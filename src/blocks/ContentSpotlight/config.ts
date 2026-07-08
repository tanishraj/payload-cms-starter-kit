import type { Block } from 'payload'

import { createCmsLinkFields } from '@/fields/cmsLinkFields'

export const ContentSpotlightBlock: Block = {
  slug: 'contentSpotlight',
  interfaceName: 'ContentSpotlightBlock',
  labels: {
    singular: 'Content Spotlight',
    plural: 'Content Spotlights',
  },
  fields: [
    {
      name: 'eyebrow',
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
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mimeType: {
          contains: 'image',
        },
      },
    },
    ...createCmsLinkFields(),
  ],
}
