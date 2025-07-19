interface RateLimitEntry {
  count: number
  resetTime: number
  blockedUntil?: number
}

class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private getIdentifier(request: Request): string {
    // Use IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded || realIp || 'unknown'
    
    return `login:${ip}`
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
        this.attempts.delete(key)
      }
    }
  }

  checkRateLimit(request: Request, options: {
    maxAttempts?: number
    windowMs?: number
    blockDurationMs?: number
  } = {}): { allowed: boolean; remainingAttempts: number; resetTime: number; blockedUntil?: number } {
    const {
      maxAttempts = 5,
      windowMs = 15 * 60 * 1000, // 15 minutes
      blockDurationMs = 30 * 60 * 1000 // 30 minutes
    } = options

    const identifier = this.getIdentifier(request)
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    // If no entry exists, create one
    if (!entry) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      return {
        allowed: true,
        remainingAttempts: maxAttempts - 1,
        resetTime: now + windowMs
      }
    }

    // Check if currently blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: entry.resetTime,
        blockedUntil: entry.blockedUntil
      }
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      return {
        allowed: true,
        remainingAttempts: maxAttempts - 1,
        resetTime: now + windowMs
      }
    }

    // Increment attempt count
    entry.count++

    // Check if max attempts exceeded
    if (entry.count > maxAttempts) {
      entry.blockedUntil = now + blockDurationMs
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: entry.resetTime,
        blockedUntil: entry.blockedUntil
      }
    }

    return {
      allowed: true,
      remainingAttempts: maxAttempts - entry.count,
      resetTime: entry.resetTime
    }
  }

  recordSuccess(request: Request): void {
    const identifier = this.getIdentifier(request)
    this.attempts.delete(identifier)
  }

  getRemainingAttempts(request: Request): number {
    const identifier = this.getIdentifier(request)
    const entry = this.attempts.get(identifier)
    
    if (!entry) return 5 // Default max attempts
    
    const now = Date.now()
    if (now > entry.resetTime) return 5
    
    return Math.max(0, 5 - entry.count)
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Create singleton instance
export const rateLimiter = new RateLimiter()

// Helper function to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  return forwarded || realIp || cfConnectingIp || 'unknown'
}
