import { getPayload, Payload } from 'payload'

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { createTestMongoServer } from '../helpers/mongoMemoryServer'

vi.mock('next/cache', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/cache')>()),
  revalidateTag: vi.fn(),
}))

let payload: Payload
let stopMongoServer: (() => Promise<void>) | null = null

describe('API', () => {
  beforeAll(async () => {
    const mongoServer = await createTestMongoServer()

    process.env.MONGODB_URI = mongoServer.uri
    process.env.EMAIL_PROVIDER = 'none'
    process.env.MEDIA_PROVIDER = 'localDisk'
    process.env.PAYLOAD_SECRET = 'test-secret'
    stopMongoServer = mongoServer.stop

    vi.resetModules()
    const { default: config } = await import('@/payload.config')
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    await Promise.all([
      ...Object.values(payload.db.collections).map((model) => model.init()),
      ...Object.values(payload.db.versions).map((model) => model.init()),
    ])
  }, 120000)

  afterAll(async () => {
    if (payload) {
      await payload.destroy()
    }

    if (stopMongoServer) {
      await stopMongoServer()
    }
  }, 30000)

  it('loads configured collections', async () => {
    const [users, pages, forms, categories, articles] = await Promise.all([
      payload.find({
        collection: 'users',
      }),
      payload.find({
        collection: 'pages',
        limit: 1,
      }),
      payload.find({
        collection: 'forms',
        limit: 1,
      }),
      payload.find({
        collection: 'categories',
        limit: 1,
      }),
      payload.find({
        collection: 'articles',
        limit: 1,
      }),
    ])

    expect(users).toBeDefined()
    expect(Array.isArray(users.docs)).toBe(true)
    expect(pages).toBeDefined()
    expect(Array.isArray(pages.docs)).toBe(true)
    expect(forms).toBeDefined()
    expect(Array.isArray(forms.docs)).toBe(true)
    expect(categories).toBeDefined()
    expect(Array.isArray(categories.docs)).toBe(true)
    expect(articles).toBeDefined()
    expect(Array.isArray(articles.docs)).toBe(true)
  })

  it('publishes a title-derived Form slug before validation and preserves chosen URLs', async () => {
    const data = {
      title: 'An Editor’s Enquiry',
      slug: '',
      fields: [{ label: 'Your question', name: 'custom_question', type: 'text' as const }],
      submissionIntent: 'general' as const,
      submitButtonLabel: 'Send',
      successMessage: 'Received',
      _status: 'published' as const,
    }
    const generated = await payload.create({ collection: 'forms', data })
    expect(generated.slug).toBe('an-editors-enquiry')
    const renamed = await payload.update({
      collection: 'forms',
      id: generated.id,
      data: { title: 'A different title' },
    })
    expect(renamed.slug).toBe(generated.slug)
    const chosen = await payload.create({
      collection: 'forms',
      data: { ...data, slug: 'chosen-enquiry-url' },
    })
    expect(chosen.slug).toBe('chosen-enquiry-url')
  })

  it('enforces two-role feature permissions through the Payload Local API', async () => {
    await payload.create({
      collection: 'operational-audit-events',
      data: {
        action: 'test_initialized',
        entityId: 'api-test',
        entityTitle: 'API test',
        entityType: 'test',
        occurredAt: new Date().toISOString(),
        summary: 'Initialized the isolated audit collection.',
      },
      draft: false,
      overrideAccess: true,
    })

    const firstAdmin = await payload.create({
      collection: 'users',
      data: {
        email: 'first-admin@example.test',
        password: 'test-password',
        role: 'admin',
      },
      draft: false,
    })

    expect(firstAdmin.role).toBe('admin')

    const siteManager = await payload.create({
      collection: 'users',
      data: {
        email: 'site-manager@example.test',
        features: { pages: true },
        password: 'test-password',
        role: 'siteManager',
      },
      draft: false,
      overrideAccess: false,
      user: firstAdmin,
    })
    const secondAdmin = await payload.create({
      collection: 'users',
      data: {
        email: 'second-admin@example.test',
        password: 'test-password',
        role: 'admin',
      },
      draft: false,
      overrideAccess: false,
      user: firstAdmin,
    })

    expect(siteManager.role).toBe('siteManager')
    expect(siteManager.features?.pages).toBe(true)
    expect(secondAdmin.role).toBe('admin')
    await expect(
      payload.find({
        collection: 'pages',
        overrideAccess: false,
        user: siteManager,
      }),
    ).resolves.toBeDefined()
    await expect(
      payload.find({
        collection: 'articles',
        overrideAccess: false,
        user: siteManager,
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: 'forbidden-user@example.test',
          password: 'test-password',
          role: 'siteManager',
        },
        draft: false,
        overrideAccess: false,
        user: siteManager,
      }),
    ).rejects.toThrow()

    const topic = await payload.create({
      collection: 'categories',
      data: { slug: 'temporary-topic', title: 'Temporary topic' },
      draft: false,
      overrideAccess: false,
      user: firstAdmin,
    })
    await payload.delete({
      collection: 'categories',
      id: topic.id,
      overrideAccess: false,
      user: firstAdmin,
    })

    const deletionAudit = await payload.find({
      collection: 'operational-audit-events',
      overrideAccess: true,
      where: {
        and: [
          { action: { equals: 'permanently_deleted' } },
          { entityId: { equals: String(topic.id) } },
          { feature: { equals: 'topics' } },
        ],
      },
    })
    expect(deletionAudit.totalDocs).toBe(1)
    expect(deletionAudit.docs[0]?.entityTitle).toBe(`Topics #${topic.id}`)

    await payload.update({
      collection: 'users',
      id: siteManager.id,
      data: { deletedAt: new Date().toISOString() },
      overrideAccess: false,
      user: firstAdmin,
    })
    await payload.update({
      collection: 'users',
      id: siteManager.id,
      data: { deletedAt: null },
      overrideAccess: false,
      trash: true,
      user: firstAdmin,
    })
    await payload.delete({
      collection: 'users',
      id: siteManager.id,
      overrideAccess: false,
      user: firstAdmin,
    })

    const userLifecycleAudit = await payload.find({
      collection: 'operational-audit-events',
      overrideAccess: true,
      where: {
        action: {
          in: ['user_trashed', 'user_restored', 'user_permanently_deleted'],
        },
      },
    })
    expect(userLifecycleAudit.docs.map(({ action }) => action)).toEqual(
      expect.arrayContaining(['user_trashed', 'user_restored', 'user_permanently_deleted']),
    )
  })

  it('renames a published Page and creates a permanent redirect for its former slug', async () => {
    const admin = await payload.create({
      collection: 'users',
      data: {
        email: 'page-slug-admin@example.test',
        password: 'test-password',
        role: 'admin',
      },
      draft: false,
      overrideAccess: true,
    })
    const page = await payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        generateSlug: false,
        slug: 'former-page-path',
        title: 'Renamed Page',
      },
      draft: false,
      overrideAccess: false,
      user: admin,
    })

    const updatedPage = await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        _status: 'published',
        generateSlug: false,
        slug: 'current-page-path',
      },
      draft: false,
      overrideAccess: false,
      user: admin,
    })
    const redirects = await payload.find({
      collection: 'redirects',
      depth: 0,
      draft: true,
      overrideAccess: true,
      where: {
        fromPath: {
          equals: '/former-page-path',
        },
      },
    })

    expect(updatedPage.slug).toBe('current-page-path')
    expect(redirects.docs).toHaveLength(1)
    expect(redirects.docs[0]).toEqual(
      expect.objectContaining({
        _status: 'published',
        destinationType: 'page',
        enabled: true,
        page: page.id,
        statusCode: '301',
      }),
    )
  })
  it('retains original form answers through schema changes and operational updates', async () => {
    const { buildFormSubmissionSnapshot } = await import('@/lib/formSubmissionSnapshot')
    const admin = await payload.create({
      collection: 'users',
      data: { email: 'form-history-admin@example.test', password: 'test-password', role: 'admin' },
      overrideAccess: true,
    })
    const form = await payload.create({
      collection: 'forms',
      data: {
        title: 'Custom Department Enquiry',
        slug: 'custom-department-enquiry',
        _status: 'published',
        submissionIntent: 'general',
        submitButtonLabel: 'Send',
        successMessage: 'Received.',
        fields: [
          { label: 'Work email', name: 'work_email', type: 'email', contactRole: 'email' },
          {
            label: 'Preferred department',
            name: 'preferred_department',
            type: 'select',
            options: [{ label: 'Admissions', value: 'admissions' }],
          },
          { label: 'Consent', name: 'consent', type: 'checkbox' },
        ],
      },
      draft: false,
      overrideAccess: false,
      user: admin,
    })
    const values = {
      work_email: 'person@example.test',
      preferred_department: 'admissions',
      consent: true,
    }
    const captured = buildFormSubmissionSnapshot(form, values)
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        ...captured,
        data: values,
        form: form.id,
        status: 'new',
        submissionIntent: 'general',
        submittedAt: new Date().toISOString(),
        submitterEmail: values.work_email,
      },
      overrideAccess: true,
    })
    expect(submission.answers?.[1]).toMatchObject({
      fieldID: form.fields[1].id,
      label: 'Preferred department',
      name: 'preferred_department',
      displayValue: 'Admissions',
      value: { raw: 'admissions' },
    })
    expect(submission.answers?.[2].value).toEqual({ raw: true })

    await payload.update({
      collection: 'forms',
      id: form.id,
      data: {
        fields: [
          {
            ...form.fields[1],
            label: 'New department question',
            name: 'department',
            options: [{ label: 'Student services', value: 'admissions' }],
          },
          form.fields[0],
        ],
      },
      draft: false,
      overrideAccess: false,
      user: admin,
    })
    const updated = await payload.update({
      collection: 'form-submissions',
      id: submission.id,
      data: {
        status: 'in_review',
        internalNotes: 'Follow up.',
        answers: [],
        formRevision: 'tampered',
        formSnapshot: { title: 'tampered' },
      },
      overrideAccess: false,
      user: admin,
    })
    expect(updated.status).toBe('in_review')
    expect(updated.internalNotes).toBe('Follow up.')
    const stored = await payload.findByID({
      collection: 'form-submissions',
      id: submission.id,
      depth: 0,
      overrideAccess: false,
      user: admin,
    })
    expect(stored.formRevision).toBe(captured.formRevision)
    expect(stored.formSnapshot).toEqual(captured.formSnapshot)
    expect(stored.answers).toEqual(submission.answers)
    expect(stored.data).toEqual(values)
  })
  it('persists owner-only activity for an authorized Manager and preserves unchanged timestamps and answers', async () => {
    const makeUser = (email: string, granted: boolean) =>
      payload.create({
        collection: 'users',
        overrideAccess: true,
        data: {
          email,
          password: 'test-password',
          role: 'siteManager',
          features: { formSubmissions: granted },
        },
      })
    const operator = await makeUser('activity-operator@example.test', true)
    const secondOwner = await makeUser('activity-second@example.test', true)
    const denied = await makeUser('activity-denied@example.test', false)
    const form = await payload.create({
      collection: 'forms',
      data: {
        title: 'Activity form',
        slug: 'activity-form',
        _status: 'published',
        submissionIntent: 'general',
        submitButtonLabel: 'Send',
        successMessage: 'Received',
        fields: [{ name: 'question', label: 'Question', type: 'text' }],
      },
    })
    const oldAction = '2000-01-01T00:00:00.000Z'
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        form: form.id,
        data: { question: 'Original answer' },
        submissionIntent: 'general',
        submittedAt: new Date().toISOString(),
        lastActionAt: oldAction,
      },
    })
    expect(typeof operator.id).toBe('string')
    const update = (data: {
      owner?: string | null
      internalNotes?: string
      lastActionAt?: string
    }) =>
      payload.update({
        collection: 'form-submissions',
        id: submission.id,
        data,
        depth: 0,
        overrideAccess: false,
        user: operator,
      })
    for (const owner of [operator.id, secondOwner.id, null]) {
      await payload.update({
        collection: 'form-submissions',
        id: submission.id,
        data: { lastActionAt: oldAction },
        overrideAccess: true,
      })
      const updated = await update({ owner })
      expect(updated.owner ?? null).toBe(owner)
      expect(Date.parse(updated.lastActionAt!)).toBeGreaterThan(Date.parse(oldAction))
      expect(updated.data).toEqual(submission.data)
      expect(updated.submittedAt).toBe(submission.submittedAt)
    }
    const assigned = await update({ owner: operator.id })
    expect((await update({ owner: operator.id })).lastActionAt).toBe(assigned.lastActionAt)
    expect((await update({ internalNotes: '' })).lastActionAt).toBe(assigned.lastActionAt)
    expect((await update({ lastActionAt: oldAction })).lastActionAt).toBe(assigned.lastActionAt)
    await expect(
      payload.update({
        collection: 'form-submissions',
        id: submission.id,
        data: { owner: secondOwner.id },
        overrideAccess: false,
        user: denied,
      }),
    ).rejects.toThrow()
    const stored = await payload.findByID({
      collection: 'form-submissions',
      id: submission.id,
      depth: 0,
    })
    expect(stored.owner).toBe(operator.id)
    expect(stored.lastActionAt).toBe(assigned.lastActionAt)
  })
})
