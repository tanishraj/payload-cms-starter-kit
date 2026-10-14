import {
  getFormFieldConfiguration,
  validateFormFieldDefinitions,
  type SimpleFormField,
} from '@/lib/forms'
import type { Form } from '@/payload-types'

export type GenericFormDefinition = {
  revision?: string
  slug: string
  fields: SimpleFormField[]
  submitButtonLabel: string
}

/** Shared explicit projection for intake and public/preview consumers. */
export function projectFormFields(form: Partial<Form>): SimpleFormField[] {
  return (form.fields ?? []).map((field) => ({
    id: field.id,
    name: field.name,
    label: field.label,
    type: field.type,
    required: field.required,
    placeholder: field.placeholder,
    contactRole: field.contactRole,
    options: field.options?.map(({ id, label, value }) => ({ id, label, value })),
    ...getFormFieldConfiguration(field),
  }))
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
  const fields = projectFormFields(form)
  if (validateFormFieldDefinitions(fields) !== true) return null
  return { slug: form.slug, fields, submitButtonLabel: form.submitButtonLabel || 'Submit' }
}
