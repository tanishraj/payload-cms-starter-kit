import type { Block } from 'payload'

export const ReusableSectionBlock: Block = {
  slug: 'reusableSection',
  labels: {
    singular: 'Reusable Section',
    plural: 'Reusable Sections',
  },
  admin: {},
  fields: [
    {
      name: 'section',
      type: 'relationship',
      relationTo: 'reusable-sections',
      required: true,
      admin: {
        description: 'Select a reusable section to embed on this page.',
      },
    },
  ],
}
