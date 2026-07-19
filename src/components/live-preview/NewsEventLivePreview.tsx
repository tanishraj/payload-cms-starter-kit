'use client'

import { RefreshRouteOnSave, useLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

import { NewsEventStory } from '@/components/news-events/NewsEventStory'
import { toPublicNewsEventDetail } from '@/lib/newsEventsShared'
import type { NewsEvent } from '@/payload-types'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export function NewsEventLivePreview({
  initialData,
  nowISO,
}: {
  initialData: NewsEvent
  nowISO: string
}) {
  const router = useRouter()
  const { data } = useLivePreview<NewsEvent>({ depth: 2, initialData, serverURL })

  return (
    <>
      <NewsEventStory entry={toPublicNewsEventDetail(data, nowISO)} />
      <RefreshRouteOnSave depth={2} refresh={() => router.refresh()} serverURL={serverURL} />
    </>
  )
}
