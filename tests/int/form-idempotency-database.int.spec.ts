// @vitest-environment node
import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { getPayload, type Payload } from 'payload'
import { createTestMongoServer } from '../helpers/mongoMemoryServer'
import {
  findSubmissionReceipt,
  hasSubmissionKeyIndex,
  submissionIdentity,
} from '@/lib/formSubmissionIdempotency.server'
import { projectPublishedGenericForm } from '@/lib/genericFormRevision.server'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }))

let payload: Payload
let stop: (() => Promise<void>) | undefined
describe('durable form submission retries', () => {
  beforeAll(async () => {
    const mongo = await createTestMongoServer()
    stop = mongo.stop
    process.env.MONGODB_URI = mongo.uri
    process.env.EMAIL_PROVIDER = 'none'
    process.env.MEDIA_PROVIDER = 'localDisk'
    process.env.PAYLOAD_SECRET = 'disposable-idempotency-test-only'
    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config })
    await Promise.all(
      [...Object.values(payload.db.collections), ...Object.values(payload.db.versions)].map(
        (model) => model.init(),
      ),
    )
  }, 120000)
  afterAll(async () => {
    if (payload) await payload.destroy()
    await stop?.()
  }, 30000)

  it('accepts one concurrent attempt, replays after publication changes, rejects different answers and permits a new response', async () => {
    const form = await payload.create({
      collection: 'forms',
      data: {
        title: 'Retry test',
        slug: 'durable-retry-test',
        _status: 'published',
        fields: [{ name: 'question', label: 'Question', type: 'text', required: true }],
        submitButtonLabel: 'Send',
        successMessage: 'Original confirmation',
        submissionIntent: 'general',
      },
    })
    expect(await hasSubmissionKeyIndex(payload)).toBe(true)
    const { POST } = await import('@/app/api/forms/[slug]/submit/route')
    const body = {
      submissionKey: randomUUID(),
      formRevision: projectPublishedGenericForm(form)!.revision,
      values: { question: 'Hello' },
    }
    const submit = (data = body) =>
      POST(
        new Request('http://localhost/api/forms/durable-retry-test/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.0.2.123' },
          body: JSON.stringify(data),
        }),
        { params: Promise.resolve({ slug: form.slug }) },
      )
    const replies = await Promise.all(Array.from({ length: 3 }, () => submit()))
    expect(replies.some((reply) => reply.status === 200)).toBe(true)
    for (const reply of replies) {
      expect([200, 503]).toContain(reply.status)
      const confirmed = reply.status === 503 ? await submit() : reply
      expect(confirmed.status).toBe(200)
      expect(await confirmed.json()).toEqual({ message: 'Original confirmation' })
    }
    expect(
      (
        await payload.count({
          collection: 'form-submissions',
          where: { form: { equals: form.id } },
        })
      ).totalDocs,
    ).toBe(1)
    const identity = submissionIdentity(
      form.slug,
      body.submissionKey,
      body.values,
      body.formRevision,
    )!
    const receipt = await findSubmissionReceipt(payload, identity.submissionKeyHash)
    expect(receipt?.submissionRequestHash).toBe(identity.submissionRequestHash)
    await payload.update({
      collection: 'forms',
      id: form.id,
      data: { _status: 'published', successMessage: 'New confirmation' },
    })
    expect(await (await submit()).json()).toEqual({ message: 'Original confirmation' })
    expect((await submit({ ...body, values: { question: 'Different' } })).status).toBe(409)
    const latest = await payload.findByID({ collection: 'forms', id: form.id })
    expect(
      (
        await submit({
          ...body,
          submissionKey: randomUUID(),
          formRevision: projectPublishedGenericForm(latest)!.revision,
        })
      ).status,
    ).toBe(200)
    expect(
      (
        await payload.count({
          collection: 'form-submissions',
          where: { form: { equals: form.id } },
        })
      ).totalDocs,
    ).toBe(2)
    // Missing-key legacy documents coexist with the sparse unique index.
    await payload.create({
      collection: 'form-submissions',
      data: {
        form: form.id,
        submissionIntent: 'general',
        submittedAt: new Date().toISOString(),
        data: { question: 'Legacy one' },
      },
    })
    await payload.create({
      collection: 'form-submissions',
      data: {
        form: form.id,
        submissionIntent: 'general',
        submittedAt: new Date().toISOString(),
        data: { question: 'Legacy two' },
      },
    })
    expect(
      (
        await payload.count({
          collection: 'form-submissions',
          where: { form: { equals: form.id } },
        })
      ).totalDocs,
    ).toBe(4)
    await payload.update({
      collection: 'form-submissions',
      id: receipt!.id,
      data: { deletedAt: new Date().toISOString() },
    })
    expect(await (await submit()).json()).toEqual({ message: 'Original confirmation' })
    expect(
      (
        await payload.count({
          collection: 'form-submissions',
          trash: true,
          where: { form: { equals: form.id } },
        })
      ).totalDocs,
    ).toBe(4)
  }, 30000)
})
