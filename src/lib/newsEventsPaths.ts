import type { NewsEventsArchiveQuery, NewsEventsArchiveType } from '@/lib/newsEventsShared'

export type NewsEventsTaxonomyContext = {
  kind: 'category' | 'tag'
  slug: string
}

export type NewsEventsArchiveHrefUpdates = Partial<{
  category: string | undefined
  page: number
  pastPage: number
  tag: string | undefined
  type: NewsEventsArchiveType
  upcomingPage: number
}>

export const getNewsEventsCategoryPath = (slug: string) =>
  `/news-events/category/${encodeURIComponent(slug)}`

export const getNewsEventsTagPath = (slug: string) =>
  `/news-events/tag/${encodeURIComponent(slug)}`

export function buildNewsEventsArchiveHref(
  query: NewsEventsArchiveQuery,
  updates: NewsEventsArchiveHrefUpdates,
  context?: NewsEventsTaxonomyContext,
): string {
  const next = { ...query, ...updates }
  const updatesCategory = Object.prototype.hasOwnProperty.call(updates, 'category')
  const updatesTag = Object.prototype.hasOwnProperty.call(updates, 'tag')
  let activeContext = context

  if (context?.kind === 'category' && updatesCategory) {
    activeContext = updates.category
      ? { kind: 'category', slug: updates.category }
      : undefined
  } else if (context?.kind === 'tag' && updatesTag) {
    activeContext = updates.tag ? { kind: 'tag', slug: updates.tag } : undefined
  } else if (!context && updatesCategory && updates.category) {
    activeContext = { kind: 'category', slug: updates.category }
  } else if (!context && updatesTag && updates.tag) {
    activeContext = { kind: 'tag', slug: updates.tag }
  }

  const params = new URLSearchParams()
  if (next.type !== 'all') params.set('type', next.type)
  if (next.category && activeContext?.kind !== 'category') params.set('category', next.category)
  if (next.tag && activeContext?.kind !== 'tag') params.set('tag', next.tag)
  if (next.page > 1) params.set('page', String(next.page))
  if (next.upcomingPage > 1) params.set('upcomingPage', String(next.upcomingPage))
  if (next.pastPage > 1) params.set('pastPage', String(next.pastPage))

  const pathname =
    activeContext?.kind === 'category'
      ? getNewsEventsCategoryPath(activeContext.slug)
      : activeContext?.kind === 'tag'
        ? getNewsEventsTagPath(activeContext.slug)
        : '/news-events'
  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}
