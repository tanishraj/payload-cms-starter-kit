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
import { ContentActions } from '@/components/ContentActions'
import type { ResolvedCmsAction } from '@/lib/cmsLinks'
import { cn } from '@/lib/utils'

export type ImageMosaicAlignment = 'center' | 'left' | 'right'
export type ImageMosaicImagePosition = 'bottom' | 'center' | 'left' | 'right' | 'top'
export type ImageMosaicSize = 'comfortable' | 'compact' | 'default'

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
  actions?: ReactNode
  alignment?: ImageMosaicAlignment
  appearance?: BlockAppearance | null
  className?: string
  description?: string | null
  eyebrow?: string | null
  items: ImageMosaicItem[]
  showImageOverlays?: boolean
  size?: ImageMosaicSize
  title?: string | null
}

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'mx-auto items-center text-center',
  right: 'ml-auto items-end text-right',
} as const

const sectionGapClasses = {
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
  compact: 'lg:auto-rows-[13rem]',
  default: 'lg:auto-rows-[15rem]',
  comfortable: 'lg:auto-rows-[17rem]',
} as const

const mobileTileHeightClasses = {
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
  actions,
  alignment = 'center',
  appearance,
  className,
  description,
  eyebrow,
  items,
  showImageOverlays = true,
  size = 'default',
  title,
}: ImageMosaicProps) {
  const visibleItems = items.slice(0, 8)

  if (!title?.trim() || visibleItems.length === 0) {
    return null
  }

  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const count = visibleItems.length as keyof typeof desktopGridClasses

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[size], appearanceClasses.className, className)}
      data-image-mosaic="true"
      data-image-mosaic-alignment={alignment}
      data-image-mosaic-background={appearance?.background ?? 'none'}
      data-image-mosaic-overlays={showImageOverlays ? 'shown' : 'hidden'}
      data-image-mosaic-size={size}
    >
      <div className={cn(regularBlockContainerClasses, 'flex flex-col', sectionGapClasses[size])}>
        <div className={cn('flex max-w-3xl flex-col gap-4', alignmentClasses[alignment])}>
          {eyebrow ? (
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
            {title}
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
                  <div className="image-mosaic-overlay absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/85 to-transparent p-5 pt-16 text-foreground">
                    <div
                      className="flex flex-col items-start gap-2"
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
                          data-image-mosaic-item-action="true"
                          mode={item.action.mode}
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
