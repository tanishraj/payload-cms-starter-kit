import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { PageContent } from '@/app/(frontend)/PageContent'
import { AnnouncementBlock } from '@/blocks/Announcement/config'
import { Pages } from '@/collections/Pages'

const getLayoutField = () => {
  const tabsField = Pages.fields.find(
    (field) => typeof field === 'object' && field !== null && 'tabs' in field,
  ) as { tabs: Array<{ label: string; fields: unknown[] }> } | undefined

  const contentTab = tabsField?.tabs.find((tab) => tab.label === 'Content')

  return contentTab?.fields.find(
    (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'layout',
  ) as { blocks?: Array<{ slug: string }>; type?: string } | undefined
}

describe('page block pipeline', () => {
  it('registers a general layout blocks field on Pages', () => {
    const layoutField = getLayoutField()

    expect(layoutField?.type).toBe('blocks')
    expect(layoutField?.blocks?.map((block) => block.slug)).toEqual(['announcement'])
  })

  it('renders nothing for a normal page without layout blocks', () => {
    const result = PageContent({
      page: {
        id: 'page-1',
        slug: 'home',
        title: 'Home',
      } as never,
    })

    expect(result).toBeNull()
  })

  it('defines the page announcement block schema with interval and rotating items', () => {
    const intervalField = AnnouncementBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'intervalMs',
    ) as { defaultValue?: number; type?: string } | undefined
    const itemsField = AnnouncementBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'items',
    ) as { minRows?: number; type?: string } | undefined

    expect(intervalField?.type).toBe('number')
    expect(intervalField?.defaultValue).toBe(4000)
    expect(itemsField?.type).toBe('array')
    expect(itemsField?.minRows).toBe(1)
  })

  it('renders the first announcement item for a page announcement block', () => {
    const result = PageContent({
      page: {
        id: 'page-2',
        layout: [
          {
            blockType: 'announcement',
            intervalMs: 4000,
            id: 'block-1',
            items: [
              {
                description: 'Scheduled tonight at 10:00 PM.',
                url: '/maintenance',
              },
              {
                description: 'The second item should not be visible in server markup.',
                title: 'Ignored in static render',
              },
            ],
          },
        ],
        slug: 'updates',
        title: 'Updates',
      } as never,
    })

    const html = renderToStaticMarkup(result)

    expect(html).toContain('lucide-megaphone')
    expect(html).toContain('Scheduled tonight at 10:00 PM.')
    expect(html).toContain('href="/maintenance"')
  })
})
