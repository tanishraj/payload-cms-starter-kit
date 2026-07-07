import type { Block } from 'payload'

import type { Hero36IconName } from '@/components/hero36'
import { createCmsLinkFields } from '@/fields/cmsLinkFields'

const hero36IconOptions: { label: string; value: Hero36IconName }[] = [
  {
    label: 'Blocks',
    value: 'blocks',
  },
  {
    label: 'Database',
    value: 'database',
  },
  {
    label: 'Layout',
    value: 'layout',
  },
  {
    label: 'Rocket',
    value: 'rocket',
  },
]

export const Hero36Block: Block = {
  slug: 'hero36',
  interfaceName: 'Hero36Block',
  labels: {
    singular: 'Hero 36',
    plural: 'Hero 36 Blocks',
  },
  fields: [
    {
      name: 'badge',
      type: 'group',
      fields: [
        {
          name: 'text',
          type: 'text',
          admin: {
            placeholder: 'New Release',
          },
        },
      ],
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
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 3,
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'visualType',
          type: 'select',
          required: true,
          defaultValue: 'icon',
          options: [
            {
              label: 'Icon',
              value: 'icon',
            },
            {
              label: 'Image',
              value: 'image',
            },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'icon',
          type: 'select',
          options: hero36IconOptions,
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.visualType === 'icon',
          },
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
          admin: {
            condition: (_, siblingData) => siblingData?.visualType === 'image',
          },
        },
        ...createCmsLinkFields(),
      ],
    },
  ],
}
