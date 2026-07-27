import {
  EventGalleryBlockPresentation,
  type EventGalleryBlockLike,
} from '@/blocks/EventGallery/Presentation'
import { getPublishedEventGalleryAlbums } from '@/lib/eventGallery'

export async function EventGalleryBlockComponent(props: EventGalleryBlockLike) {
  const albums = await getPublishedEventGalleryAlbums()

  return <EventGalleryBlockPresentation {...props} albums={albums} />
}
