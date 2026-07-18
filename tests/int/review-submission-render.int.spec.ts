import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ReviewSubmissionBlockComponent } from '@/blocks/ReviewSubmission/Component'

describe('review submission block', () => {
  it.each([
    ['compact', 'py-10 md:py-20'],
    ['default', 'py-12 md:py-24'],
    ['comfortable', 'py-16 md:py-28'],
  ] as const)('uses consistent %s mobile spacing without changing desktop spacing', (size, classes) => {
    const html = renderToStaticMarkup(
      createElement(ReviewSubmissionBlockComponent, {
        size,
        title: 'Share your experience',
      }),
    )

    expect(html).toContain(`data-review-submission-size="${size}"`)
    expect(html).toContain(classes)
  })

  it('aligns only the content header while preserving shared description typography', () => {
    const centerHtml = renderToStaticMarkup(
      createElement(ReviewSubmissionBlockComponent, {
        actionMode: 'link',
        actions: [
          {
            label: 'Read review policy',
            linkType: 'custom',
            url: '/reviews',
          },
          {
            label: 'External policy',
            linkType: 'custom',
            openInNewTab: true,
            url: 'https://example.com/policy',
          },
        ],
        contentAlignment: 'center',
        description: 'Every review is read by our student affairs office.',
        eyebrow: 'Feedback',
        title: 'Your voice is part of the record.',
      }),
    )
    const rightHtml = renderToStaticMarkup(
      createElement(ReviewSubmissionBlockComponent, {
        contentAlignment: 'right',
        description: 'Every review is read by our student affairs office.',
        title: 'Your voice is part of the record.',
      }),
    )

    expect(centerHtml).toContain('data-review-submission-content-alignment="center"')
    expect(centerHtml).toContain('self-center items-center text-center')
    expect(centerHtml).toContain('text-base leading-7 text-muted-foreground')
    expect(centerHtml).toContain('data-review-submission-actions="true"')
    expect(centerHtml).toContain('data-action-mode="link"')
    expect(centerHtml).toContain('justify-center')
    expect(centerHtml).toContain('href="/reviews"')
    expect(centerHtml).toContain('href="https://example.com/policy"')
    expect(centerHtml).toContain('target="_blank"')
    expect(centerHtml).toContain('rel="noreferrer"')
    expect(centerHtml).toContain('group-hover/button:translate-x-1')
    expect(rightHtml).toContain('data-review-submission-content-alignment="right"')
    expect(rightHtml).toContain('self-end items-end text-right')
  })

  it('renders shared actions as theme-aware buttons', () => {
    const html = renderToStaticMarkup(
      createElement(ReviewSubmissionBlockComponent, {
        actionMode: 'button',
        actions: [
          {
            label: 'Review guidelines',
            linkType: 'custom',
            url: '/guidelines',
            variant: 'default',
          },
          {
            label: 'Contact support',
            linkType: 'custom',
            url: '/support',
            variant: 'outline',
          },
        ],
        contentAlignment: 'right',
        description: 'Every review is read by our student affairs office.',
        title: 'Your voice is part of the record.',
      }),
    )

    expect(html).toContain('data-review-submission-actions="true"')
    expect(html).toContain('data-action-mode="button"')
    expect(html).toContain('data-action-variant="default"')
    expect(html).toContain('data-action-variant="outline"')
    expect(html).toContain('sm:justify-end')
  })
})
