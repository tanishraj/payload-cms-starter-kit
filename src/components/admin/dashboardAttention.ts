export type DashboardWorkflowCollection = 'articles' | 'news-events' | 'pages' | 'reviews'

export type DashboardCountResult =
  | { status: 'available'; value: number }
  | { status: 'unavailable' }

export type DashboardAttentionItem = {
  href: string
  label: string
  result: DashboardCountResult
}

export type DashboardAttentionSummary = {
  displayValue: string
  rows: DashboardAttentionItem[]
  stateLabel: 'Count unavailable' | 'Needs attention' | 'Nothing waiting' | 'Partial count'
}

export async function settleDashboardCount(
  countPromise: Promise<{ totalDocs: number }>,
): Promise<DashboardCountResult> {
  try {
    const { totalDocs } = await countPromise
    return { status: 'available', value: totalDocs }
  } catch {
    return { status: 'unavailable' }
  }
}

export const buildInReviewAdminURL = (collection: DashboardWorkflowCollection): string =>
  `/admin/collections/${collection}?where[workflowState][equals]=in_review`

export const buildScheduledAdminURL = (
  collection: Exclude<DashboardWorkflowCollection, 'reviews'>,
  requestTime: string,
): string =>
  `/admin/collections/${collection}?where[and][0][scheduledPublishAt][exists]=true` +
  `&where[and][1][scheduledPublishAt][greater_than]=${encodeURIComponent(requestTime)}`

export function summarizeDashboardAttention(
  items: DashboardAttentionItem[],
): DashboardAttentionSummary {
  const available = items.filter(
    (item): item is DashboardAttentionItem & { result: { status: 'available'; value: number } } =>
      item.result.status === 'available',
  )
  const unavailable = items.filter((item) => item.result.status === 'unavailable')
  const knownTotal = available.reduce((total, item) => total + item.result.value, 0)
  const rows = items.filter(
    (item) => item.result.status === 'unavailable' || item.result.value > 0,
  )

  if (available.length === 0) {
    return { displayValue: '—', rows, stateLabel: 'Count unavailable' }
  }

  if (unavailable.length > 0) {
    return { displayValue: `${knownTotal}+`, rows, stateLabel: 'Partial count' }
  }

  return {
    displayValue: String(knownTotal),
    rows,
    stateLabel: knownTotal === 0 ? 'Nothing waiting' : 'Needs attention',
  }
}
