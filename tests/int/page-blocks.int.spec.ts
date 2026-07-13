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
      'splitFeature',
      'statsStrip',
    ])
  })

  it('defines the statsStrip schema with metric items, background, and animation fields', async () => {
    const { StatsStripBlock } = await import('@/blocks/StatsStrip/config')

    const itemsField = StatsStripBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'items',
    ) as { fields?: Array<{ name?: string; type?: string }>; minRows?: number; type?: string } | undefined

    const backgroundStyleField = StatsStripBlock.fields.find(
      (field) =>
        typeof field === 'object' && field !== null && 'name' in field && field.name === 'backgroundStyle',
    ) as { defaultValue?: string; options?: Array<{ value: string }>; type?: string } | undefined

    const animationEnabledField = StatsStripBlock.fields.find(
      (field) =>
        typeof field === 'object' && field !== null && 'name' in field && field.name === 'animationEnabled',
    ) as { defaultValue?: boolean; type?: string } | undefined

    const animationDurationField = StatsStripBlock.fields.find(
      (field) =>
        typeof field === 'object' && field !== null && 'name' in field && field.name === 'animationDuration',
    ) as { defaultValue?: number; type?: string } | undefined

    const triggerOnceField = StatsStripBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'triggerOnce',
    ) as { defaultValue?: boolean; type?: string } | undefined

    expect(itemsField?.type).toBe('array')
    expect(itemsField?.minRows).toBe(1)
    expect(itemsField?.fields?.map((field) => field.name)).toEqual(['prefix', 'value', 'suffix', 'label'])
    expect(backgroundStyleField?.type).toBe('select')
    expect(backgroundStyleField?.defaultValue).toBe('default')
    expect(backgroundStyleField?.options?.map((option) => option.value)).toEqual([
      'default',
      'muted',
      'accent',
    ])
    expect(animationEnabledField?.type).toBe('checkbox')
    expect(animationEnabledField?.defaultValue).toBe(true)
    expect(animationDurationField?.type).toBe('number')
    expect(animationDurationField?.defaultValue).toBe(1200)
    expect(triggerOnceField?.type).toBe('checkbox')
    expect(triggerOnceField?.defaultValue).toBe(true)
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

  it('defines the splitFeature schema with image, layout, and CTA mode fields', async () => {
    const { SplitFeatureBlock } = await import('@/blocks/SplitFeature/config')

    const imageField = SplitFeatureBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'image',
    ) as { relationTo?: string; required?: boolean; type?: string } | undefined

    const titleField = SplitFeatureBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'title',
    ) as { required?: boolean; type?: string } | undefined

    const layoutModeField = SplitFeatureBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'layoutMode',
    ) as { defaultValue?: string; options?: Array<{ value: string }>; type?: string } | undefined

    const mediaPositionField = SplitFeatureBlock.fields.find(
      (field) =>
        typeof field === 'object' && field !== null && 'name' in field && field.name === 'mediaPosition',
    ) as { defaultValue?: string; options?: Array<{ value: string }>; type?: string } | undefined

    const backgroundStyleField = SplitFeatureBlock.fields.find(
      (field) =>
        typeof field === 'object' && field !== null && 'name' in field && field.name === 'backgroundStyle',
    ) as { defaultValue?: string; options?: Array<{ value: string }>; type?: string } | undefined

    const ctaModeField = SplitFeatureBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'ctaMode',
    ) as { defaultValue?: string; options?: Array<{ value: string }>; type?: string } | undefined

    const buttonsField = SplitFeatureBlock.fields.find(
      (field) => typeof field === 'object' && field !== null && 'name' in field && field.name === 'buttons',
    ) as { maxRows?: number; type?: string } | undefined

    expect(imageField?.type).toBe('upload')
    expect(imageField?.relationTo).toBe('media')
    expect(imageField?.required).not.toBe(true)
    expect(titleField?.type).toBe('text')
    expect(titleField?.required).toBe(true)
    expect(layoutModeField?.type).toBe('select')
    expect(layoutModeField?.defaultValue).toBe('split')
    expect(layoutModeField?.options?.map((option) => option.value)).toEqual(['split', 'contentOnly'])
    expect(mediaPositionField?.type).toBe('select')
    expect(mediaPositionField?.defaultValue).toBe('left')
    expect(mediaPositionField?.options?.map((option) => option.value)).toEqual(['left', 'right'])
    expect(backgroundStyleField?.type).toBe('select')
    expect(backgroundStyleField?.defaultValue).toBe('plain')
    expect(backgroundStyleField?.options?.map((option) => option.value)).toEqual(['plain', 'muted'])
    expect(ctaModeField?.type).toBe('select')
    expect(ctaModeField?.defaultValue).toBe('link')
    expect(ctaModeField?.options?.map((option) => option.value)).toEqual(['link', 'buttons'])
    expect(buttonsField?.type).toBe('array')
    expect(buttonsField?.maxRows).toBe(2)
  })

  it('renders a splitFeature page block through PageContent', () => {
    const result = PageContent({
      page: {
        id: 'page-split-1',
        layout: [
          {
            backgroundStyle: 'muted',
            blockType: 'splitFeature',
            ctaMode: 'link',
            description: 'Choose from MD, MD-PhD, and specialized tracks.',
            eyebrow: 'Programs',
            image: {
              alt: 'Students in clinic',
              url: '/media/programs.jpg',
            },
            layoutMode: 'split',
            linkLabel: 'See all programs',
            linkType: 'custom',
            mediaPosition: 'right',
            title: 'Four years. Six pathways. One physician.',
            url: '/programs',
          },
        ],
        slug: 'programs',
        title: 'Programs',
      } as never,
    })

    const html = renderToStaticMarkup(result)

    expect(html).toContain('data-split-feature-position="right"')
    expect(html).toContain('data-split-feature-layout="split"')
    expect(html).toContain('data-split-feature-background="muted"')
    expect(html).toContain('href="/programs"')
    expect(html).toContain('See all programs')
  })

  it('renders a statsStrip page block through PageContent', () => {
    const result = PageContent({
      page: {
        id: 'page-stats-1',
        layout: [
          {
            animationDuration: 1200,
            animationEnabled: true,
            backgroundStyle: 'accent',
            blockType: 'statsStrip',
            id: 'stats-block-1',
            items: [
              { label: 'Years of training physicians', value: 112 },
              { label: 'Student-to-faculty ratio', suffix: ':1', value: 9 },
              { label: 'Annual research funding', prefix: '$', suffix: 'M', value: 186 },
              { label: 'Residency match rate', suffix: '%', value: 96 },
              { label: 'Clinical sites', value: 14 },
            ],
            triggerOnce: true,
          },
        ],
        slug: 'stats',
        title: 'Stats',
      } as never,
    })

    const html = renderToStaticMarkup(result)

    expect(html).toContain('data-stats-strip-background="accent"')
    expect(html).toContain('data-stats-strip-row="0"')
    expect(html).toContain('data-stats-strip-row="1"')
    expect(html).toContain('data-stats-strip-row-size="4"')
    expect(html).toContain('data-stats-strip-row-size="1"')
    expect(html).toContain('Years of training physicians')
    expect(html).toContain('Student-to-faculty ratio')
    expect(html).toContain('$0M')
    expect(html).toContain('0%')
  })
})
