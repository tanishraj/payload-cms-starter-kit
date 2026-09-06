import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  FORM_MAX_FIELDS,
  FORM_MAX_METADATA_URL_LENGTH,
  validateFormSubmission,
  validateFormSubmissionMetadata,
  type FormFieldType,
  type SimpleFormField,
} from '@/lib/forms'
import { RequestBodyError, readBoundedJSON } from '@/domains/forms/requestLimits'
import { getTrustedClientIPAddress, InMemoryRateLimiter } from '@/domains/forms/rateLimiter'

const makeField = (type: FormFieldType, label = 'Example'): SimpleFormField => ({
  label,
  name: 'example',
  type,
})

const expectRequestBodyError = async (
  promise: Promise<unknown>,
  code: RequestBodyError['code'],
) => {
  await expect(promise).rejects.toMatchObject({
    code,
    name: 'RequestBodyError',
  })
}

describe('bounded public JSON requests', () => {
  it.each([
    ['missing', undefined],
    ['non-JSON', 'text/plain'],
  ])('rejects %s Content-Type', async (_label, contentType) => {
    const headers = contentType ? { 'Content-Type': contentType } : undefined
    const request = new Request('http://localhost/api/forms/contact/submit', {
      body: '{}',
      headers,
      method: 'POST',
    })

    await expectRequestBodyError(
      readBoundedJSON(request, { maxBytes: 262_144 }),
      'unsupported_media_type',
    )
  })

  it('accepts JSON media type parameters', async () => {
    const request = new Request('http://localhost/api/forms/contact/submit', {
      body: '{"ok":true}',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      method: 'POST',
    })

    await expect(readBoundedJSON(request, { maxBytes: 262_144 })).resolves.toEqual({ ok: true })
  })

  it('rejects malformed JSON with a stable code', async () => {
    const request = new Request('http://localhost/api/forms/contact/submit', {
      body: '{"broken":',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    await expectRequestBodyError(readBoundedJSON(request, { maxBytes: 262_144 }), 'invalid_json')
  })

  it('rejects a UTF-8 body above 256 KiB before parsing it', async () => {
    const request = new Request('http://localhost/api/forms/contact/submit', {
      body: 'é'.repeat(131_073),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    await expectRequestBodyError(readBoundedJSON(request, { maxBytes: 262_144 }), 'body_too_large')
  })
})

describe('public form submission limits', () => {
  it('rejects arrays as submitted values', () => {
    expect(validateFormSubmission({ fields: [], values: [] }).errors).toEqual({
      values: 'Submitted values must be an object.',
    })
  })

  it('accepts 100 own value fields and rejects 101', () => {
    const makeSubmission = (count: number) => {
      const fields = Array.from({ length: count }, (_, index) => ({
        label: `Field ${index}`,
        name: `field${index}`,
        type: 'text' as const,
      }))
      const values = Object.fromEntries(fields.map((field) => [field.name, 'x']))

      return validateFormSubmission({ fields, values })
    }

    expect(makeSubmission(FORM_MAX_FIELDS).errors).toEqual({})
    expect(makeSubmission(FORM_MAX_FIELDS + 1).errors).toEqual({
      values: `Submit no more than ${FORM_MAX_FIELDS} fields.`,
    })
  })

  it.each([
    ['email', 320],
    ['text', 500],
    ['textarea', 10_000],
  ] as const)('accepts %s length %i and rejects the next character', (type, maxLength) => {
    const field = makeField(type, 'Public label')
    const acceptedValue =
      type === 'email' ? `${'a'.repeat(maxLength - 5)}@x.co` : 'a'.repeat(maxLength)
    const rejectedValue = `${acceptedValue}a`

    expect(
      validateFormSubmission({ fields: [field], values: { example: acceptedValue } }).errors,
    ).toEqual({})
    expect(
      validateFormSubmission({ fields: [field], values: { example: rejectedValue } }).errors,
    ).toEqual({
      example: `Public label must be ${maxLength.toLocaleString('en-US')} characters or fewer.`,
    })
  })

  it('accepts landing-page length 2,048 and rejects 2,049', () => {
    expect(
      validateFormSubmissionMetadata({
        landingPage: 'a'.repeat(FORM_MAX_METADATA_URL_LENGTH),
        ignored: 'discard me',
      }),
    ).toEqual({
      errors: {},
      normalizedMetadata: {
        campaign: undefined,
        landingPage: 'a'.repeat(FORM_MAX_METADATA_URL_LENGTH),
        source: undefined,
      },
    })

    expect(
      validateFormSubmissionMetadata({
        landingPage: 'a'.repeat(FORM_MAX_METADATA_URL_LENGTH + 1),
      }).errors,
    ).toEqual({
      landingPage: `Landing page must be ${FORM_MAX_METADATA_URL_LENGTH.toLocaleString('en-US')} characters or fewer.`,
    })
  })

  it.each(['campaign', 'source'] as const)(
    'accepts %s length 500 and rejects 501',
    (metadataKey) => {
      expect(
        validateFormSubmissionMetadata({
          [metadataKey]: 'a'.repeat(500),
        }).errors,
      ).toEqual({})
      expect(
        validateFormSubmissionMetadata({
          [metadataKey]: 'a'.repeat(501),
        }).errors,
      ).toEqual({
        [metadataKey]: `${metadataKey === 'campaign' ? 'Campaign' : 'Source'} must be 500 characters or fewer.`,
      })
    },
  )
})

describe('in-memory rate limiter', () => {
  it('returns a positive, rounded-up retry interval', () => {
    let now = 0
    const limiter = new InMemoryRateLimiter({
      clock: () => now,
      maxAttempts: 1,
      maxKeys: 10,
      pruneIntervalMs: 1_000,
      windowMs: 1_500,
    })

    limiter.record('client')
    now = 1

    expect(limiter.check('client')).toEqual({
      limited: true,
      retryAfterSeconds: 2,
    })
  })

  it('periodically prunes expired entries and bounds the key count', () => {
    let now = 0
    const limiter = new InMemoryRateLimiter({
      clock: () => now,
      maxAttempts: 1,
      maxKeys: 2,
      pruneIntervalMs: 1_000,
      windowMs: 1_000,
    })

    limiter.record('oldest')
    limiter.record('retained')
    limiter.record('newest')

    expect(limiter.check('oldest').limited).toBe(false)
    expect(limiter.check('retained').limited).toBe(true)

    now = 1_001

    expect(limiter.check('retained').limited).toBe(false)
  })
})

describe('trusted client address handling', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('ignores spoofable forwarded headers outside Vercel', () => {
    vi.stubEnv('VERCEL', '')

    expect(
      getTrustedClientIPAddress(
        new Request('http://localhost', {
          headers: {
            'x-forwarded-for': '203.0.113.8',
            'x-real-ip': '203.0.113.9',
          },
        }),
      ),
    ).toBe('unknown')
  })

  it('normalizes the first Vercel-forwarded address and caps its length', () => {
    vi.stubEnv('VERCEL', '1')

    expect(
      getTrustedClientIPAddress(
        new Request('http://localhost', {
          headers: {
            'x-forwarded-for': `  ${'A'.repeat(140)}, 203.0.113.9`,
          },
        }),
      ),
    ).toBe('a'.repeat(128))
  })
})
