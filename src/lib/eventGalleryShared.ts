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

export type EventGalleryDisplayOrder = 'latestEventDate' | 'manual'

const getRelationshipID = (value: unknown): string | undefined => {
  if (typeof value === 'string' || typeof value === 'number') {
    const id = String(value).trim()

    return id || undefined
  }

  if (typeof value !== 'object' || value === null || !('id' in value)) {
    return undefined
  }

  const id = value.id

  if (typeof id !== 'string' && typeof id !== 'number') {
    return undefined
  }

  const normalizedID = String(id).trim()

  return normalizedID || undefined
}

export const getEventGalleryAlbumRelationshipIDs = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()

  return value.flatMap((entry): string[] => {
    const id = getRelationshipID(entry)

    if (!id || seen.has(id)) {
      return []
    }

    seen.add(id)
    return [id]
  })
}

export const getEventGalleryAlbumIDsFromBlocks = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  const relationships = value.flatMap((block): unknown[] => {
    if (
      typeof block !== 'object' ||
      block === null ||
      !('blockType' in block) ||
      block.blockType !== 'eventGallery' ||
      !('galleryAlbums' in block) ||
      !Array.isArray(block.galleryAlbums)
    ) {
      return []
    }

    return block.galleryAlbums
  })

  return getEventGalleryAlbumRelationshipIDs(relationships)
}

const parseOptionalTimestamp = (value: string | undefined): number | null => {
  if (!value) {
    return null
  }

  const timestamp = Date.parse(value)

  return Number.isNaN(timestamp) ? null : timestamp
}

export const selectAndOrderEventGalleryAlbums = ({
  albums,
  displayOrder,
  selectedAlbumIDs,
}: {
  albums: EventGalleryAlbum[]
  displayOrder: EventGalleryDisplayOrder
  selectedAlbumIDs: string[]
}): EventGalleryAlbum[] => {
  const albumByID = new Map(albums.map((album) => [album.id, album]))
  const selectedAlbums = getEventGalleryAlbumRelationshipIDs(selectedAlbumIDs).flatMap(
    (id, selectionIndex) => {
      const album = albumByID.get(id)

      return album ? [{ album, selectionIndex }] : []
    },
  )

  if (displayOrder === 'manual') {
    return selectedAlbums.map(({ album }) => album)
  }

  return selectedAlbums
    .sort((first, second) => {
      const firstEventDate = parseOptionalTimestamp(first.album.eventDate)
      const secondEventDate = parseOptionalTimestamp(second.album.eventDate)

      if (firstEventDate !== null && secondEventDate === null) {
        return -1
      }

      if (firstEventDate === null && secondEventDate !== null) {
        return 1
      }

      if (
        firstEventDate !== null &&
        secondEventDate !== null &&
        firstEventDate !== secondEventDate
      ) {
        return secondEventDate - firstEventDate
      }

      const createdAtDifference =
        (parseOptionalTimestamp(second.album.createdAt) ?? 0) -
        (parseOptionalTimestamp(first.album.createdAt) ?? 0)

      return createdAtDifference || first.selectionIndex - second.selectionIndex
    })
    .map(({ album }) => album)
}

const getTimestamp = (value: string): number => {
  const timestamp = Date.parse(value)

  return Number.isNaN(timestamp) ? 0 : timestamp
}

export const normalizeEventGalleryAlbums = (value: unknown): EventGalleryAlbum[] => {
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
