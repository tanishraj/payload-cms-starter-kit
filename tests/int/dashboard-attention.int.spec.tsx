import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DashboardWorkflowCard } from '@/components/admin/DashboardWorkflowCard'
import {
  buildInReviewAdminURL,
  buildScheduledAdminURL,
  settleDashboardCount,
  summarizeDashboardAttention,
  type DashboardAttentionItem,
} from '@/components/admin/dashboardAttention'

const item = (
  label: string,
  result: DashboardAttentionItem['result'],
  href = `/admin/collections/${label.toLowerCase()}`,
): DashboardAttentionItem => ({ href, label, result })

describe('dashboard attention model', () => {
  it('settles successful and failed counts without treating failure as zero', async () => {
    await expect(settleDashboardCount(Promise.resolve({ totalDocs: 3 }))).resolves.toEqual({
      status: 'available',
      value: 3,
    })
    await expect(settleDashboardCount(Promise.reject(new Error('offline')))).resolves.toEqual({
      status: 'unavailable',
    })
  })

  it('builds exact In Review and future Scheduled destinations', () => {
    const requestTime = '2026-08-24T12:30:00.000Z'

    expect(buildInReviewAdminURL('news-events')).toBe(
      '/admin/collections/news-events?where[workflowState][equals]=in_review',
    )
    expect(buildScheduledAdminURL('pages', requestTime)).toBe(
      '/admin/collections/pages?where[and][0][scheduledPublishAt][exists]=true' +
        '&where[and][1][scheduledPublishAt][greater_than]=2026-08-24T12%3A30%3A00.000Z',
    )
  })

  it('omits successful zero rows and sums known work', () => {
    expect(
      summarizeDashboardAttention([
        item('Pages', { status: 'available', value: 2 }),
        item('Articles', { status: 'available', value: 0 }),
        item('Reviews', { status: 'available', value: 4 }),
      ]),
    ).toEqual({
      displayValue: '6',
      rows: [
        item('Pages', { status: 'available', value: 2 }),
        item('Reviews', { status: 'available', value: 4 }),
      ],
      stateLabel: 'Needs attention',
    })
  })

  it('represents partial results as a lower bound', () => {
    expect(
      summarizeDashboardAttention([
        item('Pages', { status: 'available', value: 2 }),
        item('Articles', { status: 'unavailable' }),
        item('Reviews', { status: 'available', value: 0 }),
      ]),
    ).toEqual({
      displayValue: '2+',
      rows: [
        item('Pages', { status: 'available', value: 2 }),
        item('Articles', { status: 'unavailable' }),
      ],
      stateLabel: 'Partial count',
    })
  })

  it('distinguishes a complete failure from a successful empty state', () => {
    expect(
      summarizeDashboardAttention([
        item('Pages', { status: 'unavailable' }),
        item('Articles', { status: 'unavailable' }),
      ]),
    ).toMatchObject({ displayValue: '—', stateLabel: 'Count unavailable' })

    expect(
      summarizeDashboardAttention([
        item('Pages', { status: 'available', value: 0 }),
        item('Articles', { status: 'available', value: 0 }),
      ]),
    ).toEqual({ displayValue: '0', rows: [], stateLabel: 'Nothing waiting' })
  })
})

describe('DashboardWorkflowCard', () => {
  it('renders exact non-zero links without making the aggregate a link', () => {
    const html = renderToStaticMarkup(
      <DashboardWorkflowCard
        items={[
          item('Pages', { status: 'available', value: 2 }, '/admin/pages?review=true'),
          item('Articles', { status: 'available', value: 0 }, '/admin/articles?review=true'),
          item('Reviews', { status: 'available', value: 1 }, '/admin/reviews?review=true'),
        ]}
        label="In Review"
      />,
    )

    expect(html).toContain('<section')
    expect(html).toContain('>3<')
    expect(html).toContain('href="/admin/pages?review=true"')
    expect(html).toContain('href="/admin/reviews?review=true"')
    expect(html).not.toContain('href="/admin/articles?review=true"')
    expect(html.match(/<a /g)).toHaveLength(2)
  })

  it('renders a successful zero state without links', () => {
    const html = renderToStaticMarkup(
      <DashboardWorkflowCard
        items={[item('Pages', { status: 'available', value: 0 })]}
        label="Scheduled"
      />,
    )

    expect(html).toContain('Nothing waiting')
    expect(html).not.toContain('<a ')
  })

  it('renders unavailable rows as non-interactive status', () => {
    const html = renderToStaticMarkup(
      <DashboardWorkflowCard
        items={[
          item('Pages', { status: 'available', value: 2 }, '/admin/pages'),
          item('Articles', { status: 'unavailable' }, '/admin/articles'),
        ]}
        label="In Review"
      />,
    )

    expect(html).toContain('2+')
    expect(html).toContain('Partial count')
    expect(html).toContain('Articles')
    expect(html).toContain('Count unavailable')
    expect(html).not.toContain('href="/admin/articles"')
  })
})
