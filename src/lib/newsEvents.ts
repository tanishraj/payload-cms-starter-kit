import 'server-only'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Payload, type Where } from 'payload'
import { cache } from 'react'

import { CMS_CACHE_TAGS } from '@/hooks/revalidateCmsContent'
import {
  isNewsEventsTabsItemsPerTab,
  type NewsEventsTabsItemsPerTab,
} from '@/blocks/NewsEventsTabs/newsEventsTabsShared'
import {
  NEWS_EVENT_CLASSIFICATIONS,
  NEWS_EVENT_CLASSIFICATION_TABS,
  type NewsEventClassification,
  type NewsEventClassificationTab,
} from '@/lib/newsEventClassifications'
import {
  createEmptyNewsEventGroups,
  interleaveNewsEvents,
  normalizeHighlightsItemCount,
  type PublicNewsEventCard,
  type PublicNewsEventDetail,
  type PublicNewsEventGroups,
  type PublicNewsEventPage,
  toPublicNewsEventCard,
  toPublicNewsEventDetail,
} from '@/lib/newsEventsShared'
import type { NewsEvent, SeoSetting } from '@/payload-types'

export type NewsEventsPayload = Pick<Payload, 'find' | 'findGlobal' | 'logger'>

type NewsEventCardRecord = Pick<
  NewsEvent,
  | 'contentType'
  | 'createdAt'
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
  createdAt: true,
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

const nonEventClassifications = NEWS_EVENT_CLASSIFICATIONS.flatMap(({ value }) =>
  value === 'event' ? [] : [value],
)

const normalizeGroupLimit = (value: number): number =>
  Number.isInteger(value) ? Math.min(12, Math.max(1, value)) : 6

const positiveIntegerPattern = /^[1-9]\d*$/
const classificationTabValues = new Set<string>(
  NEWS_EVENT_CLASSIFICATION_TABS.map(({ value }) => value),
)

const isNewsEventClassificationTab = (value: unknown): value is NewsEventClassificationTab =>
  typeof value === 'string' && classificationTabValues.has(value)

export function parseNewsEventsTabsPagination(searchParams: URLSearchParams):
  | {
      classification: NewsEventClassificationTab
      limit: NewsEventsTabsItemsPerTab
      ok: true
      page: number
    }
  | { message: string; ok: false } {
  const classification = searchParams.get('classification')

  if (!isNewsEventClassificationTab(classification)) {
    return { message: 'Classification is invalid.', ok: false }
  }

  const pageValue = searchParams.get('page')

  if (!pageValue || !positiveIntegerPattern.test(pageValue)) {
    return { message: 'Page must be a positive integer.', ok: false }
  }

  const limitValue = searchParams.get('limit')
  const limit = limitValue && positiveIntegerPattern.test(limitValue) ? Number(limitValue) : NaN

  if (!isNewsEventsTabsItemsPerTab(limit)) {
    return { message: 'Limit must be one of 3, 6, 9, or 12.', ok: false }
  }

  return {
    classification,
    limit,
    ok: true,
    page: Number(pageValue),
  }
}

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

async function fetchMixedNewsEventSources(
  payload: Pick<NewsEventsPayload, 'find'>,
  { limit, nowISO }: { limit: number; nowISO: string },
): Promise<{ events: PublicNewsEventCard[]; news: PublicNewsEventCard[] }> {
  const [newsResult, eventsResult] = await Promise.all([
    payload.find({
      collection: 'news-events',
      depth: 1,
      limit,
      overrideAccess: true,
      select: cardSelect,
      sort: ['-publishedAt', '-id'],
      where: {
        and: [...publishedWhere, { contentType: { in: nonEventClassifications } }],
      },
    }),
    payload.find({
      collection: 'news-events',
      depth: 1,
      limit,
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

  return { events, news }
}

async function fetchMixedNewsEvents(
  payload: Pick<NewsEventsPayload, 'find'>,
  { limit, nowISO }: { limit: number; nowISO: string },
): Promise<PublicNewsEventCard[]> {
  const { events, news } = await fetchMixedNewsEventSources(payload, { limit, nowISO })

  return interleaveNewsEvents(news, events, limit)
}

async function fetchMixedNewsEventsPage(
  payload: Pick<NewsEventsPayload, 'find'>,
  { limit, nowISO, page }: { limit: number; nowISO: string; page: number },
): Promise<PublicNewsEventPage> {
  const offset = (page - 1) * limit
  const end = page * limit
  const prefixLimit = end + 1
  const { events, news } = await fetchMixedNewsEventSources(payload, {
    limit: prefixLimit,
    nowISO,
  })
  const mixed = interleaveNewsEvents(news, events, prefixLimit)

  return {
    docs: mixed.slice(offset, end),
    hasNextPage: mixed.length > end,
    page,
  }
}

export async function fetchNewsEventsHighlights(
  payload: Pick<NewsEventsPayload, 'find'>,
  { limit, nowISO }: { limit: number; nowISO: string },
): Promise<PublicNewsEventCard[]> {
  return fetchMixedNewsEvents(payload, {
    limit: normalizeHighlightsItemCount(limit),
    nowISO,
  })
}

export async function fetchNewsEventGroups(
  payload: Pick<NewsEventsPayload, 'find'>,
  { limit, nowISO }: { limit: number; nowISO: string },
): Promise<PublicNewsEventGroups> {
  const resolvedLimit = normalizeGroupLimit(limit)
  const allPromise = fetchNewsEventPage(payload, {
    classification: 'all',
    limit: resolvedLimit,
    nowISO,
    page: 1,
  })
  const classificationPromises = NEWS_EVENT_CLASSIFICATIONS.map(async ({ value }) => {
    const page = await fetchNewsEventPage(payload, {
      classification: value,
      limit: resolvedLimit,
      nowISO,
      page: 1,
    })

    return [value, page] as const satisfies readonly [NewsEventClassification, PublicNewsEventPage]
  })
  const [all, classifications] = await Promise.all([
    allPromise,
    Promise.all(classificationPromises),
  ])
  const groups = createEmptyNewsEventGroups()
  groups.all = all

  for (const [classification, items] of classifications) {
    groups[classification] = items
  }

  return groups
}

export async function fetchNewsEventPage(
  payload: Pick<NewsEventsPayload, 'find'>,
  {
    classification,
    limit,
    nowISO,
    page,
  }: {
    classification: NewsEventClassificationTab
    limit: number
    nowISO: string
    page: number
  },
): Promise<PublicNewsEventPage> {
  const resolvedLimit = normalizeGroupLimit(limit)
  const resolvedPage = Number.isInteger(page) && page > 0 ? page : 1

  if (classification === 'all') {
    return fetchMixedNewsEventsPage(payload, {
      limit: resolvedLimit,
      nowISO,
      page: resolvedPage,
    })
  }

  const result = await payload.find({
    collection: 'news-events',
    depth: 1,
    limit: resolvedLimit,
    overrideAccess: true,
    page: resolvedPage,
    select: cardSelect,
    sort: classification === 'event' ? ['eventStart', 'id'] : ['-publishedAt', '-id'],
    where: {
      and: [
        ...publishedWhere,
        { contentType: { equals: classification } },
        ...(classification === 'event' ? [currentOrUpcomingEventWhere(nowISO)] : []),
      ],
    },
  })

  return {
    docs: (result.docs as NewsEventCardRecord[]).map((entry) =>
      toPublicNewsEventCard(entry, nowISO),
    ),
    hasNextPage: result.hasNextPage,
    page: result.page ?? resolvedPage,
  }
}

export async function fetchNewsGridItems(
  payload: Pick<NewsEventsPayload, 'find'>,
  { limit, nowISO }: { limit: number; nowISO: string },
): Promise<PublicNewsEventCard[]> {
  const resolvedLimit = normalizeHighlightsItemCount(limit)
  const result = await payload.find({
    collection: 'news-events',
    depth: 1,
    limit: resolvedLimit,
    overrideAccess: true,
    select: cardSelect,
    sort: ['-updatedAt', '-createdAt', '-id'],
    where: {
      and: [
        ...publishedWhere,
        {
          or: [
            { contentType: { equals: 'news' } },
            {
              and: [{ contentType: { equals: 'event' } }, currentOrUpcomingEventWhere(nowISO)],
            },
          ],
        },
      ],
    },
  })

  return (result.docs as NewsEventCardRecord[]).map((entry) => toPublicNewsEventCard(entry, nowISO))
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

export const getNewsEventGroups = cache(async (limit: number, nowISO: string) => {
  const payload = await loadPayload()

  try {
    return await fetchNewsEventGroups(payload, { limit, nowISO })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Failed to load grouped News & Events.' })
    return createEmptyNewsEventGroups()
  }
})

export const getNewsEventPage = cache(
  async (
    classification: NewsEventClassificationTab,
    page: number,
    limit: number,
    nowISO: string,
  ) => {
    const payload = await loadPayload()
    return fetchNewsEventPage(payload, { classification, limit, nowISO, page })
  },
)

export const getNewsGridItems = cache(async (limit: number, nowISO: string) => {
  const payload = await loadPayload()

  try {
    return await fetchNewsGridItems(payload, { limit, nowISO })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Failed to load News Grid items.' })
    throw error
  }
})

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
