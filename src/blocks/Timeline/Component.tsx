import Image from 'next/image'
import { CheckCircle2, Circle, Clock } from 'lucide-react'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { getMediaImageProps } from '@/lib/media'
import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'

type TimelineItem = {
  badge?: 'none' | 'done' | 'active' | 'upcoming' | null
  date?: string | null
  description?: string | null
  image?: string | number | Media | null
  title?: string | null
}

type TimelineBlockLike = {
  appearance?: BlockAppearance | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  eyebrow?: string | null
  items?: TimelineItem[] | null
  size?: RegularBlockSize | null
  title?: string | null
  variant?: 'horizontal' | 'vertical' | 'alternating' | null
}

// ── Status styles for Horizontal Steps ──────────────────────────────────────
const stepCircleClasses = {
  none: 'border-2 border-border bg-background text-muted-foreground',
  upcoming: 'border-2 border-border bg-background text-muted-foreground',
  active: 'border-2 border-primary bg-primary text-primary-foreground',
  done: 'border-2 border-green-500 bg-green-500 text-white',
} as const

const stepConnectorClasses = {
  none: 'border-border',
  upcoming: 'border-border',
  active: 'border-primary',
  done: 'border-green-500',
} as const

function StatusIcon({ badge, index }: { badge: string; index: number }) {
  if (badge === 'done') return <CheckCircle2 className="size-4" />
  if (badge === 'active') return <span className="text-sm font-bold">{index + 1}</span>
  return <span className="text-sm font-semibold">{index + 1}</span>
}

// ── Section header shared across variants ────────────────────────────────────
function SectionHeader({
  eyebrow,
  title,
  description,
  alignment,
}: {
  eyebrow?: string
  title: string
  description?: string
  alignment: 'left' | 'center'
}) {
  return (
    <div
      className={cn(
        'mb-12 flex flex-col gap-3',
        alignment === 'center' ? 'mx-auto max-w-3xl items-center text-center' : 'items-start',
      )}
    >
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">{title}</h2>
      {description ? <p className="text-lg text-muted-foreground">{description}</p> : null}
    </div>
  )
}

// ── HORIZONTAL STEPS ─────────────────────────────────────────────────────────
function HorizontalTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max items-start gap-0">
        {items.map((item, index) => {
          const badge = item.badge ?? 'none'
          const isLast = index === items.length - 1

          return (
            <div key={index} className="flex items-start">
              <div className="flex w-36 flex-col items-center gap-3 sm:w-44">
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full',
                    stepCircleClasses[badge],
                    badge === 'active' && 'ring-4 ring-primary/20',
                  )}
                >
                  <StatusIcon badge={badge} index={index} />
                </div>
                <div className="flex flex-col items-center gap-1 px-2 text-center">
                  {item.date?.trim() ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3 shrink-0" />
                      {item.date.trim()}
                    </span>
                  ) : null}
                  <p className="text-sm font-semibold leading-snug text-foreground">
                    {item.title?.trim()}
                  </p>
                  {item.description?.trim() ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.description.trim()}
                    </p>
                  ) : null}
                </div>
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    'mt-5 w-8 shrink-0 border-t-2 sm:w-12',
                    stepConnectorClasses[badge],
                  )}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── VERTICAL ──────────────────────────────────────────────────────────────────
function VerticalTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative flex flex-col gap-0">
      {items.map((item, index) => {
        const badge = item.badge ?? 'none'
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex gap-5">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full',
                  stepCircleClasses[badge],
                  badge === 'active' && 'ring-4 ring-primary/20',
                )}
              >
                {badge === 'done' ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Circle className="size-3 fill-current" />
                )}
              </div>
              {!isLast ? <div className="w-0.5 flex-1 bg-border" /> : null}
            </div>
            <div className={cn('flex flex-col gap-1 pb-10', isLast && 'pb-0')}>
              {item.date?.trim() ? (
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.date.trim()}
                </span>
              ) : null}
              <h3 className="text-lg font-semibold leading-snug text-foreground">
                {item.title?.trim()}
              </h3>
              {item.description?.trim() ? (
                <p className="text-base leading-relaxed text-muted-foreground">
                  {item.description.trim()}
                </p>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── ALTERNATING ───────────────────────────────────────────────────────────────
function AlternatingTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="flex flex-col gap-16">
      {items.map((item, index) => {
        const isEven = index % 2 === 0
        const image = getMediaImageProps({ media: item.image, preset: 'generic' })

        return (
          <div
            key={index}
            className={cn(
              'flex flex-col gap-8 md:flex-row md:items-center md:gap-12',
              !isEven && 'md:flex-row-reverse',
            )}
          >
            {/* Media or styled fallback */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl md:flex-1">
              {image ? (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">
                  <span className="font-serif text-8xl font-bold text-border">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 md:flex-1">
              {item.date?.trim() ? (
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                  {item.date.trim()}
                </span>
              ) : (
                <span className="font-serif text-5xl font-bold leading-none text-border/60">
                  {String(index + 1).padStart(2, '0')}
                </span>
              )}
              <h3 className="text-2xl font-semibold leading-snug tracking-tight text-foreground md:text-3xl">
                {item.title?.trim()}
              </h3>
              {item.description?.trim() ? (
                <p className="text-base leading-relaxed text-muted-foreground">
                  {item.description.trim()}
                </p>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function TimelineBlockComponent({
  appearance,
  contentAlignment = 'center',
  description,
  eyebrow,
  items,
  size = 'default',
  title,
  variant = 'vertical',
}: TimelineBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const validItems = (items ?? []).filter((item) => item.title?.trim())
  if (validItems.length === 0) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const alignment = contentAlignment ?? 'center'

  return (
    <section className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}>
      <div className="mx-auto w-full max-w-screen-2xl px-4">
        <SectionHeader
          alignment={alignment}
          description={description?.trim() || undefined}
          eyebrow={eyebrow?.trim() || undefined}
          title={resolvedTitle}
        />

        {variant === 'horizontal' ? (
          <div className={cn(alignment === 'center' && 'flex justify-center')}>
            <HorizontalTimeline items={validItems} />
          </div>
        ) : variant === 'alternating' ? (
          <AlternatingTimeline items={validItems} />
        ) : (
          <div className="mx-auto max-w-2xl">
            <VerticalTimeline items={validItems} />
          </div>
        )}
      </div>
    </section>
  )
}
