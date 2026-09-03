export type RateLimitDecision = {
  limited: boolean
  retryAfterSeconds: number
}

export interface RateLimiter {
  check(key: string): RateLimitDecision
  record(key: string): void
}

type InMemoryRateLimiterOptions = {
  clock?: () => number
  maxAttempts: number
  maxKeyLength?: number
  maxKeys?: number
  pruneIntervalMs?: number
  windowMs: number
}

const DEFAULT_MAX_KEY_LENGTH = 256
const DEFAULT_MAX_KEYS = 10_000

export class InMemoryRateLimiter implements RateLimiter {
  private readonly attemptsByKey = new Map<string, number[]>()
  private readonly clock: () => number
  private readonly maxAttempts: number
  private readonly maxKeyLength: number
  private readonly maxKeys: number
  private readonly pruneIntervalMs: number
  private readonly windowMs: number
  private lastPrunedAt: number

  constructor({
    clock = Date.now,
    maxAttempts,
    maxKeyLength = DEFAULT_MAX_KEY_LENGTH,
    maxKeys = DEFAULT_MAX_KEYS,
    pruneIntervalMs,
    windowMs,
  }: InMemoryRateLimiterOptions) {
    this.clock = clock
    this.maxAttempts = Math.max(1, Math.floor(maxAttempts))
    this.maxKeyLength = Math.max(1, Math.floor(maxKeyLength))
    this.maxKeys = Math.max(1, Math.floor(maxKeys))
    this.pruneIntervalMs = Math.max(1, pruneIntervalMs ?? windowMs)
    this.windowMs = Math.max(1, windowMs)
    this.lastPrunedAt = this.clock()
  }

  check(key: string): RateLimitDecision {
    const now = this.clock()
    this.pruneIfDue(now)

    const normalizedKey = this.normalizeKey(key)
    const recentAttempts = this.getRecentAttempts(normalizedKey, now)

    if (recentAttempts.length < this.maxAttempts) {
      return {
        limited: false,
        retryAfterSeconds: 0,
      }
    }

    const retryAfterMs = recentAttempts[0] + this.windowMs - now

    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1_000)),
    }
  }

  record(key: string): void {
    const now = this.clock()
    this.pruneIfDue(now)

    const normalizedKey = this.normalizeKey(key)
    const recentAttempts = this.getRecentAttempts(normalizedKey, now)

    if (recentAttempts.length >= this.maxAttempts) {
      return
    }

    if (!this.attemptsByKey.has(normalizedKey) && this.attemptsByKey.size >= this.maxKeys) {
      const oldestKey = this.attemptsByKey.keys().next().value

      if (typeof oldestKey === 'string') {
        this.attemptsByKey.delete(oldestKey)
      }
    }

    recentAttempts.push(now)
    this.attemptsByKey.delete(normalizedKey)
    this.attemptsByKey.set(normalizedKey, recentAttempts)
  }

  private getRecentAttempts(key: string, now: number): number[] {
    const recentAttempts = (this.attemptsByKey.get(key) ?? []).filter(
      (timestamp) => now - timestamp < this.windowMs,
    )

    if (recentAttempts.length === 0) {
      this.attemptsByKey.delete(key)
    } else {
      this.attemptsByKey.set(key, recentAttempts)
    }

    return recentAttempts
  }

  private normalizeKey(key: string): string {
    return (key.trim().toLowerCase() || 'unknown').slice(0, this.maxKeyLength)
  }

  private pruneIfDue(now: number): void {
    if (now >= this.lastPrunedAt && now - this.lastPrunedAt < this.pruneIntervalMs) {
      return
    }

    for (const key of this.attemptsByKey.keys()) {
      this.getRecentAttempts(key, now)
    }

    this.lastPrunedAt = now
  }
}

const MAX_CLIENT_ADDRESS_LENGTH = 128

const normalizeClientAddress = (value: string | null): string | null => {
  const normalizedValue = value?.trim().toLowerCase().slice(0, MAX_CLIENT_ADDRESS_LENGTH)

  return normalizedValue || null
}

export const getTrustedClientIPAddress = (request: Request): string => {
  if (process.env.VERCEL !== '1') {
    return 'unknown'
  }

  const forwardedAddress = normalizeClientAddress(
    request.headers.get('x-forwarded-for')?.split(',', 1)[0] ?? null,
  )

  return forwardedAddress ?? normalizeClientAddress(request.headers.get('x-real-ip')) ?? 'unknown'
}
