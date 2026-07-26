import type { Block, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'

const contentAlignmentField = {
  name: 'contentAlignment',
  label: 'Content Alignment',
  type: 'select',
  defaultValue: 'left',
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
  required: true,
} satisfies SelectField

const sizeField = {
  name: 'size',
  label: 'Size',
  type: 'select',
  defaultValue: 'default',
  options: [
    { label: 'Compact', value: 'compact' },
    { label: 'Default', value: 'default' },
    { label: 'Comfortable', value: 'comfortable' },
  ],
  required: true,
} satisfies SelectField

export const Contact24Block: Block = {
  slug: 'contact24',
  interfaceName: 'Contact24Block',
  admin: getBlockThumbnailAdmin('contact24'),
  labels: {
    singular: 'Contact 24',
    plural: 'Contact 24 Blocks',
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
              type: 'text',
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },
        {
          label: 'Layout & Theme',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            contentAlignmentField,
            sizeField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
