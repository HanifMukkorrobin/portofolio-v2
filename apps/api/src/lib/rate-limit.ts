interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimiterOptions {
  maxEntries?: number;
  now?: () => number;
}

export function createRateLimiter(
  maxAttempts: number,
  windowMs: number,
  options: RateLimiterOptions = {}
) {
  const buckets = new Map<string, Bucket>();
  const maxEntries = options.maxEntries ?? 1000;
  const getNow = options.now ?? (() => Date.now());
  let lastPrunedAt = getNow();

  function prune(now: number) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
    lastPrunedAt = now;
  }

  return {
    consume(key: string): { allowed: boolean; retryAfterSec: number } {
      const now = getNow();

      if (now - lastPrunedAt >= windowMs || buckets.size >= maxEntries) {
        prune(now);
      }

      const existing = buckets.get(key);

      if (!existing || existing.resetAt <= now) {
        // Evict oldest key if still at cap after pruning active entries
        if (!existing && buckets.size >= maxEntries) {
          const oldestKey = buckets.keys().next().value;
          if (oldestKey !== undefined) {
            buckets.delete(oldestKey);
          }
        }
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
    },
    size(): number {
      return buckets.size;
    }
  };
}
