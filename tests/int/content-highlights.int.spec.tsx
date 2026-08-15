import { readFileSync } from 'node:fs'

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
  label?: string
  maxRows?: number
  minRows?: number
  name?: string
  options?: Array<{ label: string; value: string }>
  required?: boolean
  tabs?: TestTab[]
  type?: string
}

type TestTab = { fields: TestField[]; label: string }

const getField = (fields: TestField[], name: string) => fields.find((field) => field.name === name)

const item = (title: string) => ({ markerMode: 'numbered' as const, title })

describe('Content Highlights', () => {
  it('defines the aligned Payload schema', () => {
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
    const theme = tabs.tabs.find(({ label }) => label === 'Theme Settings')
    const items = getField(content?.fields ?? [], 'items')

    expect(tabs.type).toBe('tabs')
    expect(content?.fields.map(({ name }) => name)).toEqual([
      'eyebrow',
      'title',
      'accentTitle',
      'description',
      'actions',
      'footerActions',
      'items',
    ])
    expect(getField(content?.fields ?? [], 'title')).toMatchObject({
      required: true,
      type: 'text',
    })
    expect(items).toMatchObject({ maxRows: 6, minRows: 1, required: true, type: 'array' })

    const itemTabs = items?.fields?.[0]
    const itemContent = itemTabs?.tabs?.find(({ label }) => label === 'Content')
    const itemTheme = itemTabs?.tabs?.find(({ label }) => label === 'Theme Settings')

    expect(itemContent?.fields.map(({ name }) => name)).toEqual([
      'markerMode',
      'markerLabel',
      'title',
      'description',
      'cardAction',
    ])
    expect(getField(itemContent?.fields ?? [], 'markerMode')).toMatchObject({
      defaultValue: 'numbered',
      required: true,
      type: 'select',
    })
    expect(getField(itemContent?.fields ?? [], 'markerMode')?.options?.map(({ value }) => value)).toEqual([
      'numbered',
      'custom',
      'hidden',
    ])
    const markerLabel = getField(itemContent?.fields ?? [], 'markerLabel')
    expect(markerLabel?.admin?.condition).toBeTypeOf('function')
    expect(markerLabel?.admin?.condition?.({}, { markerMode: 'custom' })).toBe(true)
    expect(markerLabel?.admin?.condition?.({}, { markerMode: 'numbered' })).toBe(false)
    expect(getField(itemContent?.fields ?? [], 'title')).toMatchObject({
      required: true,
      type: 'text',
    })
    expect(getField(itemContent?.fields ?? [], 'cardAction')).toMatchObject({
      maxRows: 1,
      type: 'array',
    })
    expect(itemTheme?.fields.map(({ name }) => name)).toEqual(['cardBackground'])

    for (const removedField of ['metadata', 'linkType', 'page', 'url', 'openInNewTab']) {
      expect(getField(itemContent?.fields ?? [], removedField)).toBeUndefined()
    }

    expect(theme?.fields.map(({ name }) => name)).toEqual([
      'appearance',
      'layout',
      'headerLayout',
      'contentAlignment',
      'splitContentAlignment',
      'size',
    ])
    expect(getField(theme?.fields ?? [], 'layout')?.options).toEqual([
      { label: 'Editorial List', value: 'editorialRow' },
      { label: 'Calm Grid', value: 'highlightsGrid' },
      { label: 'Simple Grid', value: 'simpleGrid' },
    ])
    expect(getField(theme?.fields ?? [], 'headerLayout')).toMatchObject({
      defaultValue: 'stacked',
      required: true,
      type: 'select',
    })
    expect(getField(theme?.fields ?? [], 'headerLayout')?.options?.map(({ value }) => value)).toEqual([
      'stacked',
      'split',
    ])
    expect(getField(theme?.fields ?? [], 'enableSplitLayout')).toBeUndefined()

    const horizontal = getField(theme?.fields ?? [], 'contentAlignment')
    const vertical = getField(theme?.fields ?? [], 'splitContentAlignment')
    expect(horizontal).toMatchObject({ defaultValue: 'left', type: 'select' })
    expect(horizontal?.admin?.condition?.({}, { headerLayout: 'stacked' })).toBe(true)
    expect(horizontal?.admin?.condition?.({}, { headerLayout: 'split' })).toBe(false)
    expect(vertical).toMatchObject({ defaultValue: 'top', type: 'select' })
    expect(vertical?.admin?.condition?.({}, { headerLayout: 'stacked' })).toBe(false)
    expect(vertical?.admin?.condition?.({}, { headerLayout: 'split' })).toBe(true)
    expect(getField(theme?.fields ?? [], 'size')?.defaultValue).toBe('default')
  })

  it.each([
    ['editorialRow', 'editorial', 'gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3'],
    ['highlightsGrid', 'calm', 'gap-6 md:grid-cols-2 lg:grid-cols-3'],
    ['simpleGrid', 'simple', 'gap-x-12 gap-y-10 md:grid-cols-2'],
  ] as const)('renders the %s presentation', (layout, presentation, gridClasses) => {
    const html = renderToStaticMarkup(
      <ContentHighlights
        appearance={{ background: 'subtle', border: 'topAndBottom' }}
        description="A concise introduction to the highlighted content."
        eyebrow="Latest"
        items={[item('First'), item('Second'), item('Third')]}
        layout={layout}
        size="compact"
        title="Content worth exploring"
      />,
    )

    expect(html).toContain(`data-content-highlights-layout="${layout}"`)
    expect(html).toContain(`data-content-highlight-presentation="${presentation}"`)
    expect(html).toContain(gridClasses)
    expect(html).toContain('max-w-screen-2xl')
    expect(html).toContain('bg-subtle')
    expect(html).toContain('border-y border-border')
  })

  it('supports Stacked and Split header compositions', () => {
    const stacked = renderToStaticMarkup(
      <ContentHighlights
        contentAlignment="right"
        headerLayout="stacked"
        items={[item('First'), item('Second')]}
        title="Highlights"
      />,
    )
    const split = renderToStaticMarkup(
      <ContentHighlights
        headerLayout="split"
        items={[item('First'), item('Second')]}
        splitContentAlignment="bottom"
        title="Highlights"
      />,
    )

    expect(stacked).toContain('data-content-highlights-header-layout="stacked"')
    expect(stacked).toContain('ml-auto items-end text-right')
    expect(split).toContain('data-content-highlights-header-layout="split"')
    expect(split).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]')
    expect(split).toContain('lg:self-end')
    expect(split).not.toContain('lg:grid-cols-3')
  })

  it('normalizes per-card markers after unusable rows are removed', () => {
    const html = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        items={[
          { markerMode: 'numbered', title: 'First usable card' },
          { markerMode: 'numbered', title: '   ' },
          { markerLabel: 'Clinical', markerMode: 'custom', title: 'Custom marker' },
          { markerMode: 'hidden', title: 'No marker' },
          { markerLabel: '   ', markerMode: 'custom', title: 'Blank custom marker' },
          { markerMode: 'stale' as never, title: 'Safe default' },
        ]}
        title="Highlights"
      />,
    )

    expect(html).toContain('data-content-highlight-marker="01"')
    expect(html).toContain('data-content-highlight-marker="Clinical"')
    expect(html).toContain('data-content-highlight-marker="05"')
    expect(html).not.toContain('data-content-highlight-marker="02"')
    expect(html).not.toContain('data-content-highlight-marker="03"')
    expect(html).not.toContain('data-content-highlight-marker=""')
    expect(html).not.toContain('data-content-highlight-metadata')
  })

  it('renders one explicit card action and ignores legacy title-link fields', () => {
    const html = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        items={[
          {
            cardAction: [
              {
                label: 'Explore programme',
                linkType: 'custom',
                mode: 'button',
                openInNewTab: true,
                showArrow: true,
                url: '/programmes',
                variant: 'default',
              },
            ],
            cardBackground: 'primary',
            linkType: 'custom',
            metadata: 'Discard me',
            title: 'Clinical learning',
            url: '/legacy-title-link',
          } as never,
          {
            cardAction: [{ label: 'Broken action', linkType: 'custom', url: '' }],
            title: 'No empty footer',
          },
        ]}
        title="Highlights"
      />,
    )

    expect(html).toContain('data-content-highlight-action-footer="true"')
    expect(html).toContain('border-t')
    expect(html).toContain('mt-auto')
    expect(html).toContain('href="/programmes"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
    expect(html).toContain('data-action-arrow="true"')
    expect(html).toContain('bg-primary-foreground text-primary')
    expect(html).not.toContain('/legacy-title-link')
    expect(html).not.toContain('Discard me')
    expect(html.match(/data-content-highlight-action-footer="true"/g)).toHaveLength(1)
  })

  it.each([
    ['editorialRow', 'editorialRow'],
    ['highlightsGrid', 'highlightsGrid'],
    ['simpleGrid', 'simpleGrid'],
    ['numberedSteps', 'highlightsGrid'],
    ['stale', 'highlightsGrid'],
  ] as const)('normalizes %s to %s', (layout, expected) => {
    const html = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        items={[{ title: 'Item' }]}
        layout={layout as never}
        title="Highlights"
      />,
    )
    expect(html).toContain(`data-content-highlights-layout="${expected}"`)
  })

  it('uses legacy split data only when Header Layout is absent', () => {
    const legacy = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        enableSplitLayout
        items={[{ title: 'Item' }]}
        title="Legacy split"
      />,
    )
    const explicit = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        enableSplitLayout
        headerLayout="stacked"
        items={[{ title: 'Item' }]}
        title="Explicit stacked"
      />,
    )
    expect(legacy).toContain('data-content-highlights-header-layout="split"')
    expect(explicit).toContain('data-content-highlights-header-layout="stacked"')
  })

  it('keeps section and footer actions independent from card actions', () => {
    const html = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        actions={[{ label: 'Explore all', linkType: 'custom', url: '/explore' }]}
        footerActions={[{ label: 'Contact us', linkType: 'custom', url: '/contact' }]}
        items={[item('Static card')]}
        title="Useful links"
      />,
    )

    expect(html).toContain('data-content-highlights-actions="true"')
    expect(html).toContain('href="/explore"')
    expect(html).toContain('href="/contact"')
    expect(html).not.toContain('data-content-highlight-action-footer="true"')
  })

  it('renders the editor-authored accent title', () => {
    const html = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        accentTitle="worth exploring."
        items={[item('Research')]}
        title="Content"
      />,
    )

    expect(html).toContain('<span class="block font-[inherit]">Content</span>')
    expect(html).toContain('<em class="block font-[inherit]">worth exploring.</em>')
  })

  it('renders nothing when required display content is unusable', () => {
    expect(ContentHighlightsBlockComponent({ items: [item('Item')], title: '   ' })).toBeNull()
    expect(
      ContentHighlightsBlockComponent({
        items: [{ markerMode: 'numbered', title: '   ' }],
        title: 'Valid title',
      }),
    ).toBeNull()
  })

  it('uses the current generated Payload contract', () => {
    const generatedTypes = readFileSync('src/payload-types.ts', 'utf8')
    const contentHighlightsType = generatedTypes.slice(
      generatedTypes.indexOf('export interface ContentHighlightsBlock {'),
      generatedTypes.indexOf('export interface EditorialReasonsBlock {'),
    )

    expect(contentHighlightsType).toContain("markerMode: 'numbered' | 'custom' | 'hidden';")
    expect(contentHighlightsType).toContain('markerLabel?: string | null;')
    expect(contentHighlightsType).toContain('cardAction?:')
    expect(contentHighlightsType).toContain(
      "layout: 'editorialRow' | 'highlightsGrid' | 'simpleGrid';",
    )
    expect(contentHighlightsType).toContain("headerLayout: 'stacked' | 'split';")
    expect(contentHighlightsType).not.toContain('metadata?:')
    expect(contentHighlightsType).not.toContain("linkType: 'none' | 'page' | 'custom';")
    expect(contentHighlightsType).not.toContain('enableSplitLayout')
    expect(contentHighlightsType).not.toContain('numberedSteps')
  })
})
