import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  EventGallery,
  type EventGalleryAlignment,
  type EventGalleryCardTextLayout,
  type EventGallerySize,
} from '@/components/event-gallery'
import type {
  EventGalleryAlbum,
  EventGalleryDisplayOrder,
} from '@/lib/eventGalleryShared'
import { ContentActions } from '@/components/ContentActions'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'

export type EventGalleryBlockLike = {
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  cardTextLayout?: EventGalleryCardTextLayout | null
  contentAlignment?: EventGalleryAlignment | null
  description?: string | null
  displayOrder?: EventGalleryDisplayOrder | null
  eyebrow?: string | null
  galleryAlbums?: unknown
  size?: EventGallerySize | null
  title?: string | null
}

export function EventGalleryBlockPresentation({
  actions,
  albums,
  appearance,
  cardTextLayout,
  contentAlignment = 'center',
  description,
  eyebrow,
  size = 'default',
  title,
}: EventGalleryBlockLike & { albums: EventGalleryAlbum[] }) {
  const resolvedTitle = title?.trim()

  if (!resolvedTitle || !albums.length) {
    return null
  }

  const resolvedActions = resolveCmsActions(actions)

  return (
    <EventGallery
      actions={resolvedActions.length > 0 ? <ContentActions actions={resolvedActions} /> : undefined}
      albums={albums}
      alignment={contentAlignment ?? 'center'}
      appearance={appearance}
      cardTextLayout={cardTextLayout ?? 'center'}
      description={description?.trim() || undefined}
      eyebrow={eyebrow?.trim() || undefined}
      size={size ?? 'default'}
      title={resolvedTitle}
    />
  )
}
