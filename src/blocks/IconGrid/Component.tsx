import { ArrowRight, Star, type LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockMobilePaddingClasses,
  regularBlockContainerClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { Button } from '@/components/ui/button'
import { ContentActions } from '@/components/ContentActions'
import { resolveCmsActions, type CmsActionValue, type CmsActionVariant } from '@/lib/cmsLinks'
import { getPageHref } from '@/lib/pagePaths'
import type { Page } from '@/payload-types'
import { cn } from '@/lib/utils'
import { resolveCardSurface, type CardSurfaceClasses } from '@/blocks/shared/cardSurface'

type IconGridItem = {
  cardBackground?: string | null
  description?: string | null
  icon?: string | null
  linkType?: 'none' | 'page' | 'custom' | null
  openInNewTab?: boolean | null
  page?: string | number | Page | null
  title?: string | null
  url?: string | null
}

type IconGridBlockLike = {
  actionMode?: 'button' | 'link' | null
  actionVariant?: CmsActionVariant | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  columns?: '2' | '3' | '4' | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  eyebrow?: string | null
  iconStyle?: 'square' | 'circle' | 'outline' | 'plain' | null
  itemActionLabel?: string | null
  items?: IconGridItem[] | null
  size?: RegularBlockSize | null
  title?: string | null
  variant?: 'card' | 'minimal' | 'iconTop' | null
}

const columnClasses = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
  '4': 'sm:grid-cols-2 lg:grid-cols-4',
} as const

const iconContainerClasses = {
  square: 'flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary',
  circle:
    'flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary',
  outline:
    'flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-primary',
  plain: 'flex size-11 shrink-0 items-center justify-center text-primary',
} as const

function resolveHref(item: IconGridItem): { href: string; openInNewTab: boolean } | undefined {
  if (item.linkType === 'custom' && item.url?.trim()) {
    return { href: item.url.trim(), openInNewTab: item.openInNewTab ?? false }
  }
  if (item.linkType === 'page' && item.page) {
    const href = getPageHref(item.page)
    if (href) return { href, openInNewTab: item.openInNewTab ?? false }
  }
  return undefined
}

function IconContainer({
  icon,
  iconStyle,
  surface,
}: {
  icon: string
  iconStyle: keyof typeof iconContainerClasses
  surface?: CardSurfaceClasses
}) {
  const Icon = ((LucideIcons as Record<string, unknown>)[icon] as LucideIcon | undefined) ?? Star
  return (
    <div className={cn(iconContainerClasses[iconStyle], surface?.icon)}>
      <Icon className="size-5" />
    </div>
  )
}

type ActionProps = {
  actionMode: 'button' | 'link'
  actionVariant: CmsActionVariant
  actionLabel: string
  link: { href: string; openInNewTab: boolean }
  surface?: CardSurfaceClasses
}

function CardAction({ actionMode, actionVariant, actionLabel, link, surface }: ActionProps) {
  if (actionMode === 'button') {
    return (
      <Button
        asChild
        size="sm"
        variant={actionVariant}
        className={cn('mt-auto self-start', surface?.button[actionVariant])}
      >
        <a
          href={link.href}
          target={link.openInNewTab ? '_blank' : undefined}
          rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
        >
          {actionLabel}
        </a>
      </Button>
    )
  }
  return (
    <div
      className={cn(
        'mt-auto flex items-center gap-1 text-sm font-medium',
        surface?.link ?? 'text-primary',
      )}
    >
      {actionLabel}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </div>
  )
}

// ── Card variant ──────────────────────────────────────────────────────────────
function CardItem({
  item,
  iconStyle,
  actionMode,
  actionVariant,
  actionLabel,
}: {
  item: IconGridItem
  iconStyle: keyof typeof iconContainerClasses
  actionMode: 'button' | 'link'
  actionVariant: CmsActionVariant
  actionLabel: string
}) {
  const link = resolveHref(item)
  const surface = resolveCardSurface(item.cardBackground)
  const inner = (
    <div
      data-card-background={surface.value}
      className={cn(
        'group flex h-full flex-col gap-4 rounded-xl border p-6 transition-shadow',
        surface.className,
        surface.divider,
        link && 'hover:shadow-md hover:border-primary/30',
      )}
    >
      {item.icon ? (
        <IconContainer icon={item.icon} iconStyle={iconStyle} surface={surface} />
      ) : null}
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="font-sans text-base font-semibold leading-snug text-current">
          {item.title?.trim()}
        </h3>
        {item.description?.trim() ? (
          <p className={cn('text-sm leading-relaxed', surface.secondary)}>
            {item.description.trim()}
          </p>
        ) : null}
      </div>
      {link ? (
        <CardAction
          actionMode={actionMode}
          actionVariant={actionVariant}
          actionLabel={actionLabel}
          link={link}
          surface={surface}
        />
      ) : null}
    </div>
  )

  if (link && actionMode === 'link') {
    return (
      <a
        href={link.href}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
        className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {inner}
      </a>
    )
  }
  return <div className="h-full">{inner}</div>
}

// ── Minimal variant ───────────────────────────────────────────────────────────
function MinimalItem({
  item,
  iconStyle,
  actionMode,
  actionVariant,
  actionLabel,
}: {
  item: IconGridItem
  iconStyle: keyof typeof iconContainerClasses
  actionMode: 'button' | 'link'
  actionVariant: CmsActionVariant
  actionLabel: string
}) {
  const link = resolveHref(item)
  const inner = (
    <div className="group flex flex-col gap-3">
      <div className="flex gap-4">
        {item.icon ? <IconContainer icon={item.icon} iconStyle={iconStyle} /> : null}
        <div className="flex flex-col gap-1">
          <h3 className="font-sans text-base font-semibold leading-snug text-current">
            {item.title?.trim()}
          </h3>
          {item.description?.trim() ? (
            <p className="text-sm leading-relaxed text-current/70">{item.description.trim()}</p>
          ) : null}
        </div>
      </div>
      {link ? (
        <CardAction
          actionMode={actionMode}
          actionVariant={actionVariant}
          actionLabel={actionLabel}
          link={link}
        />
      ) : null}
    </div>
  )

  if (link && actionMode === 'link') {
    return (
      <a
        href={link.href}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
        className="block focus-visible:outline-none"
      >
        {inner}
      </a>
    )
  }
  return <div>{inner}</div>
}

// ── Icon Top variant ──────────────────────────────────────────────────────────
function IconTopItem({
  item,
  iconStyle,
  actionMode,
  actionVariant,
  actionLabel,
}: {
  item: IconGridItem
  iconStyle: keyof typeof iconContainerClasses
  actionMode: 'button' | 'link'
  actionVariant: CmsActionVariant
  actionLabel: string
}) {
  const link = resolveHref(item)
  const inner = (
    <div className="group flex h-full flex-col items-center gap-3 text-center">
      {item.icon ? <IconContainer icon={item.icon} iconStyle={iconStyle} /> : null}
      <div className="flex flex-col gap-1">
        <h3 className="font-sans text-base font-semibold leading-snug text-current">
          {item.title?.trim()}
        </h3>
        {item.description?.trim() ? (
          <p className="text-sm leading-relaxed text-current/70">{item.description.trim()}</p>
        ) : null}
      </div>
      {link ? (
        <CardAction
          actionMode={actionMode}
          actionVariant={actionVariant}
          actionLabel={actionLabel}
          link={link}
        />
      ) : null}
    </div>
  )

  if (link && actionMode === 'link') {
    return (
      <a
        href={link.href}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
        className="block h-full focus-visible:outline-none"
      >
        {inner}
      </a>
    )
  }
  return <div className="h-full">{inner}</div>
}

export function IconGridBlockComponent({
  actionMode,
  actionVariant,
  actions,
  appearance,
  columns = '3',
  contentAlignment = 'center',
  description,
  eyebrow,
  iconStyle = 'square',
  itemActionLabel,
  items,
  size = 'default',
  title,
  variant = 'card',
}: IconGridBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const validItems = (items ?? []).filter((item) => item.title?.trim())
  if (validItems.length === 0) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const isCenter = (contentAlignment ?? 'center') === 'center'
  const resolvedActions = resolveCmsActions(actions)
  const resolvedColumns = columns ?? '3'
  const resolvedIconStyle = (iconStyle ?? 'square') as keyof typeof iconContainerClasses
  const resolvedVariant = variant ?? 'card'
  const resolvedActionMode = actionMode ?? 'link'
  const resolvedActionVariant = actionVariant ?? 'default'
  const resolvedActionLabel = itemActionLabel?.trim() || 'Learn More'

  const itemProps = {
    iconStyle: resolvedIconStyle,
    actionMode: resolvedActionMode,
    actionVariant: resolvedActionVariant,
    actionLabel: resolvedActionLabel,
  }

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}
    >
      <div className={regularBlockContainerClasses}>
        {/* Header */}
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
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
            {resolvedTitle}
          </h2>
          {description?.trim() ? (
            <p className="text-base leading-7 text-current/70">{description.trim()}</p>
          ) : null}
          {resolvedActions.length > 0 ? (
            <div className="mt-2">
              <ContentActions actions={resolvedActions} />
            </div>
          ) : null}
        </div>

        {/* Grid */}
        <div className={cn('grid grid-cols-1 gap-6', columnClasses[resolvedColumns])}>
          {validItems.map((item, index) => {
            if (resolvedVariant === 'minimal') {
              return <MinimalItem key={index} item={item} {...itemProps} />
            }
            if (resolvedVariant === 'iconTop') {
              return <IconTopItem key={index} item={item} {...itemProps} />
            }
            return <CardItem key={index} item={item} {...itemProps} />
          })}
        </div>
      </div>
    </section>
  )
}
