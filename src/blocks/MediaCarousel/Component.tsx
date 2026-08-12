import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import type { RegularBlockSize } from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { getMediaAbsoluteUrl, isMediaDoc } from '@/lib/media'
import { resolveCmsActions, type CmsActionValue, type CmsActionVariant } from '@/lib/cmsLinks'
import type { Media } from '@/payload-types'

import { MediaCarouselClient, type MediaCarouselItem } from './MediaCarouselClient'

type MediaCarouselItemValue = {
  actions?: CmsActionValue[] | null
  cardBackground?: string | null
  icon?: string | null
  media?: unknown
  summary?: string | null
  title?: string | null
}

type MediaCarouselBlockLike = {
  actionMode?: 'button' | 'link' | null
  actionVariant?: CmsActionVariant | null
  appearance?: BlockAppearance | null
  columns?: '2' | '3' | '4' | null
  contentAlignment?: 'left' | 'center' | null
  description?: string | null
  eyebrow?: string | null
  items?: MediaCarouselItemValue[] | null
  sectionActions?: CmsActionValue[] | null
  size?: RegularBlockSize | null
  title?: string | null
}

export function MediaCarouselBlockComponent({
  actionMode,
  actionVariant,
  appearance,
  columns,
  contentAlignment = 'center',
  description,
  eyebrow,
  items,
  sectionActions,
  size = 'default',
  title,
}: MediaCarouselBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const resolvedItems: MediaCarouselItem[] = (items ?? []).flatMap((item): MediaCarouselItem[] => {
    const itemTitle = item.title?.trim()
    if (!itemTitle) return []

    const media = item.media as Media | null | undefined
    if (!isMediaDoc(media)) return []

    const src = getMediaAbsoluteUrl(media)
    if (!src) return []

    const mediaType =
      typeof media.mimeType === 'string' && media.mimeType.startsWith('video/') ? 'video' : 'image'

    const resolvedActions = resolveCmsActions(item.actions)

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
        action: resolvedActions[0],
        cardBackground: item.cardBackground ?? undefined,
      },
    ]
  })

  if (resolvedItems.length === 0) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const resolvedColumns = (Number(columns ?? '3') as 2 | 3 | 4) || 3
  const resolvedSectionActions = resolveCmsActions(sectionActions)

  return (
    <MediaCarouselClient
      actionMode={actionMode ?? 'link'}
      actionVariant={actionVariant ?? 'default'}
      appearance={appearanceClassName}
      columns={resolvedColumns}
      contentAlignment={contentAlignment ?? 'center'}
      description={description?.trim() || undefined}
      eyebrow={eyebrow?.trim() || undefined}
      items={resolvedItems}
      sectionActions={
        resolvedSectionActions.length > 0 ? (
          <ContentActions actions={resolvedSectionActions} />
        ) : undefined
      }
      size={size ?? 'default'}
      title={resolvedTitle}
    />
  )
}
