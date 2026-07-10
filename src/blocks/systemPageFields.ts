import type { Block, Field } from 'payload'

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

const createSharedSystemPageFields = (defaults: SystemPageDefaults): Field[] => [
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
  defaults,
  pluralLabel,
  singularLabel,
  slug,
}: {
  defaults: SystemPageDefaults
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
  fields: createSharedSystemPageFields(defaults),
})
