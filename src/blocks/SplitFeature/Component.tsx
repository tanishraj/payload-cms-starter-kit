import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import { Button, buttonVariants } from '@/components/ui/button'
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
  appearance?: BlockAppearance | null
  buttons?: SplitFeatureButton[] | null
  contentVerticalAlignment?: 'bottom' | 'center' | 'top' | null
  ctaMode?: 'buttons' | 'link' | null
  description?: string | null
  eyebrow?: string | null
  image?: unknown
  imagePosition?: 'bottom' | 'center' | 'left' | 'right' | 'top' | null
  layoutMode?: 'contentOnly' | 'split' | null
  linkLabel?: string | null
  linkType?: 'page' | 'custom' | null
  mediaFillMode?: 'contained' | 'containedFill' | 'edgeToEdge' | null
  mediaPosition?: 'left' | 'right' | null
  openInNewTab?: boolean | null
  page?: Page | number | string | null
  size?: 'comfortable' | 'compact' | 'default' | null
  title: string
  url?: string | null
}

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

const objectPositionClasses = {
  center: 'object-[center_center]',
  top: 'object-[center_top]',
  bottom: 'object-[center_bottom]',
  left: 'object-[left_center]',
  right: 'object-[right_center]',
} as const

const containedPaddingClasses = {
  compact: 'py-10 md:py-10',
  default: 'py-12 md:py-12',
  comfortable: 'py-16 md:py-16',
} as const

const edgeContentPaddingClasses = {
  compact: 'px-4 py-10 md:px-8 md:py-10 lg:px-12',
  default: 'px-4 py-12 md:px-8 md:py-12 lg:px-12',
  comfortable: 'px-4 py-16 md:px-8 md:py-16 lg:px-12',
} as const

const edgeLayoutMinHeightClasses = {
  compact: 'min-h-[18rem] md:min-h-[24rem]',
  default: 'min-h-[24rem] md:min-h-[32rem]',
  comfortable: 'min-h-[30rem] md:min-h-[40rem]',
} as const

const contentVerticalAlignmentClasses = {
  top: 'justify-start',
  center: 'justify-center',
  bottom: 'justify-end',
} as const

export function SplitFeatureBlockComponent({
  appearance,
  buttons,
  contentVerticalAlignment = 'center',
  ctaMode = 'link',
  description,
  eyebrow,
  image,
  imagePosition = 'center',
  layoutMode = 'split',
  linkLabel,
  linkType,
  mediaFillMode = 'contained',
  mediaPosition = 'left',
  openInNewTab,
  page,
  size = 'default',
  title,
  url,
}: SplitFeatureBlockLike) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const media = getMediaImageProps({
    media: image as never,
    preset: 'generic',
    fallbackAlt: title,
  })

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

  const resolvedImagePosition = imagePosition ?? 'center'
  const resolvedPosition = mediaPosition ?? 'left'
  const resolvedMediaFillMode = mediaFillMode ?? 'contained'
  const resolvedSize = size ?? 'default'
  const resolvedContentVerticalAlignment = contentVerticalAlignment ?? 'center'
  const order = resolvedPosition === 'right' ? orderClasses.right : orderClasses.left
  const hasMedia = Boolean(media)
  const renderAsSplit = resolvedLayoutMode === 'split' && hasMedia
  const renderAsEdgeToEdge = renderAsSplit && resolvedMediaFillMode === 'edgeToEdge'
  const renderAsContainedFill = renderAsSplit && resolvedMediaFillMode === 'containedFill'
  const contentContainerClasses = renderAsSplit
    ? 'max-w-xl text-left'
    : 'mx-auto max-w-2xl items-center text-center'
  const actionClasses =
    ctaMode === 'buttons'
      ? renderAsSplit
        ? 'flex flex-col gap-3 sm:flex-row'
        : 'flex flex-col items-center gap-3 sm:flex-row sm:justify-center'
      : undefined
  const edgeContentAlignmentClasses = resolvedPosition === 'left' ? 'mr-auto' : 'ml-auto'
  const contentVerticalAlignmentClass =
    contentVerticalAlignmentClasses[resolvedContentVerticalAlignment]

  const content = (
    <div
      className={cn(
        'flex flex-col gap-4',
        renderAsEdgeToEdge
          ? cn('w-full max-w-xl text-left', edgeContentAlignmentClasses)
          : contentContainerClasses,
      )}
    >
      {eyebrow ? (
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-balance text-base leading-7 text-muted-foreground">{description}</p>
      ) : null}
      {ctaMode === 'link' && linkLabel?.trim() && linkCta.href ? (
        <div>
          <a
            className={cn(
              buttonVariants({ variant: 'link' }),
              'group/button h-auto gap-2 px-0 py-0 text-sm',
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
              <ArrowRight className="absolute left-0 top-0 size-4 rotate-[-35deg] transition-all duration-200 ease-out group-hover/button:translate-x-1 group-hover/button:opacity-0 group-hover/button:rotate-0" />
              <ArrowRight className="absolute left-0 top-0 size-4 translate-x-[-70%] opacity-0 transition-all duration-200 ease-out group-hover/button:translate-x-0 group-hover/button:opacity-100" />
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
  )

  return (
    <section
      className={appearanceClasses.className}
      data-split-feature-background={appearance?.background ?? 'none'}
      data-split-feature-cta={ctaMode}
      data-split-feature-layout={renderAsSplit ? 'split' : 'contentOnly'}
      data-split-feature-media-fill={renderAsSplit ? resolvedMediaFillMode : 'contentOnly'}
      data-split-feature-content-vertical-alignment={
        renderAsSplit ? resolvedContentVerticalAlignment : 'contentOnly'
      }
      data-split-feature-image-position={resolvedImagePosition}
      data-split-feature-position={renderAsSplit ? resolvedPosition : 'contentOnly'}
      data-split-feature-size={resolvedSize}
    >
      {renderAsEdgeToEdge ? (
        <div
          className={cn(
            'grid items-stretch md:grid-cols-2',
            edgeLayoutMinHeightClasses[resolvedSize],
          )}
        >
          {renderAsSplit ? (
            <div
              className={cn(order.media, 'relative min-h-full overflow-hidden')}
              data-split-feature-media-frame="edgeToEdge"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={media?.alt}
                className={cn(
                  'absolute inset-0 size-full object-cover',
                  objectPositionClasses[resolvedImagePosition],
                )}
                src={media?.src}
              />
            </div>
          ) : null}
          <div className={cn(order.content)}>
            <div
              className={cn(
                'flex min-h-full flex-col',
                contentVerticalAlignmentClass,
                edgeContentPaddingClasses[resolvedSize],
              )}
            >
              {content}
            </div>
          </div>
        </div>
      ) : renderAsContainedFill ? (
        <div className="mx-auto max-w-screen-2xl px-4">
          <div
            className={cn(
              'grid items-stretch md:grid-cols-2',
              edgeLayoutMinHeightClasses[resolvedSize],
            )}
          >
            <div className={cn(order.media)} data-split-feature-media-frame="containedFill">
              <div className="relative aspect-[4/3] overflow-hidden md:h-full md:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={media?.alt}
                  className={cn(
                    'absolute inset-0 size-full object-cover',
                    objectPositionClasses[resolvedImagePosition],
                  )}
                  src={media?.src}
                />
              </div>
            </div>
            <div className={cn(order.content)}>
              <div
                className={cn(
                  'flex min-h-full flex-col',
                  contentVerticalAlignmentClass,
                  edgeContentPaddingClasses[resolvedSize],
                )}
              >
                {content}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn('mx-auto max-w-screen-2xl px-4', containedPaddingClasses[resolvedSize])}>
          {renderAsSplit ? (
            <div className={cn('grid items-stretch gap-8 md:grid-cols-2 md:gap-12 lg:gap-16')}>
              <div className={cn(order.media)} data-split-feature-media-frame="contained">
                <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={media?.alt}
                    className={cn(
                      'aspect-4/3 size-full object-cover',
                      objectPositionClasses[resolvedImagePosition],
                    )}
                    src={media?.src}
                  />
                </div>
              </div>
              <div
                className={cn(
                  order.content,
                  'flex min-h-full flex-col',
                  contentVerticalAlignmentClass,
                )}
              >
                {content}
              </div>
            </div>
          ) : (
            <div className="block">{content}</div>
          )}
        </div>
      )}
    </section>
  )
}
