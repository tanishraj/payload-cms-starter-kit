import type { Field, GroupField, SelectField } from 'payload'

type CreateBlockAppearanceFieldsOptions = {
  includeTextOverride?: boolean
}

const backgroundField = {
  name: 'background',
  label: 'Background',
  type: 'select',
  defaultValue: 'none',
  options: [
    { label: 'None', value: 'none' },
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Muted', value: 'muted' },
    { label: 'Accent', value: 'accent' },
  ],
  required: true,
} satisfies SelectField

const textColorField = {
  name: 'textColor',
  label: 'Text Color',
  type: 'select',
  defaultValue: 'auto',
  options: [
    { label: 'Auto', value: 'auto' },
    { label: 'Default', value: 'default' },
    { label: 'Inverse', value: 'inverse' },
  ],
  required: true,
} satisfies SelectField

const borderField = {
  name: 'border',
  label: 'Border',
  type: 'select',
  defaultValue: 'none',
  options: [
    { label: 'None', value: 'none' },
    { label: 'Top', value: 'top' },
    { label: 'Bottom', value: 'bottom' },
    { label: 'Top and Bottom', value: 'topAndBottom' },
  ],
  required: true,
} satisfies SelectField

export const createBlockAppearanceFields = ({
  includeTextOverride = true,
}: CreateBlockAppearanceFieldsOptions = {}): Field =>
  ({
    name: 'appearance',
    label: 'Appearance',
    type: 'group',
    fields: includeTextOverride
      ? [backgroundField, textColorField, borderField]
      : [backgroundField, borderField],
  }) satisfies GroupField
