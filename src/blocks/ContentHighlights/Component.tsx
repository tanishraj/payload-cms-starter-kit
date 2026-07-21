import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { ContentActions } from '@/components/ContentActions'
import {
  ContentHighlights,
  type ContentHighlightItem,
  type ContentHighlightsAlignment,
  type ContentHighlightsLayout,
  type ContentHighlightsSize,
  type ContentHighlightsSplitAlignment,
} from '@/components/content-highlights'
import {
  resolveCmsActions,
  resolveCmsLink,
  type CmsActionValue,
  type CmsLinkValue,
} from '@/lib/cmsLinks'

type ContentHighlightItemValue = Omit<CmsLinkValue, 'linkType'> & {
  description?: string | null
  linkType?: 'custom' | 'none' | 'page' | null
  metadata?: string | null
  title?: string | null
}

type ContentHighlightsBlockLike = {
  actionMode?: 'button' | 'link' | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: ContentHighlightsAlignment | null
  description?: string | null
  enableSplitLayout?: boolean | null
  eyebrow?: string | null
  items?: ContentHighlightItemValue[] | null
  layout?: ContentHighlightsLayout | null
  size?: ContentHighlightsSize | null
  splitContentAlignment?: ContentHighlightsSplitAlignment | null
  title?: string | null
}

export function ContentHighlightsBlockComponent({
  actionMode = 'link',
  actions,
  appearance,
  contentAlignment = 'left',
  description,
  enableSplitLayout = false,
  eyebrow,
  items,
  layout = 'highlightsGrid',
  size = 'default',
  splitContentAlignment = 'top',
  title,
}: ContentHighlightsBlockLike) {
  const resolvedTitle = title?.trim()
  const resolvedItems = (items ?? []).flatMap((item): ContentHighlightItem[] => {
    const itemTitle = item.title?.trim()

    if (!itemTitle) {
      return []
    }

    const destination = resolveCmsLink({
      linkType: item.linkType === 'none' ? null : item.linkType,
      openInNewTab: item.openInNewTab,
      page: item.page,
      url: item.url,
    })

    return [
      {
        description: item.description?.trim() || undefined,
        href: destination.href,
        metadata: item.metadata?.trim() || undefined,
        openInNewTab: destination.openInNewTab,
        title: itemTitle,
      },
    ]
  })

  if (!resolvedTitle || !resolvedItems.length) {
    return null
  }

  const resolvedLayout = layout ?? 'highlightsGrid'
  const resolvedActions = resolveCmsActions(actions)
  const resolvedAlignment = contentAlignment ?? 'left'
  const isSplit = enableSplitLayout === true
  const resolvedActionNode = resolvedActions.length ? (
    <ContentActions
      actions={resolvedActions}
      alignment={isSplit ? 'left' : resolvedAlignment}
      className={
        resolvedLayout === 'editorialRow' && !isSplit
          ? 'lg:w-auto lg:shrink-0 lg:items-end lg:justify-end'
          : undefined
      }
      data-content-highlights-actions="true"
      mode={actionMode ?? 'link'}
    />
  ) : null

  return (
    <ContentHighlights
      actions={resolvedActionNode}
      appearance={appearance}
      contentAlignment={resolvedAlignment}
      description={description?.trim() || undefined}
      enableSplitLayout={isSplit}
      eyebrow={eyebrow?.trim() || undefined}
      items={resolvedItems}
      layout={resolvedLayout}
      size={size ?? 'default'}
      splitContentAlignment={splitContentAlignment ?? 'top'}
      title={resolvedTitle}
    />
  )
}
