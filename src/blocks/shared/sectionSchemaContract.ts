import type { Block, Field, TabsField } from 'payload'

import { blockSectionProfiles, type ProfiledPageBlockSlug } from './blockSectionProfiles'
import {
  createFooterActionsField,
  createIntroductionActionsField,
  createSectionAlignmentField,
  createSectionPaddingField,
  type SectionContentAlignment,
  type SectionPadding,
} from './sectionFields'

type NamedField = Field & { name: string }

const requiredTitleBlocks = new Set<ProfiledPageBlockSlug>([
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
])

const eyebrowBlocks = new Set<ProfiledPageBlockSlug>(['qaAccordion', 'teamShowcase'])

const centeredBlocks = new Set<ProfiledPageBlockSlug>([
  'aboutSection',
  'featureSpotlight',
  'qaAccordion',
  'testimonialSpotlight',
  'contact24',
  'cta39',
  'galleryCoverflow',
  'featureMatrix',
  'newsEventsHighlights',
  'profileCarousel',
  'galleryShowcase',
  'eventGallery',
  'imageMosaic',
  'ratingSpotlight',
  'reviewFeed',
  'reviewSubmission',
  'contact33',
  'teamShowcase',
  'services21',
  'videoEmbed',
  'mediaCarousel',
  'logoStrip',
  'timeline',
  'iconCardShowcase',
  'iconGrid',
  'tabsContent',
  'numberedSteps',
  'bentoGrid',
  'testimonialGrid',
])

const introductionFieldNames: Partial<Record<ProfiledPageBlockSlug, readonly string[]>> = {
  aboutSection: ['eyebrow', 'title', 'accentTitle', 'body'],
  pageHeader: ['eyebrow', 'title', 'accentTitle', 'subtitle'],
  testimonialSpotlight: ['sectionEyebrow', 'sectionTitle', 'sectionDescription'],
}

const isNamedField = (field: Field): field is NamedField => 'name' in field

const nameOf = (field: Field): string | undefined => (isNamedField(field) ? field.name : undefined)

const normalizeContentFields = (slug: ProfiledPageBlockSlug, fields: Field[]): Field[] => {
  let normalized = fields.map((field): Field => {
    if (!isNamedField(field)) return field

    if (field.name === 'actions' && field.type === 'array') {
      return { ...field, label: 'Introduction Actions' }
    }
    if (field.name === 'footerActions' && field.type === 'array') {
      return { ...field, label: 'Footer Actions' }
    }
    if (slug === 'mediaCarousel' && field.name === 'sectionActions' && field.type === 'array') {
      return {
        ...field,
        label: 'Legacy Section Actions',
        admin: { ...field.admin, hidden: true },
      }
    }
    if (field.name === 'title' && field.type === 'text' && requiredTitleBlocks.has(slug)) {
      return { ...field, required: true }
    }

    return field
  })

  if (eyebrowBlocks.has(slug) && !normalized.some((field) => nameOf(field) === 'eyebrow')) {
    const titleIndex = normalized.findIndex((field) => nameOf(field) === 'title')
    const eyebrowField: Field = {
      name: 'eyebrow',
      label: 'Eyebrow',
      type: 'text',
      admin: { description: 'Small label above the section title.' },
    }

    normalized.splice(Math.max(titleIndex, 0), 0, eyebrowField)
  }

  const existingActions = normalized.find((field) => nameOf(field) === 'actions')
  const existingFooterActions = normalized.find((field) => nameOf(field) === 'footerActions')
  const actions = existingActions ?? createIntroductionActionsField()
  const footerActions = existingFooterActions ?? createFooterActionsField()
  const bodyFields = normalized.filter((field) => {
    const name = nameOf(field)
    return name !== 'actions' && name !== 'footerActions'
  })
  const introNames = introductionFieldNames[slug] ?? [
    'eyebrow',
    'title',
    'accentTitle',
    'description',
  ]
  const introIndex = bodyFields.reduce(
    (lastIndex, field, index) => (introNames.includes(nameOf(field) ?? '') ? index : lastIndex),
    -1,
  )

  normalized = [
    ...bodyFields.slice(0, introIndex + 1),
    actions,
    ...bodyFields.slice(introIndex + 1),
    footerActions,
  ]

  return normalized
}

const normalizeThemeFields = (slug: ProfiledPageBlockSlug, fields: Field[]): Field[] => {
  const alignmentName =
    slug === 'testimonialSpotlight' ? 'sectionContentAlignment' : 'contentAlignment'
  const appearance = fields.find((field) => nameOf(field) === 'appearance')
  const currentAlignment = fields.find((field) => nameOf(field) === alignmentName)
  const currentPadding = fields.find((field) => nameOf(field) === 'size')
  const alignmentDefault =
    (currentAlignment &&
      isNamedField(currentAlignment) &&
      'defaultValue' in currentAlignment &&
      (currentAlignment.defaultValue as SectionContentAlignment)) ||
    (centeredBlocks.has(slug) ? 'center' : 'left')
  const paddingDefault =
    (currentPadding &&
      isNamedField(currentPadding) &&
      'defaultValue' in currentPadding &&
      (currentPadding.defaultValue as SectionPadding)) ||
    'default'
  const remaining = fields.filter((field) => {
    const name = nameOf(field)
    return name !== 'appearance' && name !== alignmentName && name !== 'size'
  })

  return [
    ...(appearance ? [appearance] : []),
    createSectionAlignmentField({
      defaultValue: alignmentDefault,
      name: alignmentName,
    }),
    createSectionPaddingField({ defaultValue: paddingDefault }),
    ...remaining,
  ]
}

const normalizeTabs = (slug: ProfiledPageBlockSlug, field: TabsField): TabsField => ({
  ...field,
  tabs: field.tabs.map((tab) => {
    if (tab.label === 'Content') {
      return { ...tab, fields: normalizeContentFields(slug, tab.fields) }
    }

    if (tab.label === 'Theme Settings') {
      return { ...tab, fields: normalizeThemeFields(slug, tab.fields) }
    }

    return tab
  }),
})

/**
 * Applies the standard authoring contract without mutating the source config.
 * Stored names and block identifiers remain unchanged; only the registered
 * Payload schema is normalized.
 */
export const applyBlockSectionSchemaContract = (block: Block): Block => {
  const slug = block.slug as ProfiledPageBlockSlug

  if (blockSectionProfiles[slug] !== 'standard') return block

  return {
    ...block,
    fields: block.fields.map((field) =>
      field.type === 'tabs' ? normalizeTabs(slug, field) : field,
    ),
  }
}
