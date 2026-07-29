import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { NewsEventsFeed } from '@/components/news-events/NewsEventsFeed'
import type { NewsEventsSetting } from '@/payload-types'

const settings = {
  allLabel: 'All',
  appearance: {
    background: 'none',
    border: 'none',
  },
  emptyStateTitle: 'No entries found',
  entriesPerPage: 9,
  eventsLabel: 'Events',
  id: 'news-events-settings',
  newsLabel: 'News',
  pastEventsLabel: 'Past Events',
  readMoreLabel: 'Read More',
  size: 'default',
  title: 'News & Events',
  upcomingEventsLabel: 'Upcoming Events',
} as NewsEventsSetting

describe('News & Events archive feed', () => {
  it('renders compact attachment-style rows with a smaller responsive image', () => {
    const markup = renderToStaticMarkup(
      <NewsEventsFeed
        archiveData={{
          docs: [
            {
              category: { id: 'campus', slug: 'campus', title: 'Campus' },
              contentType: 'news',
              dateISO: '2026-07-19T00:00:00.000Z',
              dateLabel: 'Jul 19, 2026',
              excerpt: 'A concise introduction to the story.',
              href: '/news-events/campus-story',
              id: 'campus-story',
              image: {
                alt: 'Students working in a laboratory',
                height: 900,
                position: 'center',
                src: '/media/laboratory.jpg',
                width: 1600,
              },
              isPastEvent: false,
              slug: 'campus-story',
              title: 'Campus story',
            },
          ],
          hasNextPage: false,
          hasPrevPage: false,
          page: 1,
          totalPages: 1,
        }}
        categories={[]}
        query={{ page: 1, pastPage: 1, type: 'all', upcomingPage: 1 }}
        settings={settings}
        tags={[]}
      />,
    )

    expect(markup).toContain('data-news-event-feed-row="true"')
    expect(markup).toContain('md:grid-cols-[minmax(14rem,26rem)_minmax(0,1fr)]')
    expect(markup).toContain('h-44 w-full')
    expect(markup).toContain('md:h-48')
    expect(markup).toContain('border-b border-border')
    expect(markup).toContain('line-clamp-2')
    expect(markup).toContain('mt-auto')
    expect(markup).not.toContain('md:min-h-full')
    expect(markup).not.toContain('ring-1 ring-border')
  })
})
