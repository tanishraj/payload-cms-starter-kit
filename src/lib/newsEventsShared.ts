import type { ResolvedCmsAction } from '@/lib/cmsLinks'
import { resolveCmsActions } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { getTaxonomyTerm, getTaxonomyTerms } from '@/lib/taxonomy'
import {
  resolveNewsEventClassificationRecord,
  type NewsEventClassificationBehavior,
  type ResolvedNewsEventClassification,
} from '@/lib/newsEventClassifications'
import type { NewsEvent } from '@/payload-types'

export const NEWS_EVENTS_DEFAULT_HIGHLIGHT_COUNT = 3
export const NEWS_EVENTS_MAX_HIGHLIGHT_COUNT = 6

/** @deprecated Classifications are now dynamic; use ResolvedNewsEventClassification. */
export type NewsEventContentType = string
export type NewsEventImagePosition = 'bottom' | 'center' | 'left' | 'right' | 'top'

export type PublicNewsEventImage = {
  alt: string
  height?: number
  position: NewsEventImagePosition
  src: string
  width?: number
}

export type PublicNewsEventCard = {
  behavior: NewsEventClassificationBehavior
  category?: { id: number | string; slug: string; title: string }
  classification: ResolvedNewsEventClassification
  /** @deprecated Use classification.slug and behavior. */
  contentType: string
  dateISO: string
  dateLabel: string
  eventEnd?: string
  eventStart?: string
  excerpt: string
  href: string
  id: string
  image?: PublicNewsEventImage
  isPastEvent: boolean
  slug: string
  title: string
}

export type PublicNewsEventDetail = PublicNewsEventCard & {
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

export type PublicNewsEventPage = {
  docs: PublicNewsEventCard[]
  hasNextPage: boolean
  page: number
}

export type PublicNewsEventGroups = Record<string, PublicNewsEventPage>

export const newsEventObjectPositionClasses = {
  bottom: 'object-bottom',
  center: 'object-center',
  left: 'object-left',
  right: 'object-right',
  top: 'object-top',
} as const satisfies Record<NewsEventImagePosition, string>

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
const rangeMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
})
const rangeMonthDayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

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

export function formatNewsEventDateRange(
  startValue: string | null | undefined,
  endValue?: string | null,
): string {
  if (!startValue) return ''

  const start = new Date(startValue)
  const end = endValue ? new Date(endValue) : undefined

  if (Number.isNaN(start.getTime())) return ''
  if (!end || Number.isNaN(end.getTime())) return formatNewsEventDate(startValue)

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear()
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth()
  const sameDay = sameMonth && start.getUTCDate() === end.getUTCDate()

  if (sameDay) return formatNewsEventDate(startValue)

  if (sameMonth) {
    return `${rangeMonthFormatter.format(start)} ${start.getUTCDate()}–${end.getUTCDate()}, ${end.getUTCFullYear()}`
  }

  return `${rangeMonthDayFormatter.format(start)}, ${start.getUTCFullYear()} – ${rangeMonthDayFormatter.format(end)}, ${end.getUTCFullYear()}`
}

export const normalizeHighlightsItemCount = (value: number | null | undefined): number =>
  typeof value === 'number' && Number.isInteger(value)
    ? Math.min(NEWS_EVENTS_MAX_HIGHLIGHT_COUNT, Math.max(1, value))
    : NEWS_EVENTS_DEFAULT_HIGHLIGHT_COUNT

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
    | 'classification'
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
  const classification = resolveNewsEventClassificationRecord(
    entry.classification,
    entry.contentType,
  )

  if (!classification) {
    throw new Error(`News & Events entry ${String(entry.id)} has no usable classification.`)
  }

  const isEvent = classification.behavior === 'event'
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
    behavior: classification.behavior,
    category: category ?? undefined,
    classification,
    contentType: classification.slug,
    dateISO,
    dateLabel: formatNewsEventDate(dateISO),
    eventEnd: isEvent ? entry.eventEnd || undefined : undefined,
    eventStart: isEvent ? entry.eventStart || undefined : undefined,
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
    body: entry.body,
    categories: getTaxonomyTerms(entry.categories),
    eventEnd: card.behavior === 'event' ? entry.eventEnd || undefined : undefined,
    eventLocation: card.behavior === 'event' ? entry.eventLocation?.trim() || undefined : undefined,
    eventRegistrationAction: card.behavior === 'event' ? resolvedRegistration : undefined,
    eventRegistrationMode:
      card.behavior === 'event' ? (registration?.mode ?? undefined) : undefined,
    eventStart: card.behavior === 'event' ? entry.eventStart || undefined : undefined,
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

export const createEmptyNewsEventPage = (page = 1): PublicNewsEventPage => ({
  docs: [],
  hasNextPage: false,
  page,
})

export function createEmptyNewsEventGroups(): PublicNewsEventGroups {
  return { all: createEmptyNewsEventPage() }
}
