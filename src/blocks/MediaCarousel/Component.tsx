import { resolveBlockAppearanceClasses, type BlockAppearance } from '@/blocks/shared/blockAppearance'
import type { RegularBlockSize } from '@/blocks/shared/blockSpacing'
import { getMediaAbsoluteUrl, isMediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'

import { MediaCarouselClient, type MediaCarouselItem } from './MediaCarouselClient'

type PageDoc = {
  publicUrlPreview?: string | null
  slug?: string | null
}

type MediaCarouselItemValue = {
  icon?: string | null
  linkType?: 'none' | 'page' | 'custom' | null
  media?: unknown
  openInNewTab?: boolean | null
  page?: unknown
  summary?: string | null
  title?: string | null
  url?: string | null
}

type MediaCarouselBlockLike = {
  appearance?: BlockAppearance | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  eyebrow?: string | null
  items?: MediaCarouselItemValue[] | null
  size?: RegularBlockSize | null
  title?: string | null
}

export function MediaCarouselBlockComponent({
  appearance,
  contentAlignment = 'center',
  description,
  eyebrow,
  items,
  size = 'default',
  title,
}: MediaCarouselBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const resolvedItems: MediaCarouselItem[] = (items ?? []).flatMap(
    (item): MediaCarouselItem[] => {
      const itemTitle = item.title?.trim()
      if (!itemTitle) return []

      const media = item.media as Media | null | undefined
      if (!isMediaDoc(media)) return []

      const src = getMediaAbsoluteUrl(media)
      if (!src) return []

      const mediaType =
        typeof media.mimeType === 'string' && media.mimeType.startsWith('video/')
          ? 'video'
          : 'image'

      let href: string | undefined
      if (item.linkType === 'page') {
        const pageDoc = item.page as PageDoc | null | undefined
        href = pageDoc?.publicUrlPreview ?? undefined
      } else if (item.linkType === 'custom') {
        href = item.url?.trim() || undefined
      }

      return [
        {
          id: media.id,
          mediaType,
          src,
          alt: media.alt?.trim() || itemTitle,
          width: typeof media.width === 'number' ? media.width : undefined,
          height: typeof media.height === 'number' ? media.height : undefined,
          icon: item.icon ?? undefined,
          title: itemTitle,
          summary: item.summary?.trim() || undefined,
          href,
          openInNewTab: item.openInNewTab ?? false,
        },
      ]
    },
  )

  if (resolvedItems.length === 0) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)

  return (
    <MediaCarouselClient
      appearance={appearanceClassName}
      contentAlignment={contentAlignment ?? 'center'}
      description={description?.trim() || undefined}
      eyebrow={eyebrow?.trim() || undefined}
      items={resolvedItems}
      size={size ?? 'default'}
      title={resolvedTitle}
    />
  )
}
