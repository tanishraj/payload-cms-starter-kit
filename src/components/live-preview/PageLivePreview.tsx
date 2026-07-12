'use client'

import type { Page } from '@/payload-types'
import { RefreshRouteOnSave, useLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

type Props = {
  initialData: Page
}

export function PageLivePreview({ initialData }: Props) {
  const router = useRouter()
  useLivePreview<Page>({
    depth: 2,
    initialData,
    serverURL,
  })

  return (
    <>
      <RefreshRouteOnSave
        depth={2}
        refresh={() => router.refresh()}
        serverURL={serverURL}
      />
    </>
  )
}
