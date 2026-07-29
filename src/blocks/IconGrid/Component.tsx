import {
  Award,
  BarChart2,
  BookOpen,
  Building2,
  CheckCircle2,
  Code2,
  Eye,
  FlaskConical,
  Globe,
  GraduationCap,
  Heart,
  Layers,
  Lightbulb,
  Lock,
  Microscope,
  Play,
  Rocket,
  Settings2,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import {
  regularBlockMobilePaddingClasses,
  regularBlockContainerClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getPageHref } from '@/lib/pagePaths'
import type { Page } from '@/payload-types'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  Star,
  Zap,
  Eye,
  Shield,
  Globe,
  Code2,
  Layers,
  Settings2,
  Users,
  BarChart2,
  Lock,
  Play,
  Rocket,
  Sparkles,
  Target,
  Award,
  Lightbulb,
  CheckCircle2,
  Heart,
  BookOpen,
  GraduationCap,
  FlaskConical,
  Microscope,
  Building2,
}

type IconGridItem = {
  description?: string | null
  icon?: string | null
  linkType?: 'none' | 'page' | 'custom' | null
  openInNewTab?: boolean | null
  page?: string | number | Page | null
  title?: string | null
  url?: string | null
}

type IconGridBlockLike = {
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  columns?: '2' | '3' | '4' | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  eyebrow?: string | null
  iconStyle?: 'square' | 'circle' | 'outline' | 'plain' | null
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
  circle: 'flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary',
  outline: 'flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-primary',
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
}: {
  icon: string
  iconStyle: keyof typeof iconContainerClasses
}) {
  const Icon = ICON_MAP[icon] ?? Star
  return (
    <div className={iconContainerClasses[iconStyle]}>
      <Icon className="size-5" />
    </div>
  )
}

// ── Card variant ──────────────────────────────────────────────────────────────
function CardItem({
  item,
  iconStyle,
}: {
  item: IconGridItem
  iconStyle: keyof typeof iconContainerClasses
}) {
  const link = resolveHref(item)
  const Inner = (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      {item.icon ? <IconContainer icon={item.icon} iconStyle={iconStyle} /> : null}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold leading-snug text-foreground">{item.title?.trim()}</h3>
        {item.description?.trim() ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{item.description.trim()}</p>
        ) : null}
      </div>
    </div>
  )

  if (link) {
    return (
      <a
        href={link.href}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      >
        {Inner}
      </a>
    )
  }
  return <div>{Inner}</div>
}

// ── Minimal variant ───────────────────────────────────────────────────────────
function MinimalItem({
  item,
  iconStyle,
}: {
  item: IconGridItem
  iconStyle: keyof typeof iconContainerClasses
}) {
  const link = resolveHref(item)
  const Inner = (
    <div className="flex gap-4">
      {item.icon ? <IconContainer icon={item.icon} iconStyle={iconStyle} /> : null}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold leading-snug text-foreground">{item.title?.trim()}</h3>
        {item.description?.trim() ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{item.description.trim()}</p>
        ) : null}
      </div>
    </div>
  )

  if (link) {
    return (
      <a
        href={link.href}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
        className="group block focus-visible:outline-none"
      >
        {Inner}
      </a>
    )
  }
  return <div>{Inner}</div>
}

// ── Icon Top variant ──────────────────────────────────────────────────────────
function IconTopItem({
  item,
  iconStyle,
}: {
  item: IconGridItem
  iconStyle: keyof typeof iconContainerClasses
}) {
  const link = resolveHref(item)
  const Inner = (
    <div className="flex flex-col items-center gap-3 text-center">
      {item.icon ? <IconContainer icon={item.icon} iconStyle={iconStyle} /> : null}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold leading-snug text-foreground">{item.title?.trim()}</h3>
        {item.description?.trim() ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{item.description.trim()}</p>
        ) : null}
      </div>
    </div>
  )

  if (link) {
    return (
      <a
        href={link.href}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
        className="group block focus-visible:outline-none"
      >
        {Inner}
      </a>
    )
  }
  return <div>{Inner}</div>
}

export function IconGridBlockComponent({
  actions,
  appearance,
  columns = '3',
  contentAlignment = 'center',
  description,
  eyebrow,
  iconStyle = 'square',
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

  return (
    <section className={cn(regularBlockMobilePaddingClasses[size ?? 'default'], appearanceClassName)}>
      <div className={regularBlockContainerClasses}>
        {/* Header */}
        <div
          className={cn(
            'mb-12 flex flex-col gap-3',
            isCenter ? 'mx-auto max-w-3xl items-center text-center' : 'items-start',
          )}
        >
          {eyebrow?.trim() ? (
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {eyebrow.trim()}
            </p>
          ) : null}
          <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            {resolvedTitle}
          </h2>
          {description?.trim() ? (
            <p className="text-lg text-muted-foreground">{description.trim()}</p>
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
              return <MinimalItem key={index} item={item} iconStyle={resolvedIconStyle} />
            }
            if (resolvedVariant === 'iconTop') {
              return <IconTopItem key={index} item={item} iconStyle={resolvedIconStyle} />
            }
            return <CardItem key={index} item={item} iconStyle={resolvedIconStyle} />
          })}
        </div>
      </div>
    </section>
  )
}
