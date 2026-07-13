import {
  AnnouncementBar,
  type AnnouncementDisplayMode,
  type AnnouncementItemInput,
} from '@/components/announcement/AnnouncementBar'

type AnnouncementBlockLike = {
  displayMode?: AnnouncementDisplayMode | null
  intervalMs?: number | null
  items?: AnnouncementItemInput[] | null
  label?: string | null
  marqueeDurationMs?: number | null
}

export function AnnouncementBlockComponent(props: AnnouncementBlockLike) {
  return (
    <AnnouncementBar
      displayMode={props.displayMode}
      intervalMs={props.intervalMs}
      items={props.items}
      label={props.label}
      marqueeDurationMs={props.marqueeDurationMs}
    />
  )
}
