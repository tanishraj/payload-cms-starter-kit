import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { ContentActions } from '@/components/ContentActions'
import {
  ContentHighlights,
  type ContentHighlightItem,
  type ContentHighlightsLayout,
  type ContentHighlightsSize,
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
  description?: string | null
  eyebrow?: string | null
  items?: ContentHighlightItemValue[] | null
  layout?: ContentHighlightsLayout | null
  size?: ContentHighlightsSize | null
  title?: string | null
}

export function ContentHighlightsBlockComponent({
  actionMode = 'link',
  actions,
  appearance,
  description,
  eyebrow,
  items,
  layout = 'highlightsGrid',
  size = 'default',
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

  return (
    <ContentHighlights
      actions={
        resolvedActions.length ? (
          <ContentActions
            actions={resolvedActions}
            alignment="left"
            className={
              resolvedLayout === 'editorialRow'
                ? 'lg:w-auto lg:shrink-0 lg:items-end lg:justify-end'
                : undefined
            }
            data-content-highlights-actions="true"
            mode={actionMode ?? 'link'}
          />
        ) : null
      }
      appearance={appearance}
      description={description?.trim() || undefined}
      eyebrow={eyebrow?.trim() || undefined}
      items={resolvedItems}
      layout={resolvedLayout}
      size={size ?? 'default'}
      title={resolvedTitle}
    />
  )
}
