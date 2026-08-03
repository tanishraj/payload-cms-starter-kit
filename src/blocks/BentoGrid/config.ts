import type { ArrayField, Block, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { createIconField } from '@/blocks/shared/iconField'
import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'

const itemsField: ArrayField = {
  name: 'items',
  label: 'Bento Items',
  type: 'array',
  minRows: 2,
  maxRows: 8,
  admin: {
    initCollapsed: true,
    description: 'Each item is a bento cell. Size controls how much grid space it occupies.',
  },
  fields: [
    {
      name: 'size',
      label: 'Cell Size',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Full Width (spans all columns)', value: 'full' },
        { label: 'Large (2/3 width)', value: 'large' },
        { label: 'Medium (1/3 width)', value: 'medium' },
        { label: 'Small (fits remaining)', value: 'small' },
      ],
    } satisfies SelectField,
    {
      name: 'eyebrow',
      type: 'text',
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    createIconField({ description: 'Lucide icon name — e.g. "Star", "Rocket". Shown when no image is set. Browse all icons at lucide.dev/icons' }),
    {
      name: 'image',
      label: 'Background / Feature Image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'accentColor',
      label: 'Accent Color',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Accent', value: 'accent' },
      ],
    } satisfies SelectField,
    {
      name: 'linkUrl',
      label: 'Link URL',
      type: 'text',
      admin: { description: 'Optional — makes the entire cell a clickable link.' },
    },
  ],
}

export const BentoGridBlock: Block = {
  admin: getBlockThumbnailAdmin('bentoGrid'),
  slug: 'bentoGrid',
  interfaceName: 'BentoGridBlock',
  labels: {
    singular: 'Bento Grid',
    plural: 'Bento Grids',
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
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            itemsField,
          ],
        },
        {
          label: 'Layout',
          fields: [
            createBlockAppearanceFields(),
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'center',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
              ],
            } satisfies SelectField,
            {
              name: 'size',
              label: 'Section Padding',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Comfortable', value: 'comfortable' },
              ],
            } satisfies SelectField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
