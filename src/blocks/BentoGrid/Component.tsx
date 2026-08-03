import Image from 'next/image'
import { Star, type LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockMobilePaddingClasses,
  regularBlockContainerClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'


type BentoItem = {
  accentColor?: 'none' | 'primary' | 'secondary' | 'accent' | null
  description?: string | null
  eyebrow?: string | null
  icon?: string | null
  id?: string | null
  image?: string | number | Media | null
  linkUrl?: string | null
  size?: 'full' | 'large' | 'medium' | 'small' | null
  title?: string | null
}

type BentoGridBlockLike = {
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  eyebrow?: string | null
  items?: BentoItem[] | null
  size?: RegularBlockSize | null
  title?: string | null
}

const accentBgClasses = {
  none: 'bg-card',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
} as const

const accentTextClasses = {
  none: 'text-foreground',
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  accent: 'text-accent-foreground',
} as const

const accentMutedClasses = {
  none: 'text-muted-foreground',
  primary: 'text-primary-foreground/80',
  secondary: 'text-secondary-foreground/80',
  accent: 'text-accent-foreground/80',
} as const

const accentIconClasses = {
  none: 'bg-primary/10 text-primary',
  primary: 'bg-white/20 text-primary-foreground',
  secondary: 'bg-secondary-foreground/10 text-secondary-foreground',
  accent: 'bg-accent-foreground/10 text-accent-foreground',
} as const

const cellColSpan = {
  full: 'col-span-1 md:col-span-3',
  large: 'col-span-1 md:col-span-2',
  medium: 'col-span-1',
  small: 'col-span-1',
} as const

function BentoCell({ item }: { item: BentoItem }) {
  const image = getMediaImageProps({ media: item.image, preset: 'generic' })
  const Icon = item.icon ? (((LucideIcons as Record<string, unknown>)[item.icon] as LucideIcon | undefined) ?? Star) : null
  const accent = (item.accentColor ?? 'none') as keyof typeof accentBgClasses
  const isFull = item.size === 'full'
  const isLarge = item.size === 'large'

  const Inner = (
    <div
      className={cn(
        'group relative flex h-full min-h-45 flex-col justify-end overflow-hidden rounded-2xl border border-border p-6 transition-all',
        accentBgClasses[accent],
        image ? 'min-h-60' : '',
        isLarge ? 'min-h-70' : '',
        item.linkUrl && 'cursor-pointer hover:shadow-lg hover:scale-[1.01]',
      )}
    >
      {/* Background image */}
      {image ? (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </>
      ) : null}

      {/* Icon (no image) */}
      {Icon && !image ? (
        <div
          className={cn(
            'absolute top-5 left-5 flex size-10 items-center justify-center rounded-lg',
            accentIconClasses[accent],
          )}
        >
          <Icon className="size-5" />
        </div>
      ) : null}

      {/* Content */}
      <div className={cn('relative flex flex-col gap-1.5', !image && Icon ? 'mt-14' : '')}>
        {item.eyebrow?.trim() ? (
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-widest',
              image ? 'text-white/70' : accentMutedClasses[accent],
            )}
          >
            {item.eyebrow.trim()}
          </p>
        ) : null}
        {item.title?.trim() ? (
          <h3
            className={cn(
              'font-sans font-semibold leading-snug',
              isFull || isLarge ? 'text-xl md:text-2xl' : 'text-base',
              image ? 'text-white' : accentTextClasses[accent],
            )}
          >
            {item.title.trim()}
          </h3>
        ) : null}
        {item.description?.trim() ? (
          <p
            className={cn(
              'text-sm leading-relaxed',
              image ? 'text-white/80' : accentMutedClasses[accent],
            )}
          >
            {item.description.trim()}
          </p>
        ) : null}
      </div>
    </div>
  )

  if (item.linkUrl?.trim()) {
    return (
      <a
        href={item.linkUrl.trim()}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
      >
        {Inner}
      </a>
    )
  }

  return <div className="h-full">{Inner}</div>
}

export function BentoGridBlockComponent({
  actions,
  appearance,
  contentAlignment = 'center',
  description,
  eyebrow,
  items,
  size = 'default',
  title,
}: BentoGridBlockLike) {
  const validItems = (items ?? []).filter((item) => item.title?.trim())
  if (validItems.length === 0) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const isCenter = (contentAlignment ?? 'center') === 'center'
  const resolvedActions = resolveCmsActions(actions)

  return (
    <section className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}>
      <div className={regularBlockContainerClasses}>
        {(eyebrow?.trim() || title?.trim() || description?.trim() || resolvedActions.length > 0) ? (
          <div
            className={cn(
              'mb-12 flex flex-col gap-4',
              isCenter ? 'mx-auto max-w-3xl items-center text-center' : 'items-start',
            )}
          >
            {eyebrow?.trim() ? (
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
                {eyebrow.trim()}
              </p>
            ) : null}
            {title?.trim() ? (
              <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
                {title.trim()}
              </h2>
            ) : null}
            {description?.trim() ? (
              <p className="text-base leading-7 text-current/70">{description.trim()}</p>
            ) : null}
            {resolvedActions.length > 0 ? (
              <div className="mt-2">
                <ContentActions actions={resolvedActions} />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-3">
          {validItems.map((item, index) => (
            <div key={item.id ?? index} className={cellColSpan[item.size ?? 'medium']}>
              <BentoCell item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
