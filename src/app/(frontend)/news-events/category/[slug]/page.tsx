import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { NewsEventsArchivePage } from '@/components/news-events/NewsEventsArchivePage'
import {
  getNewsEventCategoryBySlug,
  getNewsEventsInheritedRobots,
  getNewsEventsSettings,
} from '@/lib/newsEvents'
import { getNewsEventsCategoryPath } from '@/lib/newsEventsPaths'
import { getNewsEventsTaxonomyMetadata } from '@/lib/newsEventsMetadata'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [term, settings, inheritedRobots] = await Promise.all([
    getNewsEventCategoryBySlug(slug),
    getNewsEventsSettings(),
    getNewsEventsInheritedRobots(),
  ])

  if (!term) return {}

  return getNewsEventsTaxonomyMetadata({
    inheritedRobots,
    pathname: getNewsEventsCategoryPath(slug),
    settings,
    term,
  })
}

export default async function NewsEventsCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const term = await getNewsEventCategoryBySlug(slug)

  if (!term) notFound()

  return (
    <NewsEventsArchivePage
      fixedTaxonomy={{ kind: 'category', slug: term.slug }}
      searchParams={searchParams}
    />
  )
}
