import {
  NEWS_EVENT_CLASSIFICATIONS,
  type NewsEventClassification,
  type NewsEventClassificationTab,
} from '@/lib/newsEventClassifications'

export type NewsEventsTabsConfiguredTab = {
  classification?: string | null
  label?: string | null
}

export type NewsEventsTabsResolvedTab = {
  label: string
  value: NewsEventClassificationTab
}

export const NEWS_EVENTS_TABS_DEFAULT_CONFIGURED_TABS = NEWS_EVENT_CLASSIFICATIONS.map(
  ({ tabLabel, value }) => ({ classification: value, label: tabLabel }),
) satisfies Array<{ classification: NewsEventClassification; label: string }>

const classificationValues = new Set<string>(NEWS_EVENT_CLASSIFICATIONS.map(({ value }) => value))

function isNewsEventClassification(value: unknown): value is NewsEventClassification {
  return typeof value === 'string' && classificationValues.has(value)
}

export function validateNewsEventsTabsConfiguredTabs(value: unknown): true | string {
  if (!Array.isArray(value)) return true

  const seen = new Set<string>()

  for (const row of value) {
    if (!row || typeof row !== 'object') continue

    const classification = (row as NewsEventsTabsConfiguredTab).classification
    if (!classification) continue
    if (seen.has(classification)) return 'Each classification can only be added once.'

    seen.add(classification)
  }

  return true
}

export function resolveNewsEventsTabs(
  allTabLabel?: string | null,
  tabs?: NewsEventsTabsConfiguredTab[] | null,
): NewsEventsTabsResolvedTab[] {
  const resolved: NewsEventsTabsResolvedTab[] = [
    { label: allTabLabel?.trim() || 'All', value: 'all' },
  ]
  const configured = tabs == null ? NEWS_EVENTS_TABS_DEFAULT_CONFIGURED_TABS : tabs
  const seen = new Set<NewsEventClassification>()

  for (const tab of configured) {
    const classification = tab?.classification
    const label = tab?.label?.trim()

    if (!isNewsEventClassification(classification) || !label || seen.has(classification)) continue

    seen.add(classification)
    resolved.push({ label, value: classification })
  }

  return resolved
}

export const NEWS_EVENTS_TABS_DEFAULT_ITEMS_PER_TAB = 6
export const NEWS_EVENTS_TABS_DEFAULT_LOAD_MORE_LABEL = 'Load More'

export const NEWS_EVENTS_TABS_ITEM_VALUES = ['3', '6', '9', '12'] as const

export type NewsEventsTabsItemsPerTabValue = (typeof NEWS_EVENTS_TABS_ITEM_VALUES)[number]
export type NewsEventsTabsItemsPerTab = 3 | 6 | 9 | 12
export type NewsEventsTabsCardsPerRow = '2' | '3' | '4'

const gridClassesByCardsPerRow = {
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  '4': 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
} as const satisfies Record<NewsEventsTabsCardsPerRow, string>

export function normalizeNewsEventsTabsItemsPerTab(
  value?: number | string | null,
): NewsEventsTabsItemsPerTab {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : value

  return isNewsEventsTabsItemsPerTab(parsed) ? parsed : NEWS_EVENTS_TABS_DEFAULT_ITEMS_PER_TAB
}

export function isNewsEventsTabsItemsPerTab(value: unknown): value is NewsEventsTabsItemsPerTab {
  return value === 3 || value === 6 || value === 9 || value === 12
}

export function resolveNewsEventsTabsLoadMoreLabel(value?: string | null): string {
  return value?.trim() || NEWS_EVENTS_TABS_DEFAULT_LOAD_MORE_LABEL
}

export function normalizeNewsEventsTabsCardsPerRow(
  value?: string | null,
): NewsEventsTabsCardsPerRow {
  return value === '2' || value === '4' ? value : '3'
}

export function getNewsEventsTabsGridClasses(value?: string | null): string {
  return gridClassesByCardsPerRow[normalizeNewsEventsTabsCardsPerRow(value)]
}
