/**
 * Sliding Window Rate Limiter
 * Supports in-memory sliding window for development / fallback, and is prepared for Upstash / Redis.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale memory entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      // Remove timestamps older than 1 hour
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600 * 1000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Seconds until oldest entry expires
}

export async function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = memoryStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(identifier, record);
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((timestamp) => timestamp > cutoff);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0] ?? now;
    const reset = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.max(reset, 1),
    };
  }

  // Record this request
  record.timestamps.push(now);

  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: windowSeconds,
  };
}

/**
 * Pre-configured rate limits for common operations
 */
export const rateLimits = {
  // Authentication: 10 attempts per 15 minutes per IP
  auth: (ip: string) => checkRateLimit(`rate:auth:${ip}`, 10, 15 * 60),

  // Search Autocomplete: 120 queries per minute per IP
  search: (ip: string) => checkRateLimit(`rate:search:${ip}`, 120, 60),

  // Review & Lead Submissions: 5 submissions per 30 minutes per IP
  submission: (ip: string) => checkRateLimit(`rate:submit:${ip}`, 5, 30 * 60),

  // Media Uploads: 20 uploads per hour per user/IP
  upload: (identifier: string) => checkRateLimit(`rate:upload:${identifier}`, 20, 60 * 60),
};
