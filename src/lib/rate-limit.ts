/**
 * Best-effort in-memory rate limiter.
 *
 * Caveat: serverless deployments (Vercel) instantiate isolated function
 * processes, so the bucket is per-instance, not global. This is enough to
 * stop naive scripted abuse and the simplest possible local denial-of-service
 * patterns. For real protection at scale, swap this for @upstash/ratelimit
 * backed by Redis once the abuse surface justifies the dependency.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Identifier the limit applies to (typically IP + route). */
  key: string;
  /** Maximum hits allowed in the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function rateLimit(opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(opts.key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= opts.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: opts.limit - existing.count,
    retryAfterMs: 0,
  };
}

/** Extract the best-effort client IP from request headers. Vercel/Next set
 *  x-forwarded-for; fall back to a generic bucket if none is present. */
export function clientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
