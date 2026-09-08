import type { Field, SelectField } from 'payload'

import { createBlockAppearanceFields } from './blockAppearanceFields'
import {
  createContentActionsField,
  type CreateContentActionsFieldOptions,
} from './contentActionsFields'

export type SectionContentAlignment = 'center' | 'left' | 'right'
export type SectionPadding = 'comfortable' | 'compact' | 'default' | 'none'

export const sectionAlignmentOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
] satisfies SelectField['options']

export const sectionPaddingOptions = [
  { label: 'None', value: 'none' },
  { label: 'Compact', value: 'compact' },
  { label: 'Default', value: 'default' },
  { label: 'Comfortable', value: 'comfortable' },
] satisfies SelectField['options']

type CreateSectionAlignmentFieldOptions = {
  defaultValue?: SectionContentAlignment
  description?: string
  label?: string
  name?: string
  required?: boolean
}

type CreateSectionPaddingFieldOptions = {
  defaultValue?: SectionPadding
  label?: string
  name?: string
  required?: boolean
}

type CreateSectionThemeFieldsOptions = {
  alignment?: CreateSectionAlignmentFieldOptions | false
  appearance?: Parameters<typeof createBlockAppearanceFields>[0] | false
  padding?: CreateSectionPaddingFieldOptions | false
}

export const createSectionAlignmentField = ({
  defaultValue = 'left',
  description =
    'Aligns the section introduction, Introduction Actions, and Footer Actions. Block content keeps its own layout.',
  label = 'Section Content Alignment',
  name = 'contentAlignment',
  required = true,
}: CreateSectionAlignmentFieldOptions = {}): SelectField => ({
  name,
  label,
  type: 'select',
  defaultValue,
  options: sectionAlignmentOptions,
  required,
  admin: { description },
})

export const createSectionPaddingField = ({
  defaultValue = 'default',
  label = 'Section Padding',
  name = 'size',
  required = true,
}: CreateSectionPaddingFieldOptions = {}): SelectField => ({
  name,
  label,
  type: 'select',
  defaultValue,
  options: sectionPaddingOptions,
  required,
})

export const createIntroductionActionsField = (
  options: CreateContentActionsFieldOptions = {},
) =>
  createContentActionsField({
    label: 'Introduction Actions',
    maxRows: 2,
    name: 'actions',
    ...options,
  })

export const createFooterActionsField = (
  options: CreateContentActionsFieldOptions = {},
) =>
  createContentActionsField({
    label: 'Footer Actions',
    maxRows: 2,
    name: 'footerActions',
    ...options,
  })

export const createSectionThemeFields = ({
  alignment = {},
  appearance = {},
  padding = {},
}: CreateSectionThemeFieldsOptions = {}): Field[] => [
  ...(appearance === false ? [] : [createBlockAppearanceFields(appearance)]),
  ...(alignment === false ? [] : [createSectionAlignmentField(alignment)]),
  ...(padding === false ? [] : [createSectionPaddingField(padding)]),
]
