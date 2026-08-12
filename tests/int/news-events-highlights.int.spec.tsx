import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { NewsEventsHighlightsBlock } from '@/blocks/NewsEventsHighlights/config'
import { NewsEventsHighlightsBlockPresentation } from '@/blocks/NewsEventsHighlights/Presentation'

const findNamedField = (value: unknown, name: string): Record<string, unknown> | undefined => {
  if (Array.isArray(value)) {
    for (const child of value) {
      const match = findNamedField(child, name)
      if (match) return match
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (record.name === name) return record

    for (const child of Object.values(record)) {
      const match = findNamedField(child, name)
      if (match) return match
    }
  }

  return undefined
}

describe('News & Events Highlights block', () => {
  it('uses the approved canonical identity and two-tab configuration', () => {
    expect(NewsEventsHighlightsBlock.slug).toBe('newsEventsHighlights')
    expect(NewsEventsHighlightsBlock.interfaceName).toBe('NewsEventsHighlightsBlock')
    expect(JSON.stringify(NewsEventsHighlightsBlock.fields)).toContain('Theme Settings')
    expect(JSON.stringify(NewsEventsHighlightsBlock.fields)).toContain('itemCount')

    const contentAlignment = findNamedField(NewsEventsHighlightsBlock.fields, 'contentAlignment')
    expect(contentAlignment).toMatchObject({
      defaultValue: 'left',
      required: true,
      type: 'select',
    })
  })

  it.each([
    ['left', 'items-start text-left'],
    ['center', 'mx-auto items-center text-center'],
    ['right', 'ml-auto items-end text-right'],
  ] as const)(
    'aligns the block text to %s and keeps its action right-aligned',
    (contentAlignment, headerClasses) => {
      const markup = renderToStaticMarkup(
        <NewsEventsHighlightsBlockPresentation
          actions={[{ label: 'All stories', linkType: 'custom', url: '/news-events' }]}
          contentAlignment={contentAlignment}
          items={[]}
          title="News & Events"
        />,
      )

      expect(markup).toContain(`data-news-events-highlights-alignment="${contentAlignment}"`)
      expect(markup).toContain(headerClasses)
      expect(markup).toContain('justify-end')
    },
  )

  it('renders normalized headings, cards, badges, and actions', () => {
    const markup = renderToStaticMarkup(
      <NewsEventsHighlightsBlockPresentation
        actions={[{ label: 'All stories', linkType: 'custom', url: '/news-events' }]}
        contentAlignment="center"
        eyebrow="Latest"
        items={[
          {
            contentType: 'news',
            dateISO: '2026-07-20T00:00:00.000Z',
            dateLabel: 'Jul 20, 2026',
            excerpt: 'A public story.',
            href: '/news-events/story',
            id: 'story',
            image: {
              alt: 'Campus',
              height: 900,
              position: 'center',
              src: '/media/campus.jpg',
              width: 1600,
            },
            isPastEvent: false,
            slug: 'story',
            title: 'Public story',
          },
        ]}
        title="News & Events"
      />,
    )

    expect(markup).toContain('data-news-events-highlights="true"')
    expect(markup).toContain('data-news-events-highlights-alignment="center"')
    expect(markup).toContain('mx-auto items-center text-center')
    expect(markup).toContain('lg:grid-cols-[minmax(0,1fr)_auto]')
    expect(markup).toContain('justify-end')
    expect(markup).toContain('h-44 sm:h-48')
    expect(markup).toContain('line-clamp-4')
    expect(markup).toContain('<h2')
    expect(markup).toContain('Public story')
    expect(markup).toContain('Read more')
    expect(markup).toContain('All stories')
  })
})
