'use client'

import { renderLivePreviewPageBlocks } from '@/blocks/renderLivePreviewPageBlocks'
import type { ReviewPreviewSnapshot } from '@/lib/reviewPreviewShared'
import type { NewsEventsPreviewSnapshot } from '@/lib/newsEventsPreviewShared'
import type { Page } from '@/payload-types'
import { RefreshRouteOnSave, useLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

type Props = {
  initialData: Page
  newsEventsSnapshot: NewsEventsPreviewSnapshot
  reviewSnapshot: ReviewPreviewSnapshot
}

export function PageLivePreview({ initialData, newsEventsSnapshot, reviewSnapshot }: Props) {
  const router = useRouter()
  const { data } = useLivePreview<Page>({
    depth: 2,
    initialData,
    serverURL,
  })

  return (
    <>
      {renderLivePreviewPageBlocks(data.layout, reviewSnapshot, newsEventsSnapshot)}
      <RefreshRouteOnSave depth={2} refresh={() => router.refresh()} serverURL={serverURL} />
    </>
  )
}
