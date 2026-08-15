import { readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { StudyPathwaysBlockComponent } from '@/blocks/StudyPathways/Component'
import { StudyPathwaysBlock } from '@/blocks/StudyPathways/config'
import type { Media } from '@/payload-types'

const findNamedField = (fields: unknown[], name: string): Record<string, unknown> | undefined => {
  for (const candidate of fields) {
    if (!candidate || typeof candidate !== 'object') continue

    const field = candidate as Record<string, unknown>
    if (field.name === name) return field

    if (Array.isArray(field.fields)) {
      const nested = findNamedField(field.fields, name)
      if (nested) return nested
    }

    if (Array.isArray(field.tabs)) {
      for (const candidateTab of field.tabs) {
        if (!candidateTab || typeof candidateTab !== 'object') continue
        const tab = candidateTab as Record<string, unknown>
        if (!Array.isArray(tab.fields)) continue
        const nested = findNamedField(tab.fields, name)
        if (nested) return nested
      }
    }
  }
}

const selectValues = (name: string) => {
  const field = findNamedField(StudyPathwaysBlock.fields, name)
  const options = Array.isArray(field?.options) ? field.options : []

  return options.map((candidate) =>
    candidate && typeof candidate === 'object' && 'value' in candidate
      ? (candidate as { value: unknown }).value
      : candidate,
  )
}

const media = (index: number): Media =>
  ({
    alt: `Pathway ${index}`,
    height: 900,
    id: `media-${index}`,
    updatedAt: '2026-08-15T00:00:00.000Z',
    url: `/block-thumbnail-assets/pathway-${index}.jpg`,
    width: 1600,
  }) as Media

const pathway = (index: number) => ({
  description: `Description ${index}`,
  image: media(index),
  imagePosition: 'center' as const,
  title: `Pathway ${index}`,
})

describe('Study Pathways block', () => {
  it('defines the intended admin schema', () => {
    expect(StudyPathwaysBlock).toMatchObject({
      interfaceName: 'StudyPathwaysBlock',
      labels: { plural: 'Study Pathways', singular: 'Study Pathways' },
      slug: 'studyPathways',
    })
    expect(findNamedField(StudyPathwaysBlock.fields, 'pathways')).toMatchObject({
      maxRows: 4,
      minRows: 2,
      required: true,
      type: 'array',
    })
    expect(selectValues('cardSplit')).toEqual(['60-40', 'equal', '40-60', '30-30-60', '60-30-30'])
    expect(selectValues('cardHeight')).toEqual(['compact', 'default', 'comfortable'])
    expect(selectValues('contentAlignment')).toEqual(['left', 'center', 'right'])
  })

  it('renders configured headings and responsive two-card splits', () => {
    const html = renderToStaticMarkup(
      <StudyPathwaysBlockComponent
        accentTitle="direction."
        cardSplit="60-40"
        pathways={[pathway(1), pathway(2)]}
        title="Study"
      />,
    )

    expect(html).toContain('data-study-pathways="true"')
    expect(html).toContain('lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]')
    expect(html).toContain('<em class="block font-[inherit]">direction.</em>')
  })

  it('renders three- and four-card split layouts', () => {
    const threeCards = renderToStaticMarkup(
      <StudyPathwaysBlockComponent
        cardSplit="30-30-60"
        pathways={[pathway(1), pathway(2), pathway(3)]}
      />,
    )
    const fourCards = renderToStaticMarkup(
      <StudyPathwaysBlockComponent
        cardSplit="60-30-30"
        pathways={[pathway(1), pathway(2), pathway(3), pathway(4)]}
      />,
    )

    expect(threeCards).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(18rem,2fr)]')
    expect(fourCards).toContain('lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]')
    expect(fourCards).toContain('lg:col-span-2')
  })

  it('honors header, alignment, height, overlay, and link controls', () => {
    const compact = renderToStaticMarkup(
      <StudyPathwaysBlockComponent
        cardHeight="compact"
        contentAlignment="center"
        description="Choose a route"
        headerLayout="stacked"
        pathways={[
          {
            ...pathway(1),
            imagePosition: 'right',
            linkType: 'custom',
            openInNewTab: true,
            overlayCoverage: 'split',
            overlayDirection: 'leftToRight',
            overlayStrength: 'darker',
            themeMode: 'brand',
            url: '/pathways/one',
          },
          pathway(2),
        ]}
        title="Study"
      />,
    )
    const comfortable = renderToStaticMarkup(
      <StudyPathwaysBlockComponent
        cardHeight="comfortable"
        contentAlignment="right"
        pathways={[pathway(1), pathway(2)]}
        title="Study"
      />,
    )

    expect(compact).toContain('max-w-3xl')
    expect(compact).toContain('mx-auto items-center text-center')
    expect(compact).toContain('min-h-[18rem] sm:min-h-[20rem]')
    expect(compact).toContain('object-right')
    expect(compact).toContain('href="/pathways/one"')
    expect(compact).toContain('target="_blank"')
    expect(compact).toContain('data-study-pathways-overlay-coverage="split"')
    expect(compact).toContain('data-study-pathways-overlay-direction="leftToRight"')
    expect(compact).toContain('data-study-pathways-overlay-strength="darker"')
    expect(compact).toContain('data-study-pathways-overlay-tone="brand"')
    expect(comfortable).toContain('ml-auto items-end text-right')
    expect(comfortable).toContain('min-h-[24rem] sm:min-h-[28rem] xl:min-h-[30rem]')
  })

  it('filters unusable rows, caps output at four cards, and handles an empty result', () => {
    const filtered = renderToStaticMarkup(
      <StudyPathwaysBlockComponent
        pathways={[
          pathway(1),
          { ...pathway(2), title: '   ' },
          pathway(3),
          pathway(4),
          pathway(5),
          pathway(6),
        ]}
      />,
    )

    expect(filtered).not.toContain('Pathway 2</h3>')
    expect(filtered).not.toContain('Pathway 6</h3>')
    expect(filtered.match(/<h3/g)).toHaveLength(4)
    expect(
      StudyPathwaysBlockComponent({ pathways: [{ image: media(1), title: '   ' }] }),
    ).toBeNull()
  })

  it('is registered across schema, renderers, types, and thumbnail infrastructure', () => {
    const sources = [
      'src/collections/Pages.ts',
      'src/collections/ReusableSections.ts',
      'src/blocks/renderPageBlocks.tsx',
      'src/blocks/renderLivePreviewPageBlocks.tsx',
      'src/payload-types.ts',
      'src/block-thumbnails/definitions.ts',
      'src/block-thumbnails/fixtures.tsx',
    ].map((file) => readFileSync(file, 'utf8'))

    for (const source of sources) {
      expect(source).toMatch(/StudyPathways|studyPathways/)
    }
    expect(sources[4]).toContain("blockType: 'studyPathways'")
    expect(sources[5]).toContain("filename: 'study-pathways.jpg'")
  })
})
