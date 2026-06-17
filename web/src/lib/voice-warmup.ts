// Wake the agent worker ahead of a real call so the first session after idle
// doesn't lose the cold-start race. Best-effort and throttled.

const KEY = 'voice-warmed-at';
const MIN_INTERVAL_MS = 45_000;

let lastWarmMs = 0;

export function warmVoiceAgent(): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  let last = lastWarmMs;
  try {
    last = Math.max(last, Number(sessionStorage.getItem(KEY) ?? 0));
  } catch {
    // sessionStorage can throw in private mode; the in-memory guard still applies.
  }
  if (now - last < MIN_INTERVAL_MS) return;
  lastWarmMs = now;
  try {
    sessionStorage.setItem(KEY, String(now));
  } catch {
    /* ignore */
  }
  void fetch('/api/voice/warmup', { method: 'POST', keepalive: true }).catch(() => {});
}
