import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FormSubmissions } from '@/collections/FormSubmissions'

const payloadMocks = vi.hoisted(() => {
  return {
    create: vi.fn(),
    find: vi.fn(),
    loggerError: vi.fn(),
    sendEmail: vi.fn(),
    update: vi.fn(),
  }
})

const eventMocks = vi.hoisted(() => {
  return {
    emitFormSubmissionEvent: vi.fn(),
  }
})

const spamProtectionMocks = vi.hoisted(() => {
  return {
    getClientIPAddress: vi.fn(),
    isRateLimited: vi.fn(),
    isSpamHoneypotTriggered: vi.fn(),
    recordSubmissionAttempt: vi.fn(),
  }
})

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    create: payloadMocks.create,
    find: payloadMocks.find,
    logger: {
      error: payloadMocks.loggerError,
    },
    sendEmail: payloadMocks.sendEmail,
    update: payloadMocks.update,
  })),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('@/lib/formSubmissionEvents', () => ({
  emitFormSubmissionEvent: eventMocks.emitFormSubmissionEvent,
}))

vi.mock('@/lib/formSpamProtection', () => ({
  getClientIPAddress: spamProtectionMocks.getClientIPAddress,
  isRateLimited: spamProtectionMocks.isRateLimited,
  isSpamHoneypotTriggered: spamProtectionMocks.isSpamHoneypotTriggered,
  recordSubmissionAttempt: spamProtectionMocks.recordSubmissionAttempt,
}))

type NamedField = {
  admin?: {
    readOnly?: boolean
  }
  defaultValue?: unknown
  name: string
  options?: Array<string | { value: string }>
  type: string
}

const getField = (fieldName: string): NamedField => {
  const field = FormSubmissions.fields.find(
    (candidate): candidate is NamedField =>
      typeof candidate === 'object' &&
      candidate !== null &&
      'name' in candidate &&
      candidate.name === fieldName,
  )

  if (!field) {
    throw new Error(`Expected FormSubmissions to include "${fieldName}".`)
  }

  return field
}

const loadRouteModule = async () => {
  vi.resetModules()
  return import('@/app/api/forms/[slug]/submit/route')
}

describe('form submission model', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    spamProtectionMocks.getClientIPAddress.mockReturnValue('127.0.0.1')
    spamProtectionMocks.isRateLimited.mockReturnValue(false)
    spamProtectionMocks.isSpamHoneypotTriggered.mockReturnValue(false)
    eventMocks.emitFormSubmissionEvent.mockResolvedValue(undefined)
    payloadMocks.sendEmail.mockResolvedValue(undefined)
  })

  it('stores operator-friendly submission fields', () => {
    const statusField = getField('status')
    const emailField = getField('email')
    const submissionTypeField = getField('submissionType')
    const submittedAtField = getField('submittedAt')
    const submitterEmailField = getField('submitterEmail')
    const linkedReviewField = getField('linkedReview')

    expect(statusField.type).toBe('select')
    expect(statusField.defaultValue).toBe('new')
    expect(statusField.options?.map((option) => (typeof option === 'string' ? option : option.value))).toEqual([
      'new',
      'reviewed',
      'archived',
    ])
    expect(submissionTypeField.type).toBe('select')
    expect(submissionTypeField.defaultValue).toBe('general')
    expect(submissionTypeField.admin?.readOnly).toBe(true)
    expect(emailField.type).toBe('email')
    expect(emailField.admin?.readOnly).toBe(true)
    expect(submitterEmailField.type).toBe('email')
    expect(submitterEmailField.admin?.readOnly).toBe(true)
    expect(linkedReviewField.type).toBe('relationship')
    expect(submittedAtField.type).toBe('date')
    expect(submittedAtField.admin?.readOnly).toBe(true)
  })

  it('enriches persisted submissions and emits the starter event seam', async () => {
    payloadMocks.find.mockResolvedValue({
      docs: [
        {
          fields: [
            {
              label: 'Email',
              name: 'email',
              required: true,
              type: 'email',
            },
            {
              label: 'Full Name',
              name: 'fullName',
              required: true,
              type: 'text',
            },
          ],
          id: 42,
          notificationRecipients: [],
          slug: 'contact',
          submissionType: 'general',
          successMessage: 'Thanks. Your submission has been received.',
          title: 'Contact',
        },
      ],
    })
    payloadMocks.create.mockResolvedValue({
      createdAt: '2026-07-07T12:00:00.000Z',
      id: 99,
    })

    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/forms/contact/submit', {
        body: JSON.stringify({
          values: {
            email: 'lead@example.com',
            fullName: 'Taylor Lead',
            website: '',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
      {
        params: Promise.resolve({
          slug: 'contact',
        }),
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      message: 'Thanks. Your submission has been received.',
    })

    expect(spamProtectionMocks.recordSubmissionAttempt).toHaveBeenCalledWith({
      formSlug: 'contact',
      ipAddress: '127.0.0.1',
    })

    expect(payloadMocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'form-submissions',
        data: expect.objectContaining({
          data: {
            email: 'lead@example.com',
            fullName: 'Taylor Lead',
          },
          email: 'lead@example.com',
          form: 42,
          submissionType: 'general',
          submittedAt: expect.any(String),
          submitterEmail: 'lead@example.com',
          submitterName: 'Taylor Lead',
        }),
        overrideAccess: true,
      }),
    )

    const createCall = payloadMocks.create.mock.calls[0]?.[0]
    expect(createCall?.data.submittedAt).toBe(new Date(createCall?.data.submittedAt).toISOString())

    expect(eventMocks.emitFormSubmissionEvent).toHaveBeenCalledWith({
      formId: 42,
      formSlug: 'contact',
      submissionId: 99,
      values: {
        email: 'lead@example.com',
        fullName: 'Taylor Lead',
      },
    })
    expect(payloadMocks.sendEmail).not.toHaveBeenCalled()
    expect(payloadMocks.update).not.toHaveBeenCalled()
  })
})
