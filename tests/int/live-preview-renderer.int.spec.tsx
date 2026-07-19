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
      renderLivePreviewPageBlocks(layout, snapshot, EMPTY_NEWS_EVENTS_PREVIEW_SNAPSHOT),
    )

    expect(html).toContain('Live rating')
    expect(html).toContain('4.5 / 5')
    expect(html).toContain('Reviews')
    expect(html).toContain('Review loaded for page size eight')
  })
})
