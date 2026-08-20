import { readFileSync } from 'node:fs'

import { GraduationCap, Hospital, Users } from 'lucide-react'
import type { ArrayField, Field, TabsField } from 'payload'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ProgramMatrixBlockComponent } from '@/blocks/ProgramMatrix/Component'
import { ProgramMatrixBlock } from '@/blocks/ProgramMatrix/config'
import { resolveLucideIcon } from '@/blocks/shared/resolveLucideIcon'
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
    if ('name' in field && field.name === name) {
      return field
    }

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

describe('resolveLucideIcon', () => {
  it.each([
    ['Hospital', Hospital],
    ['hospital', Hospital],
    [' hospital ', Hospital],
    ['GraduationCap', GraduationCap],
    ['graduation-cap', GraduationCap],
    ['graduation_cap', GraduationCap],
    ['graduation cap icon', GraduationCap],
    ['users', Users],
  ])('resolves %s', (name, expectedIcon) => {
    expect(resolveLucideIcon(name)).toBe(expectedIcon)
  })

  it('omits empty and invalid icon names', () => {
    expect(resolveLucideIcon()).toBeUndefined()
    expect(resolveLucideIcon('')).toBeUndefined()
    expect(resolveLucideIcon('not-a-real-lucide-icon')).toBeUndefined()
  })
})

describe('ProgramMatrixBlock schema', () => {
  it('defines its identity and required item limits', () => {
    expect(ProgramMatrixBlock).toMatchObject({
      slug: 'programMatrix',
      interfaceName: 'ProgramMatrixBlock',
      labels: {
        singular: 'Program Matrix',
        plural: 'Program Matrices',
      },
    })
    expect(ProgramMatrixBlock.admin?.images?.thumbnail).toEqual({
      alt: 'Program Matrix block preview',
      url: '/block-thumbnails/program-matrix.jpg',
    })
    expect(findNamedField(ProgramMatrixBlock.fields, 'title')).toMatchObject({
      type: 'text',
      required: true,
    })
    expect(findNamedField(ProgramMatrixBlock.fields, 'items')).toMatchObject({
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 24,
    })
  })

  it('defines the approved action, alignment, appearance, and spacing controls', () => {
    const tabs = ProgramMatrixBlock.fields.find((field) => field.type === 'tabs')
    const itemsField = findNamedField(ProgramMatrixBlock.fields, 'items') as ArrayField
    const itemTabs = itemsField.fields[0] as TabsField

    expect(tabs && tabs.type === 'tabs' ? tabs.tabs.map((tab) => tab.label) : []).toEqual([
      'Content',
      'Theme Settings',
    ])
    expect(itemTabs.tabs.map((tab) => tab.label)).toEqual(['Content', 'Theme Settings'])
    expect(findNamedField(ProgramMatrixBlock.fields, 'cardBackground')).toMatchObject({
      label: 'Background',
      type: 'select',
      defaultValue: 'default',
      required: true,
      options: [
        { label: 'Default Card', value: 'default' },
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Muted', value: 'muted' },
        { label: 'Accent', value: 'accent' },
      ],
    })
    expect(findNamedField(ProgramMatrixBlock.fields, 'actionMode')).toMatchObject({
      type: 'select',
      defaultValue: 'link',
      required: false,
    })
    expect(findNamedField(ProgramMatrixBlock.fields, 'actionVariant')).toMatchObject({
      type: 'select',
      defaultValue: 'default',
    })
    expect(findNamedField(ProgramMatrixBlock.fields, 'itemActionLabel')).toMatchObject({
      type: 'text',
      defaultValue: 'Learn More',
    })
    expect(findNamedField(ProgramMatrixBlock.fields, 'contentAlignment')).toMatchObject({
      type: 'select',
      defaultValue: 'left',
      required: true,
    })
    expect(findNamedField(ProgramMatrixBlock.fields, 'size')).toMatchObject({
      type: 'select',
      defaultValue: 'default',
      required: true,
    })
    expect(findNamedField(ProgramMatrixBlock.fields, 'appearance')).toBeDefined()
  })
})

const baseItems = [
  {
    description: 'Supervised clinical learning from the first semester.',
    icon: 'hospital',
    title: 'MBBS',
    metadata: '4.5 Years + 1 Year Internship',
  },
  {
    icon: 'graduation-cap',
    title: 'Postgraduate MD / MS',
    metadata: '3 Years',
  },
  {
    icon: 'heart-pulse',
    title: 'GNM & B.Sc Nursing',
    metadata: '3–4 Years',
  },
  {
    icon: 'microscope',
    title: 'Allied Health Sciences',
    metadata: '2–3 Years',
  },
]

describe('ProgramMatrixBlockComponent', () => {
  it('renders semantic responsive content and flexible icons', () => {
    const html = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        description="Four routes into clinical practice."
        eyebrow="Academics"
        items={baseItems}
        title="Programmes offered"
      />,
    )

    expect(html).toContain('<h2')
    expect(html).toContain('<h3')
    expect(html).toContain('data-program-matrix="true"')
    expect(html).toContain('md:grid-cols-2')
    expect(html.match(/data-program-matrix-item="true"/g)).toHaveLength(4)
    expect(html).toContain('lucide-hospital')
    expect(html).toContain('lucide-graduation-cap')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('flex flex-col gap-10 md:gap-12')
    expect(html).toContain('flex max-w-3xl flex-col gap-4')
    expect(html).toContain(
      'text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl',
    )
    expect(html).not.toContain('font-serif')
    expect(html).toContain('max-w-[70ch] text-base leading-7 text-current/70')
    expect(html).toContain('p-6 text-left md:p-8 bg-transparent text-current border-current/10')
    expect(html).toContain('mb-4 size-5 shrink-0')
    expect(html).toContain('font-sans text-lg font-semibold leading-snug text-current')
    expect(html).toContain('mt-2 font-mono text-xs font-semibold uppercase tracking-[0.24em]')
    expect(html).toContain('mt-4 max-w-[65ch] text-sm leading-6')
  })

  it('uses the shared eyebrow color treatment on colored section surfaces', () => {
    const html = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        appearance={{ background: 'brand' }}
        eyebrow="Academics"
        items={baseItems}
        title="Programmes"
      />,
    )

    expect(html).toContain(
      'font-mono text-xs font-semibold uppercase tracking-[0.24em] text-current/70',
    )
  })

  it('adapts every card surface through semantic theme classes', () => {
    const html = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        items={[
          { cardBackground: 'default', title: 'Default' },
          { cardBackground: 'primary', title: 'Primary' },
          { cardBackground: 'secondary', title: 'Secondary' },
          { cardBackground: 'muted', title: 'Muted' },
          { cardBackground: 'accent', title: 'Accent' },
        ]}
        title="Programmes"
      />,
    )

    expect(html).toContain('data-card-background="default"')
    expect(html).toContain('data-card-background="primary"')
    expect(html).toContain('data-card-background="secondary"')
    expect(html).toContain('data-card-background="muted"')
    expect(html).toContain('data-card-background="accent"')
    expect(html).toContain('bg-transparent text-current')
    expect(html).toContain('bg-primary text-primary-foreground')
    expect(html).toContain('bg-secondary text-secondary-foreground')
    expect(html).toContain('bg-muted text-foreground')
    expect(html).toContain('bg-accent text-accent-foreground')
    expect(html).toContain('border-primary-foreground/15')
    expect(html).toContain('border-secondary-foreground/15')
    expect(html).toContain('border-accent-foreground/15')
  })

  it('falls back to Default Card for an invalid surface value', () => {
    const html = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        items={[{ cardBackground: 'invalid' as never, title: 'Legacy programme' }]}
        title="Programmes"
      />,
    )

    expect(html).toContain('data-card-background="default"')
    expect(html).toContain('bg-transparent text-current')
  })

  it('honors link, button, and legacy programme action modes', () => {
    const linkHtml = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        actionMode="link"
        itemActionLabel="View programme"
        items={[
          {
            cardBackground: 'primary',
            linkType: 'custom',
            title: 'MBBS',
            url: '/mbbs',
          },
        ]}
        title="Programmes"
      />,
    )
    const buttonHtml = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        actionMode="button"
        actionVariant="secondary"
        itemActionLabel="Apply"
        items={[
          {
            cardBackground: 'secondary',
            linkType: 'custom',
            title: 'Nursing',
            url: '/nursing',
          },
        ]}
        title="Programmes"
      />,
    )
    const legacyHtml = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        items={[{ linkType: 'custom', title: 'Allied Health', url: '/allied-health' }]}
        title="Programmes"
      />,
    )

    expect(linkHtml).toContain('data-content-link="true"')
    expect(linkHtml).toContain('text-primary-foreground')
    expect(linkHtml).not.toContain('data-slot="button"')
    expect(buttonHtml).toContain('data-slot="button"')
    expect(buttonHtml).toContain('data-variant="secondary"')
    expect(buttonHtml).toContain('bg-secondary-foreground text-secondary')
    expect(buttonHtml).not.toContain('data-content-link="true"')
    expect(legacyHtml).toContain('data-content-link="true"')
  })

  it('adapts section actions when the block uses a matching colored surface', () => {
    const linkHtml = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        actions={[{ label: 'Explore', linkType: 'custom', url: '/programmes' }]}
        appearance={{ background: 'brand' }}
        items={baseItems}
        title="Programmes"
      />,
    )
    const buttonHtml = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        actions={[
          {
            label: 'Explore',
            linkType: 'custom',
            mode: 'button',
            url: '/programmes',
            variant: 'default',
          },
        ]}
        appearance={{ background: 'brand' }}
        items={baseItems}
        title="Programmes"
      />,
    )

    // Brand-surface contrast for BOTH buttons and links now comes from custom.css
    // (`.bg-brand [data-slot='button']...` and `.bg-brand [data-content-link='true']`),
    // so the component emits no per-variant Tailwind classes of its own — it only
    // marks the surface and lets each action declare its own display mode.
    expect(linkHtml).toContain('data-surface-contrast="true"')
    expect(buttonHtml).toContain('data-surface-contrast="true"')
    expect(linkHtml).toContain('data-action-mode="link"')
    expect(linkHtml).toContain('data-content-link="true"')
    expect(buttonHtml).toContain('data-action-mode="button"')
    expect(buttonHtml).toContain('data-slot="button"')
    expect(buttonHtml).toContain('data-variant="default"')
    // No hand-rolled contrast classes survive in either mode.
    expect(linkHtml).not.toContain(':text-current')
    expect(buttonHtml).not.toContain('bg-primary-foreground')
  })

  it('omits invalid rows and invalid icons without a fallback', () => {
    const html = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        items={[
          { icon: 'not-a-real-icon', title: 'Valid Programme' },
          { icon: 'star', title: '   ' },
        ]}
        title="Programmes"
      />,
    )

    expect(html).toContain('Valid Programme')
    expect(html).not.toContain('lucide-star')
    expect(html).not.toContain('data-program-icon="true"')
  })

  it('renders explicit link actions without wrapping the cell', () => {
    const linkHtml = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        itemActionLabel="View Programme"
        items={[{ linkType: 'custom', title: 'MBBS', url: '/mbbs' }]}
        title="Programmes"
      />,
    )
    const newTabHtml = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        itemActionLabel="Apply"
        items={[
          {
            linkType: 'custom',
            openInNewTab: true,
            title: 'MBBS',
            url: 'https://example.com',
          },
        ]}
        title="Programmes"
      />,
    )

    expect(linkHtml).toContain('View Programme')
    expect(linkHtml).toContain('href="/mbbs"')
    expect(linkHtml).not.toContain('<a href="/mbbs"><article')
    expect(newTabHtml).toContain('Apply')
    expect(newTabHtml).toContain('target="_blank"')
    expect(newTabHtml).toContain('rel="noreferrer"')
  })

  it('resolves hierarchical page links and omits actions without a destination', () => {
    const parent = { id: 'academics', slug: 'academics' } as unknown as Page
    const page = { id: 'mbbs', parent, slug: 'mbbs' } as unknown as Page
    const html = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        itemActionLabel="View Programme"
        items={[
          { linkType: 'page', page, title: 'MBBS' },
          { linkType: 'none', title: 'Nursing' },
        ]}
        title="Programmes"
      />,
    )

    expect(html).toContain('href="/academics/mbbs"')
    expect(html.match(/View Programme/g)).toHaveLength(1)
  })

  it('marks an odd final row for correct desktop dividers', () => {
    const html = renderToStaticMarkup(
      <ProgramMatrixBlockComponent items={baseItems.slice(0, 3)} title="Programmes" />,
    )

    expect(html.match(/data-program-matrix-item="true"/g)).toHaveLength(3)
    expect(html.match(/data-left-column="true"/g)).toHaveLength(2)
    expect(html.match(/data-last-desktop-row="true"/g)).toHaveLength(1)
  })

  it('passes alignment to section actions and derives mode from action rows', () => {
    const html = renderToStaticMarkup(
      <ProgramMatrixBlockComponent
        actions={[
          {
            label: 'Explore programmes',
            linkType: 'custom',
            mode: 'button',
            url: '/programmes',
          },
        ]}
        contentAlignment="center"
        items={baseItems}
        title="Programmes"
      />,
    )

    expect(html).toContain('data-program-matrix-actions="true"')
    expect(html).toContain('data-action-mode="button"')
    expect(html).toContain('items-center')
  })

  it('returns no markup without a title or valid items', () => {
    expect(renderToStaticMarkup(<ProgramMatrixBlockComponent items={baseItems} />)).toBe('')
    expect(
      renderToStaticMarkup(<ProgramMatrixBlockComponent items={[]} title="Programmes" />),
    ).toBe('')
  })
})

describe('Program Matrix registration', () => {
  it('is available to pages, reusable sections, and both renderers', () => {
    expect(pagesSource).toContain('ProgramMatrixBlock')
    expect(reusableSectionsSource).toContain('ProgramMatrixBlock')
    expect(pageRendererSource).toContain("case 'programMatrix':")
    expect(livePreviewRendererSource).toContain("case 'programMatrix':")
  })

  it('is represented in generated Payload types', () => {
    expect(payloadTypesSource).toContain('export interface ProgramMatrixBlock')
    expect(payloadTypesSource).toContain(
      "cardBackground: 'default' | 'primary' | 'secondary' | 'muted' | 'accent'",
    )
    expect(payloadTypesSource).toContain("blockType: 'programMatrix'")
  })
})

describe('Program Matrix catalogs', () => {
  it('has thumbnail definition and fixture coverage', () => {
    expect(thumbnailDefinitionsSource).toContain("filename: 'program-matrix.jpg'")
    expect(thumbnailDefinitionsSource).toContain("slug: 'programMatrix'")
    expect(thumbnailFixturesSource).toContain('programMatrix:')
    expect(thumbnailFixturesSource).toContain('<ProgramMatrixBlockComponent')
    expect(thumbnailFixturesSource).toContain('actionMode="button"')
    expect(thumbnailFixturesSource).toContain('itemActionLabel="View programme"')
    expect(thumbnailFixturesSource).toContain("url: '/programmes/mbbs'")
  })

  it('is recorded in architecture and operator documentation', () => {
    expect(featureInventorySource).toContain('Normal Pages register 51 choices')
    expect(featureInventorySource).toContain('Program Matrix')
    expect(blocksGuideSource).toMatch(/\| Program Matrix\s+\|/)
    expect(blocksGuideSource).toContain('independent semantic card backgrounds')
    expect(blocksGuideSource).toContain('optional Button or Link Text actions')
  })
})
