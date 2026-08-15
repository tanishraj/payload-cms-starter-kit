import type { BlockAppearance } from '@/blocks/shared/blockAppearance'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import { ContentActions } from '@/components/ContentActions'
import {
  ContentHighlights,
  type ContentHighlightItem,
  type ContentHighlightsAlignment,
  type ContentHighlightsHeaderLayout,
  type ContentHighlightsLayout,
  type ContentHighlightsSize,
  type ContentHighlightsSplitAlignment,
} from '@/components/content-highlights'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'

type ContentHighlightItemValue = {
  cardAction?: CmsActionValue[] | null
  cardBackground?: string | null
  description?: string | null
  markerLabel?: string | null
  markerMode?: 'custom' | 'hidden' | 'numbered' | null
  title?: string | null
}

type ContentHighlightsBlockLike = {
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: ContentHighlightsAlignment | null
  description?: string | null
  enableSplitLayout?: boolean | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  headerLayout?: ContentHighlightsHeaderLayout | null
  items?: ContentHighlightItemValue[] | null
  layout?: ContentHighlightsLayout | 'numberedSteps' | null
  size?: ContentHighlightsSize | null
  splitContentAlignment?: ContentHighlightsSplitAlignment | null
  title?: string | null
}

export function ContentHighlightsBlockComponent({
  accentTitle,
  actions,
  appearance,
  contentAlignment = 'left',
  description,
  enableSplitLayout = false,
  eyebrow,
  footerActions,
  headerLayout,
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

    const markerMode =
      item.markerMode === 'custom' || item.markerMode === 'hidden' ? item.markerMode : 'numbered'

    return [
      {
        cardAction: resolveCmsActions(item.cardAction)[0],
        cardBackground: item.cardBackground,
        description: item.description?.trim() || undefined,
        markerLabel: markerMode === 'custom' ? item.markerLabel?.trim() || undefined : undefined,
        markerMode,
        title: itemTitle,
      },
    ]
  })

  if (!resolvedTitle || !resolvedItems.length) {
    return null
  }

  const resolvedLayout: ContentHighlightsLayout =
    layout === 'editorialRow' || layout === 'simpleGrid' ? layout : 'highlightsGrid'
  const resolvedActions = resolveCmsActions(actions)
  const resolvedAlignment: ContentHighlightsAlignment =
    contentAlignment === 'center' || contentAlignment === 'right' ? contentAlignment : 'left'
  const resolvedHeaderLayout: ContentHighlightsHeaderLayout =
    headerLayout === 'split' || headerLayout === 'stacked'
      ? headerLayout
      : enableSplitLayout === true
        ? 'split'
        : 'stacked'
  const resolvedActionNode = resolvedActions.length ? (
    <ContentActions
      actions={resolvedActions}
      alignment={resolvedHeaderLayout === 'split' ? 'left' : resolvedAlignment}
      data-content-highlights-actions="true"
    />
  ) : null

  return (
    <>
      <ContentHighlights
        accentTitle={accentTitle?.trim() || undefined}
        actions={resolvedActionNode}
        appearance={appearance}
        contentAlignment={resolvedAlignment}
        description={description?.trim() || undefined}
        eyebrow={eyebrow?.trim() || undefined}
        headerLayout={resolvedHeaderLayout}
        items={resolvedItems}
        layout={resolvedLayout}
        size={size ?? 'default'}
        splitContentAlignment={splitContentAlignment ?? 'top'}
        title={resolvedTitle}
      />
      <BlockFooterActions
        actions={footerActions}
        alignment={resolvedHeaderLayout === 'split' ? 'left' : resolvedAlignment}
      />
    </>
  )
}
