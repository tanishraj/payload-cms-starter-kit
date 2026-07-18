import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { ContentActions } from '@/components/ContentActions'
import {
  GalleryShowcase,
  type GalleryShowcaseAlignment,
  type GalleryShowcaseImage,
  type GalleryShowcaseImagePosition,
  type GalleryShowcaseSize,
} from '@/components/gallery-showcase'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps, isMediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'

type GalleryShowcaseBlockLike = {
  actionMode?: 'button' | 'link' | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: GalleryShowcaseAlignment | null
  description?: string | null
  eyebrow?: string | null
  images?:
    | {
        image?: unknown
        imagePosition?: GalleryShowcaseImagePosition | null
      }[]
    | null
  size?: GalleryShowcaseSize | null
  title?: string | null
}

export function GalleryShowcaseBlockComponent({
  actionMode = 'link',
  actions,
  appearance,
  contentAlignment = 'center',
  description,
  eyebrow,
  images,
  size = 'default',
  title,
}: GalleryShowcaseBlockLike) {
  const resolvedTitle = title?.trim()
  const resolvedImages = (images ?? []).flatMap((item): GalleryShowcaseImage[] => {
    const media = item.image as Media | number | string | null | undefined
    const image = getMediaImageProps({ media, preset: 'generic' })

    if (!image) {
      return []
    }

    return [
      {
        ...image,
        id: isMediaDoc(media) ? media.id : image.src,
        imagePosition: item.imagePosition,
      },
    ]
  })

  if (!resolvedTitle || resolvedImages.length !== 5) {
    return null
  }

  const alignment = contentAlignment ?? 'center'

  return (
    <GalleryShowcase
      actions={
        <ContentActions
          actions={resolveCmsActions(actions).slice(0, 1)}
          alignment={alignment}
          data-gallery-showcase-actions="true"
          mode={actionMode ?? 'link'}
        />
      }
      alignment={alignment}
      appearance={appearance}
      description={description?.trim() || undefined}
      eyebrow={eyebrow?.trim() || undefined}
      images={resolvedImages}
      size={size ?? 'default'}
      title={resolvedTitle}
    />
  )
}
