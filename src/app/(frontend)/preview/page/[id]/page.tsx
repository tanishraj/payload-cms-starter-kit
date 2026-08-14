import { PageLivePreview } from '@/components/live-preview/PageLivePreview'
import { getDraftEventGalleryAlbums } from '@/lib/eventGallery'
import { getEventGalleryAlbumIDsFromBlocks } from '@/lib/eventGalleryShared'
import { loadNewsEventsPreviewSnapshot } from '@/lib/newsEventsPreviewSnapshot'
import { loadReviewPreviewSnapshot } from '@/lib/reviewPreviewSnapshot'
import { getDraftSiteOfficeLocations } from '@/lib/siteOffices'
import { getPageID } from '@/lib/pagePaths'
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

  const [page, pageSettings] = await Promise.all([
    payload.findByID({
      collection: 'pages',
      id: pageID,
      depth: 8,
      draft: true,
    }),
    payload.findGlobal({
      slug: 'page-settings',
      depth: 0,
      draft: true,
    }),
  ])

  if (!page) {
    notFound()
  }

  const isHomepage = String(getPageID(pageSettings.homepage)) === String(page.id)

  const hasContact24 = page.layout?.some((block) => block.blockType === 'contact24') ?? false
  const selectedEventGalleryAlbumIDs = getEventGalleryAlbumIDsFromBlocks(page.layout)
  const [reviewSnapshot, newsEventsSnapshot, officeLocations, eventGalleryAlbums] =
    await Promise.all([
      loadReviewPreviewSnapshot(page.layout),
      loadNewsEventsPreviewSnapshot(page.layout),
      hasContact24 ? getDraftSiteOfficeLocations() : Promise.resolve([]),
      selectedEventGalleryAlbumIDs.length
        ? getDraftEventGalleryAlbums(selectedEventGalleryAlbumIDs)
        : Promise.resolve([]),
    ])

  return (
    <PageLivePreview
      eventGalleryAlbums={eventGalleryAlbums}
      initialData={page}
      isHomepage={isHomepage}
      newsEventsSnapshot={newsEventsSnapshot}
      officeLocations={officeLocations}
      reviewSnapshot={reviewSnapshot}
    />
  )
}
