import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { NewsEventsArchivePage } from '@/components/news-events/NewsEventsArchivePage'
import {
  getNewsEventTagBySlug,
  getNewsEventsInheritedRobots,
  getNewsEventsSettings,
} from '@/lib/newsEvents'
import { getNewsEventsTagPath } from '@/lib/newsEventsPaths'
import { getNewsEventsTaxonomyMetadata } from '@/lib/newsEventsMetadata'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [term, settings, inheritedRobots] = await Promise.all([
    getNewsEventTagBySlug(slug),
    getNewsEventsSettings(),
    getNewsEventsInheritedRobots(),
  ])

  if (!term) return {}

  return getNewsEventsTaxonomyMetadata({
    inheritedRobots,
    pathname: getNewsEventsTagPath(slug),
    settings,
    term,
  })
}

export default async function NewsEventsTagPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const term = await getNewsEventTagBySlug(slug)

  if (!term) notFound()

  return (
    <NewsEventsArchivePage
      fixedTaxonomy={{ kind: 'tag', slug: term.slug }}
      searchParams={searchParams}
    />
  )
}
