export const NEWS_EVENT_CLASSIFICATIONS = [
  { adminLabel: 'News', label: 'News', tabLabel: 'News', value: 'news' },
  { adminLabel: 'Events', label: 'Event', tabLabel: 'Events', value: 'event' },
  { adminLabel: 'Notice', label: 'Notice', tabLabel: 'Notice', value: 'notice' },
  { adminLabel: 'Holiday', label: 'Holiday', tabLabel: 'Holiday', value: 'holiday' },
  {
    adminLabel: 'Achievements',
    label: 'Achievement',
    tabLabel: 'Achievements',
    value: 'achievement',
  },
  {
    adminLabel: 'Announcement',
    label: 'Announcement',
    tabLabel: 'Announcement',
    value: 'announcement',
  },
  { adminLabel: 'Others', label: 'Other', tabLabel: 'Others', value: 'other' },
] as const

export type NewsEventClassification = (typeof NEWS_EVENT_CLASSIFICATIONS)[number]['value']
export type NewsEventClassificationTab = 'all' | NewsEventClassification

const classificationValues = new Set<NewsEventClassification>(
  NEWS_EVENT_CLASSIFICATIONS.map(({ value }) => value),
)

export const NEWS_EVENT_CLASSIFICATION_TABS = [
  { label: 'All', value: 'all' },
  ...NEWS_EVENT_CLASSIFICATIONS.map(({ tabLabel, value }) => ({ label: tabLabel, value })),
] as const satisfies ReadonlyArray<{ label: string; value: NewsEventClassificationTab }>

const classificationLabels = Object.fromEntries(
  NEWS_EVENT_CLASSIFICATIONS.map(({ label, value }) => [value, label]),
) as Record<NewsEventClassification, string>

export function getNewsEventClassificationLabel(value?: string | null): string {
  return classificationLabels[normalizeNewsEventClassification(value)]
}

export function normalizeNewsEventClassification(value?: string | null): NewsEventClassification {
  return classificationValues.has(value as NewsEventClassification)
    ? (value as NewsEventClassification)
    : 'other'
}

export function isEventClassification(value?: string | null): boolean {
  return value === 'event'
}
