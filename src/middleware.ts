import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "./lib/rate-limiter";

/**
 * Middleware Implementation
 * - Runs before route handlers
 * - Edge-compatible
 * - Handles rate limiting globally
 *
 * In Go:
 * - Would be implemented as HTTP middleware
 * - Could use Chi middleware or custom handlers
 * - More control over request lifecycle
 */
export async function middleware(req: NextRequest) {
  // Get the IP address from the request
  let ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0];

  if (!ip) {
    ip = "Unknown";
  }

  console.log("Client IP:", ip);

  try {
    // Rate limiting check
    // Returns: success, pending (retry after), limit, reset time, remaining
    const { success, pending, limit, reset, remaining } =
      await rateLimiter.limit(ip);

    // If you have analytics enabled, make sure to await the pending promise
    await pending;
    if (!success) {
      // Standard rate limit headers
      // These headers help clients implement proper backoff
      return new NextResponse("You are writing messages too fast", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": pending.toString(),
        },
      });
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error occurred:", error);
    return new NextResponse(
      "Internal Server Error: Something went wrong with processing your message. Try again later!",
      { status: 500 }
    );
  }
}

// Routes to protect
// In Go, this would be defined in router configuration
export const config = {
  matcher: "/api/message/:path*",
};
