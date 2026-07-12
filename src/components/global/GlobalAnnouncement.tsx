import type { AnnouncementItemInput } from '@/components/announcement/AnnouncementBar'
import { AnnouncementBar } from '@/components/announcement/AnnouncementBar'

type GlobalAnnouncementProps = {
  intervalMs?: number | null
  items?: AnnouncementItemInput[] | null
  stickyTopOffset?: string
}

export function GlobalAnnouncement({
  intervalMs,
  items,
  stickyTopOffset = '0px',
}: GlobalAnnouncementProps) {
  return (
    <AnnouncementBar
      intervalMs={intervalMs}
      items={items}
      sticky
      topOffset={stickyTopOffset}
    />
  )
}
