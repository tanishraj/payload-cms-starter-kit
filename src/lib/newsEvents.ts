import 'server-only'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Payload, type Where } from 'payload'
import { cache } from 'react'

import { CMS_CACHE_TAGS } from '@/hooks/revalidateCmsContent'
import {
  createEmptyNewsEventsPage,
  interleaveNewsEvents,
  normalizeHighlightsItemCount,
  type NewsEventsArchiveQuery,
  type PublicNewsEventCard,
  type PublicNewsEventDetail,
  type PublicNewsEventsPage,
  toPublicNewsEventCard,
  toPublicNewsEventDetail,
} from '@/lib/newsEventsShared'
import { getTaxonomyTerm, getTaxonomyTerms } from '@/lib/taxonomy'
import type { Category, NewsEvent, NewsEventsSetting, SeoSetting, Tag } from '@/payload-types'

export type NewsEventsPayload = Pick<Payload, 'find' | 'findGlobal' | 'logger'>

type NewsEventCardRecord = Pick<
  NewsEvent,
  | 'contentType'
  | 'eventEnd'
  | 'eventStart'
  | 'excerpt'
  | 'featuredImage'
  | 'featuredImagePosition'
  | 'id'
  | 'primaryCategory'
  | 'publishedAt'
  | 'slug'
  | 'title'
  | 'updatedAt'
>

const cardSelect = {
  contentType: true,
  eventEnd: true,
  eventStart: true,
  excerpt: true,
  featuredImage: true,
  featuredImagePosition: true,
  primaryCategory: true,
  publishedAt: true,
  slug: true,
  title: true,
  updatedAt: true,
} as const

const publishedWhere: Where[] = [
  { _status: { equals: 'published' } },
  { workflowState: { equals: 'published' } },
]

const missingEventEndWhere: Where = {
  or: [{ eventEnd: { exists: false } }, { eventEnd: { equals: null } }],
}

export const currentOrUpcomingEventWhere = (nowISO: string): Where => ({
  or: [
    { eventEnd: { greater_than_equal: nowISO } },
    {
      and: [missingEventEndWhere, { eventStart: { greater_than_equal: nowISO } }],
    },
  ],
})

export const pastEventWhere = (nowISO: string): Where => ({
  or: [
    { eventEnd: { less_than: nowISO } },
    {
      and: [missingEventEndWhere, { eventStart: { less_than: nowISO } }],
    },
  ],
})

const categoryWhere = (category?: string): Where[] =>
  category
    ? [
        {
          or: [
            { 'primaryCategory.slug': { equals: category } },
            { 'categories.slug': { equals: category } },
          ],
        },
      ]
    : []

const tagWhere = (tag?: string): Where[] =>
  tag ? [{ 'tags.slug': { equals: tag } }] : []

const toPublicPage = (
  result: {
    docs: unknown[]
    hasNextPage: boolean
    hasPrevPage: boolean
    page?: number
    totalPages: number
  },
  requestedPage: number,
  nowISO: string,
): PublicNewsEventsPage => ({
  docs: (result.docs as NewsEventCardRecord[]).map((entry) => toPublicNewsEventCard(entry, nowISO)),
  hasNextPage: result.hasNextPage,
  hasPrevPage: result.hasPrevPage,
  page: result.page ?? requestedPage,
  totalPages: result.totalPages,
})

export async function fetchNewsEventsHighlights(
  payload: Pick<NewsEventsPayload, 'find'>,
  { limit, nowISO }: { limit: number; nowISO: string },
): Promise<PublicNewsEventCard[]> {
  const resolvedLimit = normalizeHighlightsItemCount(limit)
  const [newsResult, eventsResult] = await Promise.all([
    payload.find({
      collection: 'news-events',
      depth: 1,
      limit: resolvedLimit,
      overrideAccess: true,
      select: cardSelect,
      sort: ['-publishedAt', '-id'],
      where: {
        and: [...publishedWhere, { contentType: { equals: 'news' } }],
      },
    }),
    payload.find({
      collection: 'news-events',
      depth: 1,
      limit: resolvedLimit,
      overrideAccess: true,
      select: cardSelect,
      sort: ['eventStart', 'id'],
      where: {
        and: [
          ...publishedWhere,
          { contentType: { equals: 'event' } },
          currentOrUpcomingEventWhere(nowISO),
        ],
      },
    }),
  ])

  const news = (newsResult.docs as NewsEventCardRecord[]).map((entry) =>
    toPublicNewsEventCard(entry, nowISO),
  )
  const events = (eventsResult.docs as NewsEventCardRecord[]).map((entry) =>
    toPublicNewsEventCard(entry, nowISO),
  )

  return interleaveNewsEvents(news, events, resolvedLimit)
}

export async function fetchNewsEventsArchivePage(
  payload: Pick<NewsEventsPayload, 'find'>,
  { limit, nowISO, query }: { limit: number; nowISO: string; query: NewsEventsArchiveQuery },
): Promise<PublicNewsEventsPage> {
  const typeWhere: Where[] = query.type === 'all' ? [] : [{ contentType: { equals: query.type } }]
  const result = await payload.find({
    collection: 'news-events',
    depth: 1,
    limit,
    overrideAccess: true,
    page: query.page,
    select: cardSelect,
    sort: ['-publishedAt', '-id'],
    where: {
      and: [
        ...publishedWhere,
        ...typeWhere,
        ...categoryWhere(query.category),
        ...tagWhere(query.tag),
      ],
    },
  })

  return toPublicPage(result, query.page, nowISO)
}

async function fetchEventsPage(
  payload: Pick<NewsEventsPayload, 'find'>,
  {
    limit,
    nowISO,
    page,
    query,
    timeframe,
  }: {
    limit: number
    nowISO: string
    page: number
    query: NewsEventsArchiveQuery
    timeframe: 'past' | 'upcoming'
  },
): Promise<PublicNewsEventsPage> {
  const result = await payload.find({
    collection: 'news-events',
    depth: 1,
    limit,
    overrideAccess: true,
    page,
    select: cardSelect,
    sort: timeframe === 'upcoming' ? ['eventStart', 'id'] : ['-eventStart', '-id'],
    where: {
      and: [
        ...publishedWhere,
        { contentType: { equals: 'event' } },
        ...(timeframe === 'upcoming'
          ? [currentOrUpcomingEventWhere(nowISO)]
          : [pastEventWhere(nowISO)]),
        ...categoryWhere(query.category),
        ...tagWhere(query.tag),
      ],
    },
  })

  return toPublicPage(result, page, nowISO)
}

export async function fetchNewsEventBySlug(
  payload: Pick<NewsEventsPayload, 'find'>,
  slug: string,
  nowISO: string,
): Promise<PublicNewsEventDetail | null> {
  const result = await payload.find({
    collection: 'news-events',
    depth: 2,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [...publishedWhere, { slug: { equals: slug } }],
    },
  })

  const entry = result.docs[0] as NewsEvent | undefined

  return entry ? toPublicNewsEventDetail(entry, nowISO) : null
}

const loadPayload = cache(async () => getPayload({ config: configPromise }))

export const getNewsEventsHighlights = cache(async (limit: number, nowISO: string) => {
  const payload = await loadPayload()

  try {
    return await fetchNewsEventsHighlights(payload, { limit, nowISO })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Failed to load News & Events highlights.' })
    throw error
  }
})

export const getNewsEventsArchivePage = cache(
  async (query: NewsEventsArchiveQuery, limit: number, nowISO: string) => {
    const payload = await loadPayload()
    return fetchNewsEventsArchivePage(payload, { limit, nowISO, query })
  },
)

export const getUpcomingEventsPage = cache(
  async (query: NewsEventsArchiveQuery, limit: number, nowISO: string) => {
    const payload = await loadPayload()
    return fetchEventsPage(payload, {
      limit,
      nowISO,
      page: query.upcomingPage,
      query,
      timeframe: 'upcoming',
    })
  },
)

export const getPastEventsPage = cache(
  async (query: NewsEventsArchiveQuery, limit: number, nowISO: string) => {
    const payload = await loadPayload()
    return fetchEventsPage(payload, {
      limit,
      nowISO,
      page: query.pastPage,
      query,
      timeframe: 'past',
    })
  },
)

export const getNewsEventBySlug = cache(async (slug: string, nowISO: string) => {
  const payload = await loadPayload()
  return fetchNewsEventBySlug(payload, slug, nowISO)
})

export async function getNewsEventPreviewBySlug(slug: string): Promise<NewsEvent | null> {
  const payload = await loadPayload()
  const result = await payload.find({
    collection: 'news-events',
    depth: 2,
    draft: true,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })

  return result.docs[0] ?? null
}

const _getNewsEventsSettings = async (): Promise<NewsEventsSetting> => {
  const payload = await loadPayload()
  return payload.findGlobal({ slug: 'news-events-settings', depth: 1 })
}

export const getNewsEventsSettings = unstable_cache(
  _getNewsEventsSettings,
  ['news-events-settings'],
  { tags: [CMS_CACHE_TAGS.newsEvents], revalidate: false },
)

const _getNewsEventsInheritedRobots = async (): Promise<SeoSetting['robots']> => {
  const payload = await loadPayload()
  const settings = await payload.findGlobal({ slug: 'seo-settings', depth: 0 })
  return settings.robots
}

export const getNewsEventsInheritedRobots = unstable_cache(
  _getNewsEventsInheritedRobots,
  ['news-events-inherited-robots'],
  { tags: [CMS_CACHE_TAGS.globals], revalidate: false },
)

export const getNewsEventCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const payload = await loadPayload()
  const result = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] ?? null
})

export const getNewsEventTagBySlug = cache(async (slug: string): Promise<Tag | null> => {
  const payload = await loadPayload()
  const result = await payload.find({
    collection: 'tags',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] ?? null
})

const _getNewsEventCategories = async (): Promise<
  Array<{ id: number | string; slug: string; title: string }>
> => {
  const payload = await loadPayload()
  const result = await payload.find({
    collection: 'news-events',
    depth: 1,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: { categories: true, primaryCategory: true },
    where: { and: publishedWhere },
  })
  const categories = new Map<string, { id: number | string; slug: string; title: string }>()

  for (const entry of result.docs) {
    const primaryCategory = getTaxonomyTerm(entry.primaryCategory)

    for (const category of [
      ...(primaryCategory ? [primaryCategory] : []),
      ...getTaxonomyTerms(entry.categories),
    ]) {
      categories.set(String(category.id), category)
    }
  }

  return [...categories.values()].sort((left, right) => left.title.localeCompare(right.title))
}

export const getNewsEventCategories = unstable_cache(
  _getNewsEventCategories,
  ['news-events-categories'],
  { tags: [CMS_CACHE_TAGS.newsEvents], revalidate: false },
)

const _getNewsEventTags = async (): Promise<
  Array<{ id: number | string; slug: string; title: string }>
> => {
  const payload = await loadPayload()
  const result = await payload.find({
    collection: 'news-events',
    depth: 1,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: { tags: true },
    where: { and: publishedWhere },
  })
  const tags = new Map<string, { id: number | string; slug: string; title: string }>()

  for (const entry of result.docs) {
    for (const tag of getTaxonomyTerms(entry.tags)) {
      tags.set(String(tag.id), tag)
    }
  }

  return [...tags.values()].sort((left, right) => left.title.localeCompare(right.title))
}

export const getNewsEventTags = unstable_cache(
  _getNewsEventTags,
  ['news-events-tags'],
  { tags: [CMS_CACHE_TAGS.newsEvents], revalidate: false },
)

export { createEmptyNewsEventsPage }
