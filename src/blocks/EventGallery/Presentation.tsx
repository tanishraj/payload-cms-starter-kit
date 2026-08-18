import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import type {
  MediaOverlayCoverage,
  MediaOverlayDirection,
  MediaOverlayStrength,
  MediaOverlayTone,
} from '@/blocks/shared/mediaOverlayPresentation'
import {
  EventGallery,
  type EventGalleryAlignment,
  type EventGalleryCardTextLayout,
  type EventGallerySize,
} from '@/components/event-gallery'
import type { EventGalleryAlbum, EventGalleryDisplayOrder } from '@/lib/eventGalleryShared'
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
  footerActions?: CmsActionValue[] | null
  galleryAlbums?: unknown
  overlayCoverage?: MediaOverlayCoverage | null
  overlayDirection?: MediaOverlayDirection | null
  overlayStyle?: MediaOverlayStrength | null
  showCardOverlay?: boolean | null
  showEventDate?: boolean | null
  showImageCount?: boolean | null
  size?: EventGallerySize | null
  themeMode?: MediaOverlayTone | null
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
  footerActions,
  overlayCoverage,
  overlayDirection,
  overlayStyle,
  showCardOverlay,
  showEventDate,
  showImageCount,
  size = 'default',
  themeMode,
  title,
}: EventGalleryBlockLike & { albums: EventGalleryAlbum[] }) {
  const resolvedTitle = title?.trim()

  if (!resolvedTitle || !albums.length) {
    return null
  }

  const resolvedActions = resolveCmsActions(actions)

  return (
    <>
      <EventGallery
        actions={
          resolvedActions.length > 0 ? <ContentActions actions={resolvedActions} /> : undefined
        }
        albums={albums}
        alignment={contentAlignment ?? 'center'}
        appearance={appearance}
        cardTextLayout={cardTextLayout ?? 'split'}
        description={description?.trim() || undefined}
        eyebrow={eyebrow?.trim() || undefined}
        overlayCoverage={overlayCoverage ?? 'full'}
        overlayDirection={overlayDirection ?? 'bottomToTop'}
        overlayStyle={overlayStyle ?? 'darker'}
        showCardOverlay={showCardOverlay ?? true}
        showEventDate={showEventDate ?? true}
        showImageCount={showImageCount ?? true}
        size={size ?? 'default'}
        themeMode={themeMode ?? 'dark'}
        title={resolvedTitle}
      />
      <BlockFooterActions actions={footerActions} />
    </>
  )
}
