import { readFileSync } from 'node:fs'

import type { ArrayField, Field } from 'payload'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { EditorialReasonsBlockComponent } from '@/blocks/EditorialReasons/Component'
import { EditorialReasonsBlock } from '@/blocks/EditorialReasons/config'
import type { Page } from '@/payload-types'

const pagesSource = readFileSync('src/collections/Pages.ts', 'utf8')
const reusableSectionsSource = readFileSync('src/collections/ReusableSections.ts', 'utf8')
const pageRendererSource = readFileSync('src/blocks/renderPageBlocks.tsx', 'utf8')
const livePreviewRendererSource = readFileSync('src/blocks/renderLivePreviewPageBlocks.tsx', 'utf8')
const payloadTypesSource = readFileSync('src/payload-types.ts', 'utf8')
const thumbnailDefinitionsSource = readFileSync('src/block-thumbnails/definitions.ts', 'utf8')
const thumbnailFixturesSource = readFileSync('src/block-thumbnails/fixtures.tsx', 'utf8')
const featureInventorySource = readFileSync('docs/architecture/feature-inventory.md', 'utf8')
const blocksGuideSource = readFileSync('docs/guides/blocks.md', 'utf8')

const findNamedField = (fields: Field[], name: string): Field | undefined => {
  for (const field of fields) {
    if ('name' in field && field.name === name) return field

    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const match = findNamedField(tab.fields, name)
        if (match) return match
      }
    }

    if ('fields' in field && Array.isArray(field.fields)) {
      const match = findNamedField(field.fields, name)
      if (match) return match
    }
  }

  return undefined
}

const baseReasons = [
  {
    description: 'Learning connected directly with real-world patient care.',
    title: 'Clinical Exposure',
  },
  {
    description: 'Guidance from medical educators and practicing clinicians.',
    title: 'Experienced Faculty',
  },
  {
    description: 'Laboratories and clinical facilities for contemporary education.',
    title: 'Modern Infrastructure',
  },
  {
    description: 'Preparing future doctors while supporting healthcare access.',
    title: 'Community Impact',
  },
]

describe('EditorialReasonsBlock schema', () => {
  it('defines its identity, content, and row limits', () => {
    expect(EditorialReasonsBlock).toMatchObject({
      slug: 'editorialReasons',
      interfaceName: 'EditorialReasonsBlock',
      labels: { singular: 'Editorial Reasons', plural: 'Editorial Reasons' },
    })
    expect(EditorialReasonsBlock.admin?.images?.thumbnail).toEqual({
      alt: 'Editorial Reasons block preview',
      url: '/block-thumbnails/editorial-reasons.jpg',
    })

    const tabs = EditorialReasonsBlock.fields.find((field) => field.type === 'tabs')
    expect(tabs && tabs.type === 'tabs' ? tabs.tabs.map((tab) => tab.label) : []).toEqual([
      'Content',
      'Theme Settings',
    ])
    expect(findNamedField(EditorialReasonsBlock.fields, 'title')).toMatchObject({
      type: 'text',
      required: true,
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'accentTitle')).toMatchObject({
      type: 'text',
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'actions')).toMatchObject({
      type: 'array',
      maxRows: 2,
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'reasons')).toMatchObject({
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 8,
    })
  })

  it('defines reason links and approved theme controls', () => {
    const reasons = findNamedField(EditorialReasonsBlock.fields, 'reasons') as ArrayField

    expect(findNamedField(reasons.fields, 'linkType')).toMatchObject({
      type: 'radio',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Page', value: 'page' },
        { label: 'Custom URL', value: 'custom' },
      ],
    })
    expect(findNamedField(reasons.fields, 'page')).toMatchObject({
      type: 'relationship',
      relationTo: 'pages',
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'appearance')).toBeDefined()
    expect(findNamedField(EditorialReasonsBlock.fields, 'actionMode')).toMatchObject({
      type: 'select',
      defaultValue: 'link',
      required: true,
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'introVerticalAlignment')).toMatchObject({
      type: 'select',
      defaultValue: 'top',
      required: true,
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'stickyIntro')).toMatchObject({
      type: 'checkbox',
      defaultValue: true,
    })
    expect(findNamedField(EditorialReasonsBlock.fields, 'size')).toMatchObject({
      type: 'select',
      defaultValue: 'default',
      required: true,
    })
  })
})

describe('EditorialReasonsBlockComponent', () => {
  it('renders the responsive asymmetric layout and ruled numbered list', () => {
    const html = renderToStaticMarkup(
      <EditorialReasonsBlockComponent
        accentTitle="Driven by purpose."
        description="A learning environment shaped around development and service."
        eyebrow="Why SNMIH"
        reasons={baseReasons}
        title="Built for learning."
      />,
    )

    expect(html).toContain('data-editorial-reasons="true"')
    expect(html).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]')
    expect(html).toContain('grid gap-10')
    expect(html).toContain('lg:gap-16')
    expect(html).toContain('data-editorial-reasons-intro="true"')
    expect(html).toContain('data-editorial-reasons-list="true"')
    expect(html).toContain('border-t border-border')
    expect(html.match(/data-editorial-reason="true"/g)).toHaveLength(4)
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(4)
    expect(html).toContain('>01<')
    expect(html).toContain('>04<')
    expect(html).toContain('flex max-w-3xl flex-col gap-4')
    expect(html).toContain('items-start')
    expect(html).toContain(
      'font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl',
    )
    expect(html).toContain('font-[family-name:var(--font-display)]')
    expect(html.match(/font-\[family-name:inherit\]/g)).toHaveLength(2)
    expect(html).toContain('italic')
    expect(html).toContain('grid-cols-[2rem_minmax(0,1fr)]')
    expect(html).toContain('sm:grid-cols-[3rem_minmax(0,1fr)]')
    expect(html).toContain('font-sans text-md leading-tight font-semibold text-current')
    expect(html).toContain('text-sm leading-6 text-current/70')
  })

  it.each([
    ['top', 'lg:self-start'],
    ['center', 'lg:self-center'],
    ['bottom', 'lg:self-end'],
  ] as const)('maps %s introduction alignment', (introVerticalAlignment, expectedClass) => {
    const html = renderToStaticMarkup(
      <EditorialReasonsBlockComponent
        introVerticalAlignment={introVerticalAlignment}
        reasons={baseReasons}
        title="Why choose us"
      />,
    )

    expect(html).toContain(expectedClass)
    expect(html).toContain(`data-editorial-reasons-intro-alignment="${introVerticalAlignment}"`)
  })

  it('enables stickiness only from the large breakpoint', () => {
    const sticky = renderToStaticMarkup(
      <EditorialReasonsBlockComponent reasons={baseReasons} stickyIntro title="Why choose us" />,
    )
    const staticMarkup = renderToStaticMarkup(
      <EditorialReasonsBlockComponent
        reasons={baseReasons}
        stickyIntro={false}
        title="Why choose us"
      />,
    )

    expect(sticky).toContain('lg:sticky lg:top-28')
    expect(sticky).toContain('data-editorial-reasons-sticky="true"')
    expect(staticMarkup).toContain('data-editorial-reasons-sticky="false"')
    expect(staticMarkup).not.toContain('lg:sticky')
  })

  it('filters invalid rows and resolves custom and hierarchical Page links', () => {
    const parent = { id: 'academics', slug: 'academics' } as unknown as Page
    const page = { id: 'why-us', parent, slug: 'why-us' } as unknown as Page
    const html = renderToStaticMarkup(
      <EditorialReasonsBlockComponent
        reasons={[
          { linkType: 'page', page, title: 'Clinical Exposure' },
          {
            linkType: 'custom',
            openInNewTab: true,
            title: 'Experienced Faculty',
            url: 'https://example.com/faculty',
          },
          { title: '   ' },
        ]}
        title="Why choose us"
      />,
    )

    expect(html.match(/data-editorial-reason="true"/g)).toHaveLength(2)
    expect(html).toContain('href="/academics/why-us"')
    expect(html).toContain('href="https://example.com/faculty"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
    expect(html).toContain('transition-opacity hover:opacity-70 hover:underline')
    expect(html).not.toContain('>03<')
  })

  it('uses semantic appearance, spacing, and shared actions', () => {
    const html = renderToStaticMarkup(
      <EditorialReasonsBlockComponent
        actionMode="button"
        actions={[
          {
            label: 'Explore admissions',
            linkType: 'custom',
            showArrow: true,
            url: '/admissions',
            variant: 'default',
          },
        ]}
        appearance={{ background: 'primary', border: 'topAndBottom' }}
        eyebrow="Why us"
        reasons={baseReasons}
        size="comfortable"
        title="Built for learning"
      />,
    )

    expect(html).toContain('bg-primary text-primary-foreground border-y border-border')
    expect(html).toContain('py-20 md:py-28')
    expect(html).toContain('data-section-eyebrow-surface="primary"')
    expect(html).toContain('data-editorial-reasons-actions="true"')
    expect(html).toContain('data-action-mode="button"')
    expect(html).toContain('data-action-arrow="true"')
    expect(html).toContain('data-action-variant="default"')
    expect(html).not.toContain('data-surface-contrast')
  })

  it('uses the same semantic link color and treatment as Content Highlights', () => {
    const html = renderToStaticMarkup(
      <EditorialReasonsBlockComponent
        actionMode="link"
        actions={[
          {
            label: 'Explore admissions',
            linkType: 'custom',
            url: '/admissions',
          },
        ]}
        reasons={baseReasons}
        title="Built for learning"
      />,
    )

    expect(html).toContain('data-content-link="true"')
    expect(html).toContain('text-primary')
    expect(html).toContain('text-sm font-semibold')
    expect(html).toContain('underline decoration-current/55')
  })

  it('returns no markup without a title or usable reason', () => {
    expect(renderToStaticMarkup(<EditorialReasonsBlockComponent reasons={baseReasons} />)).toBe('')
    expect(
      renderToStaticMarkup(
        <EditorialReasonsBlockComponent reasons={[{ title: '   ' }]} title="Why choose us" />,
      ),
    ).toBe('')
  })
})

describe('Editorial Reasons registration', () => {
  it('is available to Pages, Reusable Sections, and both renderers', () => {
    expect(pagesSource).toContain('EditorialReasonsBlock')
    expect(reusableSectionsSource).toContain('EditorialReasonsBlock')
    expect(pageRendererSource).toContain("case 'editorialReasons':")
    expect(livePreviewRendererSource).toContain("case 'editorialReasons':")
  })
})

describe('Editorial Reasons catalogs', () => {
  it('is represented in generated Payload types', () => {
    expect(payloadTypesSource).toContain('export interface EditorialReasonsBlock')
    expect(payloadTypesSource).toContain("blockType: 'editorialReasons'")
    expect(payloadTypesSource).toContain("introVerticalAlignment: 'top' | 'center' | 'bottom'")
  })

  it('has thumbnail definition and fixture coverage', () => {
    expect(thumbnailDefinitionsSource).toContain("filename: 'editorial-reasons.jpg'")
    expect(thumbnailDefinitionsSource).toContain("slug: 'editorialReasons'")
    expect(thumbnailFixturesSource).toContain('editorialReasons:')
    expect(thumbnailFixturesSource).toContain('<EditorialReasonsBlockComponent')
  })
})

describe('Editorial Reasons documentation', () => {
  it('is recorded in architecture and operator documentation', () => {
    expect(featureInventorySource).toContain('Normal Pages register 41 choices')
    expect(featureInventorySource).toContain('Editorial Reasons')
    expect(blocksGuideSource).toMatch(/\| Editorial Reasons\s+\|/)
    expect(blocksGuideSource).toContain('sticky introduction')
    expect(blocksGuideSource).toContain('automatically numbered ruled list')
  })
})
