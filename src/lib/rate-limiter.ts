import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
/**
 * Why Upstash Redis?
 * - Serverless-first design: Works well with Next.js serverless functions
 * - Pay-per-use pricing: Cost-effective for serverless
 * - Edge-ready: Low latency globally
 * - No connection management needed: REST-based API
 *
 * In a Go backend, we might instead use:
 * - Traditional Redis with connection pooling
 * - In-memory rate limiting with golang.org/x/time/rate
 * - Distributed rate limiting with Redis Cluster
 */

/**
 * Sliding Window Rate Limiting
 * - More precise than fixed window
 * - Prevents edge-case bursts at window boundaries
 * - Memory efficient compared to rolling window
 * - Example: If limit is 10 req/minute and 5 requests were made in last 30s,
 *   then in next 30s only 5 more requests are allowed
 *
 * Go equivalent would use:
 * - redis.SlidingWindow implementation
 * - or golang.org/x/time/rate.Limiter with redis for distributed setups
 */
export const rateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(4, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

/**
 * IP-based identification
 * - Used for rate limiting per client
 * - Handles proxy forwarding
 * - Consider X-Real-IP in production behind proxy
 *
 * In Go:
 * - Would use X-Real-IP or X-Forwarded-For headers
 * - Could implement more sophisticated client identification
 */
export function getUserIdentifier(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "anonymous";
  return ip;
}
