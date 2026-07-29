import type { ArrayField, Block, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'

const timelineItemsField: ArrayField = {
  name: 'items',
  label: 'Timeline Items',
  type: 'array',
  minRows: 2,
  maxRows: 20,
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      name: 'date',
      label: 'Date / Step Label',
      type: 'text',
      admin: {
        description: 'e.g. March 2024, Week 1, Step 1, or left blank to auto-number.',
      },
    },
    {
      name: 'badge',
      label: 'Status Badge',
      type: 'select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Done', value: 'done' },
        { label: 'Active / Current', value: 'active' },
        { label: 'Upcoming', value: 'upcoming' },
      ],
      defaultValue: 'none',
      admin: {
        description: 'Optional status indicator — useful for Horizontal Steps variant.',
      },
    } satisfies SelectField,
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
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional image shown in the media column (Alternating variant).',
      },
    },
  ],
}

export const TimelineBlock: Block = {
  slug: 'timeline',
  interfaceName: 'TimelineBlock',
  labels: {
    singular: 'Timeline',
    plural: 'Timelines',
  },
  admin: {},
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
              admin: { description: 'Small label above the section title.' },
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
            timelineItemsField,
          ],
        },
        {
          label: 'Layout & Theme',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            {
              name: 'variant',
              label: 'Variant',
              type: 'select',
              defaultValue: 'vertical',
              options: [
                {
                  label: 'Horizontal Steps — numbered steps in a row (3–6 steps, e.g. How to Apply)',
                  value: 'horizontal',
                },
                {
                  label: 'Vertical — stacked list with left border line',
                  value: 'vertical',
                },
                {
                  label: 'Alternating — left/right zigzag with optional images (e.g. Our Journey)',
                  value: 'alternating',
                },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'contentAlignment',
              label: 'Header Alignment',
              type: 'select',
              defaultValue: 'center',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
              ],
              required: true,
            } satisfies SelectField,
            {
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
            } satisfies SelectField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
