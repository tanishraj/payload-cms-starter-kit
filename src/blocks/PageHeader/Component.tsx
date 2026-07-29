import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import { regularBlockMobilePaddingClasses } from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { getMediaImageProps } from '@/lib/media'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getPageHref } from '@/lib/pagePaths'
import type { Media, Page } from '@/payload-types'
import { cn } from '@/lib/utils'

type BreadcrumbItem = {
  label?: string | null
  linkType?: 'page' | 'custom' | null
  page?: unknown
  url?: string | null
}

type KeyFact = {
  label?: string | null
  value?: string | null
}

type PageHeaderBlockLike = {
  actions?: CmsActionValue[] | null
  actionMode?: 'button' | 'link' | null
  appearance?: BlockAppearance | null
  backgroundImage?: string | number | Media | null
  breadcrumbs?: BreadcrumbItem[] | null
  contentAlignment?: 'left' | 'center' | null
  eyebrow?: string | null
  height?: 'compact' | 'default' | 'immersive' | null
  keyFacts?: KeyFact[] | null
  overlayStyle?: 'light' | 'dark' | 'darker' | null
  subtitle?: string | null
  title?: string | null
  variant?: 'minimal' | 'banner' | 'split' | null
}

const overlayClasses = {
  light: 'bg-black/20',
  dark: 'bg-black/50',
  darker: 'bg-black/70',
} as const

const bannerHeightClasses = {
  compact: 'min-h-[14rem] md:min-h-[18rem]',
  default: 'min-h-[20rem] md:min-h-[26rem]',
  immersive: 'min-h-[28rem] md:min-h-[38rem]',
} as const

function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm">
      {items.map((crumb, index) => {
        const label = crumb.label?.trim()
        if (!label) return null

        const isLast = index === items.length - 1
        let href: string | undefined

        if (!isLast) {
          if (crumb.linkType === 'page') {
            href = getPageHref(crumb.page as Page | string | number | null | undefined)
          } else if (crumb.linkType === 'custom') {
            href = crumb.url?.trim() || undefined
          }
        }

        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 ? (
              <ChevronRight className="size-3.5 shrink-0 text-current/40" aria-hidden="true" />
            ) : null}
            {href && !isLast ? (
              <a href={href} className="text-current/60 transition-colors hover:text-current">
                {label}
              </a>
            ) : (
              <span className={isLast ? 'text-current/90 font-medium' : 'text-current/60'}>
                {label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export function PageHeaderBlockComponent({
  actions,
  actionMode = 'link',
  appearance,
  backgroundImage,
  breadcrumbs,
  contentAlignment = 'left',
  eyebrow,
  height = 'default',
  keyFacts,
  overlayStyle = 'dark',
  subtitle,
  title,
  variant = 'minimal',
}: PageHeaderBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const resolvedBreadcrumbs = (breadcrumbs ?? []).filter((b) => b.label?.trim())
  const resolvedActions = resolveCmsActions(actions)
  const resolvedKeyFacts = (keyFacts ?? []).filter((f) => f.label?.trim() && f.value?.trim())
  const bgImage = getMediaImageProps({ media: backgroundImage, preset: 'hero' })
  const isCenter = contentAlignment === 'center'

  // ── BANNER variant ───────────────────────────────────────────────────────────
  if (variant === 'banner') {
    return (
      <section
        className={cn(
          'relative flex flex-col justify-end overflow-hidden text-white',
          bannerHeightClasses[height ?? 'default'],
        )}
      >
        {bgImage ? (
          <Image
            src={bgImage.src}
            alt={bgImage.alt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-primary" />
        )}
        <div
          className={cn(
            'absolute inset-0',
            overlayClasses[overlayStyle ?? 'dark'],
          )}
        />
        <div className="relative mx-auto w-full max-w-screen-2xl px-4 py-10 md:py-14">
          <Breadcrumbs items={resolvedBreadcrumbs} />
          {eyebrow?.trim() ? (
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              {eyebrow.trim()}
            </p>
          ) : null}
          <h1
            className={cn(
              'text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl xl:text-6xl',
              isCenter && 'text-center',
            )}
          >
            {resolvedTitle}
          </h1>
          {subtitle?.trim() ? (
            <p
              className={cn(
                'mt-4 max-w-2xl text-lg text-white/80',
                isCenter && 'mx-auto text-center',
              )}
            >
              {subtitle.trim()}
            </p>
          ) : null}
          {resolvedActions.length > 0 ? (
            <div className={cn('mt-6', isCenter && 'flex justify-center')}>
              <ContentActions
                actions={resolvedActions}
                alignment={isCenter ? 'center' : 'left'}
                mode={actionMode ?? 'link'}
              />
            </div>
          ) : null}
        </div>
      </section>
    )
  }

  // ── SPLIT variant ────────────────────────────────────────────────────────────
  if (variant === 'split') {
    const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)

    return (
      <section className={cn(regularBlockMobilePaddingClasses['default'], appearanceClassName)}>
        <div className="mx-auto w-full max-w-screen-2xl px-4">
          <Breadcrumbs items={resolvedBreadcrumbs} />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            <div className="flex flex-1 flex-col gap-4">
              {eyebrow?.trim() ? (
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {eyebrow.trim()}
                </p>
              ) : null}
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                {resolvedTitle}
              </h1>
              {subtitle?.trim() ? (
                <p className="text-lg text-muted-foreground">{subtitle.trim()}</p>
              ) : null}
              {resolvedActions.length > 0 ? (
                <div className="mt-2">
                  <ContentActions
                    actions={resolvedActions}
                    alignment="left"
                    mode={actionMode ?? 'link'}
                  />
                </div>
              ) : null}
            </div>

            {resolvedKeyFacts.length > 0 ? (
              <div className="shrink-0 rounded-xl border border-border bg-muted/50 p-6 lg:w-72">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-1">
                  {resolvedKeyFacts.map((fact, index) => (
                    <div key={index} className="flex flex-col gap-0.5">
                      <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {fact.label!.trim()}
                      </dt>
                      <dd className="text-base font-semibold text-foreground">
                        {fact.value!.trim()}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    )
  }

  // ── MINIMAL variant (default) ─────────────────────────────────────────────
  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)

  return (
    <section className={cn(regularBlockMobilePaddingClasses['compact'], appearanceClassName)}>
      <div className="mx-auto w-full max-w-screen-2xl px-4">
        <Breadcrumbs items={resolvedBreadcrumbs} />
        {eyebrow?.trim() ? (
          <p
            className={cn(
              'mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground',
              isCenter && 'text-center',
            )}
          >
            {eyebrow.trim()}
          </p>
        ) : null}
        <h1
          className={cn(
            'text-4xl font-bold leading-tight tracking-tight md:text-5xl',
            isCenter && 'text-center',
          )}
        >
          {resolvedTitle}
        </h1>
        {subtitle?.trim() ? (
          <p
            className={cn(
              'mt-3 max-w-2xl text-lg text-muted-foreground',
              isCenter && 'mx-auto text-center',
            )}
          >
            {subtitle.trim()}
          </p>
        ) : null}
        {resolvedActions.length > 0 ? (
          <div className={cn('mt-5', isCenter && 'flex justify-center')}>
            <ContentActions
              actions={resolvedActions}
              alignment={isCenter ? 'center' : 'left'}
              mode={actionMode ?? 'link'}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
