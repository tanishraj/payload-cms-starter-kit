import type {
  AnnouncementDisplayMode,
  AnnouncementItemInput,
} from '@/components/announcement/AnnouncementBar'
import { AnnouncementBar } from '@/components/announcement/AnnouncementBar'

type GlobalAnnouncementProps = {
  displayMode?: AnnouncementDisplayMode | null
  intervalMs?: number | null
  items?: AnnouncementItemInput[] | null
  label?: string | null
  marqueeDurationMs?: number | null
  stickyTopOffset?: string
}

export function GlobalAnnouncement({
  displayMode,
  intervalMs,
  items,
  label,
  marqueeDurationMs,
  stickyTopOffset = '0px',
}: GlobalAnnouncementProps) {
  return (
    <AnnouncementBar
      displayMode={displayMode}
      intervalMs={intervalMs}
      items={items}
      label={label}
      marqueeDurationMs={marqueeDurationMs}
      sticky
      topOffset={stickyTopOffset}
    />
  )
}
