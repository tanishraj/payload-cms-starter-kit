import type { Block } from 'payload'

export const FeatureGridBlock: Block = {
  slug: 'featureGrid',
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
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
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
          name: 'icon',
          type: 'select',
          defaultValue: 'sparkles',
          options: [
            {
              label: 'Sparkles',
              value: 'sparkles',
            },
            {
              label: 'Layers',
              value: 'layers',
            },
            {
              label: 'Shield Check',
              value: 'shield-check',
            },
            {
              label: 'Blocks',
              value: 'blocks',
            },
          ],
        },
      ],
    },
  ],
}
