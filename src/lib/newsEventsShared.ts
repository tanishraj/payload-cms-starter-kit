import type { ResolvedCmsAction } from '@/lib/cmsLinks'
import { resolveCmsActions } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { getTaxonomyTerm, getTaxonomyTerms } from '@/lib/taxonomy'
import type { NewsEvent } from '@/payload-types'

export const NEWS_EVENTS_DEFAULT_PAGE_SIZE = 9
export const NEWS_EVENTS_MAX_PAGE_SIZE = 24
export const NEWS_EVENTS_DEFAULT_HIGHLIGHT_COUNT = 3
export const NEWS_EVENTS_MAX_HIGHLIGHT_COUNT = 6

export type NewsEventContentType = 'event' | 'news'
export type NewsEventImagePosition = 'bottom' | 'center' | 'left' | 'right' | 'top'
export type NewsEventsArchiveType = 'all' | NewsEventContentType

export type PublicNewsEventImage = {
  alt: string
  height?: number
  position: NewsEventImagePosition
  src: string
  width?: number
}

export type PublicNewsEventCard = {
  category?: { id: number | string; slug: string; title: string }
  contentType: NewsEventContentType
  dateISO: string
  dateLabel: string
  excerpt: string
  href: string
  id: string
  image?: PublicNewsEventImage
  isPastEvent: boolean
  slug: string
  title: string
}

export type PublicNewsEventDetail = PublicNewsEventCard & {
  authorName?: string
  body: NewsEvent['body']
  categories: Array<{ id: number | string; slug: string; title: string }>
  eventEnd?: string
  eventLocation?: string
  eventRegistrationAction?: ResolvedCmsAction
  eventRegistrationMode?: 'button' | 'link'
  eventStart?: string
  canonicalURL?: string
  metaDescription?: string
  metaTitle?: string
  ogDescription?: string
  ogImageURL?: string
  ogTitle?: string
  publishedAt?: string
  robotsMode?: 'default' | 'index' | 'noindex'
  tags: Array<{ id: number | string; slug: string; title: string }>
  updatedAt: string
}

export type PublicNewsEventsPage = {
  docs: PublicNewsEventCard[]
  hasNextPage: boolean
  hasPrevPage: boolean
  page: number
  totalPages: number
}

export type NewsEventsArchiveQuery = {
  category?: string
  page: number
  pastPage: number
  tag?: string
  type: NewsEventsArchiveType
  upcomingPage: number
}

export const newsEventObjectPositionClasses = {
  bottom: 'object-bottom',
  center: 'object-center',
  left: 'object-left',
  right: 'object-right',
  top: 'object-top',
} as const satisfies Record<NewsEventImagePosition, string>

const archiveTypeValues = new Set<NewsEventsArchiveType>(['all', 'event', 'news'])
const categorySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const tagSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const positiveIntegerPattern = /^[1-9]\d*$/
const cardDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})
const eventDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  month: 'short',
  timeZone: 'UTC',
  timeZoneName: 'short',
  year: 'numeric',
})

const firstSearchParam = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

const parsePositiveInteger = (value: string | undefined): number =>
  value && positiveIntegerPattern.test(value) ? Number(value) : 1

const formatDate = (value: string | null | undefined, includeTime = false): string => {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return includeTime ? eventDateFormatter.format(date) : cardDateFormatter.format(date)
}

export const formatNewsEventDate = (value: string | null | undefined): string => formatDate(value)

export const formatNewsEventDateTime = (value: string | null | undefined): string =>
  formatDate(value, true)

export const normalizeHighlightsItemCount = (value: number | null | undefined): number =>
  typeof value === 'number' && Number.isInteger(value)
    ? Math.min(NEWS_EVENTS_MAX_HIGHLIGHT_COUNT, Math.max(1, value))
    : NEWS_EVENTS_DEFAULT_HIGHLIGHT_COUNT

export const normalizeNewsEventsPageSize = (value: number | null | undefined): number =>
  typeof value === 'number' && Number.isInteger(value)
    ? Math.min(NEWS_EVENTS_MAX_PAGE_SIZE, Math.max(3, value))
    : NEWS_EVENTS_DEFAULT_PAGE_SIZE

export function parseNewsEventsSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): NewsEventsArchiveQuery {
  const requestedType = firstSearchParam(searchParams.type)
  const requestedCategory = firstSearchParam(searchParams.category)?.trim().toLowerCase()
  const requestedTag = firstSearchParam(searchParams.tag)?.trim().toLowerCase()
  const type = archiveTypeValues.has(requestedType as NewsEventsArchiveType)
    ? (requestedType as NewsEventsArchiveType)
    : 'all'

  return {
    category:
      requestedCategory && categorySlugPattern.test(requestedCategory)
        ? requestedCategory
        : undefined,
    page: parsePositiveInteger(firstSearchParam(searchParams.page)),
    pastPage: parsePositiveInteger(firstSearchParam(searchParams.pastPage)),
    tag: requestedTag && tagSlugPattern.test(requestedTag) ? requestedTag : undefined,
    type,
    upcomingPage: parsePositiveInteger(firstSearchParam(searchParams.upcomingPage)),
  }
}

export function interleaveNewsEvents(
  news: PublicNewsEventCard[],
  events: PublicNewsEventCard[],
  limit: number,
): PublicNewsEventCard[] {
  const result: PublicNewsEventCard[] = []
  const seen = new Set<string>()
  let newsIndex = 0
  let eventIndex = 0
  let preferNews = true

  while (result.length < limit && (newsIndex < news.length || eventIndex < events.length)) {
    let candidate: PublicNewsEventCard | undefined

    if (preferNews && newsIndex < news.length) {
      candidate = news[newsIndex++]
    } else if (!preferNews && eventIndex < events.length) {
      candidate = events[eventIndex++]
    } else if (newsIndex < news.length) {
      candidate = news[newsIndex++]
    } else {
      candidate = events[eventIndex++]
    }

    if (candidate && !seen.has(candidate.id)) {
      seen.add(candidate.id)
      result.push(candidate)
    }

    preferNews = !preferNews
  }

  if (result.length < limit) {
    for (const candidate of [...news.slice(newsIndex), ...events.slice(eventIndex)]) {
      if (result.length >= limit) {
        break
      }

      if (!seen.has(candidate.id)) {
        seen.add(candidate.id)
        result.push(candidate)
      }
    }
  }

  return result
}

const getEffectiveEventEnd = (
  entry: Pick<NewsEvent, 'eventEnd' | 'eventStart'>,
): string | undefined => entry.eventEnd || entry.eventStart || undefined

export function toPublicNewsEventCard(
  entry: Pick<
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
  >,
  nowISO: string,
): PublicNewsEventCard {
  const isEvent = entry.contentType === 'event'
  const title = entry.title?.trim() || 'Untitled entry'
  const slug = entry.slug?.trim() || 'untitled-entry'
  const dateISO = (isEvent ? entry.eventStart : entry.publishedAt) || entry.updatedAt
  const effectiveEnd = getEffectiveEventEnd(entry)
  const image = getMediaImageProps({
    fallbackAlt: title,
    media: entry.featuredImage,
    preset: 'generic',
  })
  const category = getTaxonomyTerm(entry.primaryCategory)

  return {
    category: category ?? undefined,
    contentType: entry.contentType,
    dateISO,
    dateLabel: formatNewsEventDate(dateISO),
    excerpt: entry.excerpt?.trim() || '',
    href: `/news-events/${slug}`,
    id: String(entry.id),
    image: image
      ? {
          ...image,
          position: entry.featuredImagePosition ?? 'center',
        }
      : undefined,
    isPastEvent:
      isEvent && effectiveEnd
        ? new Date(effectiveEnd).getTime() < new Date(nowISO).getTime()
        : false,
    slug,
    title,
  }
}

export function toPublicNewsEventDetail(entry: NewsEvent, nowISO: string): PublicNewsEventDetail {
  const card = toPublicNewsEventCard(entry, nowISO)
  const registration = entry.eventRegistrationAction?.[0]
  const resolvedRegistration = resolveCmsActions(registration ? [registration] : [])[0]
  const ogImage = getMediaImageProps({
    fallbackAlt: entry.title,
    media: entry.ogImage,
    preset: 'generic',
  })

  return {
    ...card,
    authorName: entry.authorName?.trim() || undefined,
    body: entry.body,
    categories: getTaxonomyTerms(entry.categories),
    eventEnd: entry.eventEnd || undefined,
    eventLocation: entry.eventLocation?.trim() || undefined,
    eventRegistrationAction: resolvedRegistration,
    eventRegistrationMode: registration?.mode ?? undefined,
    eventStart: entry.eventStart || undefined,
    canonicalURL: entry.canonicalURL?.trim() || undefined,
    metaDescription: entry.metaDescription?.trim() || undefined,
    metaTitle: entry.metaTitle?.trim() || undefined,
    ogDescription: entry.ogDescription?.trim() || undefined,
    ogImageURL: ogImage?.src,
    ogTitle: entry.ogTitle?.trim() || undefined,
    publishedAt: entry.publishedAt || undefined,
    robotsMode: entry.robotsMode ?? undefined,
    tags: getTaxonomyTerms(entry.tags),
    updatedAt: entry.updatedAt,
  }
}

export const createEmptyNewsEventsPage = (): PublicNewsEventsPage => ({
  docs: [],
  hasNextPage: false,
  hasPrevPage: false,
  page: 1,
  totalPages: 0,
})
