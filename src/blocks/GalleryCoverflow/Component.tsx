import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps, isMediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'
import { cn } from '@/lib/utils'

import {
  GalleryCoverflowClient,
  type CoverflowImage,
  type CoverflowSurface,
} from './GalleryCoverflowClient'

type GalleryCoverflowAlignment = 'center' | 'left' | 'right'

type GalleryCoverflowBlockLike = {
  actionMode?: 'button' | 'link' | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: GalleryCoverflowAlignment | null
  description?: string | null
  eyebrow?: string | null
  images?: { image?: unknown }[] | null
  size?: RegularBlockSize | null
  title?: string | null
}

export function resolveGalleryCoverflowImages(
  images?: { image?: unknown }[] | null,
): CoverflowImage[] {
  return (images ?? []).flatMap((item): CoverflowImage[] => {
    const media = item.image as Media | number | string | null | undefined
    const image = getMediaImageProps({ media, preset: 'generic' })

    if (!image) {
      return []
    }

    return [
      {
        ...image,
        id: isMediaDoc(media) ? media.id : image.src,
      },
    ]
  })
}

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'mx-auto items-center text-center',
  right: 'ml-auto items-end text-right',
} as const

const actionAlignmentClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

export function GalleryCoverflowBlockComponent({
  actionMode = 'link',
  actions,
  appearance,
  contentAlignment = 'center',
  description,
  eyebrow,
  images,
  size = 'default',
  title,
}: GalleryCoverflowBlockLike) {
  const resolvedImages = resolveGalleryCoverflowImages(images)

  if (resolvedImages.length < 3) return null

  const alignment = contentAlignment ?? 'center'
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedActions = resolveCmsActions(actions).slice(0, 1)
  const surface = (appearance?.background ?? 'none') as CoverflowSurface

  return (
    <section
      className={cn(
        regularBlockMobilePaddingClasses[size ?? 'default'],
        appearanceClasses.className,
      )}
      data-gallery-coverflow="true"
      data-gallery-coverflow-alignment={alignment}
      data-gallery-coverflow-size={size ?? 'default'}
    >
      <div className={cn(regularBlockContainerClasses)}>
        <div className={cn('flex max-w-3xl flex-col gap-4', alignmentClasses[alignment])}>
          {eyebrow?.trim() ? (
            <SectionEyebrow surface={appearance?.background ?? 'none'}>
              {eyebrow.trim()}
            </SectionEyebrow>
          ) : null}
          {title?.trim() ? (
            <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
              {title.trim()}
            </h2>
          ) : null}
          {description?.trim() ? (
            <p className="text-base leading-7 text-balance text-current/70">{description.trim()}</p>
          ) : null}
        </div>
      </div>

      <GalleryCoverflowClient images={resolvedImages} surface={surface} />

      {resolvedActions.length > 0 ? (
        <div
          className={cn(
            regularBlockContainerClasses,
            'mt-4 flex',
            actionAlignmentClasses[alignment],
          )}
        >
          <ContentActions
            actions={resolvedActions}
            alignment={alignment}
            className="[&_[data-slot=button]]:rounded-full"
            mode={actionMode ?? 'link'}
          />
        </div>
      ) : null}
    </section>
  )
}
