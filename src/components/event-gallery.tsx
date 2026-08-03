import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import { EventGalleryClient } from '@/components/event-gallery-client'
import type { EventGalleryAlbum } from '@/lib/eventGalleryShared'
import { cn } from '@/lib/utils'

export type EventGalleryAlignment = 'center' | 'left' | 'right'
export type EventGalleryCardTextLayout = 'center' | 'split'
export type EventGallerySize = 'none' | 'comfortable' | 'compact' | 'default'

type EventGalleryProps = {
  actions?: React.ReactNode
  albums: EventGalleryAlbum[]
  alignment?: EventGalleryAlignment
  appearance?: BlockAppearance | null
  cardTextLayout?: EventGalleryCardTextLayout
  className?: string
  description?: string | null
  eyebrow?: string | null
  size?: EventGallerySize
  title?: string | null
}

const alignmentClasses = {
  center: 'mx-auto items-center text-center',
  left: 'items-start text-left',
  right: 'ml-auto items-end text-right',
} as const

const gridMarginClasses = {
  comfortable: 'mt-12',
  none: 'mt-10',
  compact: 'mt-8',
  default: 'mt-10',
} as const

export function EventGallery({
  actions,
  albums,
  alignment = 'left',
  appearance,
  cardTextLayout = 'center',
  className,
  description,
  eyebrow,
  size = 'default',
  title,
}: EventGalleryProps) {
  if (!albums.length) {
    return null
  }

  const appearanceClasses = resolveBlockAppearanceClasses(appearance)

  return (
    <section
      className={cn(
        regularBlockMobilePaddingClasses[size],
        appearanceClasses.className,
        className,
      )}
      data-event-gallery="true"
      data-event-gallery-alignment={alignment}
      data-event-gallery-background={appearance?.background ?? 'none'}
      data-event-gallery-size={size}
    >
      <div className={regularBlockContainerClasses}>
        <div className={cn('flex max-w-3xl flex-col gap-4', alignmentClasses[alignment])}>
          {eyebrow ? (
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="text-base leading-7 text-balance text-current/70">{description}</p>
          ) : null}
          {actions ? <div className="mt-2">{actions}</div> : null}
        </div>

        <div className={gridMarginClasses[size]}>
          <EventGalleryClient albums={albums} cardTextLayout={cardTextLayout} />
        </div>
      </div>
    </section>
  )
}
