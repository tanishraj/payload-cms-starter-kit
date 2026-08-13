import Image from 'next/image'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow, type SectionEyebrowSurface } from '@/components/SectionEyebrow'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'

type BannerCtaAlignment = 'center' | 'left' | 'right'
type BannerCtaContentWidth = 'default' | 'narrow' | 'wide'
type BannerCtaHeight = 'compact' | 'default' | 'immersive'
type BannerCtaOverlayDirection = 'leftToRight' | 'rightToLeft' | 'vertical'
type BannerCtaOverlayStyle = 'dark' | 'darker' | 'light'
type BannerCtaPlacement = 'below' | 'side'
type BannerCtaThemeMode = 'auto' | 'dark' | 'light'

type BannerCtaBlockLike = {
  accentTitle?: string | null
  actionPlacement?: BannerCtaPlacement | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  backgroundImage?: unknown
  contentAlignment?: BannerCtaAlignment | null
  contentWidth?: BannerCtaContentWidth | null
  description?: string | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  height?: BannerCtaHeight | null
  overlayDirection?: BannerCtaOverlayDirection | null
  overlayStyle?: BannerCtaOverlayStyle | null
  size?: RegularBlockSize | null
  themeMode?: BannerCtaThemeMode | null
  title?: string | null
}

// `auto` tints with --primary so the scrim tracks the active theme; `light`
// tints with --background for a pale scrim under dark copy; `dark` tints with
// black so white copy stays readable in either mode.
const overlayClasses = {
  auto: {
    light: {
      vertical: 'bg-linear-to-b from-primary/72 via-primary/56 to-primary/78',
      leftToRight: 'bg-linear-to-r from-primary/72 via-primary/56 to-primary/78',
      rightToLeft: 'bg-linear-to-l from-primary/72 via-primary/56 to-primary/78',
    },
    dark: {
      vertical: 'bg-linear-to-b from-primary/86 via-primary/72 to-primary/88',
      leftToRight: 'bg-linear-to-r from-primary/86 via-primary/72 to-primary/88',
      rightToLeft: 'bg-linear-to-l from-primary/86 via-primary/72 to-primary/88',
    },
    // Weighted toward the copy edge so the image stays visible opposite it.
    darker: {
      vertical: 'bg-linear-to-b from-primary/95 via-primary/82 to-primary/45',
      leftToRight: 'bg-linear-to-r from-primary/95 via-primary/82 to-primary/45',
      rightToLeft: 'bg-linear-to-l from-primary/95 via-primary/82 to-primary/45',
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
      vertical: 'bg-linear-to-b from-background/94 via-background/80 to-background/40',
      leftToRight: 'bg-linear-to-r from-background/94 via-background/80 to-background/40',
      rightToLeft: 'bg-linear-to-l from-background/94 via-background/80 to-background/40',
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
    // Weighted toward the copy edge so the image stays visible opposite it.
    darker: {
      vertical: 'bg-linear-to-b from-black/86 via-black/70 to-black/34',
      leftToRight: 'bg-linear-to-r from-black/86 via-black/70 to-black/34',
      rightToLeft: 'bg-linear-to-l from-black/86 via-black/70 to-black/34',
    },
  },
} as const

const textToneClasses = {
  auto: { title: 'text-primary-foreground', description: 'text-primary-foreground/84' },
  light: { title: 'text-foreground', description: 'text-foreground/84' },
  dark: { title: 'text-white', description: 'text-white/84' },
} as const

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
} as const

const actionAlignmentClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

const contentWidthClasses = {
  narrow: 'max-w-xl',
  default: 'max-w-2xl',
  wide: 'max-w-4xl',
} as const

const titleSizeClasses = {
  compact: 'text-3xl sm:text-4xl md:text-5xl',
  default: 'text-4xl sm:text-5xl md:text-6xl',
  immersive: 'text-4xl sm:text-6xl md:text-7xl',
} as const

const heightClasses = {
  compact: 'min-h-[32dvh]',
  default: 'min-h-[46dvh]',
  immersive: 'min-h-[68dvh]',
} as const

export function BannerCtaBlockComponent({
  accentTitle,
  actionPlacement = 'side',
  actions,
  appearance,
  backgroundImage,
  contentAlignment = 'left',
  contentWidth = 'default',
  description,
  eyebrow,
  footerActions,
  height = 'default',
  overlayDirection = 'leftToRight',
  overlayStyle = 'darker',
  size = 'default',
  themeMode = 'dark',
  title,
}: BannerCtaBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedAccentTitle = accentTitle?.trim() || undefined
  const resolvedActions = resolveCmsActions(actions)
  const resolvedAlignment = contentAlignment ?? 'left'
  const resolvedContentWidth = contentWidth ?? 'default'
  const resolvedDescription = description?.trim()
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedHeight = height ?? 'default'
  const resolvedOverlayDirection = overlayDirection ?? 'leftToRight'
  const resolvedOverlayStyle = overlayStyle ?? 'darker'
  const resolvedPlacement = actionPlacement ?? 'side'
  const resolvedSize = size ?? 'default'
  const resolvedThemeMode = themeMode ?? 'dark'

  const image = getMediaImageProps({
    media: backgroundImage as never,
    preset: 'hero',
    fallbackAlt: resolvedTitle,
  })

  // `auto` paints the section in --primary, making it a brand surface.
  const isBrandTone = resolvedThemeMode === 'auto'
  const isDarkOverlay = resolvedThemeMode === 'dark'
  const eyebrowSurface: SectionEyebrowSurface = isBrandTone
    ? 'brand'
    : isDarkOverlay
      ? 'darkOverlay'
      : appearanceClasses.background
  // Copy sits on the image rather than a background class, so the brand-surface
  // button treatment has to be declared explicitly. The auto and dark scrims
  // both carry light copy, so both need it.
  const blockSurface = isBrandTone || isDarkOverlay ? 'brand' : undefined
  const isSideColumn = resolvedPlacement === 'side'

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden',
        !image && appearanceClasses.className,
        regularBlockMobilePaddingClasses[resolvedSize],
      )}
      data-banner-cta-background={appearanceClasses.background}
      data-banner-cta-block="true"
      data-banner-cta-placement={resolvedPlacement}
      data-block-surface={blockSurface}
    >
      {image ? (
        <>
          <div className="absolute inset-0 -z-10">
            <Image alt={image.alt} className="object-cover" fill sizes="100vw" src={image.src} />
          </div>
          <div
            className={cn(
              'absolute inset-0 -z-10',
              overlayClasses[resolvedThemeMode][resolvedOverlayStyle][resolvedOverlayDirection],
            )}
            data-banner-cta-overlay={resolvedOverlayStyle}
            data-banner-cta-overlay-direction={resolvedOverlayDirection}
            data-banner-cta-theme={resolvedThemeMode}
          />
        </>
      ) : null}

      <div
        className={cn(
          regularBlockContainerClasses,
          'flex flex-col justify-center gap-10',
          heightClasses[resolvedHeight],
          // The side column only splits off once there is room for two columns.
          isSideColumn && 'lg:flex-row lg:items-center lg:justify-between lg:gap-16',
        )}
        data-banner-cta-height={resolvedHeight}
      >
        <div
          className={cn(
            'flex w-full flex-col gap-6',
            contentWidthClasses[resolvedContentWidth],
            alignmentClasses[resolvedAlignment],
          )}
          data-banner-cta-content="true"
          data-banner-cta-content-width={resolvedContentWidth}
        >
          {resolvedEyebrow ? (
            <SectionEyebrow className="tracking-[0.28em]" surface={eyebrowSurface}>
              {resolvedEyebrow}
            </SectionEyebrow>
          ) : null}

          <h2
            className={cn(
              'font-semibold tracking-tight text-balance',
              titleSizeClasses[resolvedHeight],
              textToneClasses[resolvedThemeMode].title,
            )}
          >
            <span className="block font-[inherit]">{resolvedTitle}</span>
            {resolvedAccentTitle ? (
              <em className="block font-[inherit]">{resolvedAccentTitle}</em>
            ) : null}
          </h2>

          {resolvedDescription ? (
            <p
              className={cn(
                'max-w-[60ch] text-base leading-7 text-balance',
                textToneClasses[resolvedThemeMode].description,
              )}
              data-banner-cta-description="true"
            >
              {resolvedDescription}
            </p>
          ) : null}

          {!isSideColumn && resolvedActions.length > 0 ? (
            <ContentActions
              actions={resolvedActions}
              alignment={resolvedAlignment}
              data-banner-cta-actions="true"
            />
          ) : null}
        </div>

        {isSideColumn && resolvedActions.length > 0 ? (
          <div
            className={cn('flex w-full lg:w-auto lg:min-w-56', actionAlignmentClasses[resolvedAlignment])}
            data-banner-cta-action-column="true"
          >
            {/* Forced to a column so each action fills the rail at any width. */}
            <ContentActions
              actions={resolvedActions}
              alignment={resolvedAlignment}
              className="flex-col gap-3 sm:flex-col [&>*]:w-full"
              data-banner-cta-actions="true"
            />
          </div>
        ) : null}
      </div>

      {footerActions?.length ? (
        <div className={regularBlockContainerClasses}>
          <BlockFooterActions actions={footerActions} alignment={resolvedAlignment} />
        </div>
      ) : null}
    </section>
  )
}
