import { getMediaImageProps, isMediaDoc } from '@/lib/media'
import type { GalleryAlbum } from '@/payload-types'

export type EventGalleryImage = {
  alt: string
  caption?: string
  height: number
  id: string
  src: string
  width: number
}

export type EventGalleryAlbum = {
  cover: EventGalleryImage
  createdAt: string
  description?: string
  eventDate?: string
  id: string
  imageCount: number
  images: EventGalleryImage[]
  title: string
}

const getTimestamp = (value: string): number => {
  const timestamp = Date.parse(value)

  return Number.isNaN(timestamp) ? 0 : timestamp
}

export const normalizeEventGalleryAlbums = (
  value: unknown,
): EventGalleryAlbum[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .flatMap((entry): EventGalleryAlbum[] => {
      const album = entry as Partial<GalleryAlbum>
      const title = album.title?.trim()
      const images = (album.images ?? []).flatMap((row): EventGalleryImage[] => {
        const media = row.image
        const image = getMediaImageProps({ media, preset: 'generic' })

        if (!image || !isMediaDoc(media)) {
          return []
        }

        const caption = row.caption?.trim()

        return [
          {
            alt: image.alt,
            ...(caption ? { caption } : {}),
            height: image.height ?? 900,
            id: row.id ?? String(media.id),
            src: image.src,
            width: image.width ?? 1600,
          },
        ]
      })
      const cover = images[0]

      if (!title || !cover || album.id == null || !album.createdAt) {
        return []
      }

      const description = album.description?.trim()

      return [
        {
          cover,
          createdAt: album.createdAt,
          ...(description ? { description } : {}),
          ...(album.eventDate ? { eventDate: album.eventDate } : {}),
          id: String(album.id),
          imageCount: images.length,
          images,
          title,
        },
      ]
    })
    .sort((first, second) => getTimestamp(second.createdAt) - getTimestamp(first.createdAt))
}
