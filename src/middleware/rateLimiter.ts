import { NextRequest, NextResponse } from 'next/server';

// LRU Cache implementation with closure
function createLRUCache(capacity: number) {
  const cache = new Map<string, { count: number; timestamp: number }>();

  return {
    get: (key: string) => {
      const value = cache.get(key);
      if (value) {
        // Update timestamp on access to maintain LRU order
        value.timestamp = Date.now();
        cache.set(key, value);
      }
      return value;
    },
    set: (key: string, value: { count: number; timestamp: number }) => {
      if (cache.size >= capacity) {
        // Remove the least recently used item (oldest timestamp)
        let oldestKey: string | undefined;
        let oldestTimestamp = Infinity;
        for (const [k, v] of cache) {
          if (v.timestamp < oldestTimestamp) {
            oldestTimestamp = v.timestamp;
            oldestKey = k;
          }
        }
        if (oldestKey) {
          cache.delete(oldestKey);
        }
      }
      cache.set(key, value);
    },
    deleteExpired: (window: number) => {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > window) {
          cache.delete(key);
        }
      }
    },
    size: () => cache.size,
  };
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds window in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 20; // Max requests per window per IP
const CACHE_CAPACITY = 1000; // Maximum number of IP addresses to track

// Initialize LRU cache
const rateLimitCache = createLRUCache(CACHE_CAPACITY);

// Function to get client IP address
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  // Use a fallback since 'ip' property might not be directly available
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function rateLimiterMiddleware(request: NextRequest) {
  // Only apply rate limiting to public API routes
  if (!request.nextUrl.pathname.startsWith('/api/public/')) {
    return NextResponse.next();
  }

  const clientIp = getClientIp(request);
  const cacheKey = `rate_limit:${clientIp}:${request.nextUrl.pathname}`;
  const now = Date.now();

  try {
    // Clean up expired entries
    rateLimitCache.deleteExpired(RATE_LIMIT_WINDOW);

    // Check rate limit
    let entry = rateLimitCache.get(cacheKey);
    if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
      entry = { count: 1, timestamp: now };
      rateLimitCache.set(cacheKey, entry);
    } else {
      entry.count += 1;
      entry.timestamp = now; // Update timestamp on each request
      rateLimitCache.set(cacheKey, entry);
    }

    // Check if count is within limits
    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
        }),
        { status: 429, headers: { 'content-type': 'application/json' } },
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set(
      'X-Rate-Limit-Limit',
      RATE_LIMIT_MAX_REQUESTS.toString(),
    );
    response.headers.set(
      'X-Rate-Limit-Remaining',
      (RATE_LIMIT_MAX_REQUESTS - entry.count).toString(),
    );
    response.headers.set(
      'X-Rate-Limit-Reset',
      Math.ceil(
        (RATE_LIMIT_WINDOW - (now - entry.timestamp)) / 1000,
      ).toString(),
    );

    return response;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If something fails, allow the request but log the error
    return NextResponse.next();
  }
}

// Export config for middleware matcher
export const config = {
  matcher: '/api/public/:path*',
};
