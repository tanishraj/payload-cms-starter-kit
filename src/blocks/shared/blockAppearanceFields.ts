import type { Field, GroupField, SelectField } from 'payload'

type CreateBlockAppearanceFieldsOptions = {
  includeBackground?: boolean
  includeBorder?: boolean
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
    { label: 'Gradient: Secondary', value: 'gradient-secondary' },
    { label: 'Gradient: Muted', value: 'gradient-muted' },
    { label: 'Gradient: Accent', value: 'gradient-accent' },
    { label: 'Gradient: Success', value: 'gradient-success' },
    { label: 'Gradient: Error', value: 'gradient-error' },
    { label: 'Gradient: Info', value: 'gradient-info' },
    { label: 'Gradient: Warning', value: 'gradient-warning' },
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
  includeBackground = true,
  includeBorder = true,
}: CreateBlockAppearanceFieldsOptions = {}): GroupField =>
  ({
    name: 'appearance',
    label: 'Appearance',
    type: 'group',
    fields: [
      ...(includeBackground ? [backgroundField] : []),
      ...(includeBorder ? [borderField] : []),
    ],
  }) satisfies GroupField
