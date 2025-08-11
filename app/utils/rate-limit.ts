export class RateLimit {
  private timestamps: Map<string, number[]>
  private readonly windowMs: number
  private readonly max: number

  constructor(windowMs: number, max: number) {
    this.timestamps = new Map()
    this.windowMs = windowMs
    this.max = max
  }

  check(key: string): boolean {
    const now = Date.now()
    const timestamps = this.timestamps.get(key) || []

    // Remove old timestamps
    const validTimestamps = timestamps.filter((t) => now - t < this.windowMs)

    if (validTimestamps.length >= this.max) {
      return false
    }

    validTimestamps.push(now)
    this.timestamps.set(key, validTimestamps)
    return true
  }
}

// Create rate limiter instance - 100 requests per 15 minutes
export const limiter = new RateLimit(5 * 60 * 1000, 15)
