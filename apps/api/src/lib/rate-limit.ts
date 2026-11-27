interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();

  return {
    consume(key: string): { allowed: boolean; retryAfterSec: number } {
      const now = Date.now();
      const existing = buckets.get(key);

      if (!existing || existing.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSec: 0 };
      }

      if (existing.count >= maxAttempts) {
        return {
          allowed: false,
          retryAfterSec: Math.ceil((existing.resetAt - now) / 1000)
        };
      }

      existing.count += 1;
      return { allowed: true, retryAfterSec: 0 };
    },
    reset(key: string) {
      buckets.delete(key);
    }
  };
}
