import Image from 'next/image'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import { ActionButtonContent } from '@/components/ActionButtonContent'
import { ContentLink } from '@/components/ContentLink'
import { Button } from '@/components/ui/button'
import { SectionEyebrow, type SectionEyebrowSurface } from '@/components/SectionEyebrow'
import { resolveCmsLink } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'
import type { Page } from '@/payload-types'

type HeroButton = {
  label?: string | null
  linkType?: 'page' | 'custom' | null
  openInNewTab?: boolean | null
  page?: Page | number | string | null
  showArrow?: boolean | null
  url?: string | null
  variant?: 'default' | 'link' | 'outline' | 'secondary' | null
}

type HeroBannerBlockLike = {
  accentTitle?: string | null
  appearance?: BlockAppearance | null
  backgroundImage?: unknown
  buttons?: HeroButton[] | null
  contentWidth?: 'default' | 'narrow' | 'wide' | null
  description?: string | null
  enableTextShadow?: boolean | null
  eyebrow?: string | null
  height?: '40' | '60' | '80' | 'balanced' | 'compact' | 'default' | 'immersive' | null
  horizontalAlignment?: 'center' | 'left' | 'right' | null
  overlayDirection?: 'leftToRight' | 'rightToLeft' | 'vertical' | null
  overlayStyle?: 'brand' | 'dark' | 'darker' | 'darkest' | 'ink' | 'light' | 'soft' | null
  themeMode?: 'auto' | 'dark' | 'light' | null
  title?: string | null
  verticalAlignment?: 'bottom' | 'center' | 'top' | null
}

const overlayClasses = {
  auto: {
    light: {
      vertical: 'bg-linear-to-b from-background/72 via-background/56 to-background/78',
      leftToRight: 'bg-linear-to-r from-background/72 via-background/56 to-background/78',
      rightToLeft: 'bg-linear-to-l from-background/72 via-background/56 to-background/78',
    },
    dark: {
      vertical: 'bg-linear-to-b from-background/82 via-background/68 to-background/86',
      leftToRight: 'bg-linear-to-r from-background/82 via-background/68 to-background/86',
      rightToLeft: 'bg-linear-to-l from-background/82 via-background/68 to-background/86',
    },
    darker: {
      vertical: 'bg-linear-to-b from-background/90 via-background/80 to-background/92',
      leftToRight: 'bg-linear-to-r from-background/90 via-background/80 to-background/92',
      rightToLeft: 'bg-linear-to-l from-background/90 via-background/80 to-background/92',
    },
  },
  light: {
    light: {
      vertical: 'bg-linear-to-b from-background/72 via-background/56 to-background/78',
      leftToRight: 'bg-linear-to-r from-background/72 via-background/56 to-background/78',
      rightToLeft: 'bg-linear-to-l from-background/72 via-background/56 to-background/78',
    },
    dark: {
      vertical: 'bg-linear-to-b from-background/82 via-background/68 to-background/86',
      leftToRight: 'bg-linear-to-r from-background/82 via-background/68 to-background/86',
      rightToLeft: 'bg-linear-to-l from-background/82 via-background/68 to-background/86',
    },
    darker: {
      vertical: 'bg-linear-to-b from-background/90 via-background/80 to-background/92',
      leftToRight: 'bg-linear-to-r from-background/90 via-background/80 to-background/92',
      rightToLeft: 'bg-linear-to-l from-background/90 via-background/80 to-background/92',
    },
  },
  dark: {
    light: {
      vertical: 'bg-linear-to-b from-black/56 via-black/42 to-black/62',
      leftToRight: 'bg-linear-to-r from-black/56 via-black/42 to-black/62',
      rightToLeft: 'bg-linear-to-l from-black/56 via-black/42 to-black/62',
    },
    dark: {
      vertical: 'bg-linear-to-b from-black/68 via-black/54 to-black/74',
      leftToRight: 'bg-linear-to-r from-black/68 via-black/54 to-black/74',
      rightToLeft: 'bg-linear-to-l from-black/68 via-black/54 to-black/74',
    },
    darker: {
      vertical: 'bg-linear-to-b from-black/80 via-black/68 to-black/84',
      leftToRight: 'bg-linear-to-r from-black/80 via-black/68 to-black/84',
      rightToLeft: 'bg-linear-to-l from-black/80 via-black/68 to-black/84',
    },
  },
} as const

const textToneClasses = {
  auto: {
    title: 'text-foreground',
    description: 'text-foreground/84',
    eyebrow: 'text-foreground/78',
    link: 'text-foreground',
  },
  light: {
    title: 'text-foreground',
    description: 'text-foreground/84',
    eyebrow: 'text-foreground/78',
    link: 'text-foreground',
  },
  dark: {
    title: 'text-white',
    description: 'text-white/84',
    eyebrow: 'text-white/78',
    link: 'text-white',
  },
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

const constrainedItemAlignmentClasses = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
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

const titleSizeClasses = {
  compact: 'text-3xl sm:text-4xl md:text-5xl',
  default: 'text-4xl sm:text-5xl md:text-6xl',
  immersive: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
} as const

const descriptionSizeClasses = {
  compact: 'text-sm leading-6 lg:text-lg',
  default: 'text-base leading-7 lg:text-xl',
  immersive: 'text-base leading-7 lg:text-xl',
} as const

const actionAlignmentClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

const heroTextShadowStyle = { textShadow: '0 2px 12px rgb(0 0 0 / 55%)' } as const
const heroLinkArrowShadowStyle = {
  filter: 'drop-shadow(0 2px 6px rgb(0 0 0 / 55%))',
} as const

export function HeroBannerBlockComponent({
  accentTitle,
  appearance,
  backgroundImage,
  buttons,
  contentWidth = 'default',
  description,
  enableTextShadow = false,
  eyebrow,
  height = 'default',
  horizontalAlignment = 'left',
  overlayDirection = 'vertical',
  overlayStyle = 'dark',
  themeMode = 'auto',
  title,
  verticalAlignment = 'center',
}: HeroBannerBlockLike) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedContentWidth = contentWidth ?? 'default'
  const resolvedHorizontalAlignment = horizontalAlignment ?? 'left'
  const resolvedOverlayStyle =
    overlayStyle === 'light' || overlayStyle === 'darker'
      ? overlayStyle
      : overlayStyle === 'soft'
        ? 'light'
        : overlayStyle === 'ink' || overlayStyle === 'darkest'
        ? 'darker'
        : 'dark'
  const resolvedOverlayDirection = overlayDirection ?? 'vertical'
  const resolvedThemeMode = themeMode ?? 'auto'
  const usesTextShadow = Boolean(enableTextShadow)
  const eyebrowSurface: SectionEyebrowSurface =
    resolvedThemeMode === 'dark' ? 'darkOverlay' : 'none'
  const resolvedVerticalAlignment = verticalAlignment ?? 'center'
  const resolvedHeight =
    height === '40'
      ? 'compact'
      : height === '80'
        ? 'immersive'
        : height === '60' || height === 'balanced'
          ? 'default'
          : (height ?? 'default')

  const resolvedAccentTitle = accentTitle?.trim() || undefined

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
    const resolvedVariant = button.variant ?? 'default'

    return label && link.href
      ? [
          {
            href: link.href,
            label,
            openInNewTab: link.openInNewTab,
            showArrow: Boolean(button.showArrow),
            variant: resolvedVariant,
          },
        ]
      : []
  })

  return (
    <section
      className={cn('relative isolate overflow-hidden', appearanceClasses.className)}
      // Over a dark overlay the section carries no background class, so buttons
      // need the brand-surface treatment declared explicitly.
      data-block-surface={eyebrowSurface === 'darkOverlay' ? 'brand' : undefined}
      data-hero-banner-background={appearanceClasses.background}
      data-hero-banner-block="true"
    >
      <div className="absolute inset-0">
        <Image fill alt={image.alt} className="object-cover" src={image.src} sizes="100vw" />
      </div>
      <div
        className={cn(
          'absolute inset-0',
          overlayClasses[resolvedThemeMode][resolvedOverlayStyle][resolvedOverlayDirection],
        )}
        data-hero-banner-overlay={resolvedOverlayStyle}
        data-hero-banner-overlay-direction={resolvedOverlayDirection}
        data-hero-banner-theme={resolvedThemeMode}
      />
      <div
        className={cn('relative mx-auto flex max-w-screen-2xl px-4', heightClasses[resolvedHeight])}
        data-hero-banner-height={resolvedHeight}
      >
        <div
          className={cn(
            'flex w-full',
            horizontalShellClasses[resolvedHorizontalAlignment],
            verticalShellClasses[resolvedVerticalAlignment],
          )}
          data-hero-banner-horizontal={resolvedHorizontalAlignment}
          data-hero-banner-vertical={resolvedVerticalAlignment}
        >
          <div
            className={cn(
              'flex w-full flex-col gap-8',
              contentWidthClasses[resolvedContentWidth],
              textAlignmentClasses[resolvedHorizontalAlignment],
            )}
            data-hero-banner-content-width={resolvedContentWidth}
          >
            <div className="flex flex-col gap-6">
              {eyebrow ? (
                <SectionEyebrow
                  className={cn('tracking-[0.28em]', textToneClasses[resolvedThemeMode].eyebrow)}
                  data-hero-banner-eyebrow="true"
                  surface={eyebrowSurface}
                  style={usesTextShadow ? heroTextShadowStyle : undefined}
                >
                  {eyebrow}
                </SectionEyebrow>
              ) : null}
              <h1
                className={cn(
                  'font-semibold tracking-tight text-balance',
                  titleSizeClasses[resolvedHeight],
                  textToneClasses[resolvedThemeMode].title,
                  titleWidthClasses[resolvedContentWidth],
                  constrainedItemAlignmentClasses[resolvedHorizontalAlignment],
                )}
                style={usesTextShadow ? heroTextShadowStyle : undefined}
              >
                {resolvedAccentTitle ? (
                  <>
                    <span className="block">{title}</span>
                    <em className="block">{resolvedAccentTitle}</em>
                  </>
                ) : (
                  title
                )}
              </h1>
              {description ? (
                <p
                  className={cn(
                    'text-balance',
                    descriptionSizeClasses[resolvedHeight],
                    descriptionWidthClasses[resolvedContentWidth],
                    textToneClasses[resolvedThemeMode].description,
                    constrainedItemAlignmentClasses[resolvedHorizontalAlignment],
                  )}
                  data-hero-banner-description="true"
                  style={usesTextShadow ? heroTextShadowStyle : undefined}
                >
                  {description}
                </p>
              ) : null}
            </div>
            {actions.length > 0 ? (
              <div
                className={cn(
                  'flex flex-col gap-3 sm:flex-row',
                  actionAlignmentClasses[resolvedHorizontalAlignment],
                )}
                data-hero-banner-actions="true"
              >
                {actions.map((action) =>
                  action.variant === 'link' ? (
                    <ContentLink
                      arrowStyle={usesTextShadow ? heroLinkArrowShadowStyle : undefined}
                      className={cn(
                        'w-full sm:w-auto',
                        textToneClasses[resolvedThemeMode].link,
                      )}
                      href={action.href}
                      key={`${action.label}-${action.href}`}
                      label={action.label}
                      openInNewTab={action.openInNewTab}
                      style={usesTextShadow ? heroTextShadowStyle : undefined}
                    />
                  ) : (
                    <Button
                      asChild
                      className="h-12 w-full sm:w-auto"
                      key={`${action.label}-${action.href}`}
                      size="lg"
                      variant={action.variant}
                    >
                      <a
                        href={action.href}
                        rel={action.openInNewTab ? 'noreferrer' : undefined}
                        target={action.openInNewTab ? '_blank' : undefined}
                      >
                        <ActionButtonContent label={action.label} showArrow={action.showArrow} />
                      </a>
                    </Button>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
