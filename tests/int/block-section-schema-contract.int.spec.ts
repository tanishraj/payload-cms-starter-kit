import { describe, expect, it } from 'vitest'

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
})
