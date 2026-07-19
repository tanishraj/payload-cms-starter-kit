import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import type { RegularBlockSize } from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { NewsEventsHighlights } from '@/components/news-events/NewsEventsHighlights'
import type { CmsActionValue } from '@/lib/cmsLinks'
import { resolveCmsActions } from '@/lib/cmsLinks'
import type { PublicNewsEventCard } from '@/lib/newsEventsShared'

export type NewsEventsHighlightsBlockLike = {
  actionMode?: 'button' | 'link' | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  description?: string | null
  emptyStateMessage?: string | null
  eyebrow?: string | null
  itemCount?: number | null
  size?: RegularBlockSize | null
  title?: string | null
}

type NewsEventsHighlightsBlockPresentationProps = NewsEventsHighlightsBlockLike & {
  items: PublicNewsEventCard[]
}

export function NewsEventsHighlightsBlockPresentation({
  actionMode = 'link',
  actions,
  appearance,
  description,
  emptyStateMessage,
  eyebrow,
  items,
  size = 'default',
  title,
}: NewsEventsHighlightsBlockPresentationProps) {
  const resolvedTitle = title?.trim()

  if (!resolvedTitle) {
    return null
  }

  const resolvedActions = resolveCmsActions(actions)

  return (
    <NewsEventsHighlights
      actions={
        resolvedActions.length ? (
          <ContentActions actions={resolvedActions} alignment="left" mode={actionMode ?? 'link'} />
        ) : null
      }
      appearance={appearance}
      description={description?.trim() || undefined}
      emptyStateMessage={emptyStateMessage?.trim() || undefined}
      eyebrow={eyebrow?.trim() || undefined}
      items={items}
      size={size ?? 'default'}
      title={resolvedTitle}
    />
  )
}
