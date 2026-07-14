import { Megaphone } from 'lucide-react'

import { MarqueeAnnouncementContent } from '@/components/announcement/MarqueeAnnouncementContent'
import { RotatingAnnouncementContent } from '@/components/announcement/RotatingAnnouncementContent'

export type AnnouncementItemInput = {
  description?: string | null
  title?: string | null
  url?: string | null
}

export type AnnouncementDisplayMode = 'horizontal' | 'marquee' | 'vertical'

type AnnouncementBarProps = {
  displayMode?: AnnouncementDisplayMode | null
  intervalMs?: number | null
  items?: AnnouncementItemInput[] | null
  label?: string | null
  marqueeDurationMs?: number | null
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
  displayMode = 'vertical',
  intervalMs,
  items,
  label,
  marqueeDurationMs,
  sticky = false,
  topOffset = '0px',
}: AnnouncementBarProps) {
  const normalizedItems = normalizeAnnouncementItems(items)
  const resolvedDisplayMode = displayMode ?? 'vertical'
  const resolvedLabel = label?.trim() || 'Announcement'

  if (normalizedItems.length === 0) {
    return null
  }

  const style = sticky
    ? ({
        position: 'sticky',
        top: topOffset,
        zIndex: 40,
      } as const)
    : undefined

  return (
    <section
      aria-label="Announcement"
      className="border-b border-border bg-accent text-accent-foreground"
      style={style}
    >
      <div className="mx-auto flex min-h-10 w-full max-w-screen-2xl items-center gap-2 px-4 py-2 text-sm">
        <Megaphone
          aria-hidden="true"
          className="size-4 shrink-0 text-accent-foreground/80 md:hidden"
        />
        <span className="hidden shrink-0 font-mono font-bold uppercase tracking-wider md:inline">
          {resolvedLabel}
        </span>
        <span aria-hidden="true" className="hidden shrink-0 text-accent-foreground/70 md:inline">
          |
        </span>
        {resolvedDisplayMode === 'marquee' ? (
          <MarqueeAnnouncementContent durationMs={marqueeDurationMs} items={normalizedItems} />
        ) : (
          <RotatingAnnouncementContent
            intervalMs={intervalMs}
            items={normalizedItems}
            mode={resolvedDisplayMode}
          />
        )}
      </div>
    </section>
  )
}
