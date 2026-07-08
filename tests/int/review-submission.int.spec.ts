import { beforeEach, describe, expect, it, vi } from 'vitest'

const payloadMocks = vi.hoisted(() => ({
  create: vi.fn(),
  loggerError: vi.fn(),
}))

const spamProtectionMocks = vi.hoisted(() => ({
  getClientIPAddress: vi.fn(),
  isRateLimited: vi.fn(),
  isSpamHoneypotTriggered: vi.fn(),
  recordSubmissionAttempt: vi.fn(),
}))

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()

  return {
    ...actual,
    getPayload: vi.fn(async () => ({
      create: payloadMocks.create,
      logger: {
        error: payloadMocks.loggerError,
      },
    })),
  }
})

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('@/lib/formSpamProtection', () => ({
  getClientIPAddress: spamProtectionMocks.getClientIPAddress,
  isRateLimited: spamProtectionMocks.isRateLimited,
  isSpamHoneypotTriggered: spamProtectionMocks.isSpamHoneypotTriggered,
  recordSubmissionAttempt: spamProtectionMocks.recordSubmissionAttempt,
}))

const loadRouteModule = async () => {
  vi.resetModules()
  return import('@/app/api/reviews/submit/route')
}

describe('review submission route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    spamProtectionMocks.getClientIPAddress.mockReturnValue('127.0.0.1')
    spamProtectionMocks.isRateLimited.mockReturnValue(false)
    spamProtectionMocks.isSpamHoneypotTriggered.mockReturnValue(false)
  })

  it('rejects incomplete review payloads', async () => {
    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/reviews/submit', {
        body: JSON.stringify({
          values: {
            reviewTitle: '',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        errors: expect.objectContaining({
          rating: expect.any(String),
          reviewBody: expect.any(String),
          reviewerEmail: expect.any(String),
        }),
        message: 'Please correct the highlighted fields and try again.',
      }),
    )
  })

  it('creates a draft in-review document for valid review submissions', async () => {
    payloadMocks.create.mockResolvedValue({
      id: 33,
    })

    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/reviews/submit', {
        body: JSON.stringify({
          values: {
            rating: '5',
            reviewTitle: 'Fast, clear, and reliable',
            reviewBody: 'Everything worked exactly as expected.',
            reviewerName: 'Taylor Lead',
            reviewerEmail: 'taylor@example.com',
            isGenuineExperience: true,
            website: '',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      message: 'Thanks for your review.',
    })

    expect(spamProtectionMocks.recordSubmissionAttempt).toHaveBeenCalledWith({
      formSlug: 'reviews',
      ipAddress: '127.0.0.1',
    })

    expect(payloadMocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reviews',
        data: expect.objectContaining({
          _status: 'draft',
          workflowState: 'in_review',
          title: 'Fast, clear, and reliable',
          reviewTitle: 'Fast, clear, and reliable',
          reviewerEmail: 'taylor@example.com',
        }),
        overrideAccess: true,
      }),
    )
  })
})
