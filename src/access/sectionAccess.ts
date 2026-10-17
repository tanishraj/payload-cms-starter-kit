import { APIError, type Access, type PayloadRequest, type Where } from 'payload'
import type { AdminFeatureKey } from '@/access/adminFeatures'
import { normalizeSectionRoots, relationshipID, scopedSourceFeatures } from './sectionScope'
import { canReadFeature, hasFeature, isAdmin, isSiteManager } from '@/access/featureAccess'
export { normalizeSectionRoots, relationshipID, scopedSourceFeatures } from './sectionScope'

export const SECTION_SCOPE_LIMIT = 5000
const cacheKey = Symbol('section-access-request-cache')
const rootsOf = (user: unknown) =>
  normalizeSectionRoots(
    user && typeof user === 'object' && 'sectionRoots' in user ? user.sectionRoots : [],
  )
const memo = <T>(req: PayloadRequest, key: string, read: () => Promise<T>): Promise<T> => {
  const context = (req.context ??= {}) as Record<symbol, Map<string, Promise<unknown>>>
  context[cacheKey] ??= new Map()
  const userKey = `${relationshipID(req.user)}:${rootsOf(req.user).join(',')}:${key}`
  if (!context[cacheKey].has(userKey)) context[cacheKey].set(userKey, read())
  return context[cacheKey].get(userKey) as Promise<T>
}
/** Nested native operations can reuse this request; writes must invalidate prior ownership reads. */
export const invalidateSectionAccessCache = (req: PayloadRequest): void => {
  const cache = (req.context as Record<symbol, Map<string, Promise<unknown>>> | undefined)?.[
    cacheKey
  ]
  cache?.clear()
}

export const rootPageFilter: Where = {
  or: [{ parent: { exists: false } }, { parent: { equals: null } }],
}

/** Only real, active top-level Pages remain valid grants. No URL-prefix authority or cross-request cache. */
export const grantedSectionRoots = (req: PayloadRequest): Promise<string[]> =>
  memo(req, 'roots', async () => {
    const roots = rootsOf(req.user)
    if (!roots.length) return []
    const result = await req.payload.find({
      collection: 'pages',
      overrideAccess: true,
      req,
      draft: true,
      depth: 0,
      pagination: false,
      limit: SECTION_SCOPE_LIMIT + 1,
      select: { parent: true },
      where: { and: [{ id: { in: roots } }, rootPageFilter] },
    })
    return result.docs.map((doc) => String(doc.id))
  })

export const scopedPageIDs = (req: PayloadRequest): Promise<string[]> =>
  memo(req, 'pages', async () => {
    const roots = await grantedSectionRoots(req)
    const ids = new Set(roots)
    let frontier = roots
    for (let depth = 0; frontier.length; depth++) {
      if (depth >= 100)
        throw new APIError('This section hierarchy is too deep. Contact an Admin.', 503)
      const result = await req.payload.find({
        collection: 'pages',
        overrideAccess: true,
        req,
        draft: true,
        depth: 0,
        pagination: false,
        limit: SECTION_SCOPE_LIMIT + 1,
        select: { parent: true },
        trash: true,
        where: { parent: { in: frontier } },
      })
      if (ids.size + result.docs.length > SECTION_SCOPE_LIMIT)
        throw new APIError(
          'This section exceeds the access traversal limit. Contact an Admin.',
          503,
        )
      frontier = result.docs.map((doc) => String(doc.id)).filter((id) => !ids.has(id))
      frontier.forEach((id) => ids.add(id))
    }
    return [...ids]
  })

export type OwnedSectionCollection = 'forms' | 'reusable-sections' | 'media'
export const ownedSectionIDs = (
  req: PayloadRequest,
  collection: OwnedSectionCollection,
  shared = false,
): Promise<string[]> =>
  memo(req, `${collection}:${shared}`, async () => {
    const roots = await grantedSectionRoots(req)
    if (!shared && !roots.length) return []
    const result = await req.payload.find({
      collection,
      req,
      overrideAccess: true,
      draft: true,
      depth: 0,
      pagination: false,
      limit: SECTION_SCOPE_LIMIT + 1,
      select: { sectionRoot: true },
      trash: !shared,
      where: shared
        ? { or: [{ sectionRoot: { exists: false } }, { sectionRoot: { equals: null } }] }
        : { sectionRoot: { in: roots } },
    })
    if (result.docs.length > SECTION_SCOPE_LIMIT)
      throw new APIError('This resource exceeds the section access limit. Contact an Admin.', 503)
    return result.docs.map((doc) => String(doc.id))
  })

export const scopedPageAccess =
  (operation: 'create' | 'read' | 'update' | 'delete' | 'versions'): Access =>
  async ({ req, data }): Promise<boolean | Where> => {
    if (isAdmin(req.user)) return true
    if (!req.user) return operation === 'read' ? { _status: { equals: 'published' } } : false
    if (
      !isSiteManager(req.user) ||
      !(operation === 'read' ? canReadFeature(req.user, 'pages') : hasFeature(req.user, 'pages'))
    )
      return false
    if (!rootsOf(req.user).length) return false
    if (operation === 'delete' && !data?.deletedAt) return false
    const ids = await scopedPageIDs(req)
    if (operation === 'create') return ids.length > 0
    if (operation === 'delete')
      return { id: { in: ids.filter((id) => !rootsOf(req.user).includes(id)) } }
    // Payload 3.90's version APIs apply readVersions constraints directly to version records.
    return { [operation === 'versions' ? 'parent' : 'id']: { in: ids } }
  }

export const scopedResourceAccess =
  (
    collection: OwnedSectionCollection,
    feature: AdminFeatureKey,
    operation: 'create' | 'read' | 'update' | 'delete' | 'versions',
  ): Access =>
  async ({ req, data }): Promise<boolean | Where> => {
    if (isAdmin(req.user)) return true
    if (!req.user) return operation === 'read' ? { _status: { equals: 'published' } } : false
    if (
      !isSiteManager(req.user) ||
      !(operation === 'read' ? canReadFeature(req.user, feature) : hasFeature(req.user, feature))
    )
      return false
    if (operation === 'delete' && !data?.deletedAt) return false
    if (operation === 'create') return (await grantedSectionRoots(req)).length > 0
    const ids = rootsOf(req.user).length ? await ownedSectionIDs(req, collection) : []
    if (operation !== 'read') return { [operation === 'versions' ? 'parent' : 'id']: { in: ids } }
    const shared = await ownedSectionIDs(req, collection, true)
    return {
      or: [
        { id: { in: ids } },
        { and: [{ id: { in: shared } }, { _status: { equals: 'published' } }] },
      ],
    }
  }

/** Public image/file bytes remain public even when the visitor has an editor cookie. */
export const scopedMediaRead: Access = async (args) => {
  const { req, isReadingStaticFile } = args
  if (!isReadingStaticFile) return scopedResourceAccess('media', 'media', 'read')(args)
  if (isAdmin(req.user)) return true
  const published: Where = { _status: { equals: 'published' } }
  if (!isSiteManager(req.user) || !canReadFeature(req.user, 'media')) return published
  const roots = await grantedSectionRoots(req)
  return roots.length ? { or: [published, { sectionRoot: { in: roots } }] } : published
}

export const submissionSectionWhere = async (req: PayloadRequest): Promise<Where> => ({
  sectionRoot: { in: await grantedSectionRoots(req) },
})
export const scopedSubmissionAccess =
  (operation: 'read' | 'update'): Access =>
  async ({ req }) => {
    if (isAdmin(req.user)) return true
    if (
      !isSiteManager(req.user) ||
      !(operation === 'read'
        ? canReadFeature(req.user, 'formSubmissions')
        : hasFeature(req.user, 'formSubmissions'))
    )
      return false
    if (!rootsOf(req.user).length) return false
    return submissionSectionWhere(req)
  }

async function scopedSourceIDs(req: PayloadRequest): Promise<Record<string, string[]>> {
  const [pages, forms, reusable, media, roots] = await Promise.all([
    hasFeature(req.user, 'pages') ? scopedPageIDs(req) : [],
    hasFeature(req.user, 'forms') ? ownedSectionIDs(req, 'forms') : [],
    hasFeature(req.user, 'reusableSections') ? ownedSectionIDs(req, 'reusable-sections') : [],
    hasFeature(req.user, 'media') ? ownedSectionIDs(req, 'media') : [],
    hasFeature(req.user, 'formSubmissions') ? grantedSectionRoots(req) : [],
  ])
  let submissions: string[] = []
  if (roots.length) {
    const result = await req.payload.find({
      collection: 'form-submissions',
      req,
      overrideAccess: true,
      depth: 0,
      pagination: false,
      limit: SECTION_SCOPE_LIMIT + 1,
      select: { createdAt: true },
      where: { sectionRoot: { in: roots } },
    })
    if (result.docs.length > SECTION_SCOPE_LIMIT)
      throw new APIError(
        'Narrow the submission section scope before using operational history.',
        503,
      )
    submissions = result.docs.map((doc) => String(doc.id))
  }
  return { pages, forms, media, 'reusable-sections': reusable, 'form-submissions': submissions }
}
export const sectionQueueWhere = async (req: PayloadRequest): Promise<Where> => {
  const ids = await scopedSourceIDs(req)
  return {
    or: [
      { feature: { not_in: [...scopedSourceFeatures] } },
      ...Object.entries(ids).map(([sourceCollection, sourceIDs]): Where => ({
        and: [{ sourceCollection: { equals: sourceCollection } }, { sourceID: { in: sourceIDs } }],
      })),
    ],
  }
}
export const sectionAuditWhere = async (req: PayloadRequest): Promise<Where> => {
  const ids = await scopedSourceIDs(req)
  const queues = await req.payload.find({
    collection: 'work-queue',
    req,
    overrideAccess: true,
    depth: 0,
    pagination: false,
    limit: SECTION_SCOPE_LIMIT + 1,
    select: { createdAt: true },
    where: { and: [{ feature: { in: [...scopedSourceFeatures] } }, await sectionQueueWhere(req)] },
  })
  if (queues.docs.length > SECTION_SCOPE_LIMIT)
    throw new APIError('This section exceeds the operational history limit.', 503)
  const types: Record<string, string> = {
    pages: 'page',
    forms: 'form',
    'reusable-sections': 'reusable-section',
    media: 'media',
    'form-submissions': 'form-submission',
  }
  return {
    or: [
      { feature: { not_in: [...scopedSourceFeatures] } },
      {
        and: [
          { entityType: { equals: 'work_queue' } },
          { entityId: { in: queues.docs.map((doc) => String(doc.id)) } },
        ],
      },
      ...Object.entries(ids).map(([collection, entityIDs]): Where => ({
        and: [{ entityType: { equals: types[collection] } }, { entityId: { in: entityIDs } }],
      })),
    ],
  }
}

export const hideUnlessSectionFeature =
  (feature: 'pages' | 'formSubmissions') =>
  ({ user }: { user?: unknown }): boolean =>
    !isAdmin(user) && (!hasFeature(user, feature) || !rootsOf(user).length)
