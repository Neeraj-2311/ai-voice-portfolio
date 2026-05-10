// Phase 2 placeholder. Voice integration ships in a separate spec; this
// route reserves the URL so client code can target /api/voice without
// landing on a 404 in the meantime.
//
// When Phase 2 lands, this file becomes the LiveKit token endpoint:
// validate origin / rate-limit, mint a participant token scoped to the
// caller, return { token, url, room }. Intended caller is VoiceCTADock.

export function GET() {
  return Response.json(
    {
      status: 'not_implemented',
      message: 'Voice tour ships in Phase 2.',
    },
    { status: 501, headers: { 'Cache-Control': 'no-store' } },
  );
}

export function POST() {
  return Response.json(
    {
      status: 'not_implemented',
      message: 'Voice tour ships in Phase 2.',
    },
    { status: 501, headers: { 'Cache-Control': 'no-store' } },
  );
}
