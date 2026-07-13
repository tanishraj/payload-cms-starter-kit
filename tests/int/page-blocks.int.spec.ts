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
    expect(layoutField?.blocks?.map((block) => block.slug)).toEqual([
      'announcement',
      'heroInstitutional',
    ])
  })

  it('defines the heroInstitutional schema with image, overlay, alignment, and CTA fields', async () => {
    const { HeroInstitutionalBlock } = await import('@/blocks/HeroInstitutional/config')

    const backgroundImageField = HeroInstitutionalBlock.fields.find(
      (field) =>
        typeof field === 'object' && field !== null && 'name' in field && field.name === 'backgroundImage',
    ) as { relationTo?: string; required?: boolean; type?: string } | undefined

    const titleField = HeroInstitutionalBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'title',
    ) as { required?: boolean; type?: string } | undefined

    const overlayStyleField = HeroInstitutionalBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'overlayStyle',
    ) as { defaultValue?: string; options?: Array<{ value: string }>; type?: string } | undefined

    const horizontalAlignmentField = HeroInstitutionalBlock.fields.find(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        field.name === 'horizontalAlignment',
    ) as { defaultValue?: string; options?: Array<{ value: string }>; type?: string } | undefined

    const verticalAlignmentField = HeroInstitutionalBlock.fields.find(
      (field) =>
        typeof field === 'object' && field !== null && 'name' in field && field.name === 'verticalAlignment',
    ) as { defaultValue?: string; options?: Array<{ value: string }>; type?: string } | undefined

    const buttonsField = HeroInstitutionalBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'buttons',
    ) as { maxRows?: number; type?: string } | undefined

    expect(backgroundImageField?.type).toBe('upload')
    expect(backgroundImageField?.relationTo).toBe('media')
    expect(backgroundImageField?.required).toBe(true)
    expect(titleField?.type).toBe('text')
    expect(titleField?.required).toBe(true)
    expect(overlayStyleField?.type).toBe('select')
    expect(overlayStyleField?.defaultValue).toBe('dark')
    expect(overlayStyleField?.options?.map((option) => option.value)).toEqual(['light', 'dark', 'darker'])
    expect(horizontalAlignmentField?.options?.map((option) => option.value)).toEqual([
      'left',
      'center',
      'right',
    ])
    expect(verticalAlignmentField?.options?.map((option) => option.value)).toEqual([
      'top',
      'center',
      'bottom',
    ])
    const heightField = HeroInstitutionalBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'height',
    ) as { defaultValue?: string; options?: Array<{ value: string }>; type?: string } | undefined

    const contentWidthField = HeroInstitutionalBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'contentWidth',
    ) as { defaultValue?: string; options?: Array<{ value: string }>; type?: string } | undefined

    expect(contentWidthField?.type).toBe('select')
    expect(contentWidthField?.defaultValue).toBe('default')
    expect(contentWidthField?.options?.map((option) => option.value)).toEqual(['narrow', 'default', 'wide'])
    expect(heightField?.type).toBe('select')
    expect(heightField?.defaultValue).toBe('default')
    expect(heightField?.options?.map((option) => option.value)).toEqual([
      'compact',
      'default',
      'immersive',
    ])
    expect(buttonsField?.type).toBe('array')
    expect(buttonsField?.maxRows).toBe(2)
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

  it('defines the page announcement block schema with mode, timing, and rotating items', () => {
    const displayModeField = AnnouncementBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'displayMode',
    ) as { defaultValue?: string; label?: string; options?: Array<{ value: string }>; type?: string } | undefined
    const labelField = AnnouncementBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'label',
    ) as { label?: string; type?: string } | undefined
    const intervalField = AnnouncementBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'intervalMs',
    ) as { defaultValue?: number; type?: string } | undefined
    const marqueeDurationField = AnnouncementBlock.fields.find(
      (field) =>
        typeof field === 'object' && field !== null && 'name' in field && field.name === 'marqueeDurationMs',
    ) as { defaultValue?: number; type?: string } | undefined
    const itemsField = AnnouncementBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'items',
    ) as { minRows?: number; type?: string } | undefined

    expect(displayModeField?.type).toBe('select')
    expect(displayModeField?.label).toBe('Animation Mode')
    expect(displayModeField?.defaultValue).toBe('vertical')
    expect(displayModeField?.options?.map((option) => option.value)).toEqual([
      'vertical',
      'horizontal',
      'marquee',
    ])
    expect(labelField?.type).toBe('text')
    expect(labelField?.label).toBe('Announcement Label')
    expect(intervalField?.type).toBe('number')
    expect(intervalField?.defaultValue).toBe(4000)
    expect(marqueeDurationField?.type).toBe('number')
    expect(marqueeDurationField?.defaultValue).toBe(18000)
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
            label: 'Urgent Notice',
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
    expect(html).toContain('Urgent Notice')
    expect(html).toContain('Scheduled tonight at 10:00 PM.')
    expect(html).toContain('href="/maintenance"')
  })

  it('renders a heroInstitutional page block through PageContent', () => {
    const result = PageContent({
      page: {
        id: 'page-hero-1',
        layout: [
          {
            backgroundImage: {
              alt: 'Main hall',
              url: '/media/main-hall.jpg',
            },
            blockType: 'heroInstitutional',
            buttons: [{ label: 'Apply now', linkType: 'custom', url: '/apply', variant: 'default' }],
            description: 'Train for the work that follows.',
            eyebrow: 'Admissions',
            height: 'default',
            horizontalAlignment: 'left',
            overlayStyle: 'dark',
            title: 'Practice begins before the clinic.',
            verticalAlignment: 'center',
          },
        ],
        slug: 'admissions',
        title: 'Admissions',
      } as never,
    })

    const html = renderToStaticMarkup(result)

    expect(html).toContain('Practice begins before the clinic.')
    expect(html).toContain('Admissions')
    expect(html).toContain('href="/apply"')
  })
})
