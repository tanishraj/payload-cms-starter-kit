import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import type { RegularBlockSize } from '@/blocks/shared/blockSpacing'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import { ContentActions } from '@/components/ContentActions'
import {
  NewsEventsHighlights,
  type NewsEventsHighlightsAlignment,
} from '@/components/news-events/NewsEventsHighlights'
import type { CmsActionValue } from '@/lib/cmsLinks'
import { resolveCmsActions } from '@/lib/cmsLinks'
import type { PublicNewsEventCard } from '@/lib/newsEventsShared'

export type NewsEventsHighlightsBlockLike = {
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: NewsEventsHighlightsAlignment | null
  description?: string | null
  emptyStateMessage?: string | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  itemCount?: number | null
  size?: RegularBlockSize | null
  title?: string | null
}

type NewsEventsHighlightsBlockPresentationProps = NewsEventsHighlightsBlockLike & {
  items: PublicNewsEventCard[]
}

export function NewsEventsHighlightsBlockPresentation({
  actions,
  appearance,
  contentAlignment = 'left',
  description,
  emptyStateMessage,
  eyebrow,
  footerActions,
  items,
  size = 'default',
  title,
}: NewsEventsHighlightsBlockPresentationProps) {
  const resolvedTitle = title?.trim()

  if (!resolvedTitle) {
    return null
  }

  const resolvedAlignment = contentAlignment ?? 'left'
  const resolvedActions = resolveCmsActions(actions)

  return (
    <>
      <NewsEventsHighlights
        actions={
          resolvedActions.length ? (
            <ContentActions actions={resolvedActions} alignment="right" className="lg:w-auto" />
          ) : null
        }
        alignment={resolvedAlignment}
        appearance={appearance}
        description={description?.trim() || undefined}
        emptyStateMessage={emptyStateMessage?.trim() || undefined}
        eyebrow={eyebrow?.trim() || undefined}
        items={items}
        size={size ?? 'default'}
        title={resolvedTitle}
      />
      <BlockFooterActions actions={footerActions} />
    </>
  )
}
