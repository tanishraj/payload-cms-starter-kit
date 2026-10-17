// @vitest-environment node
import { getPayload, handleEndpoints, createLocalReq, type Payload } from 'payload'
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'
import { createTestMongoServer } from '../helpers/mongoMemoryServer'
import type { User, Page, Form } from '@/payload-types'
import { restorePageVersionAsDraft } from '@/lib/pageDraftRestoration'
import { loadDashboardOnboarding, loadDashboardSections } from '@/lib/adminOnboarding'
import { recipeSectionsQuery, parseRecipeSectionOptions } from '@/page-recipes/sectionOptions'
import { ONBOARDING_PREFERENCE_KEY } from '@/lib/adminOnboardingShared'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }))
let payload: Payload, stop: (() => Promise<void>) | undefined
let admin: User, manager: User, otherManager: User
let a: Page, b: Page, child: Page, otherChild: Page, ownedForm: Form, sharedForm: Form
const password = 'Section-test-only-password-123!'
const asManager = () => ({ user: manager, overrideAccess: false as const })
const page = (title: string, parent?: string) =>
  payload.create({
    collection: 'pages',
    user: admin,
    data: {
      title,
      slug: title.toLowerCase().replaceAll(' ', '-'),
      parent,
      _status: 'published',
      layout: [],
    },
  })
const form = (title: string, sectionRoot?: string) =>
  payload.create({
    collection: 'forms',
    user: admin,
    data: {
      title,
      slug: title.toLowerCase().replaceAll(' ', '-'),
      sectionRoot,
      _status: 'published',
      submissionIntent: 'general',
      submitButtonLabel: 'Send',
      successMessage: 'Received',
      fields: [{ name: 'message', label: 'Message', type: 'text' }],
      notificationRecipients: [{ email: 'private-team@example.test' }],
    },
  })
const dispatch = (path: string, headers?: HeadersInit, init: RequestInit = {}) =>
  handleEndpoints({
    config: payload.config,
    request: new Request('http://localhost/api/' + path, {
      ...init,
      headers: { ...headers, ...init.headers },
    }),
  })
async function login(user: User) {
  const response = await dispatch('users/login', undefined, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password }),
  })
  expect(response.status).toBe(200)
  const cookie = response.headers
    .getSetCookie()
    .find((c) => c.startsWith(`${payload.config.cookiePrefix}-token=`))
    ?.split(';')[0]
  if (!cookie) throw new Error('No test session cookie')
  return { Cookie: cookie, 'Sec-Fetch-Site': 'same-origin' }
}

describe('section boundaries through real Payload and MongoDB', () => {
  beforeAll(async () => {
    const mongo = await createTestMongoServer()
    stop = mongo.stop
    process.env.MONGODB_URI = mongo.uri
    process.env.EMAIL_PROVIDER = 'none'
    process.env.MEDIA_PROVIDER = 'localDisk'
    process.env.PAYLOAD_SECRET = 'section-only-test-secret-32-characters'
    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config })
    await Promise.all(
      [...Object.values(payload.db.collections), ...Object.values(payload.db.versions)].map((m) =>
        m.init(),
      ),
    )
    admin = await payload.create({
      collection: 'users',
      data: { email: 'section-admin@example.test', password, role: 'admin' },
    })
    a = await page('Section A')
    b = await page('Section B')
    child = await page('A child', a.id)
    otherChild = await page('B child', b.id)
    manager = await payload.create({
      collection: 'users',
      data: {
        email: 'section-manager@example.test',
        password,
        role: 'siteManager',
        sectionRoots: [a.id],
        features: {
          pages: true,
          forms: true,
          reusableSections: true,
          formSubmissions: true,
          actionQueue: true,
          auditLog: true,
        },
      },
    })
    otherManager = await payload.create({
      collection: 'users',
      data: {
        email: 'section-other@example.test',
        password,
        role: 'siteManager',
        sectionRoots: [b.id],
        features: { pages: true, forms: true, formSubmissions: true },
      },
    })
    ownedForm = await form('Owned A', a.id)
    sharedForm = await form('Shared form')
  }, 120000)
  afterAll(async () => {
    await payload?.destroy()
    await stop?.()
  }, 30000)

  it('lists only assigned roots through the native recipe query and creates access-enforced recipe drafts', async () => {
    const headers = await login(manager)
    const rootsResponse = await dispatch(`pages?${recipeSectionsQuery()}`, headers)
    expect(rootsResponse.status).toBe(200)
    const roots = parseRecipeSectionOptions(await rootsResponse.json())
    expect(roots).toEqual([{ id: a.id, label: 'Section A (/section-a)' }])
    const createdIDs: string[] = []
    try {
      for (const recipe of ['blank', 'landing']) {
        const result = await dispatch('pages/create-from-recipe', headers, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe, title: `Scoped ${recipe} recipe`, parent: a.id }),
        })
        expect(result.status).toBe(201)
        const { id } = await result.json()
        createdIDs.push(id)
        const saved = await payload.findByID({
          collection: 'pages',
          id,
          ...asManager(),
          draft: true,
          depth: 0,
        })
        expect(saved.parent).toBe(a.id)
        expect(saved._status).toBe('draft')
        expect(saved.layout?.map((block) => block.blockType)).toEqual(
          recipe === 'blank' ? [] : ['pageHeader', 'breadcrumb'],
        )
        const publicResult = await dispatch(`pages/${id}`)
        expect(publicResult.status).not.toBe(200)
      }
      const denied = await dispatch('pages/create-from-recipe', headers, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe: 'landing', title: 'Forged recipe', parent: b.id }),
      })
      expect(denied.status).toBe(403)
      const absent = await payload.find({
        collection: 'pages',
        where: { title: { equals: 'Forged recipe' } },
      })
      expect(absent.docs).toHaveLength(0)
    } finally {
      for (const id of createdIDs) await payload.delete({ collection: 'pages', id, user: admin })
    }
  })

  it('lists only root and descendants, including new descendants and renamed URLs', async () => {
    const result = await payload.find({
      collection: 'pages',
      ...asManager(),
      draft: true,
      depth: 0,
    })
    expect(result.docs.map((d) => d.id).sort()).toEqual([a.id, child.id].sort())
    const created = await payload.create({
      collection: 'pages',
      ...asManager(),
      data: { title: 'Manager page', parent: child.id, layout: [] },
      draft: true,
    })
    await payload.update({
      collection: 'pages',
      id: created.id,
      ...asManager(),
      data: { _status: 'published', slug: 'changed-name' },
    })
    expect(
      (await payload.findByID({ collection: 'pages', id: created.id, ...asManager(), draft: true }))
        .slug,
    ).toBe('changed-name')
    await expect(
      payload.findByID({ collection: 'pages', id: otherChild.id, ...asManager(), draft: true }),
    ).rejects.toThrow()
    const publicRead = await dispatch(`pages/${otherChild.id}`)
    expect(publicRead.status).toBe(200)
  })
  it('rejects root creation, forged parents, cross-section writes and moving/trashing roots', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        ...asManager(),
        draft: true,
        data: { title: 'Forged root' },
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'pages',
        ...asManager(),
        draft: true,
        data: { title: 'Forged child', parent: b.id },
      }),
    ).rejects.toThrow()
    await expect(
      payload.update({
        collection: 'pages',
        id: otherChild.id,
        ...asManager(),
        data: { title: 'Intrusion' },
      }),
    ).rejects.toThrow()
    await expect(
      payload.update({ collection: 'pages', id: child.id, ...asManager(), data: { parent: b.id } }),
    ).rejects.toThrow()
    await expect(
      payload.update({ collection: 'pages', id: a.id, ...asManager(), data: { parent: b.id } }),
    ).rejects.toThrow()
    await expect(
      payload.update({
        collection: 'pages',
        id: a.id,
        ...asManager(),
        data: { deletedAt: new Date().toISOString() },
      }),
    ).rejects.toThrow()
  })
  it('uses current hierarchy for history and restore after an Admin moves a Page', async () => {
    const versions = await payload.findVersions({
      collection: 'pages',
      user: admin,
      where: { parent: { equals: child.id } },
    })
    expect(versions.docs.length).toBeGreaterThan(0)
    await payload.update({ collection: 'pages', id: child.id, user: admin, data: { parent: b.id } })
    const history = await payload.findVersions({
      collection: 'pages',
      ...asManager(),
      where: { parent: { equals: child.id } },
    })
    expect(history.docs).toHaveLength(0)
    await expect(
      payload.findVersionByID({ collection: 'pages', id: versions.docs[0].id, ...asManager() }),
    ).rejects.toThrow()
    await expect(
      restorePageVersionAsDraft({
        req: await createLocalReq({ user: manager }, payload),
        versionID: versions.docs[0].id,
      }),
    ).rejects.toThrow()
    await expect(
      payload.findByID({ collection: 'pages', id: child.id, ...asManager(), draft: true }),
    ).rejects.toThrow()
    await payload.update({ collection: 'pages', id: child.id, user: admin, data: { parent: a.id } })
  })
  it('supports owned Forms and read-only shared definitions without private settings', async () => {
    const created = await payload.create({
      collection: 'forms',
      ...asManager(),
      data: {
        title: 'Manager form',
        sectionRoot: a.id,
        submissionIntent: 'general',
        submitButtonLabel: 'Send',
        successMessage: 'OK',
        fields: [],
      },
      draft: true,
    })
    expect(created.sectionRoot).toBeTruthy()
    await expect(
      payload.create({
        collection: 'forms',
        ...asManager(),
        draft: true,
        data: {
          title: 'Shared intrusion',
          submissionIntent: 'general',
          submitButtonLabel: 'Send',
          successMessage: 'OK',
        },
      }),
    ).rejects.toThrow()
    await expect(
      payload.update({
        collection: 'forms',
        id: sharedForm.id,
        ...asManager(),
        data: { title: 'Changed shared' },
      }),
    ).rejects.toThrow()
    await expect(
      payload.update({
        collection: 'forms',
        id: created.id,
        ...asManager(),
        data: { sectionRoot: b.id },
      }),
    ).rejects.toThrow()
    const shared = await payload.findByID({
      collection: 'forms',
      id: sharedForm.id,
      ...asManager(),
      depth: 0,
    })
    expect(shared.title).toBe('Shared form')
    expect(shared.notificationRecipients).toEqual([])
    expect(JSON.stringify(shared)).not.toContain('private-team@example.test')
    const own = await payload.findByID({
      collection: 'forms',
      id: ownedForm.id,
      ...asManager(),
      depth: 0,
    })
    expect(own.notificationRecipients?.[0].email).toBe('private-team@example.test')
  })
  it('denies self-assigned sections and invalid roots; changing grants invalidates sessions', async () => {
    await expect(
      payload.update({
        collection: 'users',
        id: manager.id,
        ...asManager(),
        data: { sectionRoots: [b.id] },
      }),
    ).resolves.toBeDefined()
    const fresh = await payload.findByID({ collection: 'users', id: manager.id, depth: 0 })
    expect(fresh.sectionRoots).toEqual([a.id])
    await expect(
      payload.update({
        collection: 'users',
        id: manager.id,
        user: admin,
        data: { sectionRoots: [child.id] },
      }),
    ).rejects.toThrow()
    const headers = await login(manager)
    const me = (await (await dispatch('users/me?depth=0', headers)).json()).user
    expect(me.role).toBe('siteManager')
    expect(me.features.pages).toBe(true)
    expect(me.sectionRoots).toEqual([a.id])
    expect((await dispatch(`pages/${a.id}?draft=true`, headers)).status).toBe(200)
    await payload.update({
      collection: 'users',
      id: manager.id,
      user: admin,
      data: { sectionRoots: [b.id] },
    })
    expect((await (await dispatch('users/me', headers)).json()).user).toBeNull()
    const revoked = await dispatch(`pages/${a.id}`, headers, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Revoked write' }),
    })
    expect(revoked.status).not.toBe(200)
    await payload.update({
      collection: 'users',
      id: manager.id,
      user: admin,
      data: { sectionRoots: [a.id] },
    })
  })
  it('scopes inbox, CSV and operational records independently from Form placement', async () => {
    const one = await payload.create({
      collection: 'form-submissions',
      data: {
        form: ownedForm.id,
        sectionRoot: a.id,
        submissionIntent: 'general',
        submittedAt: new Date().toISOString(),
        data: { message: 'A private answer' },
      },
    })
    const two = await payload.create({
      collection: 'form-submissions',
      data: {
        form: sharedForm.id,
        sectionRoot: b.id,
        submissionIntent: 'general',
        submittedAt: new Date().toISOString(),
        data: { message: 'B private answer' },
      },
    })
    const headers = await login(manager)
    const inbox = await payload.find({ collection: 'form-submissions', ...asManager(), depth: 0 })
    expect(inbox.docs.map((d) => d.id)).toContain(one.id)
    expect(inbox.docs.map((d) => d.id)).not.toContain(two.id)
    const csv = await dispatch('form-submissions/export', headers)
    expect(csv.status).toBe(200)
    const body = await csv.text()
    expect(body).toContain('A private answer')
    expect(body).not.toContain('B private answer')
    const queue = await payload.find({ collection: 'work-queue', ...asManager(), depth: 0 })
    expect(queue.docs.some((d) => d.sourceID === one.id)).toBe(true)
    expect(queue.docs.some((d) => d.sourceID === two.id)).toBe(false)
    const audit = await payload.find({
      collection: 'operational-audit-events',
      ...asManager(),
      depth: 0,
      limit: 100,
    })
    expect(audit.docs.some((d) => d.entityId === otherChild.id)).toBe(false)
    await payload.update({
      collection: 'users',
      id: manager.id,
      user: admin,
      data: { features: { ...manager.features, formSubmissions: false } },
    })
    const placementHeaders = await login(manager)
    expect((await dispatch('form-submissions/export', placementHeaders)).status).toBe(403)
    expect((await dispatch(`form-submissions/${one.id}`, placementHeaders)).status).not.toBe(200)
    await payload.update({
      collection: 'users',
      id: manager.id,
      user: admin,
      data: { features: manager.features },
    })
  })
  it('captures submission access at intake without transferring older answers when a Form moves', async () => {
    const mail = vi.spyOn(payload, 'sendEmail').mockResolvedValue({} as never)
    try {
      const response = await dispatch(`forms/${ownedForm.slug}/submit`, undefined, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: { message: 'Section capture' } }),
      })
      expect(response.status).toBe(200)
      const stored = (
        await payload.find({
          collection: 'form-submissions',
          where: { 'data.message': { equals: 'Section capture' } },
          depth: 0,
        })
      ).docs[0]
      expect(stored.sectionRoot).toBe(a.id)
      await payload.update({
        collection: 'forms',
        id: ownedForm.id,
        user: admin,
        data: { sectionRoot: b.id },
      })
      expect(
        (
          await payload.findByID({
            collection: 'form-submissions',
            id: stored.id,
            ...asManager(),
            depth: 0,
          })
        ).sectionRoot,
      ).toBe(a.id)
      await expect(
        payload.findByID({
          collection: 'form-submissions',
          id: stored.id,
          user: otherManager,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    } finally {
      mail.mockRestore()
      await payload.update({
        collection: 'forms',
        id: ownedForm.id,
        user: admin,
        data: { sectionRoot: a.id },
      })
    }
  })
  it('uses current draft ownership for Form history and restore', async () => {
    const versions = await payload.findVersions({
      collection: 'forms',
      where: { parent: { equals: ownedForm.id } },
    })
    await payload.update({
      collection: 'forms',
      id: ownedForm.id,
      user: admin,
      draft: true,
      data: { sectionRoot: b.id },
    })
    try {
      await expect(
        payload.findByID({ collection: 'forms', id: ownedForm.id, ...asManager(), draft: true }),
      ).rejects.toThrow()
      expect(
        (
          await payload.findVersions({
            collection: 'forms',
            ...asManager(),
            where: { parent: { equals: ownedForm.id } },
          })
        ).docs,
      ).toHaveLength(0)
      await expect(
        payload.restoreVersion({ collection: 'forms', id: versions.docs[0].id, ...asManager() }),
      ).rejects.toThrow()
    } finally {
      await payload.update({
        collection: 'forms',
        id: ownedForm.id,
        user: admin,
        data: { sectionRoot: a.id, _status: 'published' },
      })
    }
  })
  it('keeps authorized Trash recovery usable and denies writes when no sections are assigned', async () => {
    const reusable = await payload.create({
      collection: 'reusable-sections',
      ...asManager(),
      draft: true,
      data: { title: 'Scoped reusable', sectionRoot: a.id, layout: [] },
    })
    await payload.update({
      collection: 'reusable-sections',
      id: reusable.id,
      ...asManager(),
      data: { deletedAt: new Date().toISOString() },
    })
    expect(
      (
        await payload.findByID({
          collection: 'reusable-sections',
          id: reusable.id,
          ...asManager(),
          trash: true,
          draft: true,
        })
      ).id,
    ).toBe(reusable.id)
    await payload.update({
      collection: 'reusable-sections',
      id: reusable.id,
      ...asManager(),
      trash: true,
      data: { deletedAt: null },
    })
    const empty = await payload.create({
      collection: 'users',
      data: {
        email: 'section-empty@example.test',
        password,
        role: 'siteManager',
        features: { pages: true, forms: true, formSubmissions: true },
      },
    })
    await expect(
      payload.create({
        collection: 'pages',
        user: empty,
        overrideAccess: false,
        draft: true,
        data: { title: 'No grant', parent: a.id },
      }),
    ).rejects.toThrow()
    await expect(
      payload.find({ collection: 'form-submissions', user: empty, overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('does not allow a Manager with both section grants to move a Page across them', async () => {
    const dual = await payload.update({
      collection: 'users',
      id: otherManager.id,
      user: admin,
      data: { sectionRoots: [a.id, b.id] },
    })
    await expect(
      payload.update({
        collection: 'pages',
        id: child.id,
        user: dual,
        overrideAccess: false,
        data: { parent: b.id },
      }),
    ).rejects.toThrow()
  })
  it('keeps guide preferences account-owned and recomputes accessible draft destinations', async () => {
    const draft = await payload.create({
      collection: 'pages',
      user: admin,
      draft: true,
      data: { title: 'Private onboarding draft A', parent: a.id },
    })
    const headers = await login(manager)
    const preference = await dispatch(`payload-preferences/${ONBOARDING_PREFERENCE_KEY}`, headers, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value: { dismissed: true },
        user: { relationTo: 'users', value: otherManager.id },
      }),
    })
    expect(preference.status).toBe(200)
    const sections = await loadDashboardSections(payload, manager)
    const task = await loadDashboardOnboarding(payload, manager, sections)
    expect(task).toMatchObject({
      collapsed: true,
      action: { href: `/admin/collections/pages/${draft.id}` },
    })
    const otherTask = await loadDashboardOnboarding(
      payload,
      otherManager,
      await loadDashboardSections(payload, otherManager),
    )
    expect(otherTask.collapsed).toBe(false)
    const otherPreferences = await payload.find({
      collection: 'payload-preferences',
      ...asManager(),
      where: { 'user.value': { equals: otherManager.id } },
    })
    expect(otherPreferences.docs).toHaveLength(0)
    await payload.update({ collection: 'pages', id: draft.id, user: admin, data: { parent: b.id } })
    const afterMove = await loadDashboardOnboarding(
      payload,
      manager,
      await loadDashboardSections(payload, manager),
    )
    expect(afterMove.action.href).not.toContain(draft.id)
    expect(afterMove.description).not.toContain('Private onboarding draft A')
  })
  it('shows a non-dismissible recovery state after sections are revoked, ignoring saved guide preferences', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: manager.id,
      user: admin,
      data: { sectionRoots: [] },
    })
    try {
      const task = await loadDashboardOnboarding(
        payload,
        updated,
        await loadDashboardSections(payload, updated),
      )
      expect(task).toMatchObject({
        title: 'No website sections assigned',
        collapsed: false,
        dismissible: false,
        action: { href: '/admin' },
      })
      expect(task.description).not.toContain('Section A')
    } finally {
      await payload.update({
        collection: 'users',
        id: manager.id,
        user: admin,
        data: { sectionRoots: [a.id] },
      })
    }
  })
})
