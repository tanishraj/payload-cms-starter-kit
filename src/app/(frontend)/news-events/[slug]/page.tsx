import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { NewsEventLivePreview } from '@/components/live-preview/NewsEventLivePreview'
import { NewsEventStory } from '@/components/news-events/NewsEventStory'
import { getNewsEventBySlug, getNewsEventPreviewBySlug } from '@/lib/newsEvents'
import { getNewsEventDetailMetadata, getNewsEventStructuredData } from '@/lib/newsEventsMetadata'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'news-events',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: { slug: true },
    where: {
      and: [
        { _status: { equals: 'published' } },
        { workflowState: { equals: 'published' } },
      ],
    },
  })
  return result.docs.map((entry) => ({ slug: entry.slug }))
}

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string | string[] }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = await getNewsEventBySlug(slug, new Date().toISOString())

  return entry ? getNewsEventDetailMetadata(entry) : {}
}

export default async function NewsEventEntryPage({ params, searchParams }: PageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams])
  const isPreview = resolvedSearchParams.preview === 'true'
  const nowISO = new Date().toISOString()

  if (isPreview) {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({
      canSetHeaders: false,
      headers: new Headers(await getHeaders()),
    })

    if (!user) notFound()

    const draftEntry = await getNewsEventPreviewBySlug(slug)
    if (!draftEntry) notFound()

    return <NewsEventLivePreview initialData={draftEntry} nowISO={nowISO} />
  }

  const entry = await getNewsEventBySlug(slug, nowISO)
  if (!entry) notFound()

  const structuredData = getNewsEventStructuredData(entry)

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
        type="application/ld+json"
      />
      <NewsEventStory entry={entry} />
    </>
  )
}
