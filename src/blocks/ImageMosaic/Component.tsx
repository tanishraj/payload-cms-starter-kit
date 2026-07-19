import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { ContentActions } from '@/components/ContentActions'
import {
  ImageMosaic,
  type ImageMosaicAlignment,
  type ImageMosaicImagePosition,
  type ImageMosaicItem,
  type ImageMosaicSize,
} from '@/components/image-mosaic'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps, isMediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'

type ImageMosaicActionValue = CmsActionValue & {
  mode?: 'button' | 'link' | null
}

type ImageMosaicItemValue = {
  action?: ImageMosaicActionValue[] | null
  image?: unknown
  imagePosition?: ImageMosaicImagePosition | null
  title?: string | null
}

type ImageMosaicBlockLike = {
  actionMode?: 'button' | 'link' | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: ImageMosaicAlignment | null
  description?: string | null
  eyebrow?: string | null
  items?: ImageMosaicItemValue[] | null
  showImageOverlays?: boolean | null
  size?: ImageMosaicSize | null
  title?: string | null
}

export function ImageMosaicBlockComponent({
  actionMode = 'link',
  actions,
  appearance,
  contentAlignment = 'center',
  description,
  eyebrow,
  items,
  showImageOverlays = true,
  size = 'default',
  title,
}: ImageMosaicBlockLike) {
  const resolvedTitle = title?.trim()

  if (!resolvedTitle) {
    return null
  }

  const resolvedItems = (items ?? [])
    .flatMap((item): ImageMosaicItem[] => {
      const itemTitle = item.title?.trim()
      const media = item.image as Media | number | string | null | undefined
      const image = getMediaImageProps({
        fallbackAlt: itemTitle,
        media,
        preset: 'generic',
      })

      if (!image) {
        return []
      }

      const actionValue = item.action?.[0]
      const resolvedAction = resolveCmsActions(actionValue ? [actionValue] : [])[0]

      return [
        {
          id: isMediaDoc(media) ? media.id : image.src,
          image,
          imagePosition: item.imagePosition ?? 'center',
          action: resolvedAction
            ? {
                ...resolvedAction,
                mode: actionValue?.mode ?? 'link',
              }
            : undefined,
          title: itemTitle,
        },
      ]
    })
    .slice(0, 8)

  if (resolvedItems.length === 0) {
    return null
  }

  const alignment = contentAlignment ?? 'center'

  return (
    <ImageMosaic
      actions={
        <ContentActions
          actions={resolveCmsActions(actions).slice(0, 2)}
          alignment={alignment}
          data-image-mosaic-actions="true"
          mode={actionMode ?? 'link'}
        />
      }
      alignment={alignment}
      appearance={appearance}
      description={description?.trim() || undefined}
      eyebrow={eyebrow?.trim() || undefined}
      items={resolvedItems}
      showImageOverlays={showImageOverlays ?? true}
      size={size ?? 'default'}
      title={resolvedTitle}
    />
  )
}
