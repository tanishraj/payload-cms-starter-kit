import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContentHighlightsBlockComponent } from '@/blocks/ContentHighlights/Component'
import { ContentHighlightsBlock } from '@/blocks/ContentHighlights/config'
import { ContentHighlights, type ContentHighlightsLayout } from '@/components/content-highlights'

type TestField = {
  admin?: {
    condition?: (data: unknown, siblingData: Record<string, unknown>) => boolean
  }
  defaultValue?: unknown
  fields?: TestField[]
  maxRows?: number
  minRows?: number
  name?: string
  options?: Array<{ label: string; value: string }>
  required?: boolean
  type?: string
}

type TestTab = { fields: TestField[]; label: string }

const getField = (fields: TestField[], name: string) => fields.find((field) => field.name === name)

describe('Content Highlights', () => {
  it('defines the approved Payload schema', () => {
    expect(ContentHighlightsBlock).toMatchObject({
      interfaceName: 'ContentHighlightsBlock',
      labels: { plural: 'Content Highlights', singular: 'Content Highlights' },
      slug: 'contentHighlights',
    })

    const tabs = ContentHighlightsBlock.fields[0] as unknown as {
      tabs: TestTab[]
      type: string
    }
    const content = tabs.tabs.find(({ label }) => label === 'Content')
    const layout = tabs.tabs.find(({ label }) => label === 'Theme Settings')
    const items = getField(content?.fields ?? [], 'items')

    expect(tabs.type).toBe('tabs')
    expect(content?.fields.map(({ name }) => name)).toEqual([
      'eyebrow',
      'title',
      'description',
      'actions',
      'items',
    ])
    expect(getField(content?.fields ?? [], 'title')).toMatchObject({
      required: true,
      type: 'text',
    })
    expect(items).toMatchObject({ maxRows: 6, minRows: 1, required: true, type: 'array' })
    expect(items?.fields?.map(({ name }) => name)).toEqual([
      'metadata',
      'title',
      'description',
      'linkType',
      'page',
      'url',
      'openInNewTab',
    ])
    expect(getField(items?.fields ?? [], 'title')).toMatchObject({
      required: true,
      type: 'text',
    })
    expect(getField(items?.fields ?? [], 'linkType')).toMatchObject({
      defaultValue: 'none',
      required: true,
      type: 'select',
    })
    expect(getField(layout?.fields ?? [], 'appearance')?.type).toBe('group')
    expect(getField(layout?.fields ?? [], 'actionMode')?.defaultValue).toBe('link')
    expect(getField(layout?.fields ?? [], 'layout')).toMatchObject({
      defaultValue: 'highlightsGrid',
      required: true,
    })
    expect(getField(layout?.fields ?? [], 'layout')?.options?.map(({ value }) => value)).toEqual([
      'editorialRow',
      'highlightsGrid',
      'simpleGrid',
      'numberedSteps',
    ])
    const split = getField(layout?.fields ?? [], 'enableSplitLayout')
    const horizontal = getField(layout?.fields ?? [], 'contentAlignment')
    const vertical = getField(layout?.fields ?? [], 'splitContentAlignment')

    expect(split).toMatchObject({ defaultValue: false, type: 'checkbox' })
    expect(horizontal).toMatchObject({ defaultValue: 'left', type: 'select' })
    expect(horizontal?.options?.map(({ value }) => value)).toEqual(['left', 'center', 'right'])
    expect(vertical).toMatchObject({ defaultValue: 'top', type: 'select' })
    expect(vertical?.options?.map(({ value }) => value)).toEqual(['top', 'center', 'bottom'])
    expect(horizontal?.admin?.condition?.({}, { enableSplitLayout: false })).toBe(true)
    expect(horizontal?.admin?.condition?.({}, { enableSplitLayout: true })).toBe(false)
    expect(vertical?.admin?.condition?.({}, { enableSplitLayout: false })).toBe(false)
    expect(vertical?.admin?.condition?.({}, { enableSplitLayout: true })).toBe(true)
    expect(getField(layout?.fields ?? [], 'size')?.defaultValue).toBe('default')
  })

  it('renders the existing responsive presentation contracts', () => {
    const renderLayout = (layout: ContentHighlightsLayout, enableSplitLayout = false) =>
      renderToStaticMarkup(
        <ContentHighlights
          actions={<span>All stories</span>}
          appearance={{ background: 'muted', border: 'topAndBottom' }}
          description="A concise introduction to the highlighted content."
          eyebrow="Latest"
          enableSplitLayout={enableSplitLayout}
          items={[
            {
              description: 'A supporting description.',
              metadata: 'Research · Jul 08, 2026',
              title: 'Precision Cardiology',
            },
            { description: 'A second description.', title: 'Campus life' },
            { title: 'Community programs' },
          ]}
          layout={layout}
          size="compact"
          title="Content worth exploring"
        />,
      )

    const editorialHtml = renderLayout('editorialRow')
    const gridHtml = renderLayout('highlightsGrid')
    const splitHtml = renderLayout('highlightsGrid', true)

    expect(editorialHtml).toContain('data-content-highlights-layout="editorialRow"')
    expect(editorialHtml).toContain('md:grid-cols-2')
    expect(editorialHtml).toContain('lg:grid-cols-3')
    expect(editorialHtml).toContain('Research · Jul 08, 2026')
    expect(editorialHtml).toContain('All stories')

    expect(gridHtml).toContain('data-content-highlights-layout="highlightsGrid"')
    expect(gridHtml).toContain('md:grid-cols-2')
    expect(gridHtml).toContain('lg:grid-cols-3')

    expect(splitHtml).toContain('data-content-highlights-layout="highlightsGrid"')
    expect(splitHtml).toContain('data-content-highlights-split="true"')
    expect(splitHtml).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]')
    expect(splitHtml).toContain('md:grid-cols-2')

    for (const html of [editorialHtml, gridHtml, splitHtml]) {
      expect(html).toContain('max-w-screen-2xl')
      expect(html).toContain('px-4')
      expect(html).toContain('bg-muted')
      expect(html).toContain('border-y border-border')
      expect(html).toContain('data-slot="separator"')
    }
  })

  it.each([
    'editorialRow',
    'highlightsGrid',
    'simpleGrid',
    'numberedSteps',
  ] satisfies ContentHighlightsLayout[])(
    'supports stacked and split composition for %s',
    (layout) => {
      const items = [
        { description: 'First description', title: 'First' },
        { description: 'Second description', title: 'Second' },
      ]
      const stacked = renderToStaticMarkup(
        <ContentHighlights
          actions={<span>Explore</span>}
          contentAlignment="right"
          items={items}
          layout={layout}
          title="Highlights"
        />,
      )
      const split = renderToStaticMarkup(
        <ContentHighlights
          actions={<span>Explore</span>}
          enableSplitLayout
          items={items}
          layout={layout}
          splitContentAlignment="bottom"
          title="Highlights"
        />,
      )

      expect(stacked).toContain('data-content-highlights-split="false"')
      expect(stacked).toContain('data-content-highlights-alignment="right"')
      expect(stacked).toContain('ml-auto items-end text-right')
      expect(split).toContain('data-content-highlights-split="true"')
      expect(split).toContain('data-content-highlights-split-alignment="bottom"')
      expect(split).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]')
      expect(split).toContain('lg:self-end')
      expect(split).not.toContain('lg:grid-cols-3')
      expect(split).not.toContain('lg:grid-cols-4')
    },
  )

  it('keeps the Editorial Row action slot only in stacked composition', () => {
    const props = {
      actions: <span>All stories</span>,
      items: [{ title: 'Story' }],
      layout: 'editorialRow' as const,
      title: 'Latest',
    }
    const stacked = renderToStaticMarkup(<ContentHighlights {...props} />)
    const split = renderToStaticMarkup(<ContentHighlights {...props} enableSplitLayout />)

    expect(stacked).toContain('data-content-highlights-action-slot="true"')
    expect(split).not.toContain('data-content-highlights-action-slot="true"')
    expect(split).toContain('All stories')
  })

  it('falls back to Highlights Grid for an unknown layout value', () => {
    const html = renderToStaticMarkup(
      <ContentHighlights
        items={[{ title: 'Item' }]}
        layout={'removed-layout' as ContentHighlightsLayout}
        title="Highlights"
      />,
    )

    expect(html).toContain('data-content-highlights-layout="highlightsGrid"')
    expect(html).toContain('lg:grid-cols-3')
  })

  it('renders simple and numbered layouts with their responsive contracts', () => {
    const items = Array.from({ length: 6 }, (_, index) => ({
      description: `Description ${index + 1}`,
      metadata: index === 0 ? 'Required' : undefined,
      title: `Item ${index + 1}`,
    }))

    const simpleHtml = renderToStaticMarkup(
      <ContentHighlights items={items} layout="simpleGrid" title="What we look for" />,
    )
    const numberedHtml = renderToStaticMarkup(
      <ContentHighlights items={items} layout="numberedSteps" title="How your application moves" />,
    )

    expect(simpleHtml).toContain('data-content-highlights-layout="simpleGrid"')
    expect(simpleHtml).toContain('grid gap-x-16 gap-y-10 md:grid-cols-2')
    expect(simpleHtml).toContain('data-content-highlight-presentation="simple"')
    expect(simpleHtml).not.toContain('data-slot="separator"')
    expect(simpleHtml).not.toContain('data-content-highlight-step=')

    expect(numberedHtml).toContain('data-content-highlights-layout="numberedSteps"')
    expect(numberedHtml).toContain('grid gap-4 md:grid-cols-2 lg:grid-cols-4')
    expect(numberedHtml).toContain('data-content-highlight-presentation="numbered"')
    expect(numberedHtml).toContain('rounded-md border border-current/20')
    expect(numberedHtml).not.toContain('rounded-md border border-border')
    expect(numberedHtml).toContain('data-content-highlight-step="01"')
    expect(numberedHtml).toContain('data-content-highlight-step="06"')
    expect(numberedHtml).not.toContain('data-slot="separator"')

    const splitNumberedHtml = renderToStaticMarkup(
      <ContentHighlights
        appearance={{ background: 'secondary' }}
        enableSplitLayout
        items={items}
        layout="numberedSteps"
        title="How your application moves"
      />,
    )

    expect(splitNumberedHtml).toContain('bg-secondary')
    expect(splitNumberedHtml).toContain('text-secondary-foreground')
    expect(splitNumberedHtml).toContain('rounded-md border border-current/20')
    expect(splitNumberedHtml).not.toContain('rounded-md border border-border')

    for (const html of [simpleHtml, numberedHtml]) {
      expect(html).toContain('py-12 md:py-16')
      expect(html).toContain('max-w-screen-2xl')
    }
  })

  it('resolves shared actions and optional item destinations defensively', () => {
    const html = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        actionMode="button"
        actions={[
          {
            label: 'Explore all',
            linkType: 'custom',
            url: '/explore',
            variant: 'outline',
          },
        ]}
        items={[
          {
            description: 'A linked item.',
            linkType: 'custom',
            openInNewTab: true,
            title: 'Programs',
            url: '/programs',
          },
          {
            description: 'No destination is required.',
            linkType: 'none',
            title: 'Static item',
          },
          {
            linkType: 'custom',
            title: '   ',
            url: '/missing',
          },
        ]}
        layout="editorialRow"
        title="Useful links"
      />,
    )

    expect(html).toContain('data-action-mode="button"')
    expect(html).toContain('Explore all')
    expect(html).toContain('href="/explore"')
    expect(html).toContain('href="/programs"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
    expect(html).toContain('Static item')
    expect(html).not.toContain('/missing')
    expect(html).not.toContain('href=""')
  })

  it.each(['simpleGrid', 'numberedSteps'] satisfies ContentHighlightsLayout[])(
    'preserves normalized actions and item links in %s',
    (layout) => {
      const html = renderToStaticMarkup(
        <ContentHighlightsBlockComponent
          actionMode="button"
          actions={[
            {
              label: 'Explore all',
              linkType: 'custom',
              url: '/explore',
              variant: 'outline',
            },
          ]}
          items={[
            {
              description: 'A linked item.',
              linkType: 'custom',
              openInNewTab: true,
              title: 'Programs',
              url: '/programs',
            },
            {
              description: 'No destination is required.',
              linkType: 'none',
              title: 'Static item',
            },
          ]}
          layout={layout}
          title="Useful links"
        />,
      )

      expect(html).toContain('data-action-mode="button"')
      expect(html).toContain('href="/explore"')
      expect(html).toContain('href="/programs"')
      expect(html).toContain('target="_blank"')
      expect(html).toContain('rel="noreferrer"')
      expect(html).toContain('Static item')
      expect(html).not.toContain('href=""')
    },
  )

  it('renders nothing when required display content is unusable', () => {
    expect(
      ContentHighlightsBlockComponent({
        items: [{ title: 'Item' }],
        title: '   ',
      }),
    ).toBeNull()
    expect(
      ContentHighlightsBlockComponent({
        items: [{ title: '   ' }],
        title: 'Valid title',
      }),
    ).toBeNull()
  })

  it('does not reserve an editorial action slot when no valid action exists', () => {
    const html = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        actions={[{ label: 'Missing destination', linkType: 'custom' }]}
        items={[{ title: 'Static item' }]}
        layout="editorialRow"
        title="No section action"
      />,
    )

    expect(html).not.toContain('data-content-highlights-actions="true"')
    expect(html).not.toContain('data-content-highlights-action-slot="true"')
  })
})
