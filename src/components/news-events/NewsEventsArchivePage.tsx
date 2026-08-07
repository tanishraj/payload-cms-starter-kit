import { NewsEventsFeed } from '@/components/news-events/NewsEventsFeed'
import {
  createEmptyNewsEventsPage,
  getNewsEventCategories,
  getNewsEventTags,
  getNewsEventsArchivePage,
  getNewsEventsSettings,
  getPastEventsPage,
  getUpcomingEventsPage,
} from '@/lib/newsEvents'
import type { NewsEventsTaxonomyContext } from '@/lib/newsEventsPaths'
import { normalizeNewsEventsPageSize, parseNewsEventsSearchParams } from '@/lib/newsEventsShared'

type NewsEventsArchivePageProps = {
  fixedTaxonomy?: NewsEventsTaxonomyContext
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function NewsEventsArchivePage({
  fixedTaxonomy,
  searchParams,
}: NewsEventsArchivePageProps) {
  const settings = await getNewsEventsSettings()
  const parsedQuery = parseNewsEventsSearchParams(await searchParams)
  const query = fixedTaxonomy
    ? { ...parsedQuery, [fixedTaxonomy.kind]: fixedTaxonomy.slug }
    : parsedQuery
  const limit = normalizeNewsEventsPageSize(settings.entriesPerPage)
  const nowISO = new Date().toISOString()

  const [categories, tags, archiveData, upcomingEvents, pastEvents] = await Promise.all([
    getNewsEventCategories().catch(() => []),
    getNewsEventTags().catch(() => []),
    query.type === 'event'
      ? Promise.resolve(createEmptyNewsEventsPage())
      : getNewsEventsArchivePage(query, limit, nowISO).catch(() => createEmptyNewsEventsPage()),
    query.type === 'event'
      ? getUpcomingEventsPage(query, limit, nowISO).catch(() => createEmptyNewsEventsPage())
      : Promise.resolve(undefined),
    query.type === 'event'
      ? getPastEventsPage(query, limit, nowISO).catch(() => createEmptyNewsEventsPage())
      : Promise.resolve(undefined),
  ])

  return (
    <NewsEventsFeed
      archiveData={archiveData}
      categories={categories}
      pastEvents={pastEvents}
      query={query}
      settings={settings}
      tags={tags}
      taxonomyContext={fixedTaxonomy}
      upcomingEvents={upcomingEvents}
    />
  )
}
