// @vitest-environment node
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createTestMongoServer } from '../helpers/mongoMemoryServer'
import { projectPublishedGenericForm } from '@/lib/genericFormRevision.server'
import { submissionIdentity } from '@/lib/formSubmissionIdempotency.server'
import type { SimpleFormField } from '@/lib/forms'
import type { FormAttachmentStorage } from '@/lib/formAttachmentStorage.server'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }))
let payload: Payload
let stop: (() => Promise<void>) | undefined
let service: typeof import('@/lib/formAttachments.server')
let storageModule: typeof import('@/lib/formAttachmentStorage.server')
const objects = new Map<string, Buffer>()
const storage: FormAttachmentStorage = {
  put: async (key, bytes) => {
    objects.set(key, bytes)
  },
  get: async (key) => {
    const bytes = objects.get(key)
    if (!bytes) throw new Error('missing')
    return bytes
  },
  remove: async (key) => {
    objects.delete(key)
  },
}
const bytes = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF')
let sequence = 0
async function setup() {
  const form = await payload.create({
    collection: 'forms',
    data: {
      title: 'Private files',
      slug: `private-files-${++sequence}`,
      _status: 'published',
      submissionIntent: 'general',
      submitButtonLabel: 'Send',
      successMessage: 'Received',
      fields: [
        {
          name: 'documents',
          label: 'Documents',
          type: 'file',
          required: true,
          maxFiles: 2,
          maxFileSizeMB: 1,
          allowedFileTypes: ['pdf'],
        },
      ],
    },
  })
  const key = randomUUID()
  const revision = projectPublishedGenericForm(form)!.revision!
  const identity = submissionIdentity(form.slug, key, {}, revision)!
  const field = form.fields[0] as SimpleFormField
  const stage = (overrides = {}) =>
    service.stageFormAttachment({
      payload,
      bytes,
      filename: 'résumé.pdf',
      field,
      formID: form.id,
      keyHash: identity.submissionKeyHash,
      uploadID: randomUUID(),
      storage,
      ...overrides,
    })
  return { form, key, revision, identity, field, stage }
}
describe('private attachments with real Payload, MongoDB and storage', () => {
  beforeAll(async () => {
    const mongo = await createTestMongoServer()
    stop = mongo.stop
    process.env.MONGODB_URI = mongo.uri
    process.env.EMAIL_PROVIDER = 'none'
    process.env.MEDIA_PROVIDER = 'localDisk'
    process.env.FORM_ATTACHMENTS_PROVIDER = 'localDisk'
    process.env.PAYLOAD_SECRET = 'isolated-private-file-test-secret-32-characters'
    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config })
    await Promise.all(
      [...Object.values(payload.db.collections), ...Object.values(payload.db.versions)].map(
        (model) => model.init(),
      ),
    )
    service = await import('@/lib/formAttachments.server')
    storageModule = await import('@/lib/formAttachmentStorage.server')
    vi.spyOn(storageModule, 'getFormAttachmentStorage').mockReturnValue(storage)
  }, 120000)
  afterAll(async () => {
    vi.restoreAllMocks()
    await payload?.destroy()
    await stop?.()
  }, 30000)
  it('keeps an unset native format selector usable after Payload normalizes it to an empty array', async () => {
    const form = await payload.create({
      collection: 'forms',
      data: {
        title: 'Default formats',
        slug: 'default-file-formats',
        _status: 'published',
        submissionIntent: 'general',
        submitButtonLabel: 'Send',
        successMessage: 'Received',
        fields: [{ name: 'file', label: 'File', type: 'file', allowedFileTypes: [] }],
      },
    })
    expect(projectPublishedGenericForm(form)?.fields[0].allowedFileTypes).toEqual([
      'pdf',
      'docx',
      'png',
      'jpg',
    ])
  })
  it('checks PDF, PNG, JPEG and Word content rather than trusting browser MIME', async () => {
    const { field } = await setup()
    const policy = { ...field, allowedFileTypes: ['pdf', 'png', 'jpg', 'docx'] as const }
    const fixtures = [
      ['file.pdf', bytes, 'pdf'],
      [
        'file.png',
        Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a8kcAAAAASUVORK5CYII=',
          'base64',
        ),
        'png',
      ],
      [
        'file.jpeg',
        Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0]),
        'jpg',
      ],
      [
        'file.docx',
        Buffer.from(
          'UEsDBBQAAAAIAEKOTl3GEnoHrAAAAPEAAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbF2Puw7CMAxFf6XKihoXBgaUlIEdGPgBK3HbiOahJBT4exKQOjBax/dcWxxfdm4Wisl4J9mWd+zYi9s7UGoKcUmyKedwAEhqIouJ+0CukMFHi7mMcYSA6o4jwa7r9qC8y+Rym6uD9eJS5NFoaq4Y8xktSQZPHzVorx62bPJiY83pF6vNkmEIs1GYy02wOP3X2fphMIrWfLWF6BWlZNxoZ74Si8Ztqh56Ad+n+g9QSwMEFAAAAAgAQo5OXTzkkq2EAAAAsAAAABEAAAB3b3JkL2RvY3VtZW50LnhtbEXOwQ3DIAwF0FUiBojTHnqIErJEF0jBSZAAI5uWdvtCeujlWV9ftjwt7+C7F7I4irO69INa9FRGS+YZMOau1lHGMqsj5zQCiDkwrNJTwli7jTisuUbeoRDbxGRQxMU9eLgOww3C6qJqJx9kP22mBjeyvqPkbnMeJ2ixyafp9LcC/3f0F1BLAQIUAxQAAAAIAEKOTl3GEnoHrAAAAPEAAAATAAAAAAAAAAAAAACAAQAAAABbQ29udGVudF9UeXBlc10ueG1sUEsBAhQDFAAAAAgAQo5OXTzkkq2EAAAAsAAAABEAAAAAAAAAAAAAAIAB3QAAAHdvcmQvZG9jdW1lbnQueG1sUEsFBgAAAAACAAIAgAAAAJABAAAAAA==',
          'base64',
        ),
        'docx',
      ],
    ] as const
    for (const [filename, data, expected] of fixtures)
      expect(
        (
          await service.verifyFormFileBytes(data, filename, {
            ...policy,
            allowedFileTypes: [...policy.allowedFileTypes],
          })
        ).fileType,
      ).toBe(expected)
    await expect(
      service.verifyFormFileBytes(bytes, 'disguised.png', {
        ...policy,
        allowedFileTypes: [...policy.allowedFileTypes],
      }),
    ).rejects.toThrow('extension')
  })
  it('retries the same upload safely and rejects changed bytes using the same identity', async () => {
    const { stage } = await setup()
    const uploadID = randomUUID()
    const first = await stage({ uploadID })
    expect(await stage({ uploadID })).toEqual(first)
    await expect(stage({ uploadID, bytes: Buffer.from('%PDF-1.7 changed') })).rejects.toThrow(
      'changed',
    )
    expect(objects.get(first.token)).toEqual(bytes)
  })
  it('limits streamed bytes and rejects disguised/empty files before metadata storage', async () => {
    const { stage, form, field, key, revision } = await setup()
    await expect(stage({ bytes: Buffer.from('not a PDF') })).rejects.toThrow('content')
    await expect(stage({ filename: '../résumé.pdf' })).rejects.toThrow('filename')
    await expect(stage({ bytes: Buffer.alloc(0) })).rejects.toThrow('empty')
    const { POST } = await import('@/app/api/forms/[slug]/attachments/route')
    const response = await POST(
      new Request('http://localhost/upload', {
        method: 'POST',
        headers: {
          'content-type': 'application/octet-stream',
          'x-form-revision': revision,
          'x-submission-key': key,
          'x-upload-id': randomUUID(),
          'x-field-id': field.id!,
          'x-file-name': 'large.pdf',
        },
        body: Buffer.alloc(3 * 1024 * 1024 + 1),
      }),
      { params: Promise.resolve({ slug: form.slug }) },
    )
    expect(response.status).toBe(413)
    expect(
      (
        await payload.count({
          collection: 'form-attachments',
          where: { formID: { equals: form.id } },
        })
      ).totalDocs,
    ).toBe(0)
  })
  it('keeps failed storage metadata for cleanup and permits the same explicit retry', async () => {
    const { stage } = await setup()
    const uploadID = randomUUID()
    await expect(
      stage({
        uploadID,
        storage: {
          ...storage,
          put: async () => {
            throw new Error('storage unavailable')
          },
        },
      }),
    ).rejects.toThrow('storage unavailable')
    const doc = (
      await payload.find({
        collection: 'form-attachments',
        where: { state: { equals: 'staging' } },
        depth: 0,
        limit: 1,
      })
    ).docs[0]
    expect(doc).toBeTruthy()
    expect((await stage({ uploadID })).token).toBe(doc.token)
  })
  it('captures files transactionally, replays receipt, protects downloads, and retains trashed files', async () => {
    const { stage, form, key, revision } = await setup()
    const file = await stage()
    const { POST } = await import('@/app/api/forms/[slug]/submit/route')
    const body = { values: { documents: [file.token] }, submissionKey: key, formRevision: revision }
    const submit = (data = body) =>
      POST(
        new Request('http://localhost/submit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        }),
        { params: Promise.resolve({ slug: form.slug }) },
      )
    expect((await submit({ ...body, submissionKey: randomUUID() })).status).toBe(400)
    expect((await submit()).status).toBe(200)
    expect((await submit()).status).toBe(200)
    const records = await payload.find({
      collection: 'form-submissions',
      where: { form: { equals: form.id } },
    })
    expect(records.totalDocs).toBe(1)
    const submission = records.docs[0]
    expect(submission.answers?.[0].displayValue).toBe('résumé.pdf')
    expect(submission.attachments?.[0]).toMatchObject(file)
    const admin = await payload.create({
      collection: 'users',
      data: {
        role: 'admin',
        email: 'files-admin@example.test',
        password: 'Test-only-file-password-123!',
      },
    })
    const manager = await payload.create({
      collection: 'users',
      data: {
        role: 'siteManager',
        email: 'files-manager@example.test',
        password: 'Test-only-file-password-123!',
      },
    })
    const granted = await payload.create({
      collection: 'users',
      data: {
        role: 'siteManager',
        email: 'files-inbox@example.test',
        password: 'Test-only-file-password-123!',
        features: { formSubmissions: true },
      },
    })
    const { GET } = await import('@/app/api/form-submissions/[id]/attachments/[token]/route')
    const download = () =>
      GET(new Request('http://localhost/download'), {
        params: Promise.resolve({ id: submission.id, token: file.token }),
      })
    const auth = vi.spyOn(payload, 'auth')
    for (const user of [null, manager]) {
      auth.mockResolvedValue({ user } as never)
      expect((await download()).status).toBe(404)
    }
    for (const user of [admin, granted]) {
      auth.mockResolvedValue({ user } as never)
      const response = await download()
      expect(response.status).toBe(200)
      expect(response.headers.get('content-disposition')).toContain('attachment;')
      expect(response.headers.get('cache-control')).toBe('private, no-store')
      expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes)
    }
    await expect(
      payload.findByID({
        collection: 'form-attachments',
        id: (
          await payload.find({
            collection: 'form-attachments',
            where: { token: { equals: file.token } },
          })
        ).docs[0].id,
        user: admin,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    auth.mockResolvedValue({ user: admin } as never)
    const unrelated = await GET(new Request('http://localhost/download'), {
      params: Promise.resolve({ id: submission.id, token: randomUUID() }),
    })
    expect(unrelated.status).toBe(404)
    objects.set(file.token, Buffer.from('tampered'))
    expect((await download()).status).toBe(404)
    objects.set(file.token, bytes)
    // Original files survive deletion of the current reusable Form.
    await payload.delete({ collection: 'forms', id: form.id })
    expect((await download()).status).toBe(200)
    auth.mockRestore()
    await payload.update({
      collection: 'form-submissions',
      id: submission.id,
      data: { deletedAt: new Date().toISOString() },
    })
    const future = new Date(Date.now() + 25 * 60 * 60 * 1000)
    await service.cleanupFormAttachments(payload, storage, future)
    expect(objects.has(file.token)).toBe(true)
    await payload.delete({ collection: 'form-submissions', id: submission.id, trash: true })
    await service.cleanupFormAttachments(
      payload,
      storage,
      new Date(future.getTime() + 25 * 60 * 60 * 1000),
    )
    expect(objects.has(file.token)).toBe(false)
  })
  it('rolls back claims when capture fails and accepts the same deliberate retry', async () => {
    const { stage, form, key, revision } = await setup()
    const file = await stage()
    const { POST } = await import('@/app/api/forms/[slug]/submit/route')
    const submit = () =>
      POST(
        new Request('http://localhost/submit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            values: { documents: [file.token] },
            submissionKey: key,
            formRevision: revision,
          }),
        }),
        { params: Promise.resolve({ slug: form.slug }) },
      )
    const original = payload.create.bind(payload)
    const create = vi.spyOn(payload, 'create').mockImplementation(async (options) => {
      if (options.collection === 'form-submissions') throw new Error('synthetic capture failure')
      return original(options)
    })
    expect((await submit()).status).toBe(503)
    create.mockRestore()
    expect(
      (
        await payload.find({
          collection: 'form-attachments',
          where: { token: { equals: file.token } },
          depth: 0,
        })
      ).docs[0].state,
    ).toBe('ready')
    expect(
      (
        await payload.count({
          collection: 'form-submissions',
          where: { form: { equals: form.id } },
        })
      ).totalDocs,
    ).toBe(0)
    expect((await submit()).status).toBe(200)
  })
  it('cleanup deletes abandoned files and retries failed external deletion', async () => {
    const { stage } = await setup()
    const file = await stage()
    const future = new Date(Date.now() + 25 * 60 * 60 * 1000)
    expect(
      (
        await service.cleanupFormAttachments(
          payload,
          {
            ...storage,
            remove: async () => {
              throw new Error('temporary deletion failure')
            },
          },
          future,
        )
      ).failed,
    ).toBeGreaterThan(0)
    expect(objects.has(file.token)).toBe(true)
    await service.cleanupFormAttachments(payload, storage, future)
    expect(objects.has(file.token)).toBe(false)
  })
  it('uses owner-only private local storage and rejects path traversal', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'private-form-files-'))
    try {
      const local = storageModule.createFormAttachmentStorage({ provider: 'localDisk' }, directory)
      const token = randomUUID()
      await local.put(token, bytes)
      expect(await local.get(token)).toEqual(bytes)
      expect((await stat(path.join(directory, token))).mode & 0o777).toBe(0o600)
      await expect(local.get('../secret')).rejects.toThrow('storage key')
      await local.remove(token)
      await expect(local.get(token)).rejects.toThrow()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
