import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { regularBlockContainerClasses } from '@/blocks/shared/blockSpacing'
import { NewsEventStory } from '@/components/news-events/NewsEventStory'
import type { PublicNewsEventDetail } from '@/lib/newsEventsShared'

const body = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'A complete story.',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
} as PublicNewsEventDetail['body']

const entry: PublicNewsEventDetail = {
  body,
  categories: [{ id: 'campus', slug: 'campus', title: 'Campus' }],
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
  tags: [{ id: 'education', slug: 'education', title: 'Education' }],
  title: 'Campus story',
  updatedAt: '2026-07-19T00:00:00.000Z',
}

describe('News & Events individual story', () => {
  it('uses the website container, normalized typography, and semantic theme colors', () => {
    const markup = renderToStaticMarkup(<NewsEventStory entry={entry} />)

    expect(markup).toContain('data-news-event-story="true"')
    expect(markup).toContain(regularBlockContainerClasses)
    expect(markup).toContain(
      'text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl',
    )
    expect(markup).toContain('text-base leading-7 text-current/70')
    expect(markup).toContain('prose-headings:text-current')
    expect(markup).toContain('prose-a:text-current')
    expect(markup).not.toContain('max-w-screen-xl')
    expect(markup).not.toContain('max-w-4xl')
    expect(markup).not.toContain('prose-neutral')
    expect(markup).not.toContain('dark:prose-invert')
  })
})
