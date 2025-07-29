// Simple rate limiting utility for client-side protection
// Note: This is not a replacement for server-side rate limiting

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  
  // Check if action is rate limited
  isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.store[key];
    
    // If no record exists or window has expired, create new record
    if (!record || now > record.resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return false;
    }
    
    // Increment count
    record.count++;
    
    // Check if limit exceeded
    return record.count > maxAttempts;
  }
  
  // Get remaining attempts
  getRemainingAttempts(key: string, maxAttempts: number): number {
    const record = this.store[key];
    if (!record || Date.now() > record.resetTime) {
      return maxAttempts;
    }
    return Math.max(0, maxAttempts - record.count);
  }
  
  // Get time until reset
  getTimeUntilReset(key: string): number {
    const record = this.store[key];
    if (!record || Date.now() > record.resetTime) {
      return 0;
    }
    return record.resetTime - Date.now();
  }
  
  // Clear specific key
  clear(key: string): void {
    delete this.store[key];
  }
  
  // Clear all records
  clearAll(): void {
    this.store = {};
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Rate limiting configurations
export const RATE_LIMITS = {
  STORY_CREATE: { maxAttempts: 10, windowMs: 60 * 1000 }, // 10 stories per minute
  IMAGE_UPLOAD: { maxAttempts: 20, windowMs: 60 * 1000 }, // 20 images per minute
  VAULT_CREATE: { maxAttempts: 5, windowMs: 60 * 1000 }, // 5 vaults per minute
  COLLABORATION_INVITE: { maxAttempts: 10, windowMs: 60 * 1000 }, // 10 invites per minute
  LOGIN_ATTEMPT: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
} as const;

// Helper function to check rate limit with user feedback
export const checkRateLimit = (
  action: keyof typeof RATE_LIMITS,
  userId: string
): { allowed: boolean; message?: string } => {
  const config = RATE_LIMITS[action];
  const key = `${action}:${userId}`;
  
  if (rateLimiter.isRateLimited(key, config.maxAttempts, config.windowMs)) {
    const timeUntilReset = rateLimiter.getTimeUntilReset(key);
    const minutes = Math.ceil(timeUntilReset / (60 * 1000));
    
    return {
      allowed: false,
      message: `Rate limit exceeded. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
    };
  }
  
  return { allowed: true };
};