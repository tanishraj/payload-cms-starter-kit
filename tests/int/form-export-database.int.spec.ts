// @vitest-environment node
import { getPayload, handleEndpoints, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createTestMongoServer } from '../helpers/mongoMemoryServer'
import { buildFormSubmissionSnapshot } from '@/lib/formSubmissionSnapshot'
import type { Form, User } from '@/payload-types'
import type { FormEntry } from '@/lib/formLayout'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }))
let payload: Payload
let stop: (() => Promise<void>) | undefined
let form: Form
let other: Form
let headers: HeadersInit
let managerHeaders: HeadersInit
let dependencyHeaders: HeadersInit
let submissionID: string
const password = 'Isolated-export-test-password-123!'
async function signIn(user: User) {
  const response = await handleEndpoints({
    config: payload.config,
    request: new Request('http://localhost/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password }),
    }),
  })
  expect(response.status).toBe(200)
  const cookie = response.headers
    .getSetCookie()
    .find((value) => value.startsWith(`${payload.config.cookiePrefix}-token=`))
    ?.split(';')[0]
  if (!cookie) throw new Error('Expected the native login session cookie')
  return { Cookie: cookie, 'Sec-Fetch-Site': 'same-origin' }
}
const dispatch = (query = '', auth?: HeadersInit) =>
  handleEndpoints({
    config: payload.config,
    request: new Request(`http://localhost/api/form-submissions/export${query}`, { headers: auth }),
  })
const filter = (id: string) =>
  '?filter=' + encodeURIComponent(JSON.stringify({ form: { equals: id } }))

describe('historical exports through native REST and real MongoDB', () => {
  beforeAll(async () => {
    const mongo = await createTestMongoServer()
    stop = mongo.stop
    process.env.MONGODB_URI = mongo.uri
    process.env.EMAIL_PROVIDER = 'none'
    process.env.MEDIA_PROVIDER = 'localDisk'
    process.env.PAYLOAD_SECRET = 'isolated-export-test-secret-32-characters'
    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config })
    await Promise.all(
      [...Object.values(payload.db.collections), ...Object.values(payload.db.versions)].map(
        (model) => model.init(),
      ),
    )
    const admin = await payload.create({
      collection: 'users',
      data: { email: 'export-admin@example.test', role: 'admin', password },
    })
    const exportRoot = await payload.create({
      collection: 'pages',
      draft: true,
      data: { title: 'Export section', layout: [] },
    })
    const manager = await payload.create({
      collection: 'users',
      data: {
        email: 'export-manager@example.test',
        role: 'siteManager',
        features: { formSubmissions: true },
        sectionRoots: [exportRoot.id],
        password,
      },
    })
    const dependency = await payload.create({
      collection: 'users',
      data: {
        email: 'export-dependency@example.test',
        role: 'siteManager',
        features: { reviews: true, forms: true },
        password,
      },
    })
    headers = await signIn(admin)
    managerHeaders = await signIn(manager)
    dependencyHeaders = await signIn(dependency)
    async function makeForm(slug: string) {
      return payload.create({
        collection: 'forms',
        data: {
          title: 'Original enquiry',
          slug,
          _status: 'published',
          submissionIntent: 'general',
          submitButtonLabel: 'Send',
          successMessage: 'Received',
          fields: [
            { name: 'visitor', label: 'Original visitor', type: 'text' },
            {
              name: 'department',
              label: 'Original department',
              type: 'select',
              options: [{ label: 'Original admissions', value: 'admissions' }],
            },
          ],
        },
      })
    }
    form = await makeForm('export-original')
    other = await makeForm('export-other')
    for (const item of [form, other]) {
      const values = {
        visitor: item === form ? '=HYPERLINK("bad")' : 'Other private answer',
        department: 'admissions',
      }
      const submission = await payload.create({
        collection: 'form-submissions',
        data: {
          form: item.id,
          sectionRoot: exportRoot.id,
          submissionIntent: 'general',
          data: values,
          submittedAt: '2026-10-16T00:00:00.000Z',
          source: 'Export fixture',
          internalNotes: 'Never export internal notes',
          ...buildFormSubmissionSnapshot({ ...item, fields: item.fields as FormEntry[] }, values),
        },
      })
      if (item === form) submissionID = submission.id
    }
  }, 120000)
  afterAll(async () => {
    await payload?.destroy()
    await stop?.()
  }, 30000)

  it('authenticates native REST and denies dependency-only access', async () => {
    expect((await dispatch()).status).toBe(401)
    expect((await dispatch('', dependencyHeaders)).status).toBe(403)
    expect((await dispatch(filter(form.id), managerHeaders)).status).toBe(200)
  })
  it('exports original names/labels/revision after rename, removal, type changes, key reuse and Form deletion', async () => {
    const before = await dispatch(filter(form.id), headers)
    expect(before.status).toBe(200)
    const original = await before.text()
    expect(original).toContain('Original admissions')
    expect(original).toContain('"\'=HYPERLINK(')
    expect(original).not.toContain('Other private answer')
    expect(original).not.toContain('Never export internal notes')
    await payload.update({
      collection: 'forms',
      id: form.id,
      data: {
        _status: 'published',
        title: 'New title',
        fields: [
          { ...form.fields[1], name: 'renamed_department', label: 'Changed label', type: 'text' },
          { name: 'department', label: 'Reused key', type: 'number' },
        ],
      },
    })
    expect(await (await dispatch(filter(form.id), headers)).text()).toBe(original)
    await payload.delete({ collection: 'forms', id: form.id })
    expect(await (await dispatch(filter(form.id), headers)).text()).toBe(original)
    expect(original).toContain(submissionID)
  })
  it('reuses native search and respects collection row constraints rather than bypassing access', async () => {
    const searched = await dispatch('?search=does-not-match', headers)
    expect(searched.status).toBe(200)
    expect(searched.headers.get('x-submission-count')).toBe('0')
    const config = payload.collections['form-submissions'].config
    const original = config.access.read
    try {
      config.access.read = () => ({ form: { equals: other.id } })
      const deniedRows = await dispatch(filter(form.id), managerHeaders)
      expect(deniedRows.status).toBe(200)
      expect(deniedRows.headers.get('x-submission-count')).toBe('0')
      expect(await deniedRows.text()).not.toContain(submissionID)
    } finally {
      config.access.read = original
    }
  })
  it.each([{ nonexistentField: { equals: 'x' } }, { status: null }, { status: {} }])(
    'rejects invalid query %j without silently exporting every submission',
    async (where) => {
      const response = await dispatch(
        '?filter=' + encodeURIComponent(JSON.stringify(where)),
        headers,
      )
      expect(response.status).toBe(400)
      expect(response.headers.get('content-disposition')).toBeNull()
    },
  )
  it('excludes trashed submissions from ordinary exports', async () => {
    await payload.update({
      collection: 'form-submissions',
      id: submissionID,
      data: { deletedAt: new Date().toISOString() },
    })
    const response = await dispatch(filter(form.id), headers)
    expect(response.status).toBe(200)
    expect(response.headers.get('x-submission-count')).toBe('0')
  })
})
