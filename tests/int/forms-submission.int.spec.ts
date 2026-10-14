import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Field } from 'payload'

import { submissionIdentity } from '@/lib/formSubmissionIdempotency.server'
import { FormSubmissions } from '@/collections/FormSubmissions'
import { projectPublishedGenericForm } from '@/lib/genericFormRevision.server'
import type { Form } from '@/payload-types'

import { updateFormSubmissionActivity } from '@/hooks/updateFormSubmissionActivity'

const payloadMocks = vi.hoisted(() => {
  return {
    indexes: vi.fn(),
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
    db: { collections: { 'form-submissions': { collection: { indexes: payloadMocks.indexes } } } },
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
    (candidate) =>
      typeof candidate === 'object' &&
      candidate !== null &&
      'name' in candidate &&
      candidate.name === fieldName,
  ) as Field | undefined

  if (!field) {
    throw new Error(`Expected FormSubmissions to include "${fieldName}".`)
  }

  return field as unknown as NamedField
}

const loadRouteModule = async () => {
  vi.resetModules()
  return import('@/endpoints/forms/submit')
}

describe('form submission model', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    payloadMocks.indexes.mockResolvedValue([
      { key: { submissionKeyHash: 1 }, unique: true, sparse: true },
    ])

    spamProtectionMocks.getClientIPAddress.mockReturnValue('127.0.0.1')
    spamProtectionMocks.isRateLimited.mockReturnValue(false)
    spamProtectionMocks.isSpamHoneypotTriggered.mockReturnValue(false)
    eventMocks.emitFormSubmissionEvent.mockResolvedValue(undefined)
    payloadMocks.sendEmail.mockResolvedValue(undefined)
  })

  it('returns the original confirmation before changed-form checks, rate limits or side effects', async () => {
    const key = 'a41b3fb9-9c37-458d-9909-c7ae38102ef3'
    const values = { question: 'Hello' }
    const formRevision = '1'.repeat(64)
    const identity = submissionIdentity('revised', key, values, formRevision)!
    payloadMocks.find.mockResolvedValue({
      docs: [{ ...identity, submissionConfirmation: 'Original receipt' }],
    })
    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/forms/revised/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionKey: key, values, formRevision }),
      }),
      { params: Promise.resolve({ slug: 'revised' }) },
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ message: 'Original receipt' })
    expect(payloadMocks.find).toHaveBeenCalledTimes(1)
    expect(payloadMocks.create).not.toHaveBeenCalled()
    expect(payloadMocks.sendEmail).not.toHaveBeenCalled()
    expect(eventMocks.emitFormSubmissionEvent).not.toHaveBeenCalled()
    expect(spamProtectionMocks.isRateLimited).not.toHaveBeenCalled()
  })

  it('rejects changed answers for an accepted key without disclosing the original answers', async () => {
    const key = 'a41b3fb9-9c37-458d-9909-c7ae38102ef3'
    payloadMocks.find.mockResolvedValue({
      docs: [
        {
          ...submissionIdentity('revised', key, { question: 'Private original' }, undefined),
          submissionConfirmation: 'Private receipt',
        },
      ],
    })
    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/forms/revised/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionKey: key, values: { question: 'Changed' } }),
      }),
      { params: Promise.resolve({ slug: 'revised' }) },
    )
    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.code).toBe('SUBMISSION_KEY_REUSED')
    expect(JSON.stringify(body)).not.toContain('Private')
    expect(payloadMocks.create).not.toHaveBeenCalled()
  })

  it('fails closed for new keyed intake when its durable constraint is absent', async () => {
    payloadMocks.find.mockResolvedValue({ docs: [] })
    payloadMocks.indexes.mockResolvedValue([{ key: { submissionKeyHash: 1 } }])
    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/forms/revised/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionKey: 'a41b3fb9-9c37-458d-9909-c7ae38102ef3', values: {} }),
      }),
      { params: Promise.resolve({ slug: 'revised' }) },
    )
    expect(response.status).toBe(503)
    expect(payloadMocks.create).not.toHaveBeenCalled()
  })

  it('rejects stale answers before writes or notifications and returns only the current public definition', async () => {
    const published = {
      id: 'revision-form',
      slug: 'revised',
      title: 'Enquiry',
      _status: 'published',
      submissionIntent: 'general',
      submitButtonLabel: 'Send',
      successMessage: 'Received',
      internalNotes: 'private note',
      notificationRecipients: [{ email: 'private@example.test' }],
      fields: [
        {
          id: 'field-1',
          name: 'new_name',
          label: 'Updated question',
          type: 'text',
          required: true,
        },
      ],
    } as Form
    payloadMocks.find.mockResolvedValue({ docs: [published] })
    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/forms/revised/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formRevision: '0'.repeat(64), values: { old_name: 'Alex' } }),
      }),
      { params: Promise.resolve({ slug: 'revised' }) },
    )
    expect(response.status).toBe(409)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    const body = await response.json()
    expect(body.form).toEqual(projectPublishedGenericForm(published))
    expect(JSON.stringify(body)).not.toContain('private')
    expect(payloadMocks.create).not.toHaveBeenCalled()
    expect(payloadMocks.sendEmail).not.toHaveBeenCalled()
    expect(eventMocks.emitFormSubmissionEvent).not.toHaveBeenCalled()
  })

  it('enforces configured limits on keyless intake and refreshes stale configured forms before writes', async () => {
    const published = {
      id: 'configured-form',
      slug: 'configured',
      title: 'Configured',
      _status: 'published',
      submissionIntent: 'general',
      submitButtonLabel: 'Send',
      successMessage: 'Received',
      notificationRecipients: [],
      fields: [
        {
          id: 'question',
          name: 'question',
          label: 'Question',
          type: 'text',
          required: true,
          minLength: 5,
          maxLength: 20,
          defaultValue: 'Campus visit',
          helpText: 'Be specific.',
        },
      ],
    } as unknown as Form
    const revision = projectPublishedGenericForm(published)!.revision
    payloadMocks.find.mockResolvedValue({ docs: [published] })
    payloadMocks.create.mockResolvedValue({ id: 'saved', createdAt: '2026-10-14T00:00:00.000Z' })
    const { POST } = await loadRouteModule()
    const submit = (body: unknown) =>
      POST(
        new Request('http://localhost/api/forms/configured/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
        { params: Promise.resolve({ slug: 'configured' }) },
      )
    for (const values of [{ question: 'Hi' }, { question: 'x'.repeat(21) }, {}]) {
      expect((await submit({ values })).status).toBe(400)
      expect(payloadMocks.create).not.toHaveBeenCalled()
    }
    const changed = { ...published, fields: [{ ...published.fields[0], maxLength: 15 }] }
    payloadMocks.find.mockResolvedValue({ docs: [changed] })
    const stale = await submit({ formRevision: revision, values: { question: 'My question' } })
    expect(stale.status).toBe(409)
    const refreshed = await stale.json()
    expect(refreshed.form.fields[0]).toMatchObject({
      minLength: 5,
      maxLength: 15,
      defaultValue: 'Campus visit',
      helpText: 'Be specific.',
    })
    expect(JSON.stringify(refreshed)).not.toContain('notificationRecipients')
    expect(payloadMocks.create).not.toHaveBeenCalled()
    expect(
      (await submit({ formRevision: refreshed.form.revision, values: { question: 'My question' } }))
        .status,
    ).toBe(200)
    const stored = payloadMocks.create.mock.calls[0][0].data
    expect(stored.data).toEqual({ question: 'My question' })
    expect(stored.formSnapshot.fields[0]).toMatchObject({
      maxLength: 15,
      defaultValue: 'Campus visit',
    })
    expect(stored.formRevision).toBe(refreshed.form.revision)
  })

  it('validates URL/number intake, retains decimal text, and refreshes changed numeric rules', async () => {
    const form = {
      id: 'new-controls',
      title: 'Visit',
      slug: 'visit',
      _status: 'published',
      submissionIntent: 'general',
      submitButtonLabel: 'Send',
      successMessage: 'Received',
      fields: [
        { id: 'reference', name: 'reference', label: 'Reference', type: 'url', required: true },
        {
          id: 'duration',
          name: 'duration',
          label: 'Duration',
          type: 'number',
          minValue: 0.5,
          maxValue: 4,
          step: 0.5,
        },
      ],
    } as Form
    payloadMocks.find.mockResolvedValue({ docs: [form] })
    payloadMocks.create.mockResolvedValue({ id: 'saved', createdAt: '2026-10-14T00:00:00.000Z' })
    const { POST } = await loadRouteModule()
    const submit = (values: unknown, formRevision?: string) =>
      POST(
        new Request('http://localhost/api/forms/visit/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values, formRevision }),
        }),
        { params: Promise.resolve({ slug: 'visit' }) },
      )
    for (const values of [
      { reference: 'example.com', duration: '1.5' },
      { reference: 'https://example.com', duration: '1.25' },
      { reference: 'https://example.com', duration: '5' },
      { reference: 'https://example.com', duration: 1.5 },
    ]) {
      expect((await submit(values)).status).toBe(400)
      expect(payloadMocks.create).not.toHaveBeenCalled()
    }
    const oldRevision = projectPublishedGenericForm(form)!.revision
    const changed = { ...form, fields: [form.fields[0], { ...form.fields[1], step: 2 }] }
    payloadMocks.find.mockResolvedValue({ docs: [changed] })
    const stale = await submit({ reference: 'https://example.com', duration: '1.50' }, oldRevision)
    expect(stale.status).toBe(409)
    const refreshed = await stale.json()
    expect(refreshed.form.fields[1].step).toBe(2)
    expect(payloadMocks.create).not.toHaveBeenCalled()
    expect(
      (
        await submit(
          { reference: 'https://example.com', duration: '2.50' },
          refreshed.form.revision,
        )
      ).status,
    ).toBe(200)
    const stored = payloadMocks.create.mock.calls[0][0].data
    expect(stored.data).toEqual({ reference: 'https://example.com', duration: '2.50' })
    expect(stored.answers[1]).toMatchObject({
      type: 'number',
      value: { raw: '2.50' },
      displayValue: '2.50',
    })
    expect(stored.formSnapshot.fields[1]).toMatchObject({ minValue: 0.5, maxValue: 4, step: 2 })
  })

  it('validates and captures multiple choices through intake and readable notifications', async () => {
    const published = {
      id: 'choice-form',
      slug: 'choices',
      title: 'Choices',
      _status: 'published',
      submissionIntent: 'general',
      submitButtonLabel: 'Send',
      successMessage: 'Received',
      notificationRecipients: [{ email: 'internal@example.test' }],
      fields: [
        {
          id: 'radio',
          name: 'email',
          label: 'Route',
          type: 'radio',
          required: true,
          options: [{ label: 'Admissions', value: 'admissions' }],
        },
        {
          id: 'topics',
          name: 'topics',
          label: 'Interests',
          type: 'checkboxGroup',
          minSelections: 1,
          maxSelections: 2,
          options: [
            { label: 'Admissions', value: 'admissions' },
            { label: 'Library', value: 'library' },
          ],
        },
        {
          id: 'services',
          name: 'services',
          label: 'Services',
          type: 'multiSelect',
          options: [{ label: 'Library', value: 'library' }],
        },
      ],
    } as Form
    payloadMocks.find.mockResolvedValue({ docs: [published] })
    payloadMocks.create.mockResolvedValue({ id: 'saved', createdAt: '2026-10-14T00:00:00.000Z' })
    const { POST } = await loadRouteModule()
    const request = (values: unknown) =>
      POST(
        new Request('http://localhost/api/forms/choices/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values }),
        }),
        { params: Promise.resolve({ slug: 'choices' }) },
      )
    const rejected = await request({ email: 'admissions', topics: ['missing'], services: [] })
    expect(rejected.status).toBe(400)
    expect(payloadMocks.create).not.toHaveBeenCalled()
    expect(payloadMocks.sendEmail).not.toHaveBeenCalled()
    const response = await request({
      email: 'admissions',
      topics: ['library', 'admissions'],
      services: ['library'],
    })
    expect(response.status).toBe(200)
    const stored = payloadMocks.create.mock.calls[0][0].data
    expect(stored.data).toEqual({
      email: 'admissions',
      topics: ['admissions', 'library'],
      services: ['library'],
    })
    expect(stored.submitterEmail).toBeUndefined()
    expect(stored.answers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'topics',
          displayValue: 'Admissions; Library',
          value: { raw: ['admissions', 'library'] },
        }),
      ]),
    )
    expect(payloadMocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('Interests: Admissions; Library') }),
    )
    expect(eventMocks.emitFormSubmissionEvent).toHaveBeenCalledWith(
      expect.objectContaining({ values: stored.data }),
    )
  })

  it('validates day/time/boolean answers and captures local values without contact inference', async () => {
    const published = {
      id: 'temporal',
      slug: 'visits',
      title: 'Visits',
      _status: 'published',
      submissionIntent: 'general',
      submitButtonLabel: 'Send',
      successMessage: 'Received',
      notificationRecipients: [{ email: 'internal@example.test' }],
      fields: [
        {
          id: 'day',
          name: 'email',
          label: 'Visit date',
          type: 'date',
          required: true,
          minDate: '2026-10-20',
          maxDate: '2026-10-31',
          defaultValue: '2026-10-22',
        },
        {
          id: 'time',
          name: 'phone',
          label: 'Visit time',
          type: 'time',
          required: true,
          minTime: '09:00',
          maxTime: '17:00',
        },
        { id: 'switch', name: 'reminder', label: 'Reminder', type: 'switch', defaultChecked: true },
      ],
    } as Form
    payloadMocks.find.mockResolvedValue({ docs: [published] })
    payloadMocks.create.mockResolvedValue({ id: 'saved', createdAt: '2026-10-14T00:00:00.000Z' })
    const { POST } = await loadRouteModule()
    const request = (values: unknown) =>
      POST(
        new Request('http://localhost/api/forms/visits/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values }),
        }),
        { params: Promise.resolve({ slug: 'visits' }) },
      )
    for (const values of [
      { phone: '10:30', reminder: false },
      { email: '2026-02-30', phone: '10:30', reminder: false },
      { email: '2026-10-22', phone: '17:01', reminder: false },
      { email: '2026-10-22', phone: '10:30', reminder: 'on' },
    ]) {
      expect((await request(values)).status).toBe(400)
      expect(payloadMocks.create).not.toHaveBeenCalled()
      expect(payloadMocks.sendEmail).not.toHaveBeenCalled()
    }
    expect((await request({ email: '2026-10-22', phone: '10:30', reminder: false })).status).toBe(
      200,
    )
    const stored = payloadMocks.create.mock.calls[0][0].data
    expect(stored.data).toEqual({ email: '2026-10-22', phone: '10:30', reminder: false })
    expect(stored.submitterEmail).toBeUndefined()
    expect(stored.submitterPhone).toBeUndefined()
    expect(stored.answers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'reminder', displayValue: 'No', value: { raw: false } }),
        expect.objectContaining({
          name: 'email',
          type: 'date',
          displayValue: '2026-10-22',
          value: { raw: '2026-10-22' },
        }),
      ]),
    )
    expect(payloadMocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('Visit time: 10:30') }),
    )
  })

  it('accepts the refreshed revision and stores that same snapshot identity', async () => {
    const published = {
      id: 'revision-form',
      slug: 'revised',
      title: 'Enquiry',
      _status: 'published',
      submissionIntent: 'general',
      submitButtonLabel: 'Send',
      successMessage: 'Received',
      fields: [
        {
          id: 'field-1',
          name: 'new_name',
          label: 'Updated question',
          type: 'text',
          required: true,
        },
      ],
    } as Form
    const revision = projectPublishedGenericForm(published)?.revision
    payloadMocks.find.mockResolvedValue({ docs: [published] })
    payloadMocks.create.mockResolvedValue({ id: 'stored-submission' })
    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/forms/revised/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formRevision: revision, values: { new_name: 'Alex' } }),
      }),
      { params: Promise.resolve({ slug: 'revised' }) },
    )
    expect(response.status).toBe(200)
    expect(payloadMocks.create).toHaveBeenCalledTimes(1)
    expect(payloadMocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ formRevision: revision, data: { new_name: 'Alex' } }),
      }),
    )
  })

  it.each([null, false, [], 'short'])(
    'rejects a malformed expected revision before writing: %s',
    async (formRevision) => {
      payloadMocks.find.mockResolvedValue({
        docs: [{ id: 'form', slug: 'enquiry', _status: 'published' }],
      })
      const { POST } = await loadRouteModule()
      const response = await POST(
        new Request('http://localhost/api/forms/enquiry/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formRevision, values: {} }),
        }),
        { params: Promise.resolve({ slug: 'enquiry' }) },
      )
      expect(response.status).toBe(400)
      expect(payloadMocks.create).not.toHaveBeenCalled()
    },
  )

  it('stores operator-friendly submission fields', () => {
    const statusField = getField('status')
    const emailField = getField('email')
    const submissionIntentField = getField('submissionIntent')
    const submittedAtField = getField('submittedAt')
    const submitterEmailField = getField('submitterEmail')
    const linkedReviewField = getField('linkedReview')
    const ownerField = getField('owner')
    const internalNotesField = getField('internalNotes')
    const lastActionAtField = getField('lastActionAt')

    expect(statusField.type).toBe('select')
    expect(statusField.defaultValue).toBe('new')
    expect(
      statusField.options?.map((option) => (typeof option === 'string' ? option : option.value)),
    ).toEqual(['new', 'in_review', 'qualified', 'won', 'rejected', 'archived'])
    expect(submissionIntentField.type).toBe('select')
    expect(submissionIntentField.defaultValue).toBe('general')
    expect(submissionIntentField.admin?.readOnly).toBe(true)
    expect(ownerField.type).toBe('relationship')
    expect(internalNotesField.type).toBe('textarea')
    expect(emailField.type).toBe('email')
    expect(emailField.admin?.readOnly).toBe(true)
    expect(submitterEmailField.type).toBe('email')
    expect(submitterEmailField.admin?.readOnly).toBe(true)
    expect(linkedReviewField.type).toBe('relationship')
    expect(submittedAtField.type).toBe('date')
    expect(submittedAtField.admin?.readOnly).toBe(true)
    expect(lastActionAtField.type).toBe('date')
    expect(lastActionAtField.admin?.readOnly).toBe(true)
  })

  it('enriches persisted submissions and emits the starter event seam with ops metadata', async () => {
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
          submissionIntent: 'lead',
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
          metadata: {
            campaign: 'summer-launch',
            landingPage: '/contact?utm_campaign=summer-launch',
            source: 'homepage-cta',
          },
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
          campaign: 'summer-launch',
          data: {
            email: 'lead@example.com',
            fullName: 'Taylor Lead',
          },
          email: 'lead@example.com',
          form: 42,
          landingPage: '/contact?utm_campaign=summer-launch',
          source: 'homepage-cta',
          status: 'new',
          submissionIntent: 'lead',
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
      campaign: 'summer-launch',
      formId: 42,
      formSlug: 'contact',
      landingPage: '/contact?utm_campaign=summer-launch',
      owner: undefined,
      source: 'homepage-cta',
      submissionId: 99,
      status: 'new',
      submissionIntent: 'lead',
      submitterEmail: 'lead@example.com',
      submitterName: 'Taylor Lead',
      values: {
        email: 'lead@example.com',
        fullName: 'Taylor Lead',
      },
    })
    expect(payloadMocks.sendEmail).not.toHaveBeenCalled()
    expect(payloadMocks.update).not.toHaveBeenCalled()
  })

  it('captures arbitrary fields and uses a custom email role for confirmation', async () => {
    payloadMocks.find.mockResolvedValue({
      docs: [
        {
          fields: [
            {
              id: 'mail-id',
              label: 'Work email',
              name: 'work_email',
              type: 'email',
              contactRole: 'email',
            },
            {
              id: 'dept-id',
              label: 'Preferred department',
              name: 'preferred_department',
              type: 'select',
              options: [{ label: 'Admissions', value: 'admissions' }],
            },
          ],
          id: 'custom-form',
          title: 'Department enquiry',
          slug: 'custom',
          submissionIntent: 'general',
          notificationRecipients: [],
          successMessage: 'Received.',
          submitterReply: { enabled: true },
        },
      ],
    })
    payloadMocks.create.mockResolvedValue({ id: 'submission-id' })
    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/forms/custom/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: { work_email: 'person@example.com', preferred_department: 'admissions' },
        }),
      }),
      { params: Promise.resolve({ slug: 'custom' }) },
    )
    expect(response.status).toBe(200)
    const stored = payloadMocks.create.mock.calls[0][0].data
    expect(stored.submitterEmail).toBe('person@example.com')
    expect(stored.formRevision).toMatch(/^[a-f0-9]{64}$/)
    expect(stored.formSnapshot.title).toBe('Department enquiry')
    expect(stored.answers[1]).toEqual({
      displayValue: 'Admissions',
      fieldID: 'dept-id',
      label: 'Preferred department',
      name: 'preferred_department',
      type: 'select',
      value: { raw: 'admissions' },
    })
    expect(payloadMocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'person@example.com' }),
    )
  })

  it.each([
    { question: { nested: 'bad' } },
    { question: 'valid', extra: 'undeclared' },
    { question: 'valid', permission: 'yes' },
  ])('rejects malformed or undeclared answers before persistence (%s)', async (values) => {
    payloadMocks.find.mockResolvedValue({
      docs: [
        {
          id: 'generic',
          slug: 'generic',
          title: 'Generic',
          fields: [
            { name: 'question', label: 'Question', type: 'text' },
            { name: 'permission', label: 'Permission', type: 'checkbox' },
          ],
          submissionIntent: 'general',
          notificationRecipients: [],
        },
      ],
    })
    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/forms/generic/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      }),
      { params: Promise.resolve({ slug: 'generic' }) },
    )
    expect(response.status).toBe(400)
    expect((await response.json()).errors).toBeTruthy()
    expect(payloadMocks.create).not.toHaveBeenCalled()
    expect(payloadMocks.sendEmail).not.toHaveBeenCalled()
    expect(eventMocks.emitFormSubmissionEvent).not.toHaveBeenCalled()
  })

  it('returns 415 when the JSON Content-Type is missing', async () => {
    payloadMocks.find.mockResolvedValue({
      docs: [
        {
          fields: [],
          id: 42,
          notificationRecipients: [],
          slug: 'contact',
          submissionIntent: 'general',
          successMessage: 'Thanks.',
          title: 'Contact',
        },
      ],
    })

    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/forms/contact/submit', {
        body: '{}',
        method: 'POST',
      }),
      { params: Promise.resolve({ slug: 'contact' }) },
    )

    expect(response.status).toBe(415)
  })

  it('returns 413 before parsing a UTF-8 body above 256 KiB', async () => {
    payloadMocks.find.mockResolvedValue({
      docs: [
        {
          fields: [],
          id: 42,
          notificationRecipients: [],
          slug: 'contact',
          submissionIntent: 'general',
          successMessage: 'Thanks.',
          title: 'Contact',
        },
      ],
    })

    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/forms/contact/submit', {
        body: 'é'.repeat(131_073),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
      { params: Promise.resolve({ slug: 'contact' }) },
    )

    expect(response.status).toBe(413)
  })

  it('includes Retry-After when a submission is rate limited', async () => {
    payloadMocks.find.mockResolvedValue({
      docs: [
        {
          fields: [],
          id: 42,
          notificationRecipients: [],
          slug: 'contact',
          submissionIntent: 'general',
          successMessage: 'Thanks.',
          title: 'Contact',
        },
      ],
    })
    spamProtectionMocks.isRateLimited.mockReturnValue({
      limited: true,
      retryAfterSeconds: 17,
    })

    const { POST } = await loadRouteModule()
    const response = await POST(
      new Request('http://localhost/api/forms/contact/submit', {
        body: '{"values":{}}',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
      { params: Promise.resolve({ slug: 'contact' }) },
    )

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('17')
  })

  it('stamps lastActionAt when operators change status, owner, or notes', async () => {
    await expect(
      updateFormSubmissionActivity({
        data: {
          internalNotes: 'Reached out by email.',
          owner: 7,
          status: 'in_review',
        },
        operation: 'update',
        originalDoc: {
          internalNotes: '',
          owner: null,
          status: 'new',
        },
      } as never),
    ).resolves.toEqual(
      expect.objectContaining({
        internalNotes: 'Reached out by email.',
        lastActionAt: expect.any(String),
        owner: 7,
        status: 'in_review',
      }),
    )
  })
})
