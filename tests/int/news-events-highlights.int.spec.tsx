import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { NewsEventsHighlightsBlock } from '@/blocks/NewsEventsHighlights/config'
import { NewsEventsHighlightsBlockPresentation } from '@/blocks/NewsEventsHighlights/Presentation'

describe('News & Events Highlights block', () => {
  it('uses the approved canonical identity and two-tab configuration', () => {
    expect(NewsEventsHighlightsBlock.slug).toBe('newsEventsHighlights')
    expect(NewsEventsHighlightsBlock.interfaceName).toBe('NewsEventsHighlightsBlock')
    expect(JSON.stringify(NewsEventsHighlightsBlock.fields)).toContain('Layout & Theme')
    expect(JSON.stringify(NewsEventsHighlightsBlock.fields)).toContain('itemCount')
  })

  it('renders normalized headings, cards, badges, and actions', () => {
    const markup = renderToStaticMarkup(
      <NewsEventsHighlightsBlockPresentation
        actions={[{ label: 'All stories', linkType: 'custom', url: '/news-events' }]}
        eyebrow="Latest"
        items={[
          {
            contentType: 'news',
            dateISO: '2026-07-20T00:00:00.000Z',
            dateLabel: 'Jul 20, 2026',
            excerpt: 'A public story.',
            href: '/news-events/story',
            id: 'story',
            isPastEvent: false,
            slug: 'story',
            title: 'Public story',
          },
        ]}
        title="News & Events"
      />,
    )

    expect(markup).toContain('data-news-events-highlights="true"')
    expect(markup).toContain('<h2')
    expect(markup).toContain('Public story')
    expect(markup).toContain('Read more')
    expect(markup).toContain('All stories')
  })
})
