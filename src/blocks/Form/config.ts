import type { Block } from 'payload'

export const FormBlock: Block = {
  slug: 'form',
  interfaceName: 'FormBlock',
  labels: {
    singular: 'Form',
    plural: 'Form Blocks',
  },
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: {
        description: 'Select the published form to render on this page.',
      },
    },
  ],
}
