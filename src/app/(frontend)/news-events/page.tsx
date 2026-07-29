import type { Metadata } from 'next'

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
import { getNewsEventsArchiveMetadata } from '@/lib/newsEventsMetadata'
import { normalizeNewsEventsPageSize, parseNewsEventsSearchParams } from '@/lib/newsEventsShared'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(): Promise<Metadata> {
  return getNewsEventsArchiveMetadata(await getNewsEventsSettings())
}

export default async function NewsEventsArchivePage({ searchParams }: PageProps) {
  const settings = await getNewsEventsSettings()
  const query = parseNewsEventsSearchParams(await searchParams)
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
      upcomingEvents={upcomingEvents}
    />
  )
}
