import type { Block, Field } from 'payload'
import { createCmsLinkFields } from '@/fields/cmsLinkFields'

const actionFields: Field[] = [
  {
    name: 'label',
    type: 'text',
  },
  ...createCmsLinkFields(),
]

export const createSystemPageBlock = ({
  pluralLabel,
  singularLabel,
  slug,
}: {
  pluralLabel: string
  singularLabel: string
  slug: string
}): Block => ({
  slug,
  interfaceName: `${slug.charAt(0).toUpperCase()}${slug.slice(1)}Block`,
  labels: {
    singular: singularLabel,
    plural: pluralLabel,
  },
  fields: [
    {
      name: 'badge',
      type: 'text',
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'supportingNote',
      type: 'text',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primaryAction',
          type: 'group',
          admin: {
            width: '50%',
          },
          fields: actionFields,
        },
        {
          name: 'secondaryAction',
          type: 'group',
          admin: {
            width: '50%',
          },
          fields: actionFields,
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mimeType: {
          contains: 'image',
        },
      },
    },
  ],
})
