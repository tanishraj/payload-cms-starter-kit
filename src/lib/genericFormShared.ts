import { validateFormFieldDefinitions, type SimpleFormField } from '@/lib/forms'
import type { Form } from '@/payload-types'

export type GenericFormDefinition = {
  revision?: string
  slug: string
  fields: SimpleFormField[]
  submitButtonLabel: string
}

/** Explicit browser projection: never pass notifications, replies or editor notes. */
export function projectGenericForm(
  form: Partial<Form> | null,
  preview = false,
): GenericFormDefinition | null {
  if (
    !form ||
    (!preview && form._status !== 'published') ||
    !['general', 'lead'].includes(form.submissionIntent ?? '') ||
    !form.slug ||
    !form.fields?.length
  )
    return null
  const fields = form.fields.map(
    ({ id, name, label, type, required, placeholder, contactRole, options }) => ({
      id,
      name,
      label,
      type,
      required,
      placeholder,
      contactRole,
      options: options?.map(({ label, value }) => ({ label, value })),
    }),
  )
  if (validateFormFieldDefinitions(fields) !== true) return null
  return { slug: form.slug, fields, submitButtonLabel: form.submitButtonLabel || 'Submit' }
}
