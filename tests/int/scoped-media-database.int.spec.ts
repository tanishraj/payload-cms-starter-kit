// @vitest-environment node
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  getPayload,
  handleEndpoints,
  createLocalReq,
  docAccessOperation,
  type Payload,
} from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { Media, Page, User } from '@/payload-types'
import { scopedMediaPrivateRead } from '@/hooks/scopedMedia'
import { createTestMongoServer } from '../helpers/mongoMemoryServer'
vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }))
let payload: Payload, stop: (() => Promise<void>) | undefined, directory: string
let admin: User,
  a: Page,
  b: Page,
  manager: User,
  other: User,
  reader: User,
  multiple: User,
  empty: User
let sequence = 0
const password = 'Media-test-only-password-123!'
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)
const file = () => ({
  data: png,
  mimetype: 'image/png',
  name: `scope-${++sequence}.png`,
  size: png.length,
})
const as = (user: User) => ({ user, overrideAccess: false as const })
async function media(user: User, data: Partial<Media> = {}) {
  return payload.create({
    collection: 'media',
    ...as(user),
    file: file(),
    depth: 0,
    data: {
      title: `Asset ${sequence}`,
      alt: 'Accessible test image',
      _status: 'published',
      ...data,
    },
  })
}
const dispatch = (route: string, init: RequestInit = {}) =>
  handleEndpoints({
    config: payload.config,
    request: new Request('http://localhost/api/' + route, init),
  })
async function login(user: User) {
  const response = await dispatch('users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password }),
  })
  expect(response.status).toBe(200)
  const cookie = response.headers
    .getSetCookie()
    .find((v) => v.startsWith(`${payload.config.cookiePrefix}-token=`))
    ?.split(';')[0]
  if (!cookie) throw new Error('Missing test cookie')
  return { Cookie: cookie, 'Sec-Fetch-Site': 'same-origin' }
}

describe('section-owned Media through real Payload and MongoDB', () => {
  beforeAll(async () => {
    const mongo = await createTestMongoServer()
    stop = mongo.stop
    directory = await mkdtemp(path.join(tmpdir(), 'section-media-'))
    process.env.MONGODB_URI = mongo.uri
    process.env.PAYLOAD_SECRET = 'media-scope-test-only-secret-32-characters'
    process.env.EMAIL_PROVIDER = 'none'
    process.env.MEDIA_PROVIDER = 'localDisk'
    const { default: incoming } = await import('@/payload.config')
    const config = await incoming
    const collection = config.collections.find((c) => c.slug === 'media')!
    collection.upload!.staticDir = directory
    payload = await getPayload({ config })
    await Promise.all(
      [...Object.values(payload.db.collections), ...Object.values(payload.db.versions)].map(
        (model) => model.init(),
      ),
    )
    admin = await payload.create({
      collection: 'users',
      data: { role: 'admin', email: 'media-scope-admin@example.test', password },
    })
    a = await payload.create({
      collection: 'pages',
      user: admin,
      data: { title: 'Media section A', slug: 'media-section-a', layout: [], _status: 'published' },
    })
    b = await payload.create({
      collection: 'pages',
      user: admin,
      data: { title: 'Media section B', slug: 'media-section-b', layout: [], _status: 'published' },
    })
    async function account(name: string, roots: string[], features: User['features']) {
      return payload.create({
        collection: 'users',
        data: {
          role: 'siteManager',
          email: `media-${name}@example.test`,
          password,
          sectionRoots: roots,
          features,
        },
      })
    }
    manager = await account('a', [a.id], {
      pages: true,
      media: true,
      actionQueue: true,
      auditLog: true,
    })
    other = await account('b', [b.id], { media: true, actionQueue: true, auditLog: true })
    reader = await account('reader', [a.id], { pages: true })
    multiple = await account('multiple', [a.id, b.id], { media: true })
    empty = await account('empty', [], { media: true })
  }, 120000)
  afterAll(async () => {
    await payload?.destroy()
    await stop?.()
    if (directory) await rm(directory, { recursive: true, force: true })
  }, 30000)

  it('infers one active section, requires a deliberate multi-section choice and rejects invalid ownership before writing files', async () => {
    const own = await media(manager)
    expect(own.sectionRoot).toBe(a.id)
    const before = (await readdir(directory)).sort()
    for (const [user, data] of [
      [empty, {}],
      [multiple, {}],
      [manager, { sectionRoot: b.id }],
    ] as [User, Partial<Media>][]) {
      await expect(media(user, data)).rejects.toThrow()
    }
    expect((await readdir(directory)).sort()).toEqual(before)
    expect((await media(multiple, { sectionRoot: b.id })).sectionRoot).toBe(b.id)
    const blank = await media(manager, { sectionRoot: null })
    expect(blank.sectionRoot).toBe(a.id)
    expect(
      (await payload.findByID({ collection: 'media', id: blank.id, user: admin, depth: 0 }))
        .sectionRoot,
    ).toBe(a.id)
    await expect(media(reader)).rejects.toThrow()
  })

  it('shows own assets and published shared assets, hides other sections and private shared metadata, and preserves public reads', async () => {
    const own = await media(manager, { _status: 'draft', notes: 'Owner-only governance' })
    const hidden = await media(other)
    const shared = await media(admin, {
      notes: 'Shared secret governance',
      title: 'Shared internal title',
    })
    const sharedDraft = await media(admin, { _status: 'draft' })
    const listed = await payload.find({
      collection: 'media',
      ...as(manager),
      draft: true,
      depth: 0,
      limit: 100,
    })
    const ids = listed.docs.map((d) => d.id)
    expect(ids).toContain(own.id)
    expect(ids).toContain(shared.id)
    expect(ids).not.toContain(hidden.id)
    expect(ids).not.toContain(sharedDraft.id)
    const sharedRead = await payload.findByID({
      collection: 'media',
      id: shared.id,
      ...as(manager),
      depth: 0,
    })
    expect(sharedRead.notes).toBeUndefined()
    const projected = await payload.findByID({
      collection: 'media',
      id: shared.id,
      ...as(manager),
      select: { notes: true, title: true },
      depth: 0,
    })
    expect(projected.notes).toBeUndefined()
    expect(projected.title).toBeUndefined()
    expect(sharedRead.sectionRoot ?? null).toBeNull()
    const unchangedShared = await payload.findByID({
      collection: 'media',
      id: shared.id,
      user: admin,
      depth: 0,
    })
    expect(unchangedShared.sectionRoot ?? null).toBeNull()
    expect(sharedRead.title).toBeUndefined()
    expect(sharedRead.alt).toBe('Accessible test image')
    expect(
      (
        await payload.findByID({
          collection: 'media',
          id: own.id,
          ...as(manager),
          draft: true,
          depth: 0,
        })
      ).notes,
    ).toBe('Owner-only governance')
    const publicResponse = await dispatch(`media/${hidden.id}`)
    expect(publicResponse.status).toBe(200)
    expect((await publicResponse.json()).notes).toBeUndefined()
    expect((await dispatch(`media/${own.id}`)).status).toBe(404)
    await expect(
      payload.update({
        collection: 'media',
        id: shared.id,
        ...as(manager),
        data: { alt: 'Not allowed' },
      }),
    ).rejects.toThrow()
    await expect(
      payload.update({
        collection: 'media',
        id: hidden.id,
        ...as(manager),
        data: { alt: 'Not allowed' },
      }),
    ).rejects.toThrow()
  })

  it('serves published file bytes across sections with an editor cookie while keeping draft files scoped', async () => {
    const published = await media(other)
    const privateDraft = await media(other, { _status: 'draft' })
    const ownDraft = await media(manager, { _status: 'draft' })
    const headers = await login(manager)
    for (const requestHeaders of [headers, undefined]) {
      const response = await dispatch(`media/file/${published.filename}`, {
        headers: requestHeaders,
      })
      expect(response.status).toBe(200)
      expect(Buffer.from(await response.arrayBuffer())).toEqual(png)
    }
    const ownFile = await dispatch(`media/file/${ownDraft.filename}`, { headers })
    expect(ownFile.status).toBe(200)
    expect(Buffer.from(await ownFile.arrayBuffer())).toEqual(png)
    const denied = await dispatch(`media/file/${privateDraft.filename}`, { headers })
    expect([403, 404]).toContain(denied.status)
  })

  it('keeps dependency access read-only and limits native version history to owned assets', async () => {
    const own = await media(manager)
    const shared = await media(admin)
    expect(
      (await payload.findByID({ collection: 'media', id: shared.id, ...as(reader), depth: 0 })).id,
    ).toBe(shared.id)
    await expect(
      payload.update({
        collection: 'media',
        id: own.id,
        ...as(reader),
        data: { alt: 'Not allowed' },
      }),
    ).rejects.toThrow()
    const versions = await payload.findVersions({
      collection: 'media',
      ...as(manager),
      limit: 100,
      depth: 0,
    })
    expect(versions.docs.some((v) => v.parent === own.id)).toBe(true)
    expect(versions.docs.some((v) => v.parent === shared.id)).toBe(false)
    const sharedVersion = (
      await payload.findVersions({
        collection: 'media',
        user: admin,
        where: { parent: { equals: shared.id } },
        limit: 1,
      })
    ).docs[0]
    await expect(
      payload.restoreVersion({ collection: 'media', id: sharedVersion.id, ...as(manager) }),
    ).rejects.toThrow()
  })

  it('rejects shared/other-section replacement before file deletion and permits ordinary owned replacement', async () => {
    const shared = await media(admin)
    const foreign = await media(other)
    for (const asset of [shared, foreign]) {
      const before = await readFile(path.join(directory, asset.filename!))
      const names = (await readdir(directory)).sort()
      await expect(
        payload.update({
          collection: 'media',
          id: asset.id,
          ...as(manager),
          file: file(),
          data: { alt: 'Blocked' },
        }),
      ).rejects.toThrow()
      expect(await readFile(path.join(directory, asset.filename!))).toEqual(before)
      expect((await readdir(directory)).sort()).toEqual(names)
    }
    const own = await media(manager)
    const updated = await payload.update({
      collection: 'media',
      id: own.id,
      ...as(manager),
      file: file(),
      data: { alt: 'Replaced safely' },
    })
    expect(updated.alt).toBe('Replaced safely')
    expect(await readFile(path.join(directory, updated.filename!))).toEqual(png)
  })

  it('does not expose cross-section usage and blocks referenced file changes/trash without altering bytes', async () => {
    const own = await media(manager)
    await payload.create({
      collection: 'pages',
      user: admin,
      data: {
        title: 'Private B usage title',
        slug: 'private-b-usage-title',
        parent: b.id,
        layout: [],
        ogImage: own.id,
        _status: 'draft',
      },
    })
    const view = await payload.findByID({
      collection: 'media',
      id: own.id,
      ...as(manager),
      depth: 0,
    })
    expect(view.usageDetails).toBeUndefined()
    expect(JSON.stringify(view)).not.toContain('Private B usage title')
    expect(view.usageSummary).toContain('Ask an Admin')
    const adminView = await payload.findByID({
      collection: 'media',
      id: own.id,
      user: admin,
      depth: 0,
    })
    expect(JSON.stringify(adminView.usageDetails)).toContain('Private B usage title')
    const bytes = await readFile(path.join(directory, own.filename!))
    await expect(
      payload.update({
        collection: 'media',
        id: own.id,
        ...as(manager),
        file: file(),
        data: { alt: 'Blocked reference replacement' },
      }),
    ).rejects.toThrow('This asset is in use')
    expect(await readFile(path.join(directory, own.filename!))).toEqual(bytes)
    await expect(
      payload.update({
        collection: 'media',
        id: own.id,
        ...as(manager),
        data: { deletedAt: new Date().toISOString() },
      }),
    ).rejects.toThrow('This asset is in use')
    // Pinned Payload sanitizes upload metadata before beforeOperation; the attempt
    // must not change the stored filename or file bytes even though native API returns 200.
    const ignored = await payload.update({
      collection: 'media',
      id: own.id,
      ...as(manager),
      data: { filename: 'forged-file.png' },
      depth: 0,
    })
    expect(ignored.filename).toBe(own.filename)
    expect(await readFile(path.join(directory, own.filename!))).toEqual(bytes)
    expect(
      (await payload.findByID({ collection: 'media', id: own.id, user: admin })).filename,
    ).toBe(own.filename)
  })

  it('scopes operational rows and prevents ownership reassignment and permanent deletion', async () => {
    const own = await media(manager, { title: '' })
    const foreign = await media(other, { title: '' })
    const rows = await payload.find({
      collection: 'work-queue',
      ...as(manager),
      limit: 100,
      where: { sourceCollection: { equals: 'media' } },
    })
    expect(rows.docs.some((row) => row.sourceID === own.id)).toBe(true)
    expect(rows.docs.some((row) => row.sourceID === foreign.id)).toBe(false)
    await expect(
      payload.update({
        collection: 'media',
        id: own.id,
        ...as(manager),
        data: { sectionRoot: b.id },
      }),
    ).rejects.toThrow()
    await expect(
      payload.delete({ collection: 'media', id: own.id, ...as(manager) }),
    ).rejects.toThrow()
    await payload.update({
      collection: 'media',
      id: own.id,
      ...as(manager),
      data: { deletedAt: new Date().toISOString() },
    })
    await payload.update({
      collection: 'media',
      id: own.id,
      ...as(manager),
      trash: true,
      data: { deletedAt: null },
    })
    expect(
      (await payload.findByID({ collection: 'media', id: own.id, ...as(manager), depth: 0 }))
        .sectionRoot,
    ).toBe(a.id)
  })

  it('native form-state field reads accept saved data without doc and keep shared metadata hidden', async () => {
    const own = await media(manager)
    const req = await createLocalReq({ user: manager }, payload)
    expect(await scopedMediaPrivateRead({ req, id: own.id, data: own })).toBe(true)
    expect(
      await scopedMediaPrivateRead({ req, id: own.id, data: { ...own, sectionRoot: null } }),
    ).toBe(false)
    expect(
      await scopedMediaPrivateRead({
        req,
        id: own.id,
        data: own,
        doc: { ...own, sectionRoot: null },
      }),
    ).toBe(false)
    expect(await scopedMediaPrivateRead({ req, data: { _status: 'draft' } })).toBe(true)
  })

  it('native history preserves the current referenced file while restoring ordinary metadata', async () => {
    const first = await media(manager)
    const oldVersion = (
      await payload.findVersions({
        collection: 'media',
        ...as(manager),
        where: { parent: { equals: first.id } },
        limit: 1,
      })
    ).docs[0]
    const current = await payload.update({
      collection: 'media',
      id: first.id,
      ...as(manager),
      file: file(),
      data: { alt: 'Current referenced image' },
      depth: 0,
    })
    await payload.create({
      collection: 'pages',
      user: admin,
      data: {
        title: 'History file reference',
        slug: 'history-file-reference',
        parent: a.id,
        layout: [],
        ogImage: current.id,
        _status: 'draft',
      },
    })
    const bytes = await readFile(path.join(directory, current.filename!))
    // Pinned restoreVersion sanitizes the historical upload fields and restores
    // upload data from the current document before application hooks execute.
    const restored = await payload.restoreVersion({
      collection: 'media',
      id: oldVersion.id,
      ...as(manager),
      depth: 0,
    })
    expect(restored.filename).toBe(current.filename)
    expect(restored.alt).toBe('Accessible test image')
    expect(
      (await payload.findByID({ collection: 'media', id: current.id, user: admin, depth: 0 }))
        .filename,
    ).toBe(current.filename)
    expect(await readFile(path.join(directory, current.filename!))).toEqual(bytes)
  })

  it('refreshes document permissions after creating Media in a request whose ownership list was already read', async () => {
    const req = await createLocalReq(
      { user: manager, context: { mediaPermissionRehearsal: true } },
      payload,
    )
    await payload.find({ collection: 'media', ...as(manager), req, depth: 0 })
    const created = await payload.create({
      collection: 'media',
      ...as(manager),
      req,
      file: file(),
      data: {
        alt: 'Same-request permission check',
        title: 'Permission check',
        _status: 'published',
      },
      depth: 0,
    })
    const permissions = await docAccessOperation({
      id: created.id,
      collection: payload.collections.media,
      data: created,
      req,
    })
    const freshReq = await createLocalReq({ user: manager }, payload)
    const freshPermissions = await docAccessOperation({
      id: created.id,
      collection: payload.collections.media,
      data: created,
      req: freshReq,
    })
    expect(freshPermissions.read).toMatchObject({ permission: true })
    expect(permissions.read).toMatchObject({ permission: true })
    expect(permissions.update).toMatchObject({ permission: true })
  })

  it('enforces real REST permissions and revokes sessions when scope is removed', async () => {
    const own = await media(manager)
    const foreign = await media(other)
    const headers = await login(manager)
    expect((await dispatch(`media/${own.id}`, { headers })).status).toBe(200)
    expect((await dispatch(`media/${foreign.id}`, { headers })).status).toBe(404)
    expect(
      (
        await dispatch(`media/${foreign.id}`, {
          method: 'PATCH',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ alt: 'No access' }),
        })
      ).status,
    ).toBe(403)
    await payload.update({
      collection: 'users',
      id: manager.id,
      user: admin,
      data: { sectionRoots: [] },
    })
    const me = await dispatch('users/me', { headers })
    expect(me.status).toBe(200)
    expect((await me.json()).user).toBeNull()
    const revokedWrite = await dispatch(`media/${own.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ alt: 'Revoked session must not write' }),
    })
    expect(revokedWrite.status).toBe(403)
    expect((await payload.findByID({ collection: 'media', id: own.id, user: admin })).alt).toBe(
      'Accessible test image',
    )
  })
})
