import type { Block } from 'payload'
import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createSectionPaddingField } from '@/blocks/shared/sectionFields'
import { createGenericFormField } from '@/blocks/shared/genericFormField'
export { validateGenericFormRelationship } from '@/blocks/shared/genericFormField'

export const GenericFormBlock: Block = {
  slug: 'genericForm',
  interfaceName: 'GenericFormBlock',
  labels: { singular: 'Generic Form', plural: 'Generic Forms' },
  admin: getBlockThumbnailAdmin('genericForm'),
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'Get in touch' },
            { name: 'description', type: 'textarea' },
            createGenericFormField(),
          ],
        },
        {
          label: 'Theme Settings',
          fields: [createSectionPaddingField()],
        },
      ],
    },
  ],
}
