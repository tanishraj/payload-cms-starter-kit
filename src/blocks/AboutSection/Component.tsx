import Image from 'next/image'
import * as LucideIcons from 'lucide-react'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
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
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  body?: string | null
  contentAlignment?: 'left' | 'center' | null
  eyebrow?: string | null
  title?: string | null
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

function ValuesGrid({ values, centered }: { values: ValueItem[]; centered?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {values.map((v, i) => (
        <div key={i} className={cn('flex flex-col gap-3', centered && 'items-center text-center')}>
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
  actions,
  appearance,
  body,
  contentAlignment = 'center',
  eyebrow,
  title,
  image,
  imagePosition = 'right',
  size = 'default',
  stats,
  values,
  variant = 'split',
}: AboutSectionBlockLike) {
  const resolvedBody = body?.trim()
  const resolvedTitle = title?.trim()
  if (!resolvedTitle && !resolvedBody) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const imageProps = getMediaImageProps({ media: image, preset: 'generic' })
  const resolvedStats = (stats ?? []).filter((s) => s.value?.trim() && s.label?.trim())
  const resolvedValues = (values ?? []).filter((v) => v.title?.trim())
  const resolvedActions = resolveCmsActions(actions)
  const isCenter = (contentAlignment ?? 'center') === 'center'

  const textContent = (
    <div className={cn('flex flex-col gap-5', isCenter && variant !== 'split' && 'items-center text-center')}>
      {eyebrow?.trim() ? (
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
          {eyebrow.trim()}
        </p>
      ) : null}
      {resolvedTitle ? (
        <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
          {resolvedTitle}
        </h2>
      ) : null}
      {resolvedBody ? <BodyText text={resolvedBody} /> : null}
      {resolvedActions.length > 0 ? (
        <div className="mt-2">
          <ContentActions actions={resolvedActions} />
        </div>
      ) : null}
      {resolvedStats.length > 0 ? <StatsRow stats={resolvedStats} /> : null}
      {resolvedValues.length > 0 ? (
        <div className={cn(resolvedStats.length > 0 && 'mt-4 border-t border-border pt-8')}>
          <ValuesGrid values={resolvedValues} centered={isCenter && variant !== 'split'} />
        </div>
      ) : null}
    </div>
  )

  const imageContent = imageProps ? (
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl">
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
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
                  {eyebrow.trim()}
                </p>
              ) : null}
              {resolvedTitle ? (
                <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
                  {resolvedTitle}
                </h2>
              ) : null}
              {resolvedBody ? <BodyText text={resolvedBody} /> : null}
              {resolvedActions.length > 0 ? (
                <div className="mt-2">
                  <ContentActions actions={resolvedActions} />
                </div>
              ) : null}
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
