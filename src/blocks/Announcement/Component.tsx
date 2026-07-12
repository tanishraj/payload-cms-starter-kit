import { AnnouncementBar, type AnnouncementItemInput } from '@/components/announcement/AnnouncementBar'

type AnnouncementBlockLike = {
  intervalMs?: number | null
  items?: AnnouncementItemInput[] | null
}

export function AnnouncementBlockComponent(props: AnnouncementBlockLike) {
  return (
    <AnnouncementBar
      intervalMs={props.intervalMs}
      items={props.items}
    />
  )
}
