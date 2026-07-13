'use client'

import { renderPageBlocks } from '@/blocks/renderPageBlocks'
import type { Page } from '@/payload-types'
import { RefreshRouteOnSave, useLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

type Props = {
  initialData: Page
}

export function PageLivePreview({ initialData }: Props) {
  const router = useRouter()
  const { data } = useLivePreview<Page>({
    depth: 2,
    initialData,
    serverURL,
  })

  return (
    <>
      {renderPageBlocks(data.layout)}
      <RefreshRouteOnSave
        depth={2}
        refresh={() => router.refresh()}
        serverURL={serverURL}
      />
    </>
  )
}
