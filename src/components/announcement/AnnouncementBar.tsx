import { Megaphone } from 'lucide-react'

import { RotatingAnnouncementContent } from '@/components/announcement/RotatingAnnouncementContent'

export type AnnouncementItemInput = {
  description?: string | null
  title?: string | null
  url?: string | null
}

type AnnouncementBarProps = {
  intervalMs?: number | null
  items?: AnnouncementItemInput[] | null
  sticky?: boolean
  topOffset?: string
}

const normalizeAnnouncementItems = (items?: AnnouncementItemInput[] | null) =>
  (items ?? []).flatMap((item) => {
    const description = item.description?.trim()
    const title = item.title?.trim()
    const url = item.url?.trim()

    return description
      ? [
          {
            description,
            title,
            url: url || undefined,
          },
        ]
      : []
  })

export function AnnouncementBar({
  intervalMs,
  items,
  sticky = false,
  topOffset = '0px',
}: AnnouncementBarProps) {
  const normalizedItems = normalizeAnnouncementItems(items)

  if (normalizedItems.length === 0) {
    return null
  }

  const style = sticky
    ? ({
        position: 'sticky',
        top: topOffset,
        zIndex: 1000,
      } as const)
    : undefined

  return (
    <section
      aria-label="Announcement"
      className="border-b border-primary/20 bg-primary text-primary-foreground"
      style={style}
    >
      <div className="mx-auto flex min-h-10 w-full max-w-screen-2xl items-center gap-2 px-4 py-2 text-sm">
        <Megaphone
          aria-hidden="true"
          className="size-4 shrink-0 text-primary-foreground/80 md:hidden"
        />
        <span className="hidden shrink-0 font-mono font-bold uppercase tracking-wider md:inline">
          Announcement
        </span>
        <span
          aria-hidden="true"
          className="hidden shrink-0 text-primary-foreground/70 md:inline"
        >
          |
        </span>
        <RotatingAnnouncementContent intervalMs={intervalMs} items={normalizedItems} />
      </div>
    </section>
  )
}
