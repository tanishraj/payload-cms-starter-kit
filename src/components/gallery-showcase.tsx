import type { ReactNode } from 'react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import {
  GalleryShowcaseFan,
  type GalleryShowcaseImage,
  type GalleryShowcaseImagePosition,
  type GalleryShowcaseSize,
} from '@/components/gallery-showcase-fan'
import { cn } from '@/lib/utils'

export type GalleryShowcaseAlignment = 'center' | 'left' | 'right'
export type { GalleryShowcaseImage, GalleryShowcaseImagePosition, GalleryShowcaseSize }

type GalleryShowcaseProps = {
  actions?: ReactNode
  alignment?: GalleryShowcaseAlignment
  appearance?: BlockAppearance | null
  className?: string
  description?: string | null
  eyebrow?: string | null
  images: GalleryShowcaseImage[]
  size?: GalleryShowcaseSize
  title: string
}

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'mx-auto items-center text-center',
  right: 'ml-auto items-end text-right',
} as const

export function GalleryShowcase({
  actions,
  alignment = 'center',
  appearance,
  className,
  description,
  eyebrow,
  images,
  size = 'default',
  title,
}: GalleryShowcaseProps) {
  if (images.length !== 5) {
    return null
  }

  const appearanceClasses = resolveBlockAppearanceClasses(appearance)

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[size], appearanceClasses.className, className)}
      data-gallery-showcase="true"
      data-gallery-showcase-alignment={alignment}
      data-gallery-showcase-background={appearance?.background ?? 'none'}
      data-gallery-showcase-size={size}
    >
      <div className={regularBlockContainerClasses}>
        <GalleryShowcaseFan images={images} size={size} />

        <div className={cn('flex max-w-3xl flex-col gap-4 mt-5', alignmentClasses[alignment])}>
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
      </div>
    </section>
  )
}
