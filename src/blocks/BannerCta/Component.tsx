import Image from 'next/image'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  bannerActionAlignmentClasses,
  bannerAlignmentClasses,
  bannerContentWidthClasses,
  bannerHeightClasses,
  bannerOverlayClasses,
  bannerTextToneClasses,
  bannerTitleSizeClasses,
  type BannerActionPlacement,
  type BannerContentAlignment,
  type BannerContentWidth,
  type BannerHeight,
  type BannerOverlayDirection,
  type BannerOverlayStyle,
  type BannerThemeMode,
} from '@/blocks/shared/bannerCtaPresentation'
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

type BannerCtaBlockLike = {
  accentTitle?: string | null
  actionPlacement?: BannerActionPlacement | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  backgroundImage?: unknown
  contentAlignment?: BannerContentAlignment | null
  contentWidth?: BannerContentWidth | null
  description?: string | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  height?: BannerHeight | null
  overlayDirection?: BannerOverlayDirection | null
  overlayStyle?: BannerOverlayStyle | null
  size?: RegularBlockSize | null
  themeMode?: BannerThemeMode | null
  title?: string | null
}

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
        image && bannerTextToneClasses[resolvedThemeMode].title,
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
              bannerOverlayClasses[resolvedThemeMode][resolvedOverlayStyle][
                resolvedOverlayDirection
              ],
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
          bannerHeightClasses[resolvedHeight],
          // The side column only splits off once there is room for two columns.
          isSideColumn && 'lg:flex-row lg:items-center lg:justify-between lg:gap-16',
        )}
        data-banner-cta-height={resolvedHeight}
      >
        <div
          className={cn(
            'flex w-full flex-col gap-6',
            bannerContentWidthClasses[resolvedContentWidth],
            bannerAlignmentClasses[resolvedAlignment],
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
              bannerTitleSizeClasses[resolvedHeight],
              bannerTextToneClasses[resolvedThemeMode].title,
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
                bannerTextToneClasses[resolvedThemeMode].description,
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
            className={cn(
              'flex w-full lg:w-auto lg:min-w-56',
              bannerActionAlignmentClasses[resolvedAlignment],
            )}
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
