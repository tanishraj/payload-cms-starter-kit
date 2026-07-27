import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  EventGallery,
  type EventGalleryAlignment,
  type EventGallerySize,
} from '@/components/event-gallery'
import type {
  EventGalleryAlbum,
  EventGalleryDisplayOrder,
} from '@/lib/eventGalleryShared'

export type EventGalleryBlockLike = {
  appearance?: BlockAppearance | null
  contentAlignment?: EventGalleryAlignment | null
  description?: string | null
  displayOrder?: EventGalleryDisplayOrder | null
  eyebrow?: string | null
  galleryAlbums?: unknown
  size?: EventGallerySize | null
  title?: string | null
}

export function EventGalleryBlockPresentation({
  albums,
  appearance,
  contentAlignment = 'left',
  description,
  eyebrow,
  size = 'default',
  title,
}: EventGalleryBlockLike & { albums: EventGalleryAlbum[] }) {
  const resolvedTitle = title?.trim()

  if (!resolvedTitle || !albums.length) {
    return null
  }

  return (
    <EventGallery
      albums={albums}
      alignment={contentAlignment ?? 'left'}
      appearance={appearance}
      description={description?.trim() || undefined}
      eyebrow={eyebrow?.trim() || undefined}
      size={size ?? 'default'}
      title={resolvedTitle}
    />
  )
}
