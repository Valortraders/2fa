interface RateLimitState {
  timestamp: number;
  count: number;
}

const rateLimitStates = new Map<string, RateLimitState>();

export class RateLimiter {
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(key: string): { success: boolean; timeLeft?: number } {
    const now = Date.now();
    const state = rateLimitStates.get(key);

    // Clean up old entries
    this.cleanup();

    if (!state) {
      rateLimitStates.set(key, { timestamp: now, count: 1 });
      return { success: true };
    }

    // Check if window has expired
    if (now - state.timestamp > this.windowMs) {
      rateLimitStates.set(key, { timestamp: now, count: 1 });
      return { success: true };
    }

    // Check if limit exceeded
    if (state.count >= this.maxRequests) {
      const timeLeft = Math.ceil((state.timestamp + this.windowMs - now) / 1000);
      return { success: false, timeLeft };
    }

    // Increment counter
    state.count++;
    rateLimitStates.set(key, state);
    return { success: true };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, state] of rateLimitStates.entries()) {
      if (now - state.timestamp > this.windowMs) {
        rateLimitStates.delete(key);
      }
    }
  }
} 