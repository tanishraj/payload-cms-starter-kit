import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import type { RegularBlockSize } from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { getMediaAbsoluteUrl, isMediaDoc } from '@/lib/media'
import { resolveCmsActions, type CmsActionValue, type CmsActionVariant } from '@/lib/cmsLinks'
import { getPageHref } from '@/lib/pagePaths'
import type { Media, Page } from '@/payload-types'

import { ProgramGridClient, type ResolvedProgram } from './ProgramGridClient'

type ProgramItem = {
  id?: string | null
  badge?: string | null
  category?: string | null
  cardBackground?: string | null
  description?: string | null
  duration?: string | null
  image?: unknown
  intake?: string | null
  linkType?: 'none' | 'page' | 'custom' | null
  openInNewTab?: boolean | null
  page?: unknown
  title?: string | null
  url?: string | null
}

type ProgramGridBlockLike = {
  actionMode?: 'button' | 'link' | null
  actionVariant?: CmsActionVariant | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  columns?: '2' | '3' | '4' | null
  contentAlignment?: 'left' | 'center' | null
  ctaLabel?: string | null
  description?: string | null
  eyebrow?: string | null
  programs?: ProgramItem[] | null
  showFilter?: boolean | null
  size?: RegularBlockSize | null
  title?: string | null
  viewMode?: 'grid' | 'list' | null
}

export function ProgramGridBlockComponent({
  actionMode,
  actionVariant,
  actions,
  appearance,
  columns,
  contentAlignment = 'center',
  ctaLabel = 'Learn More',
  description,
  eyebrow,
  programs,
  showFilter = false,
  size = 'default',
  title,
  viewMode = 'grid',
}: ProgramGridBlockLike) {
  const resolvedTitle = title?.trim()
  if (!resolvedTitle) return null

  const resolvedPrograms: ResolvedProgram[] = (programs ?? []).flatMap(
    (item, index): ResolvedProgram[] => {
      const itemTitle = item.title?.trim()
      if (!itemTitle) return []

      const media = item.image as Media | null | undefined
      const imageSrc = isMediaDoc(media) ? getMediaAbsoluteUrl(media) : undefined

      let ctaHref: string | undefined
      if (item.linkType === 'page') {
        ctaHref = getPageHref(item.page as Page | string | number | null | undefined)
      } else if (item.linkType === 'custom') {
        ctaHref = item.url?.trim() || undefined
      }

      return [
        {
          id: item.id ?? index,
          badge: item.badge?.trim() || undefined,
          cardBackground: item.cardBackground ?? undefined,
          category: item.category?.trim() || undefined,
          description: item.description?.trim() || undefined,
          duration: item.duration?.trim() || undefined,
          imageSrc,
          imageAlt: isMediaDoc(media) ? media.alt?.trim() || itemTitle : itemTitle,
          imageWidth:
            isMediaDoc(media) && typeof media.width === 'number' ? media.width : undefined,
          imageHeight:
            isMediaDoc(media) && typeof media.height === 'number' ? media.height : undefined,
          intake: item.intake?.trim() || undefined,
          title: itemTitle,
          ctaHref,
          ctaOpenInNewTab: item.openInNewTab ?? false,
        },
      ]
    },
  )

  if (resolvedPrograms.length === 0) return null

  const { className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const resolvedColumns = (Number(columns ?? '3') as 2 | 3 | 4) || 3
  const resolvedSectionActions = resolveCmsActions(actions)

  return (
    <ProgramGridClient
      actionMode={actionMode ?? 'link'}
      actionVariant={actionVariant ?? 'default'}
      appearance={appearanceClassName}
      columns={resolvedColumns}
      contentAlignment={contentAlignment ?? 'center'}
      ctaLabel={ctaLabel?.trim() || 'Learn More'}
      description={description?.trim() || undefined}
      eyebrow={eyebrow?.trim() || undefined}
      programs={resolvedPrograms}
      sectionActions={
        resolvedSectionActions.length > 0 ? (
          <ContentActions actions={resolvedSectionActions} />
        ) : undefined
      }
      sectionBackground={appearance?.background ?? 'none'}
      showFilter={showFilter ?? false}
      size={size ?? 'default'}
      title={resolvedTitle}
      viewMode={viewMode ?? 'grid'}
    />
  )
}
