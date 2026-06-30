import type { Block } from 'payload'

export const Hero174Block: Block = {
  slug: 'hero174',
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
      name: 'ctaLabel',
      label: 'CTA label',
      type: 'text',
    },
    {
      name: 'ctaHref',
      label: 'CTA URL',
      type: 'text',
    },
    {
      name: 'backgroundImageUrl',
      label: 'Background image URL',
      type: 'text',
    },
    {
      name: 'locationLabel',
      type: 'text',
    },
    {
      name: 'locationValue',
      type: 'text',
    },
  ],
}
