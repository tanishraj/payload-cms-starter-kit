import type { Block, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'

type Cta39SiblingData = {
  headerLayout?: 'split' | 'stacked' | null
}

const isSplitLayout = (_data: unknown, siblingData: Cta39SiblingData) =>
  siblingData?.headerLayout === 'split'

const ctaSizeField = {
  name: 'size',
  label: 'Section Padding',
  type: 'select',
  defaultValue: 'default',
  options: [
    { label: 'None', value: 'none' },
    { label: 'Compact', value: 'compact' },
    { label: 'Default', value: 'default' },
    { label: 'Comfortable', value: 'comfortable' },
  ],
  required: true,
} satisfies SelectField

const headerLayoutField = {
  name: 'headerLayout',
  label: 'Header Layout',
  type: 'select',
  defaultValue: 'stacked',
  options: [
    { label: 'Stacked', value: 'stacked' },
    { label: 'Split', value: 'split' },
  ],
  required: true,
  admin: {
    description: 'Stack content in one column or place supporting content beside the heading.',
  },
} satisfies SelectField

const contentAlignmentField = {
  name: 'contentAlignment',
  label: 'Section Content Alignment',
  type: 'select',
  defaultValue: 'center',
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
  required: true,
} satisfies SelectField

const splitContentAlignmentField = {
  name: 'splitContentAlignment',
  label: 'Split Content Position',
  type: 'select',
  defaultValue: 'center',
  options: [
    { label: 'Top', value: 'top' },
    { label: 'Center', value: 'center' },
    { label: 'Bottom', value: 'bottom' },
  ],
  required: true,
  admin: {
    condition: isSplitLayout,
    description: 'Position the description and actions relative to the heading.',
  },
} satisfies SelectField

export const Cta39Block: Block = {
  slug: 'cta39',
  interfaceName: 'Cta39Block',
  admin: getBlockThumbnailAdmin('cta39'),
  labels: {
    singular: 'Call to Action',
    plural: 'Call to Actions',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'eyebrow',
              label: 'Eyebrow',
              type: 'text',
              admin: {
                description: 'Optional short label shown above the title.',
              },
            },
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
            },
            {
              name: 'accentTitle',
              label: 'Accent Title (Italic)',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            createContentActionsField({
              name: 'footerActions',
              label: 'Footer Actions',
              maxRows: 2,
            }),
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            createBlockAppearanceFields(),
            headerLayoutField,
            contentAlignmentField,
            splitContentAlignmentField,
            ctaSizeField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
