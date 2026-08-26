import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding window cache
const ipCache = new Map<string, RateLimitRecord>();

// Periodic garbage collection every 5 minutes
const GC_INTERVAL_MS = 5 * 60 * 1000;
let lastGC = Date.now();

function purgeExpiredRecords(): void {
  const now = Date.now();
  if (now - lastGC < GC_INTERVAL_MS) return;
  lastGC = now;

  for (const [ip, record] of ipCache.entries()) {
    if (record.resetAt <= now) {
      ipCache.delete(ip);
    }
  }
}

export interface RateLimitResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Extracts a client IP from Next.js request headers safely.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list; the first one is the client IP
    const clientIp = forwardedFor.split(",")[0].trim();
    if (clientIp) return clientIp;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // Vercel specific header
  const vercelIp = req.headers.get("x-vercel-proxied-for");
  if (vercelIp) return vercelIp.trim();

  return "127.0.0.1";
}

/**
 * Evaluates whether a request exceeds rate limits.
 *
 * @param ip Unique client identifier (IP address)
 * @returns RateLimitResult with status and header metadata
 */
export function checkRateLimit(ip: string): RateLimitResult {
  purgeExpiredRecords();

  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "5", 10);
  const windowSeconds = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || "60", 10);
  const windowMs = windowSeconds * 1000;
  const now = Date.now();

  const existing = ipCache.get(ip);

  if (!existing || existing.resetAt <= now) {
    // New or expired window
    ipCache.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      isAllowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetSeconds: windowSeconds,
    };
  }

  if (existing.count >= maxRequests) {
    const secondsRemaining = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      isAllowed: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds: secondsRemaining,
    };
  }

  existing.count += 1;
  const secondsRemaining = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    isAllowed: true,
    limit: maxRequests,
    remaining: maxRequests - existing.count,
    resetSeconds: secondsRemaining,
  };
}
