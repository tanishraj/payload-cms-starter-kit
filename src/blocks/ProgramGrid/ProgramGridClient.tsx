'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArrowRight, Clock, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import { cn } from '@/lib/utils'
import type { CmsActionVariant } from '@/lib/cmsLinks'
import {
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { resolveCardSurface, type CardSurfaceClasses } from '@/blocks/shared/cardSurface'
import type { BlockBackground } from '@/blocks/shared/blockAppearance'

export type ResolvedProgram = {
  id: string | number
  badge?: string
  cardBackground?: string
  category?: string
  ctaHref?: string
  ctaOpenInNewTab?: boolean
  description?: string
  duration?: string
  imageSrc?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  intake?: string
  title?: string | null
}

type ProgramGridClientProps = {
  actionMode: 'button' | 'link'
  accentTitle?: string | null
  actionVariant: CmsActionVariant
  appearance?: string
  columns: 2 | 3 | 4
  contentAlignment: 'left' | 'center'
  ctaLabel: string
  description?: string
  eyebrow?: string
  programs: ResolvedProgram[]
  sectionActions?: React.ReactNode
  sectionBackground: BlockBackground
  showFilter: boolean
  size: RegularBlockSize
  title?: string | null
  viewMode: 'grid' | 'list'
}

const gridColsClasses: Record<2 | 3 | 4, string> = {
  2: 'grid gap-5 sm:grid-cols-2',
  3: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-4',
}

type CardActionProps = {
  ctaHref: string
  ctaLabel: string
  actionMode: 'button' | 'link'
  actionVariant: CmsActionVariant
  openInNewTab?: boolean
  surface: CardSurfaceClasses
}

function CardAction({
  ctaHref,
  ctaLabel,
  actionMode,
  actionVariant,
  openInNewTab,
  surface,
}: CardActionProps) {
  if (actionMode === 'button') {
    return (
      <Button
        asChild
        size="sm"
        variant={actionVariant}
        className={cn('mt-3 self-start', surface.button[actionVariant])}
      >
        <a
          href={ctaHref}
          target={openInNewTab ? '_blank' : undefined}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
        >
          {ctaLabel}
        </a>
      </Button>
    )
  }
  return (
    <div className={cn('mt-3 flex items-center gap-1 text-sm font-medium', surface.link)}>
      {ctaLabel}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </div>
  )
}

function GridCard({
  program,
  ctaLabel,
  actionMode,
  actionVariant,
  sectionBackground,
}: {
  program: ResolvedProgram
  ctaLabel: string
  actionMode: 'button' | 'link'
  actionVariant: CmsActionVariant
  sectionBackground: BlockBackground
}) {
  const surface = resolveCardSurface(program.cardBackground, sectionBackground)
  const inner = (
    <div
      data-card-background={surface.value}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-200',
        surface.className,
        surface.divider,
        program.ctaHref && 'hover:shadow-md hover:border-primary/30',
      )}
    >
      {program.imageSrc ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={program.imageSrc}
            alt={program.imageAlt ?? program.title ?? ''}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {program.badge ? (
            <div className="absolute left-3 top-3">
              <Badge variant="secondary" className="text-xs font-medium">
                {program.badge}
              </Badge>
            </div>
          ) : null}
        </div>
      ) : program.badge ? (
        <div className="px-5 pt-5">
          <Badge variant="secondary" className="text-xs font-medium">
            {program.badge}
          </Badge>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {program.category ? (
          <p
            className={cn(
              'font-mono text-xs font-semibold uppercase tracking-[0.24em]',
              surface.icon,
            )}
          >
            {program.category}
          </p>
        ) : null}
        <h3 className="text-lg font-semibold leading-snug text-current">{program.title}</h3>
        {program.description ? (
          <p className={cn('line-clamp-2 text-sm leading-relaxed', surface.secondary)}>
            {program.description}
          </p>
        ) : null}

        {program.duration || program.intake ? (
          <div
            className={cn('mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs', surface.secondary)}
          >
            {program.duration ? (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5 shrink-0" />
                {program.duration}
              </span>
            ) : null}
            {program.intake ? (
              <span className="flex items-center gap-1">
                <Users className="size-3.5 shrink-0" />
                {program.intake}
              </span>
            ) : null}
          </div>
        ) : null}

        {program.ctaHref ? (
          <CardAction
            ctaHref={program.ctaHref}
            ctaLabel={ctaLabel}
            actionMode={actionMode}
            actionVariant={actionVariant}
            openInNewTab={program.ctaOpenInNewTab}
            surface={surface}
          />
        ) : null}
      </div>
    </div>
  )

  if (program.ctaHref && actionMode === 'link') {
    return (
      <a
        href={program.ctaHref}
        target={program.ctaOpenInNewTab ? '_blank' : undefined}
        rel={program.ctaOpenInNewTab ? 'noopener noreferrer' : undefined}
        className="block h-full"
      >
        {inner}
      </a>
    )
  }

  return <div className="h-full">{inner}</div>
}

function ListCard({
  program,
  ctaLabel,
  actionMode,
  actionVariant,
  sectionBackground,
}: {
  program: ResolvedProgram
  ctaLabel: string
  actionMode: 'button' | 'link'
  actionVariant: CmsActionVariant
  sectionBackground: BlockBackground
}) {
  const surface = resolveCardSurface(program.cardBackground, sectionBackground)
  const inner = (
    <div
      data-card-background={surface.value}
      className={cn(
        'group flex flex-col gap-4 overflow-hidden rounded-xl border p-5 transition-all duration-200 sm:flex-row',
        surface.className,
        surface.divider,
        program.ctaHref && 'hover:shadow-md hover:border-primary/30',
      )}
    >
      {program.imageSrc ? (
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg sm:aspect-square sm:w-32">
          <Image
            src={program.imageSrc}
            alt={program.imageAlt ?? program.title ?? ''}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 128px"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {program.category ? (
            <p
              className={cn(
                'font-mono text-xs font-semibold uppercase tracking-[0.24em]',
                surface.icon,
              )}
            >
              {program.category}
            </p>
          ) : null}
          {program.badge ? (
            <Badge variant="secondary" className="text-xs">
              {program.badge}
            </Badge>
          ) : null}
        </div>
        <h3 className="text-base font-semibold leading-snug text-current">{program.title}</h3>
        {program.description ? (
          <p className={cn('line-clamp-2 text-sm leading-relaxed', surface.secondary)}>
            {program.description}
          </p>
        ) : null}
        <div
          className={cn(
            'mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs',
            surface.secondary,
          )}
        >
          {program.duration ? (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 shrink-0" />
              {program.duration}
            </span>
          ) : null}
          {program.intake ? (
            <span className="flex items-center gap-1">
              <Users className="size-3.5 shrink-0" />
              {program.intake}
            </span>
          ) : null}
          {program.ctaHref && actionMode === 'link' ? (
            <span className={cn('ml-auto flex items-center gap-1 font-medium', surface.link)}>
              {ctaLabel}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          ) : null}
        </div>
        {program.ctaHref && actionMode === 'button' ? (
          <CardAction
            ctaHref={program.ctaHref}
            ctaLabel={ctaLabel}
            actionMode={actionMode}
            actionVariant={actionVariant}
            openInNewTab={program.ctaOpenInNewTab}
            surface={surface}
          />
        ) : null}
      </div>
    </div>
  )

  if (program.ctaHref && actionMode === 'link') {
    return (
      <a
        href={program.ctaHref}
        target={program.ctaOpenInNewTab ? '_blank' : undefined}
        rel={program.ctaOpenInNewTab ? 'noopener noreferrer' : undefined}
        className="block"
      >
        {inner}
      </a>
    )
  }

  return <div>{inner}</div>
}

export function ProgramGridClient({
  accentTitle,
  actionMode,
  actionVariant,
  appearance,
  columns,
  contentAlignment,
  ctaLabel,
  description,
  eyebrow,
  programs,
  sectionActions,
  sectionBackground,
  showFilter,
  size,
  title,
  viewMode,
}: ProgramGridClientProps) {
  const resolvedAccentTitle = accentTitle?.trim() || undefined
  const categories = showFilter
    ? ['All', ...Array.from(new Set(programs.map((p) => p.category).filter(Boolean) as string[]))]
    : []

  const [activeCategory, setActiveCategory] = useState('All')

  const visible =
    showFilter && activeCategory !== 'All'
      ? programs.filter((p) => p.category === activeCategory)
      : programs

  return (
    <section className={cn(regularBlockMobilePaddingClasses[size], appearance)}>
      <div className="mx-auto w-full max-w-screen-2xl px-4">
        <div
          className={cn(
            'mb-10 flex flex-col gap-4',
            contentAlignment === 'center'
              ? 'mx-auto max-w-3xl items-center text-center'
              : 'items-start text-left',
          )}
        >
          {eyebrow ? (
            <SectionEyebrow surface={sectionBackground}>{eyebrow}</SectionEyebrow>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
            {resolvedAccentTitle ? (
              <>
                <span className="block font-[inherit]">{title}</span>
                <em className="block font-[inherit]">{resolvedAccentTitle}</em>
              </>
            ) : (
              title
            )}
          </h2>
          {description ? (
            <p className="text-base leading-7 text-current/70">{description}</p>
          ) : null}
          {sectionActions ? <div className="mt-2">{sectionActions}</div> : null}
        </div>

        {showFilter && categories.length > 1 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  activeCategory === cat
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}

        {viewMode === 'grid' ? (
          <div className={gridColsClasses[columns]}>
            {visible.map((program) => (
              <GridCard
                key={String(program.id)}
                ctaLabel={ctaLabel}
                program={program}
                actionMode={actionMode}
                actionVariant={actionVariant}
                sectionBackground={sectionBackground}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map((program) => (
              <ListCard
                key={String(program.id)}
                ctaLabel={ctaLabel}
                program={program}
                actionMode={actionMode}
                actionVariant={actionVariant}
                sectionBackground={sectionBackground}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
