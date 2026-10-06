import type { Block, RelationshipFieldSingleValidation } from 'payload'
import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { projectGenericForm } from '@/lib/genericFormShared'
import { createSectionPaddingField } from '@/blocks/shared/sectionFields'

export const validateGenericFormRelationship: RelationshipFieldSingleValidation = async (
  value,
  { req },
) => {
  if (value == null) return true
  const id = typeof value === 'object' ? value.value : value
  if (typeof id !== 'string' && typeof id !== 'number')
    return 'Select a published general or lead Form.'
  try {
    const form = await req.payload.findByID({
      collection: 'forms',
      id,
      depth: 0,
      draft: false,
      overrideAccess: false,
      req,
    })
    return projectGenericForm(form)
      ? true
      : 'Select a published general or lead Form with valid fields.'
  } catch {
    return 'Select a published general or lead Form you can access.'
  }
}

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
            {
              name: 'form',
              type: 'relationship',
              relationTo: 'forms',
              required: true,
              filterOptions: {
                and: [
                  { _status: { equals: 'published' } },
                  { submissionIntent: { in: ['general', 'lead'] } },
                ],
              },
              validate: validateGenericFormRelationship,
              admin: {
                description:
                  'Create and publish a Form under Forms first, then select it here. All six supported controls, custom names and labels work. Live Preview never sends submissions. Review Forms use the Review Submission block.',
              },
            },
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
