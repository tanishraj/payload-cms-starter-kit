import { PageLivePreview } from '@/components/live-preview/PageLivePreview'
import { loadReviewPreviewSnapshot } from '@/lib/reviewPreviewSnapshot'
import { loadNewsEventsPreviewSnapshot } from '@/lib/newsEventsPreviewSnapshot'
import { getDraftSiteOfficeLocations } from '@/lib/siteOffices'
import { getDraftEventGalleryAlbums } from '@/lib/eventGallery'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function AdminPreviewPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({
    config: configPromise,
  })
  const requestHeaders = new Headers(await getHeaders())
  const { user } = await payload.auth({
    canSetHeaders: false,
    headers: requestHeaders,
  })

  if (!user) {
    notFound()
  }

  const pageID = id?.trim()

  if (!pageID) {
    notFound()
  }

  const page = await payload.findByID({
    collection: 'pages',
    id: pageID,
    depth: 2,
    draft: true,
  })

  if (!page) {
    notFound()
  }

  const hasContact24 = page.layout?.some((block) => block.blockType === 'contact24') ?? false
  const hasEventGallery =
    page.layout?.some((block) => block.blockType === 'eventGallery') ?? false
  const [reviewSnapshot, newsEventsSnapshot, officeLocations, eventGalleryAlbums] =
    await Promise.all([
    loadReviewPreviewSnapshot(page.layout),
    loadNewsEventsPreviewSnapshot(page.layout),
    hasContact24 ? getDraftSiteOfficeLocations() : Promise.resolve([]),
    hasEventGallery ? getDraftEventGalleryAlbums() : Promise.resolve([]),
  ])

  return (
    <PageLivePreview
      eventGalleryAlbums={eventGalleryAlbums}
      initialData={page}
      newsEventsSnapshot={newsEventsSnapshot}
      officeLocations={officeLocations}
      reviewSnapshot={reviewSnapshot}
    />
  )
}
