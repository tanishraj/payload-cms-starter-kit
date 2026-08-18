import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { NewsEventClassificationBadge } from '@/components/news-events/NewsEventClassificationBadge'
import { NewsEventDateMeta } from '@/components/news-events/NewsEventDateMeta'
import {
  NEWS_EVENT_CLASSIFICATIONS,
  normalizeNewsEventClassification,
} from '@/lib/newsEventClassifications'

describe('News & Events classification and date metadata', () => {
  it('normalizes supported classifications and falls back to Other', () => {
    expect(normalizeNewsEventClassification('event')).toBe('event')
    expect(normalizeNewsEventClassification('invalid')).toBe('other')
    expect(normalizeNewsEventClassification(null)).toBe('other')
  })

  it('renders every classification with a visible label and shared accent treatment', () => {
    const markup = NEWS_EVENT_CLASSIFICATIONS.map(({ value }) =>
      renderToStaticMarkup(<NewsEventClassificationBadge classification={value} />),
    )

    NEWS_EVENT_CLASSIFICATIONS.forEach(({ label, value }, index) => {
      expect(markup[index]).toContain(`data-news-event-classification="${value}"`)
      expect(markup[index]).toContain(label)
      expect(markup[index]).toContain('border-border')
      expect(markup[index]).toContain('bg-accent')
      expect(markup[index]).toContain('text-accent-foreground')
      expect(markup[index]).not.toContain('bg-transparent')
    })
  })

  it('renders a semantic, regular-weight date with a calendar icon', () => {
    const markup = renderToStaticMarkup(
      <NewsEventDateMeta
        className="text-muted-foreground"
        dateISO="2026-08-18T00:00:00.000Z"
        dateLabel="Aug 18, 2026"
      />,
    )

    expect(markup).toContain('<time')
    expect(markup).toContain('dateTime="2026-08-18T00:00:00.000Z"')
    expect(markup).toContain('lucide-calendar-days')
    expect(markup).toContain('font-sans')
    expect(markup).toContain('font-normal')
    expect(markup).toContain('tracking-normal')
    expect(markup).toContain('tabular-nums')
    expect(markup).toContain('text-xs')
  })
})
