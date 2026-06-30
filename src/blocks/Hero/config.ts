import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
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
      name: 'primaryActionLabel',
      label: 'Primary action label',
      type: 'text',
    },
    {
      name: 'primaryActionHref',
      label: 'Primary action URL',
      type: 'text',
    },
    {
      name: 'secondaryActionLabel',
      label: 'Secondary action label',
      type: 'text',
    },
    {
      name: 'secondaryActionHref',
      label: 'Secondary action URL',
      type: 'text',
    },
  ],
}
