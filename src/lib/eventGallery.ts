import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import {
  normalizeEventGalleryAlbums,
  type EventGalleryAlbum,
} from '@/lib/eventGalleryShared'

const loadEventGalleryAlbums = cache(async (draft: boolean): Promise<EventGalleryAlbum[]> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'gallery-albums',
    depth: 1,
    draft,
    pagination: false,
    sort: '-createdAt',
    ...(draft ? {} : { where: { _status: { equals: 'published' as const } } }),
  })

  return normalizeEventGalleryAlbums(result.docs)
})

export const getPublishedEventGalleryAlbums = () => loadEventGalleryAlbums(false)
export const getDraftEventGalleryAlbums = () => loadEventGalleryAlbums(true)
