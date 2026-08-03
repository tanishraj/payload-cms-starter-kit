import Image from 'next/image'
import * as LucideIcons from 'lucide-react'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

type ValueItem = {
  icon?: string | null
  title?: string | null
  description?: string | null
}

type StatItem = {
  value?: string | null
  label?: string | null
}

type AboutSectionBlockLike = {
  appearance?: BlockAppearance | null
  body?: string | null
  eyebrow?: string | null
  heading?: string | null
  image?: string | number | Media | null
  imagePosition?: 'left' | 'right' | null
  size?: RegularBlockSize | null
  stats?: StatItem[] | null
  values?: ValueItem[] | null
  variant?: 'split' | 'centered' | 'text' | null
}

function DynamicIcon({ name, className }: { name?: string | null; className?: string }) {
  if (!name) return null
  const IconComponent = (LucideIcons as Record<string, unknown>)[name] as React.ComponentType<{ className?: string }> | undefined
  if (!IconComponent) return null
  return <IconComponent className={className} />
}

function BodyText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
  return (
    <div className="flex flex-col gap-4 text-muted-foreground leading-relaxed">
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  )
}

function StatsRow({ stats }: { stats: StatItem[] }) {
  return (
    <div className="flex flex-wrap gap-6 pt-2">
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col">
          <span className="text-3xl font-bold text-foreground">{s.value?.trim()}</span>
          <span className="text-sm text-muted-foreground">{s.label?.trim()}</span>
        </div>
      ))}
    </div>
  )
}

function ValuesGrid({ values }: { values: ValueItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-col gap-3">
          {v.icon?.trim() ? (
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <DynamicIcon name={v.icon.trim()} className="size-5 text-primary" />
            </div>
          ) : (
            <div className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
          <div>
            {v.title?.trim() ? (
              <h4 className="font-sans font-semibold text-foreground">{v.title.trim()}</h4>
            ) : null}
            {v.description?.trim() ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{v.description.trim()}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

export function AboutSectionBlockComponent({
  appearance,
  body,
  eyebrow,
  heading,
  image,
  imagePosition = 'right',
  size = 'default',
  stats,
  values,
  variant = 'split',
}: AboutSectionBlockLike) {
  const resolvedBody = body?.trim()
  const resolvedHeading = heading?.trim()
  if (!resolvedHeading && !resolvedBody) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const imageProps = getMediaImageProps({ media: image, preset: 'generic' })
  const resolvedStats = (stats ?? []).filter((s) => s.value?.trim() && s.label?.trim())
  const resolvedValues = (values ?? []).filter((v) => v.title?.trim())

  const textContent = (
    <div className="flex flex-col gap-5">
      {eyebrow?.trim() ? (
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {eyebrow.trim()}
        </p>
      ) : null}
      {resolvedHeading ? (
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {resolvedHeading}
        </h2>
      ) : null}
      {resolvedBody ? <BodyText text={resolvedBody} /> : null}
      {resolvedStats.length > 0 ? <StatsRow stats={resolvedStats} /> : null}
      {resolvedValues.length > 0 ? (
        <div className={cn(resolvedStats.length > 0 && 'mt-4 border-t border-border pt-8')}>
          <ValuesGrid values={resolvedValues} />
        </div>
      ) : null}
    </div>
  )

  const imageContent = imageProps ? (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
      <Image
        src={imageProps.src}
        alt={imageProps.alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  ) : null

  return (
    <section className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}>
      <div className={regularBlockContainerClasses}>
        {/* Split variant */}
        {(variant === 'split' || !variant) ? (
          <div className={cn('flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16', imagePosition === 'left' && 'lg:flex-row-reverse')}>
            <div className="flex-1">{textContent}</div>
            {imageContent ? <div className="flex-1">{imageContent}</div> : null}
          </div>
        ) : null}

        {/* Centered variant */}
        {variant === 'centered' ? (
          <div className="mx-auto max-w-3xl flex flex-col gap-8 items-center text-center">
            <div className="flex flex-col gap-5 items-center">
              {eyebrow?.trim() ? (
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  {eyebrow.trim()}
                </p>
              ) : null}
              {resolvedHeading ? (
                <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {resolvedHeading}
                </h2>
              ) : null}
              {resolvedBody ? <BodyText text={resolvedBody} /> : null}
              {resolvedStats.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-8 pt-2">
                  {resolvedStats.map((s, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-3xl font-bold text-foreground">{s.value?.trim()}</span>
                      <span className="text-sm text-muted-foreground">{s.label?.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            {imageContent}
            {resolvedValues.length > 0 ? (
              <div className="w-full text-left">
                <ValuesGrid values={resolvedValues} />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Text-only variant */}
        {variant === 'text' ? (
          <div className="mx-auto max-w-3xl">{textContent}</div>
        ) : null}
      </div>
    </section>
  )
}
