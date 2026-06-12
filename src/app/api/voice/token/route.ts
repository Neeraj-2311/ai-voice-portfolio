import { AccessToken, RoomAgentDispatch, RoomConfiguration } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { site } from '@/content/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TokenResponse {
  token: string;
  url: string;
  room: string;
  identity: string;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host;
    const siteHost = new URL(site.url).host;
    if (originHost === siteHost) return true;
    if (process.env.NODE_ENV !== 'production' && /^localhost(:\d+)?$/.test(originHost)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<TokenResponse | { error: string }>> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: 'Voice tour is not configured on this deployment.' },
      { status: 503 },
    );
  }

  // Reject cross-origin token mints. The voice tour only runs on this site.
  if (!isAllowedOrigin(request.headers.get('origin'))) {
    return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403 });
  }

  // Best-effort per-IP rate limit. Caps naive scripted abuse; not a substitute
  // for Redis-backed limiting at scale.
  const ip = clientIp(request.headers);
  const perMinute = rateLimit({ key: `voice:m:${ip}`, limit: 6, windowMs: 60_000 });
  if (!perMinute.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      {
        status: 429,
        headers: { 'Retry-After': Math.ceil(perMinute.retryAfterMs / 1000).toString() },
      },
    );
  }
  const perHour = rateLimit({ key: `voice:h:${ip}`, limit: 60, windowMs: 60 * 60_000 });
  if (!perHour.allowed) {
    return NextResponse.json(
      { error: 'Hourly limit reached. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': Math.ceil(perHour.retryAfterMs / 1000).toString() },
      },
    );
  }

  const identity = `visitor-${randomSuffix()}`;
  const room = `portfolio-${randomSuffix()}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: '10m',
  });
  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  // Dispatch the named LiveKit Agents worker into this room. The worker
  // registers itself with agent_name="neeraj-portfolio" in voice-agent/src/agent.py.
  at.roomConfig = new RoomConfiguration({
    agents: [new RoomAgentDispatch({ agentName: 'neeraj-portfolio' })],
  });

  const token = await at.toJwt();

  return NextResponse.json(
    { token, url: wsUrl, room, identity },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
