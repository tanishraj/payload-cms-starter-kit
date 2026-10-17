// @vitest-environment node
import { getPayload, handleEndpoints, createLocalReq, type Payload } from 'payload'
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'
import type { Page, User } from '@/payload-types'
import { restorePageVersionAsDraft, isPageDraftRestoration } from '@/lib/pageDraftRestoration'
import { createTestMongoServer } from '../helpers/mongoMemoryServer'
vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }))
let payload: Payload, stop: (() => Promise<void>) | undefined
let admin: User, manager: User, other: User, root: Page, unrelated: Page
const password = 'History-test-only-password-123!'
const requestFor = (user: User) => createLocalReq({ user }, payload)
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
    .find((value) => value.startsWith(`${payload.config.cookiePrefix}-token=`))
    ?.split(';')[0]
  if (!cookie) throw new Error('Missing test session.')
  return { Cookie: cookie, 'Sec-Fetch-Site': 'same-origin' }
}
async function historyPage(name: string) {
  const doc = await payload.create({
    collection: 'pages',
    user: admin,
    data: {
      title: name,
      slug: name.toLowerCase().replaceAll(' ', '-'),
      parent: root.id,
      layout: [],
      _status: 'draft',
    },
    draft: true,
  })
  const draft = (
    await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: doc.id } },
      sort: 'createdAt',
      limit: 1,
    })
  ).docs[0]
  await payload.update({
    collection: 'pages',
    id: doc.id,
    user: admin,
    data: { title: `${name} published first`, _status: 'published' },
  })
  const published = (
    await payload.findVersions({
      collection: 'pages',
      where: {
        and: [{ parent: { equals: doc.id } }, { 'version._status': { equals: 'published' } }],
      },
      sort: 'createdAt',
      limit: 1,
    })
  ).docs[0]
  await payload.update({
    collection: 'pages',
    id: doc.id,
    user: admin,
    data: { title: `${name} current live`, _status: 'published' },
  })
  return { doc, draft, published, liveTitle: `${name} current live` }
}

describe('Page history draft boundary through real Payload and MongoDB', () => {
  beforeAll(async () => {
    const mongo = await createTestMongoServer()
    stop = mongo.stop
    process.env.MONGODB_URI = mongo.uri
    process.env.EMAIL_PROVIDER = 'none'
    process.env.MEDIA_PROVIDER = 'localDisk'
    process.env.PAYLOAD_SECRET = 'history-test-only-secret-32-characters'
    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config })
    await Promise.all(
      [...Object.values(payload.db.collections), ...Object.values(payload.db.versions)].map(
        (model) => model.init(),
      ),
    )
    admin = await payload.create({
      collection: 'users',
      data: { email: 'history-admin@example.test', password, role: 'admin' },
    })
    root = await payload.create({
      collection: 'pages',
      user: admin,
      data: { title: 'History section', slug: 'history-section', layout: [], _status: 'published' },
    })
    unrelated = await payload.create({
      collection: 'pages',
      user: admin,
      data: {
        title: 'Unrelated section',
        slug: 'unrelated-section',
        layout: [],
        _status: 'published',
      },
    })
    manager = await payload.create({
      collection: 'users',
      data: {
        email: 'history-manager@example.test',
        password,
        role: 'siteManager',
        sectionRoots: [root.id],
        features: { pages: true },
      },
    })
    other = await payload.create({
      collection: 'users',
      data: {
        email: 'history-other@example.test',
        password,
        role: 'siteManager',
        sectionRoots: [unrelated.id],
        features: { pages: true },
      },
    })
  }, 120000)
  afterAll(async () => {
    await payload?.destroy()
    await stop?.()
  }, 30000)

  it.each(['draft', 'published'] as const)(
    'restores an old %s as a new private draft without changing the public Page or shared navigation',
    async (status) => {
      const item = await historyPage(`Restore ${status}`)
      const version = item[status]
      const link = await payload.create({
        collection: 'navigation-links',
        user: admin,
        data: {
          title: 'Current live menu label',
          sourceType: 'manual',
          linkType: 'page',
          page: item.doc.id,
          _status: 'published',
        },
      })
      const beforeAudit = await payload.count({
        collection: 'operational-audit-events',
        where: { entityId: { equals: item.doc.id } },
      })
      const beforeCount = await payload.countVersions({
        collection: 'pages',
        where: { parent: { equals: item.doc.id } },
      })
      const req = await requestFor(manager)
      const originalContext = req.context
      const originalQuery = req.query
      const restored = await restorePageVersionAsDraft({ req, versionID: version.id, depth: 0 })
      expect(restored).toMatchObject({
        id: item.doc.id,
        title: version.version.title,
        _status: 'draft',
      })
      expect(req.context).toBe(originalContext)
      expect(req.query).toBe(originalQuery)
      expect(
        (await payload.findByID({ collection: 'pages', id: item.doc.id, draft: true, depth: 0 }))
          .title,
      ).toBe(version.version.title)
      expect((await (await dispatch(`pages/${item.doc.id}?depth=0`)).json()).title).toBe(
        item.liveTitle,
      )
      expect(
        (
          await payload.findByID({
            collection: 'navigation-links',
            id: link.id,
            draft: false,
            depth: 0,
          })
        ).title,
      ).toBe('Current live menu label')
      expect(
        (
          await payload.countVersions({
            collection: 'pages',
            where: { parent: { equals: item.doc.id } },
          })
        ).totalDocs,
      ).toBeGreaterThan(beforeCount.totalDocs)
      const audit = await payload.find({
        collection: 'operational-audit-events',
        where: {
          and: [
            { entityId: { equals: item.doc.id } },
            { action: { equals: 'restore_version_as_draft' } },
          ],
        },
      })
      expect(audit.docs).toHaveLength(1)
      expect(
        (
          await payload.count({
            collection: 'operational-audit-events',
            where: { entityId: { equals: item.doc.id } },
          })
        ).totalDocs,
      ).toBe(beforeAudit.totalDocs + 1)
      expect(audit.docs[0]).toMatchObject({
        actorId: manager.id,
        entityType: 'page',
        feature: 'pages',
      })
      expect(audit.docs[0].summary).toContain(version.id)
      await payload.update({
        collection: 'pages',
        id: item.doc.id,
        user: manager,
        overrideAccess: false,
        data: { title: String(restored.title), _status: 'published' },
      })
      expect((await (await dispatch(`pages/${item.doc.id}?depth=0`)).json()).title).toBe(
        version.version.title,
      )
    },
  )

  it.each(['', '?draft=false', '?draft=true'])(
    'the existing REST restore URL always creates a draft (%s)',
    async (query) => {
      const item = await historyPage(`REST history ${query || 'default'}`)
      const response = await dispatch(
        `pages/versions/${item.published.id}${query}`,
        await login(manager),
        { method: 'POST' },
      )
      expect(response.status).toBe(200)
      expect(await response.json()).toMatchObject({
        id: item.doc.id,
        _status: 'draft',
        title: item.published.version.title,
        message: 'Version restored as a draft. Review it, then publish when ready.',
      })
      expect((await (await dispatch(`pages/${item.doc.id}?depth=0`)).json()).title).toBe(
        item.liveTitle,
      )
    },
  )

  it('rejects anonymous, cross-scope, missing and raw Local API restoration without changing the current Page', async () => {
    const item = await historyPage('Restore denials')
    const anonymous = await dispatch(`pages/versions/${item.published.id}`, undefined, {
      method: 'POST',
    })
    expect(anonymous.status).toBe(401)
    const denied = await dispatch(
      `pages/versions/${item.published.id}?draft=false`,
      await login(other),
      { method: 'POST' },
    )
    expect([403, 404]).toContain(denied.status)
    await expect(
      restorePageVersionAsDraft({
        req: await requestFor(manager),
        versionID: '000000000000000000000000',
      }),
    ).rejects.toThrow()
    await expect(
      payload.restoreVersion({
        collection: 'pages',
        id: item.published.id,
        user: admin,
        overrideAccess: false,
      }),
    ).rejects.toThrow('restorePageVersionAsDraft')
    expect((await (await dispatch(`pages/${item.doc.id}?depth=0`)).json()).title).toBe(
      item.liveTitle,
    )
  })

  it('preserves shared dependencies and ordinary referenced-Page unpublish protection', async () => {
    const shared = await payload.create({
      collection: 'reusable-sections',
      user: admin,
      data: { title: 'Original shared section', layout: [], _status: 'published' },
    })
    const item = await historyPage('Shared history')
    await payload.update({
      collection: 'pages',
      id: item.doc.id,
      user: admin,
      data: {
        layout: [{ blockType: 'reusableSection', section: shared.id }],
        _status: 'published',
      },
    })
    const version = (
      await payload.findVersions({
        collection: 'pages',
        where: { parent: { equals: item.doc.id } },
        sort: '-createdAt',
        limit: 1,
      })
    ).docs[0]
    await payload.update({
      collection: 'reusable-sections',
      id: shared.id,
      user: admin,
      data: { title: 'Current shared section', _status: 'published' },
    })
    const sharedVersions = await payload.countVersions({
      collection: 'reusable-sections',
      where: { parent: { equals: shared.id } },
    })
    await expect(
      payload.update({
        collection: 'pages',
        id: item.doc.id,
        user: admin,
        data: { _status: 'draft' },
      }),
    ).rejects.toThrow('cannot be unpublished')
    await restorePageVersionAsDraft({
      req: await requestFor(manager),
      versionID: version.id,
      depth: 0,
    })
    expect((await (await dispatch(`pages/${item.doc.id}`)).json()).title).toBe(item.liveTitle)
    expect(
      (await payload.findByID({ collection: 'reusable-sections', id: shared.id, draft: false }))
        .title,
    ).toBe('Current shared section')
    expect(
      (
        await payload.countVersions({
          collection: 'reusable-sections',
          where: { parent: { equals: shared.id } },
        })
      ).totalDocs,
    ).toBe(sharedVersions.totalDocs)
  })

  it('rolls back restoration when source-version audit persistence fails', async () => {
    const item = await historyPage('Audit atomicity')
    const before = await payload.countVersions({
      collection: 'pages',
      where: { parent: { equals: item.doc.id } },
    })
    const create = payload.create.bind(payload)
    const spy = vi.spyOn(payload, 'create').mockImplementation((async (
      options: Parameters<typeof payload.create>[0],
    ) => {
      if (
        options.collection === 'operational-audit-events' &&
        'action' in options.data &&
        options.data.action === 'restore_version_as_draft'
      )
        throw new Error('Synthetic audit storage failure')
      return create(options)
    }) as typeof payload.create)
    const req = await requestFor(manager)
    req.context = { callerSentinel: 'retained' }
    const originalContext = { ...req.context }
    try {
      await expect(
        restorePageVersionAsDraft({ req, versionID: item.published.id }),
      ).rejects.toThrow('Synthetic audit storage failure')
    } finally {
      spy.mockRestore()
    }
    expect(req.context).toMatchObject(originalContext)
    expect(isPageDraftRestoration(req.context)).toBe(false)
    expect(
      (await payload.findByID({ collection: 'pages', id: item.doc.id, draft: true })).title,
    ).toBe(item.liveTitle)
    expect(
      (
        await payload.countVersions({
          collection: 'pages',
          where: { parent: { equals: item.doc.id } },
        })
      ).totalDocs,
    ).toBe(before.totalDocs)
  })
})
