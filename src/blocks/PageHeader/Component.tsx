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
  resolveBannerActionPlacement,
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
import { BreadcrumbTrail } from '@/components/BreadcrumbTrail'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow, type SectionEyebrowSurface } from '@/components/SectionEyebrow'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { resolvePageHeaderBreadcrumbs, type ResolvedPageBreadcrumb } from '@/lib/pageBreadcrumbs'
import { cn } from '@/lib/utils'
import type { Media, PageHeaderBlock } from '@/payload-types'

type PageHeaderTopContent = 'breadcrumb' | 'eyebrow'

type PageHeaderBlockLike = {
  accentTitle?: string | null
  actionPlacement?: BannerActionPlacement | 'inline' | null
  actions?: CmsActionValue[] | null
  automaticBreadcrumbs?: ResolvedPageBreadcrumb[]
  appearance?: BlockAppearance | null
  backgroundImage?: string | number | Media | null
  breadcrumbMode?: PageHeaderBlock['breadcrumbMode'] | null
  breadcrumbs?: PageHeaderBlock['breadcrumbs']
  contentAlignment?: BannerContentAlignment | null
  contentWidth?: BannerContentWidth | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  height?: BannerHeight | null
  overlayDirection?: BannerOverlayDirection | null
  overlayStyle?: BannerOverlayStyle | null
  size?: RegularBlockSize | null
  subtitle?: string | null
  themeMode?: BannerThemeMode | null
  title?: string | null
  topContent?: PageHeaderTopContent | null
  variant?: 'banner' | 'minimal' | 'split' | null
}

const breadcrumbLinkClasses = {
  auto: 'text-primary-foreground hover:text-primary-foreground/80',
  dark: 'text-white hover:text-white/80',
  light: 'text-foreground hover:text-foreground/80',
} as const

export function PageHeaderBlockComponent({
  accentTitle,
  actionPlacement,
  actions,
  automaticBreadcrumbs,
  appearance,
  backgroundImage,
  breadcrumbMode,
  breadcrumbs,
  contentAlignment = 'left',
  contentWidth = 'default',
  eyebrow,
  footerActions,
  height = 'default',
  overlayDirection = 'leftToRight',
  overlayStyle = 'darker',
  size = 'default',
  subtitle,
  themeMode = 'dark',
  title,
  topContent,
  variant = 'minimal',
}: PageHeaderBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedAccentTitle = accentTitle?.trim() || undefined
  const resolvedActions = resolveCmsActions(actions)
  const resolvedAlignment = contentAlignment ?? 'left'
  const resolvedContentWidth = contentWidth ?? 'default'
  const resolvedDescription = subtitle?.trim()
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedHeight = height ?? 'default'
  const resolvedOverlayDirection = overlayDirection ?? 'leftToRight'
  const resolvedOverlayStyle = overlayStyle ?? 'darker'
  const resolvedPlacement =
    variant === 'split' ? 'side' : resolveBannerActionPlacement(actionPlacement)
  const resolvedSize = size ?? 'default'
  const resolvedThemeMode = themeMode ?? 'dark'
  const resolvedTopContent: PageHeaderTopContent =
    topContent ?? (resolvedEyebrow ? 'eyebrow' : 'breadcrumb')
  const resolvedVariant = variant === 'banner' ? 'banner' : 'minimal'
  const resolvedBreadcrumbs = resolvePageHeaderBreadcrumbs({
    automatic: automaticBreadcrumbs ?? [],
    breadcrumbMode,
    breadcrumbs,
  })

  const image =
    resolvedVariant === 'banner'
      ? getMediaImageProps({
          media: backgroundImage,
          preset: 'hero',
          fallbackAlt: resolvedTitle,
        })
      : null
  const hasImage = Boolean(image)
  const isBrandTone = hasImage && resolvedThemeMode === 'auto'
  const isDarkOverlay = hasImage && resolvedThemeMode === 'dark'
  const blockSurface = hasImage
    ? resolvedThemeMode === 'light'
      ? 'light'
      : 'brand'
    : appearanceClasses.surface
  const eyebrowSurface: SectionEyebrowSurface = isBrandTone
    ? 'brand'
    : isDarkOverlay
      ? 'darkOverlay'
      : appearanceClasses.background
  const titleToneClass = hasImage ? bannerTextToneClasses[resolvedThemeMode].title : undefined
  const descriptionToneClass = hasImage
    ? bannerTextToneClasses[resolvedThemeMode].description
    : 'text-current/70'
  const breadcrumbLinkClassName = hasImage
    ? breadcrumbLinkClasses[resolvedThemeMode]
    : appearanceClasses.surface === 'light'
      ? 'text-primary hover:text-primary/80'
      : 'text-current hover:text-current/80'
  const usesSideActions = resolvedPlacement === 'side' && resolvedActions.length > 0

  const topContentNode =
    resolvedTopContent === 'breadcrumb' && resolvedBreadcrumbs.length > 0 ? (
      <BreadcrumbTrail items={resolvedBreadcrumbs} linkClassName={breadcrumbLinkClassName} />
    ) : resolvedTopContent === 'eyebrow' && resolvedEyebrow ? (
      <SectionEyebrow surface={eyebrowSurface}>{resolvedEyebrow}</SectionEyebrow>
    ) : null

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden',
        !hasImage && appearanceClasses.className,
        hasImage && titleToneClass,
        regularBlockMobilePaddingClasses[resolvedSize],
      )}
      data-block-surface={blockSurface}
      data-page-header-variant={resolvedVariant}
    >
      {image ? (
        <>
          <div className="absolute inset-0 -z-10">
            <Image
              alt={image.alt}
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src={image.src}
            />
          </div>
          <div
            className={cn(
              'absolute inset-0 -z-10',
              bannerOverlayClasses[resolvedThemeMode][resolvedOverlayStyle][
                resolvedOverlayDirection
              ],
            )}
            data-page-header-overlay={resolvedOverlayStyle}
            data-page-header-overlay-direction={resolvedOverlayDirection}
            data-page-header-theme={resolvedThemeMode}
          />
        </>
      ) : null}

      <div
        className={cn(
          regularBlockContainerClasses,
          'flex flex-col justify-center gap-10',
          bannerHeightClasses[resolvedHeight],
          usesSideActions && 'lg:flex-row lg:items-center lg:justify-between lg:gap-16',
        )}
        data-page-header-action-placement={resolvedPlacement}
        data-page-header-height={resolvedHeight}
      >
        <div
          className={cn(
            'flex w-full min-w-0 flex-col gap-6',
            bannerContentWidthClasses[resolvedContentWidth],
            bannerAlignmentClasses[resolvedAlignment],
          )}
          data-page-header-content-alignment={resolvedAlignment}
          data-page-header-content-width={resolvedContentWidth}
          data-page-header-copy="true"
        >
          {topContentNode ? (
            <div data-page-header-top-content={resolvedTopContent}>{topContentNode}</div>
          ) : null}

          <h1
            className={cn(
              'font-semibold tracking-tight text-balance',
              bannerTitleSizeClasses[resolvedHeight],
              titleToneClass,
            )}
          >
            <span className="block font-[inherit]">{resolvedTitle}</span>
            {resolvedAccentTitle ? (
              <em className="block font-[inherit]">{resolvedAccentTitle}</em>
            ) : null}
          </h1>

          {resolvedDescription ? (
            <p
              className={cn('max-w-[60ch] text-base leading-7 text-balance', descriptionToneClass)}
              data-page-header-description="true"
            >
              {resolvedDescription}
            </p>
          ) : null}

          {!usesSideActions && resolvedActions.length > 0 ? (
            <ContentActions
              actions={resolvedActions}
              alignment={resolvedAlignment}
              data-page-header-actions="below"
            />
          ) : null}
        </div>

        {usesSideActions ? (
          <div
            className={cn(
              'flex w-full lg:w-auto lg:min-w-56',
              bannerActionAlignmentClasses[resolvedAlignment],
            )}
            data-page-header-actions="side"
          >
            <ContentActions
              actions={resolvedActions}
              alignment={resolvedAlignment}
              className="flex-col gap-3 sm:flex-col [&>*]:w-full"
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
