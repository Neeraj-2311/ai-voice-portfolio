import { AgentDispatchClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { site } from '@/content/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Wake the agent worker ahead of a real call: dispatch it into a throwaway
// `warmup-*` room, which the agent recognises and exits immediately (see
// agent.py), leaving the replica warm. Best-effort: every failure returns 204.

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

export async function POST(request: Request): Promise<NextResponse> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL;

  // Not configured, or cross-origin: silently no-op (never an error the UI shows).
  if (!apiKey || !apiSecret || !wsUrl) return new NextResponse(null, { status: 204 });
  if (!isAllowedOrigin(request.headers.get('origin'))) {
    return new NextResponse(null, { status: 403 });
  }

  // Cap warmups so this can't be used to spin the worker in a loop.
  const ip = clientIp(request.headers);
  const limited = rateLimit({ key: `voice:warm:${ip}`, limit: 3, windowMs: 60_000 });
  if (!limited.allowed) return new NextResponse(null, { status: 204 });

  // Server SDK clients want the HTTP(S) host, not the wss:// URL.
  const httpUrl = wsUrl.replace(/^ws/, 'http');
  try {
    const client = new AgentDispatchClient(httpUrl, apiKey, apiSecret);
    await client.createDispatch(`warmup-${randomSuffix()}`, 'neeraj-portfolio', {
      metadata: 'warmup',
    });
  } catch {
    // Warming is best-effort; a failure must never affect the visitor.
  }
  return new NextResponse(null, { status: 204 });
}
