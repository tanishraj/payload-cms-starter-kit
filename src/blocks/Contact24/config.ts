import type { Block, CheckboxField, SelectField, TabsField } from 'payload'

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

const detailsAlignmentField = {
  name: 'detailsAlignment',
  label: 'Details Alignment',
  type: 'select',
  defaultValue: 'left',
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
  required: true,
} satisfies SelectField

const showAddressDetailsField = {
  name: 'showAddressDetails',
  label: 'Show Location Details',
  type: 'checkbox',
  defaultValue: true,
} satisfies CheckboxField

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
    singular: 'Regional Offices',
    plural: 'Regional Offices',
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
            {
              name: 'offices',
              label: 'Offices to Show',
              type: 'relationship',
              relationTo: 'office-locations',
              hasMany: true,
              filterOptions: { _status: { equals: 'published' } },
              admin: {
                description: 'Leave empty to show all published offices. Select specific offices to show only those, in the order chosen.',
                allowCreate: false,
              },
            },
          ],
        },
        {
          label: 'Layout & Theme',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            contentAlignmentField,
            detailsAlignmentField,
            showAddressDetailsField,
            sizeField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
