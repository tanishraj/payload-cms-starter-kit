import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
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
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: ImageMosaicAlignment | null
  description?: string | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  items?: ImageMosaicItemValue[] | null
  showImageOverlays?: boolean | null
  size?: ImageMosaicSize | null
  title?: string | null
}

export function ImageMosaicBlockComponent({
  accentTitle,
  actions,
  appearance,
  contentAlignment = 'center',
  description,
  eyebrow,
  footerActions,
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
    <>
      <ImageMosaic
        accentTitle={accentTitle}
        actions={
          <ContentActions
            actions={resolveCmsActions(actions).slice(0, 2)}
            alignment={alignment}
            data-image-mosaic-actions="true"
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
      <BlockFooterActions actions={footerActions} />
    </>
  )
}
