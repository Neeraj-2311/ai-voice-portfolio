import { AccessToken, RoomAgentDispatch, RoomConfiguration } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

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

export async function POST(): Promise<NextResponse<TokenResponse | { error: string }>> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: 'Voice tour is not configured on this deployment.' },
      { status: 503 },
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
