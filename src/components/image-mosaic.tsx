import type { ReactNode } from 'react'
import Image from 'next/image'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import {
  resolveMediaOverlay,
  type MediaOverlayCoverage,
  type MediaOverlayDirection,
  type MediaOverlayStrength,
  type MediaOverlayTone,
} from '@/blocks/shared/mediaOverlayPresentation'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import type { ResolvedCmsAction } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

export type ImageMosaicAlignment = 'center' | 'left' | 'right'
export type ImageMosaicImagePosition = 'bottom' | 'center' | 'left' | 'right' | 'top'
export type ImageMosaicSize = 'none' | 'comfortable' | 'compact' | 'default'

export type ImageMosaicItem = {
  action?: ResolvedCmsAction & {
    mode: 'button' | 'link'
  }
  id: number | string
  image: {
    alt: string
    height?: number
    src: string
    width?: number
  }
  imagePosition?: ImageMosaicImagePosition | null
  title?: string | null
}

type ImageMosaicProps = {
  accentTitle?: string | null
  actions?: ReactNode
  alignment?: ImageMosaicAlignment
  appearance?: BlockAppearance | null
  className?: string
  description?: string | null
  eyebrow?: string | null
  items: ImageMosaicItem[]
  overlayCoverage?: MediaOverlayCoverage
  overlayDirection?: MediaOverlayDirection
  overlayStyle?: MediaOverlayStrength
  showImageOverlays?: boolean
  size?: ImageMosaicSize
  themeMode?: MediaOverlayTone
  title?: string | null
}

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'mx-auto items-center text-center',
  right: 'ml-auto items-end text-right',
} as const

const sectionGapClasses = {
  none: 'gap-10',
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const

const desktopGridClasses = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-4',
  6: 'lg:grid-cols-4',
  7: 'lg:grid-cols-4',
  8: 'lg:grid-cols-4',
} as const

const gridRowClasses = {
  none: 'lg:auto-rows-[15rem]',
  compact: 'lg:auto-rows-[13rem]',
  default: 'lg:auto-rows-[15rem]',
  comfortable: 'lg:auto-rows-[17rem]',
} as const

const mobileTileHeightClasses = {
  none: 'h-60 md:h-64 lg:h-full',
  compact: 'h-52 md:h-56 lg:h-full',
  default: 'h-60 md:h-64 lg:h-full',
  comfortable: 'h-68 md:h-72 lg:h-full',
} as const

const objectPositionClasses = {
  center: 'object-[center_center]',
  top: 'object-[center_top]',
  bottom: 'object-[center_bottom]',
  left: 'object-[left_center]',
  right: 'object-[right_center]',
} as const

const mosaicSpanClasses = [
  '',
  'lg:col-span-2',
  'lg:row-span-2',
  'lg:col-span-2',
  '',
  'lg:col-span-2',
  '',
  '',
] as const

export function ImageMosaic({
  accentTitle,
  actions,
  alignment = 'center',
  appearance,
  className,
  description,
  eyebrow,
  items,
  overlayCoverage = 'full',
  overlayDirection = 'bottomToTop',
  overlayStyle = 'dark',
  showImageOverlays = true,
  size = 'default',
  themeMode = 'auto',
  title,
}: ImageMosaicProps) {
  const visibleItems = items.slice(0, 8)

  if (!title?.trim() || visibleItems.length === 0) {
    return null
  }

  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const overlay = resolveMediaOverlay({
    coverage: overlayCoverage,
    direction: overlayDirection,
    sectionBackground: appearanceClasses.background,
    strength: overlayStyle,
    tone: themeMode,
  })
  const resolvedAccentTitle = accentTitle?.trim() || undefined
  const count = visibleItems.length as keyof typeof desktopGridClasses

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[size], appearanceClasses.className, className)}
      data-image-mosaic="true"
      data-image-mosaic-alignment={alignment}
      data-image-mosaic-background={appearance?.background ?? 'none'}
      data-image-mosaic-overlay-coverage={overlay.coverage}
      data-image-mosaic-overlay-direction={overlay.direction}
      data-image-mosaic-overlay-strength={overlay.strength}
      data-image-mosaic-overlay-tone={overlay.tone}
      data-image-mosaic-overlays={showImageOverlays ? 'shown' : 'hidden'}
      data-image-mosaic-size={size}
    >
      <div className={cn(regularBlockContainerClasses, 'flex flex-col', sectionGapClasses[size])}>
        <div className={cn('flex max-w-3xl flex-col gap-4', alignmentClasses[alignment])}>
          {eyebrow ? (
            <SectionEyebrow surface={appearance?.background ?? 'none'}>{eyebrow}</SectionEyebrow>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
            {resolvedAccentTitle ? (
              <>
                <span className="block font-[inherit]">{title}</span>
                <em className="block font-[inherit]">{resolvedAccentTitle}</em>
              </>
            ) : (
              title
            )}
          </h2>
          {description ? (
            <p className="text-base leading-7 text-balance text-current/70">{description}</p>
          ) : null}
          {actions}
        </div>

        <div
          className={cn(
            'grid grid-flow-dense grid-cols-1 gap-2.5 overflow-hidden md:grid-cols-2',
            desktopGridClasses[count],
            gridRowClasses[size],
          )}
          data-image-mosaic-count={count}
        >
          {visibleItems.map((item, index) => {
            const position = item.imagePosition ?? 'center'
            const resolvedTitle = item.title?.trim()
            const hasOverlay = showImageOverlays && Boolean(resolvedTitle || item.action)
            const tileClassName = cn(
              'relative overflow-hidden rounded-md border border-border',
              mobileTileHeightClasses[size],
              count >= 5 ? mosaicSpanClasses[index] : '',
            )
            const imageClassName = cn('size-full object-cover', objectPositionClasses[position])
            const itemKey = `${item.id}-${index}`

            return (
              <div
                className={cn(tileClassName, hasOverlay ? 'group/image-mosaic' : undefined)}
                data-image-mosaic-item={index + 1}
                key={itemKey}
              >
                <Image
                  alt={item.image.alt}
                  className={cn(imageClassName, hasOverlay ? 'image-mosaic-image' : undefined)}
                  draggable={false}
                  height={item.image.height}
                  src={item.image.src}
                  width={item.image.width}
                />
                {hasOverlay ? (
                  <div className="image-mosaic-overlay absolute inset-0">
                    <div
                      className={cn(
                        'pointer-events-none absolute',
                        overlay.frameClassName,
                        overlay.className,
                      )}
                    />
                    <div
                      className={cn(
                        'absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5',
                        overlay.text.title,
                      )}
                      data-block-surface={overlay.blockSurface}
                      data-image-mosaic-overlay="true"
                    >
                      {resolvedTitle ? (
                        <p className="text-base leading-tight font-semibold text-current">
                          {resolvedTitle}
                        </p>
                      ) : null}
                      {item.action ? (
                        <ContentActions
                          actions={[item.action]}
                          alignment="left"
                          className={cn(overlay.text.link, '[&_[data-content-link]]:text-current')}
                          data-image-mosaic-item-action="true"
                        />
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
