import { Button } from '@/components/ui/button'
import { resolveCmsLink } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'
import type { Page } from '@/payload-types'

type HeroButton = {
  label?: string | null
  linkType?: 'page' | 'custom' | null
  openInNewTab?: boolean | null
  page?: Page | number | string | null
  url?: string | null
  variant?: 'default' | 'link' | 'outline' | 'secondary' | null
}

type HeroInstitutionalBlockLike = {
  backgroundImage?: unknown
  buttons?: HeroButton[] | null
  contentWidth?: 'default' | 'narrow' | 'wide' | null
  description?: string | null
  eyebrow?: string | null
  height?: '40' | '60' | '80' | 'balanced' | 'compact' | 'default' | 'immersive' | null
  horizontalAlignment?: 'center' | 'left' | 'right' | null
  overlayStyle?: 'brand' | 'dark' | 'darker' | 'ink' | 'light' | 'soft' | null
  title: string
  verticalAlignment?: 'bottom' | 'center' | 'top' | null
}

const overlayClasses = {
  light: 'bg-linear-to-b from-black/58 via-black/42 to-black/62',
  dark: 'bg-linear-to-b from-black/74 via-black/58 to-black/78',
  darker: 'bg-linear-to-b from-black/84 via-black/70 to-black/88',
} as const

const horizontalShellClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

const textAlignmentClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const

const verticalShellClasses = {
  top: 'items-start py-16 md:py-20',
  center: 'items-center py-16 md:py-20',
  bottom: 'items-end py-16 md:py-20',
} as const

const contentWidthClasses = {
  narrow: 'max-w-xl',
  default: 'max-w-3xl',
  wide: 'max-w-5xl',
} as const

const titleWidthClasses = {
  narrow: 'max-w-[12ch]',
  default: 'max-w-[16ch]',
  wide: 'max-w-[20ch]',
} as const

const descriptionWidthClasses = {
  narrow: 'max-w-[46ch]',
  default: 'max-w-[60ch]',
  wide: 'max-w-[72ch]',
} as const

const heightClasses = {
  compact: 'min-h-[40dvh]',
  default: 'min-h-[60dvh]',
  immersive: 'min-h-[80dvh]',
} as const

const actionAlignmentClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

export function HeroInstitutionalBlockComponent({
  backgroundImage,
  buttons,
  contentWidth = 'default',
  description,
  eyebrow,
  height = 'default',
  horizontalAlignment = 'left',
  overlayStyle = 'dark',
  title,
  verticalAlignment = 'center',
}: HeroInstitutionalBlockLike) {
  const resolvedContentWidth = contentWidth ?? 'default'
  const resolvedHorizontalAlignment = horizontalAlignment ?? 'left'
  const resolvedOverlayStyle =
    overlayStyle === 'ink'
      ? 'darker'
      : overlayStyle === 'brand'
        ? 'dark'
        : overlayStyle === 'soft'
          ? 'light'
          : (overlayStyle ?? 'dark')
  const resolvedVerticalAlignment = verticalAlignment ?? 'center'
  const resolvedHeight =
    height === '40'
      ? 'compact'
      : height === '80'
        ? 'immersive'
        : height === '60' || height === 'balanced'
          ? 'default'
          : (height ?? 'default')

  const image = getMediaImageProps({
    media: backgroundImage as never,
    preset: 'hero',
    fallbackAlt: title,
  })

  if (!image) {
    return null
  }

  const actions = (buttons ?? []).flatMap((button) => {
    const label = button.label?.trim()
    const link = resolveCmsLink(button)
    const resolvedVariant = button.variant === 'outline' ? 'secondary' : (button.variant ?? 'default')

    return label && link.href
      ? [
          {
            href: link.href,
            label,
            openInNewTab: link.openInNewTab,
            variant: resolvedVariant,
          },
        ]
      : []
  })

  return (
    <section
      className="relative isolate overflow-hidden border-b border-border bg-background"
      data-hero-block="true"
    >
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={image.alt} className="size-full object-cover" src={image.src} />
      </div>
      <div
        className={cn('absolute inset-0', overlayClasses[resolvedOverlayStyle])}
        data-hero-overlay={resolvedOverlayStyle}
      />
      <div
        className={cn('relative mx-auto flex max-w-screen-2xl px-4', heightClasses[resolvedHeight])}
        data-hero-height={resolvedHeight}
      >
        <div
          className={cn(
            'flex w-full',
            horizontalShellClasses[resolvedHorizontalAlignment],
            verticalShellClasses[resolvedVerticalAlignment],
          )}
          data-hero-horizontal={resolvedHorizontalAlignment}
          data-hero-vertical={resolvedVerticalAlignment}
        >
          <div
            className={cn(
              'flex flex-col gap-6',
              contentWidthClasses[resolvedContentWidth],
              textAlignmentClasses[resolvedHorizontalAlignment],
            )}
            data-hero-content-width={resolvedContentWidth}
          >
            {eyebrow ? (
              <p
                className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-sidebar-primary-foreground/78"
                data-hero-eyebrow="true"
              >
                {eyebrow}
              </p>
            ) : null}
            <h1
              className={cn(
                'text-4xl font-semibold tracking-tight text-sidebar-primary-foreground sm:text-5xl md:text-6xl',
                titleWidthClasses[resolvedContentWidth],
              )}
            >
              {title}
            </h1>
            {description ? (
              <p
                className={cn(
                  'text-base leading-7 text-sidebar-primary-foreground/84',
                  descriptionWidthClasses[resolvedContentWidth],
                )}
                data-hero-description="true"
              >
                {description}
              </p>
            ) : null}
            {actions.length > 0 ? (
              <div
                className={cn(
                  'flex flex-col gap-3 sm:flex-row',
                  actionAlignmentClasses[resolvedHorizontalAlignment],
                )}
                data-hero-actions="true"
              >
                {actions.map((action) => (
                  <Button asChild key={`${action.label}-${action.href}`} size="lg" variant={action.variant}>
                    <a
                      href={action.href}
                      rel={action.openInNewTab ? 'noreferrer' : undefined}
                      target={action.openInNewTab ? '_blank' : undefined}
                    >
                      {action.label}
                    </a>
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
