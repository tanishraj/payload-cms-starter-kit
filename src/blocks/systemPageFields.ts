import type { Block, Field } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createCmsLinkFields } from '@/fields/cmsLinkFields'

type SystemPageDefaults = {
  badge: string
  description: string
  heading: string
}

const actionFields: Field[] = [
  {
    name: 'label',
    type: 'text',
  },
  ...createCmsLinkFields(),
]

export const createBaseSystemPageFields = (defaults: SystemPageDefaults): Field[] => [
  createBlockAppearanceFields({ includeTextOverride: false }),
  {
    name: 'badge',
    type: 'text',
    defaultValue: defaults.badge,
  },
  {
    name: 'heading',
    type: 'text',
    required: true,
    defaultValue: defaults.heading,
  },
  {
    name: 'description',
    type: 'textarea',
    defaultValue: defaults.description,
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
]

export const createSystemPageBlock = ({
  fields,
  pluralLabel,
  singularLabel,
  slug,
  thumbnailUrl,
}: {
  fields: Field[]
  pluralLabel: string
  singularLabel: string
  slug: string
  thumbnailUrl?: string
}): Block => ({
  slug,
  interfaceName: `${slug.charAt(0).toUpperCase()}${slug.slice(1)}Block`,
  admin: thumbnailUrl
    ? {
        images: {
          thumbnail: {
            alt: `${singularLabel} preview`,
            url: thumbnailUrl,
          },
        },
      }
    : undefined,
  labels: {
    singular: singularLabel,
    plural: pluralLabel,
  },
  fields,
})
