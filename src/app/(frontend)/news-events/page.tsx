import type { Metadata } from 'next'

import { NewsEventsArchivePage } from '@/components/news-events/NewsEventsArchivePage'
import {
  getNewsEventsInheritedRobots,
  getNewsEventsSettings,
} from '@/lib/newsEvents'
import { getNewsEventsArchiveMetadata } from '@/lib/newsEventsMetadata'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(): Promise<Metadata> {
  const [settings, inheritedRobots] = await Promise.all([
    getNewsEventsSettings(),
    getNewsEventsInheritedRobots(),
  ])

  return getNewsEventsArchiveMetadata(settings, inheritedRobots)
}

export default async function NewsEventsArchiveRoute({ searchParams }: PageProps) {
  return <NewsEventsArchivePage searchParams={searchParams} />
}
