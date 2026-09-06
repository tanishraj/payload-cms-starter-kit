import { describe, expect, it } from 'vitest'
import type { Block, Field, TabsField } from 'payload'

import { pageBuilderBlocks } from '@/blocks/blockCatalog'
import { blockSectionProfiles } from '@/blocks/shared/blockSectionProfiles'
import {
  createFooterActionsField,
  createIntroductionActionsField,
  createSectionAlignmentField,
  createSectionPaddingField,
  sectionAlignmentOptions,
  sectionPaddingOptions,
} from '@/blocks/shared/sectionFields'

describe('block section schema contract', () => {
  it('classifies every registered Page block exactly once', () => {
    expect(Object.keys(blockSectionProfiles).sort()).toEqual(
      pageBuilderBlocks.map(({ slug }) => slug).sort(),
    )
  })

  it('defines the shared section alignment field', () => {
    expect(createSectionAlignmentField()).toMatchObject({
      name: 'contentAlignment',
      label: 'Section Content Alignment',
      type: 'select',
      defaultValue: 'left',
      required: true,
      options: sectionAlignmentOptions,
    })
    expect(sectionAlignmentOptions).toEqual([
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ])
  })

  it('defines the shared section padding field', () => {
    expect(createSectionPaddingField()).toMatchObject({
      name: 'size',
      label: 'Section Padding',
      type: 'select',
      defaultValue: 'default',
      required: true,
      options: sectionPaddingOptions,
    })
  })

  it('gives introduction and footer actions consistent authoring labels', () => {
    expect(createIntroductionActionsField()).toMatchObject({
      name: 'actions',
      label: 'Introduction Actions',
      maxRows: 2,
    })
    expect(createFooterActionsField()).toMatchObject({
      name: 'footerActions',
      label: 'Footer Actions',
      maxRows: 2,
    })
  })

  const standardBlocks = pageBuilderBlocks.filter(
    ({ slug }) => blockSectionProfiles[slug as keyof typeof blockSectionProfiles] === 'standard',
  )

  const topLevelTabs = (block: Block): TabsField => {
    const tabs = block.fields.find((field): field is TabsField => field.type === 'tabs')

    if (!tabs) throw new Error(`${block.slug} does not define top-level tabs`)
    return tabs
  }

  const fieldsForTab = (block: Block, label: string): Field[] => {
    const tab = topLevelTabs(block).tabs.find((candidate) => candidate.label === label)

    if (!tab) throw new Error(`${block.slug} does not define the ${label} tab`)
    return tab.fields
  }

  const namedFields = (fields: Field[]) =>
    fields.filter((field): field is Field & { name: string } => 'name' in field)

  const introAliases: Record<string, readonly string[]> = {
    aboutSection: ['eyebrow', 'title', 'accentTitle', 'body'],
    pageHeader: ['eyebrow', 'title', 'accentTitle', 'subtitle'],
    testimonialSpotlight: ['sectionEyebrow', 'sectionTitle', 'sectionDescription'],
  }

  it('keeps standard block actions in the shared Content order', () => {
    for (const block of standardBlocks) {
      const contentFields = namedFields(fieldsForTab(block, 'Content'))
      const contentFieldNames = contentFields.map(({ name }) => name)
      const introNames =
        introAliases[block.slug] ?? ['eyebrow', 'title', 'accentTitle', 'description']
      const introIndex = Math.max(...introNames.map((name) => contentFieldNames.indexOf(name)))
      const actions = contentFields.find(({ name }) => name === 'actions')
      const footerActions = contentFields.find(({ name }) => name === 'footerActions')

      expect(actions, `${block.slug} Introduction Actions`).toMatchObject({
        label: 'Introduction Actions',
      })
      expect(contentFieldNames.indexOf('actions'), `${block.slug} action order`).toBeGreaterThan(
        introIndex,
      )
      expect(footerActions, `${block.slug} Footer Actions`).toMatchObject({
        label: 'Footer Actions',
      })
      expect(contentFieldNames.at(-1), `${block.slug} footer order`).toBe('footerActions')
    }
  })

  it('gives every standard block the shared section theme controls', () => {
    for (const block of standardBlocks) {
      const themeFields = namedFields(fieldsForTab(block, 'Theme Settings'))
      const alignmentName =
        block.slug === 'testimonialSpotlight'
          ? 'sectionContentAlignment'
          : 'contentAlignment'
      const alignment = themeFields.find(({ name }) => name === alignmentName)
      const padding = themeFields.find(({ name }) => name === 'size')

      expect(alignment, `${block.slug} alignment`).toMatchObject({
        label: 'Section Content Alignment',
        options: sectionAlignmentOptions,
        required: true,
      })
      expect(padding, `${block.slug} padding`).toMatchObject({
        label: 'Section Padding',
        options: sectionPaddingOptions,
        required: true,
      })
    }
  })

  it('includes an eyebrow on the two previously incomplete standard introductions', () => {
    for (const slug of ['qaAccordion', 'teamShowcase']) {
      const block = standardBlocks.find((candidate) => candidate.slug === slug)
      expect(block, slug).toBeDefined()
      expect(namedFields(fieldsForTab(block!, 'Content')).map(({ name }) => name)).toContain(
        'eyebrow',
      )
    }
  })

  it.each([
    'pageHeader',
    'contact24',
    'contact33',
    'galleryShowcase',
    'imageMosaic',
    'mediaCarousel',
    'numberedSteps',
    'profileCarousel',
    'ratingSpotlight',
    'reviewFeed',
    'timeline',
  ])('requires %s title because its renderer cannot render without one', (slug) => {
    const block = standardBlocks.find((candidate) => candidate.slug === slug)
    const title = namedFields(fieldsForTab(block!, 'Content')).find(({ name }) => name === 'title')

    expect(title, `${slug} title`).toMatchObject({ required: true })
  })
})
