import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContentHighlightsBlockComponent } from '@/blocks/ContentHighlights/Component'
import { ContentHighlightsBlock } from '@/blocks/ContentHighlights/config'
import { ContentHighlights, type ContentHighlightsLayout } from '@/components/content-highlights'

type TestField = {
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
    const layout = tabs.tabs.find(({ label }) => label === 'Layout & Theme')
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
      'splitHighlights',
    ])
    expect(getField(layout?.fields ?? [], 'size')?.defaultValue).toBe('default')
  })

  it('renders the three approved responsive layout contracts', () => {
    const renderLayout = (layout: ContentHighlightsLayout) =>
      renderToStaticMarkup(
        <ContentHighlights
          actions={<span>All stories</span>}
          appearance={{ background: 'muted', border: 'topAndBottom' }}
          description="A concise introduction to the highlighted content."
          eyebrow="Latest"
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
    const splitHtml = renderLayout('splitHighlights')

    expect(editorialHtml).toContain('data-content-highlights-layout="editorialRow"')
    expect(editorialHtml).toContain('md:grid-cols-2')
    expect(editorialHtml).toContain('lg:grid-cols-3')
    expect(editorialHtml).toContain('Research · Jul 08, 2026')
    expect(editorialHtml).toContain('All stories')

    expect(gridHtml).toContain('data-content-highlights-layout="highlightsGrid"')
    expect(gridHtml).toContain('md:grid-cols-2')
    expect(gridHtml).toContain('lg:grid-cols-3')

    expect(splitHtml).toContain('data-content-highlights-layout="splitHighlights"')
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
    expect(numberedHtml).toContain('rounded-md border border-border')
    expect(numberedHtml).toContain('data-content-highlight-step="01"')
    expect(numberedHtml).toContain('data-content-highlight-step="06"')
    expect(numberedHtml).not.toContain('data-slot="separator"')

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
