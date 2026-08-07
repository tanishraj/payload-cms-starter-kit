import { describe, expect, it } from 'vitest'

import {
  getNewsEventDetailMetadata,
  getNewsEventsArchiveMetadata,
  getNewsEventsTaxonomyMetadata,
} from '@/lib/newsEventsMetadata'
import type { PublicNewsEventDetail } from '@/lib/newsEventsShared'
import type { Category, NewsEventsSetting, Tag } from '@/payload-types'

const archiveSettings = (robotsMode: 'default' | 'index' | 'noindex'): NewsEventsSetting =>
  ({
    robotsMode,
    title: 'News & Events',
  }) as NewsEventsSetting

const detailFixture = (robotsMode: 'default' | 'index' | 'noindex'): PublicNewsEventDetail =>
  ({
    contentType: 'news',
    excerpt: 'News entry excerpt',
    href: '/news-events/example',
    robotsMode,
    title: 'Example news entry',
  }) as PublicNewsEventDetail

describe('News & Events metadata', () => {
  it('inherits the global archive robots policy for default mode', () => {
    expect(
      getNewsEventsArchiveMetadata(archiveSettings('default'), 'noindex,nofollow').robots,
    ).toEqual({
      follow: false,
      index: false,
    })
  })

  it('inherits the global detail robots policy for default mode', () => {
    expect(getNewsEventDetailMetadata(detailFixture('default'), 'index,nofollow').robots).toEqual({
      follow: false,
      index: true,
    })
  })

  it('lets an explicit archive policy override the global policy', () => {
    expect(
      getNewsEventsArchiveMetadata(archiveSettings('index'), 'noindex,nofollow').robots,
    ).toEqual({
      follow: true,
      index: true,
    })
  })

  it('lets an explicit detail policy override the global policy', () => {
    expect(getNewsEventDetailMetadata(detailFixture('noindex'), 'index,follow').robots).toEqual({
      follow: true,
      index: false,
    })
  })

  it('builds category metadata with taxonomy fallbacks and inherited robots', () => {
    const metadata = getNewsEventsTaxonomyMetadata({
      inheritedRobots: 'noindex,nofollow',
      pathname: '/news-events/category/campus-life',
      settings: archiveSettings('index'),
      term: {
        description: 'Campus updates and events.',
        slug: 'campus-life',
        title: 'Campus Life',
      } as Category,
    })

    expect(metadata.title).toBe('Campus Life | News & Events')
    expect(metadata.description).toBe('Campus updates and events.')
    expect(metadata.alternates?.canonical).toBe(
      'http://localhost:3000/news-events/category/campus-life',
    )
    expect(metadata.robots).toEqual({ follow: false, index: false })
  })

  it('honors tag metadata overrides before archive fallbacks', () => {
    const metadata = getNewsEventsTaxonomyMetadata({
      inheritedRobots: 'noindex,nofollow',
      pathname: '/news-events/tag/open-day',
      settings: {
        ...archiveSettings('default'),
        metaDescription: 'Archive description',
        ogDescription: 'Archive social description',
        ogTitle: 'Archive social title',
      },
      term: {
        canonicalURL: '/discover/open-days',
        metaDescription: 'Tag description',
        metaTitle: 'Open Days',
        ogDescription: 'Tag social description',
        ogTitle: 'Tag social title',
        robotsMode: 'index',
        slug: 'open-day',
        title: 'Open Day',
      } as Tag,
    })

    expect(metadata.title).toBe('Open Days')
    expect(metadata.description).toBe('Tag description')
    expect(metadata.alternates?.canonical).toBe('http://localhost:3000/discover/open-days')
    expect(metadata.openGraph).toMatchObject({
      description: 'Tag social description',
      title: 'Tag social title',
      url: 'http://localhost:3000/discover/open-days',
    })
    expect(metadata.robots).toEqual({ follow: true, index: true })
  })
})
