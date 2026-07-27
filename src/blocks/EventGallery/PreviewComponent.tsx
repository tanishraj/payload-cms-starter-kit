import {
  EventGalleryBlockPresentation,
  type EventGalleryBlockLike,
} from '@/blocks/EventGallery/Presentation'
import type { EventGalleryAlbum } from '@/lib/eventGalleryShared'

export function EventGalleryPreviewBlockComponent({
  albums,
  ...props
}: EventGalleryBlockLike & { albums: EventGalleryAlbum[] }) {
  return <EventGalleryBlockPresentation {...props} albums={albums} />
}
