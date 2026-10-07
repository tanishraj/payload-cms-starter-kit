import type { RelationshipField, RelationshipFieldSingleValidation } from 'payload'
import { projectGenericForm } from '@/lib/genericFormShared'

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

export const createGenericFormField = (): RelationshipField => ({
  name: 'form',
  type: 'relationship',
  relationTo: 'forms',
  required: true,
  filterOptions: {
    and: [{ _status: { equals: 'published' } }, { submissionIntent: { in: ['general', 'lead'] } }],
  },
  validate: validateGenericFormRelationship,
  admin: {
    description:
      'Select a published general or lead Form. Use the relationship drawer to create or edit reusable questions. Fields define labels, names, options and required state; this block controls their presentation. Live Preview never submits. Review Forms use Review Submission.',
  },
})
