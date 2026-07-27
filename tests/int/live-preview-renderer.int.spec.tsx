import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { renderLivePreviewPageBlocks } from '@/blocks/renderLivePreviewPageBlocks'
import type { ReviewPreviewSnapshot } from '@/lib/reviewPreviewShared'
import { EMPTY_NEWS_EVENTS_PREVIEW_SNAPSHOT } from '@/lib/newsEventsPreviewShared'
import type { Page } from '@/payload-types'

describe('live-preview page block renderer', () => {
  it('renders review blocks from the server-provided snapshot', () => {
    const snapshot: ReviewPreviewSnapshot = {
      feedPagesBySize: {
        '8': {
          docs: [
            {
              authorName: 'Alex M.',
              content: 'Review loaded for page size eight',
              date: 'Jul 19, 2026',
              id: 'review-8',
              rating: 5,
              title: 'Matching snapshot page',
              verified: true,
            },
          ],
          hasNextPage: false,
          page: 1,
          totalPages: 1,
        },
      },
      ratingDistribution: { average: 4.5, count: 2, counts: [0, 0, 0, 1, 1] },
    }
    const layout = [
      { blockType: 'ratingSpotlight', title: 'Live rating' },
      { blockType: 'reviewFeed', pageSize: 8, title: 'Reviews' },
    ] as unknown as NonNullable<Page['layout']>
    const html = renderToStaticMarkup(
      renderLivePreviewPageBlocks(layout, snapshot, EMPTY_NEWS_EVENTS_PREVIEW_SNAPSHOT, [], []),
    )

    expect(html).toContain('Live rating')
    expect(html).toContain('4.5 / 5')
    expect(html).toContain('Reviews')
    expect(html).toContain('Review loaded for page size eight')
  })

  it('renders contact24 from the server-provided draft office snapshot', () => {
    const offices = [
      {
        id: 'draft-office',
        region: 'Middle East',
        city: 'Draft Dubai',
        address: 'DIFC',
        phone: '+971 4 555 0123',
        phoneHref: 'tel:+97145550123',
        email: 'dubai@example.com',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=draft',
        mapUrl: 'https://maps.google.com/?q=Dubai',
        mapTitle: 'Interactive map for the draft Dubai office',
      },
    ]
    const layout = [
      {
        blockType: 'contact24',
        title: 'Global offices',
      },
    ] as unknown as NonNullable<Page['layout']>
    const html = renderToStaticMarkup(
      renderLivePreviewPageBlocks(
        layout,
        {
          feedPagesBySize: {},
          ratingDistribution: {
            average: 0,
            count: 0,
            counts: [0, 0, 0, 0, 0],
          },
        },
        EMPTY_NEWS_EVENTS_PREVIEW_SNAPSHOT,
        offices,
        [],
      ),
    )

    expect(html).toContain('Global offices')
    expect(html).toContain('Draft Dubai')
    expect(html).toContain('data-contact24-size="default"')
  })

  it('renders eventGallery from the server-provided draft album snapshot', () => {
    const layout = [
      {
        blockType: 'eventGallery',
        title: 'Event gallery',
      },
    ] as unknown as NonNullable<Page['layout']>
    const albums = [
      {
        cover: {
          alt: 'Draft event',
          height: 900,
          id: 'draft-image',
          src: '/media/draft-event.jpg',
          width: 1600,
        },
        createdAt: '2026-07-27T00:00:00.000Z',
        id: 'draft-album',
        imageCount: 1,
        images: [
          {
            alt: 'Draft event',
            height: 900,
            id: 'draft-image',
            src: '/media/draft-event.jpg',
            width: 1600,
          },
        ],
        title: 'Draft Yoga Day',
      },
    ]
    const html = renderToStaticMarkup(
      renderLivePreviewPageBlocks(
        layout,
        {
          feedPagesBySize: {},
          ratingDistribution: {
            average: 0,
            count: 0,
            counts: [0, 0, 0, 0, 0],
          },
        },
        EMPTY_NEWS_EVENTS_PREVIEW_SNAPSHOT,
        [],
        albums,
      ),
    )

    expect(html).toContain('Event gallery')
    expect(html).toContain('Draft Yoga Day')
    expect(html).toContain('data-event-gallery="true"')
  })
})
