import type { Field, SelectField, TabsField } from 'payload'

export const cardSurfaceValues = ['default', 'primary', 'secondary', 'muted', 'accent'] as const

export type CardSurfaceValue = (typeof cardSurfaceValues)[number]

type CreateCardBackgroundFieldOptions = {
  adminDescription?: string
  label?: string
  name?: string
}

type CreateCardTabsOptions = {
  backgroundFieldOptions?: CreateCardBackgroundFieldOptions
  contentFields: Field[]
  includeBackground?: boolean
  themeFields?: Field[]
}

export const createCardBackgroundField = ({
  adminDescription = 'Default Card inherits the section background. Other choices use the active theme and automatically adjust card contrast.',
  label = 'Background',
  name = 'cardBackground',
}: CreateCardBackgroundFieldOptions = {}): SelectField => ({
  name,
  label,
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
  admin: {
    description: adminDescription,
  },
})

export const createCardTabs = ({
  backgroundFieldOptions,
  contentFields,
  includeBackground = true,
  themeFields = [],
}: CreateCardTabsOptions): TabsField => ({
  type: 'tabs',
  tabs: [
    {
      label: 'Content',
      fields: [...contentFields],
    },
    {
      label: 'Theme Settings',
      fields: [
        ...themeFields,
        ...(includeBackground ? [createCardBackgroundField(backgroundFieldOptions)] : []),
      ],
    },
  ],
})
