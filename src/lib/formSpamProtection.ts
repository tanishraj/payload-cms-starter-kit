import {
  FORM_HONEYPOT_FIELD_NAME,
  FORM_RATE_LIMIT_MAX_SUBMISSIONS,
  FORM_RATE_LIMIT_WINDOW_MS,
  type FormSubmissionValues,
} from '@/lib/forms'
import {
  getTrustedClientIPAddress,
  InMemoryRateLimiter,
  type RateLimitDecision,
  type RateLimiter,
} from '@/domains/forms/rateLimiter'

const submissionRateLimiter: RateLimiter = new InMemoryRateLimiter({
  maxAttempts: FORM_RATE_LIMIT_MAX_SUBMISSIONS,
  maxKeys: 10_000,
  pruneIntervalMs: FORM_RATE_LIMIT_WINDOW_MS,
  windowMs: FORM_RATE_LIMIT_WINDOW_MS,
})

const getRateLimitKey = ({
  formSlug,
  ipAddress,
}: {
  formSlug: string
  ipAddress: string
}): string => {
  return `${ipAddress}:${formSlug}`
}

export const getClientIPAddress = (request: Request): string => {
  return getTrustedClientIPAddress(request)
}

export const isSpamHoneypotTriggered = (values: FormSubmissionValues): boolean => {
  const honeypotValue = values[FORM_HONEYPOT_FIELD_NAME]

  return typeof honeypotValue === 'string' && honeypotValue.trim().length > 0
}

export const isRateLimited = ({
  formSlug,
  ipAddress,
}: {
  formSlug: string
  ipAddress: string
}): RateLimitDecision => {
  const key = getRateLimitKey({
    formSlug,
    ipAddress,
  })

  return submissionRateLimiter.check(key)
}

export const recordSubmissionAttempt = ({
  formSlug,
  ipAddress,
}: {
  formSlug: string
  ipAddress: string
}): void => {
  const key = getRateLimitKey({
    formSlug,
    ipAddress,
  })

  submissionRateLimiter.record(key)
}
