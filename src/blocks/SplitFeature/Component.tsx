import { Button } from '@/components/ui/button'
import { resolveCmsLink } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import type { Page } from '@/payload-types'

type SplitFeatureButton = {
  label?: string | null
  linkType?: 'page' | 'custom' | null
  openInNewTab?: boolean | null
  page?: Page | number | string | null
  url?: string | null
  variant?: 'default' | 'link' | 'secondary' | null
}

type SplitFeatureBlockLike = {
  backgroundStyle?: 'muted' | 'plain' | null
  buttons?: SplitFeatureButton[] | null
  ctaMode?: 'buttons' | 'link' | null
  description?: string | null
  eyebrow?: string | null
  image?: unknown
  layoutMode?: 'contentOnly' | 'split' | null
  linkLabel?: string | null
  linkType?: 'page' | 'custom' | null
  mediaPosition?: 'left' | 'right' | null
  openInNewTab?: boolean | null
  page?: Page | number | string | null
  title: string
  url?: string | null
}

const backgroundClasses = {
  plain: 'bg-background',
  muted: 'bg-muted',
} as const

const orderClasses = {
  left: {
    content: 'md:order-2',
    media: 'md:order-1',
  },
  right: {
    content: 'md:order-1',
    media: 'md:order-2',
  },
} as const

export function SplitFeatureBlockComponent({
  backgroundStyle = 'plain',
  buttons,
  ctaMode = 'link',
  description,
  eyebrow,
  image,
  layoutMode = 'split',
  linkLabel,
  linkType,
  mediaPosition = 'left',
  openInNewTab,
  page,
  title,
  url,
}: SplitFeatureBlockLike) {
  const media = getMediaImageProps({
    media: image as never,
    preset: 'generic',
    fallbackAlt: title,
  })

  const resolvedBackgroundStyle = backgroundStyle ?? 'plain'
  const resolvedLayoutMode = layoutMode ?? 'split'

  const linkCta = resolveCmsLink({
    linkType,
    openInNewTab,
    page,
    url,
  })

  const resolvedButtons = (buttons ?? []).flatMap((button) => {
    const label = button.label?.trim()
    const link = resolveCmsLink(button)

    return label && link.href
      ? [
          {
            href: link.href,
            label,
            openInNewTab: link.openInNewTab,
            variant: button.variant ?? 'default',
          },
        ]
      : []
  })

  const resolvedPosition = mediaPosition ?? 'left'
  const order = orderClasses[resolvedPosition]
  const hasMedia = Boolean(media)
  const renderAsSplit = resolvedLayoutMode === 'split' && hasMedia
  const contentContainerClasses = renderAsSplit
    ? 'max-w-xl text-left'
    : 'mx-auto max-w-2xl items-center text-center'
  const actionClasses =
    ctaMode === 'buttons'
      ? renderAsSplit
        ? 'flex flex-col gap-3 sm:flex-row'
        : 'flex flex-col items-center gap-3 sm:flex-row sm:justify-center'
      : undefined

  return (
    <section
      className={cn('border-b border-border', backgroundClasses[resolvedBackgroundStyle])}
      data-split-feature-background={resolvedBackgroundStyle}
      data-split-feature-cta={ctaMode}
      data-split-feature-layout={renderAsSplit ? 'split' : 'contentOnly'}
      data-split-feature-position={renderAsSplit ? resolvedPosition : 'contentOnly'}
    >
      <div className="mx-auto max-w-screen-2xl px-4 py-16 md:py-24">
        <div
          className={cn(
            renderAsSplit ? 'grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16' : 'block',
          )}
        >
          {renderAsSplit ? (
            <div className={cn(order.media)}>
              <div className="overflow-hidden rounded-(--radius-xl) bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={media?.alt}
                  className="aspect-[4/3] size-full object-cover"
                  src={media?.src}
                />
              </div>
            </div>
          ) : null}
          <div className={cn(renderAsSplit ? order.content : undefined)}>
            <div className={cn('flex flex-col gap-4', contentContainerClasses)}>
              {eyebrow ? (
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                  {eyebrow}
                </p>
              ) : null}
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
              {description ? (
                <p className="text-base leading-7 text-muted-foreground">{description}</p>
              ) : null}
              {ctaMode === 'link' && linkLabel?.trim() && linkCta.href ? (
                <div>
                  <a
                    className={cn(
                      'group inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80',
                      !renderAsSplit && 'justify-center',
                    )}
                    data-split-feature-link-cta="true"
                    href={linkCta.href}
                    rel={linkCta.openInNewTab ? 'noreferrer' : undefined}
                    target={linkCta.openInNewTab ? '_blank' : undefined}
                  >
                    <span>{linkLabel.trim()}</span>
                    <span
                      className="relative inline-flex size-4 shrink-0 overflow-hidden"
                      aria-hidden="true"
                    >
                      <ArrowRight className="absolute left-0 top-0 size-4 rotate-[-35deg] transition-all duration-200 ease-out group-hover:translate-x-1 group-hover:opacity-0 group-hover:rotate-0" />
                      <ArrowRight className="absolute left-0 top-0 size-4 translate-x-[-70%] opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                  </a>
                </div>
              ) : null}
              {ctaMode === 'buttons' && resolvedButtons.length ? (
                <div className={actionClasses}>
                  {resolvedButtons.map((button) => (
                    <Button
                      asChild
                      key={`${button.label}-${button.href}`}
                      size="lg"
                      variant={button.variant}
                    >
                      <a
                        href={button.href}
                        rel={button.openInNewTab ? 'noreferrer' : undefined}
                        target={button.openInNewTab ? '_blank' : undefined}
                      >
                        {button.label}
                      </a>
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
