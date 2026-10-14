import { createHash } from 'node:crypto'

import {
  getFormFieldConfiguration,
  normalizeFormSubmissionIntent,
  type SimpleFormField,
} from '@/lib/forms'

type SnapshotForm = {
  fields: SimpleFormField[]
  id: number | string
  slug: string
  submissionIntent?: unknown
  title: string
}

export const formatFormAnswer = (field: SimpleFormField, value: boolean | string): string => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (field.type === 'select' && value) {
    return field.options?.find((option) => option.value === value)?.label || value
  }
  return value || '—'
}

// Capture the published definition used for intake, never the latest editable draft.
// Payload array row IDs are the stable identity; legacy rows may have no ID.
export const buildFormSubmissionSnapshot = (
  form: SnapshotForm,
  values: Record<string, boolean | string>,
) => {
  const fields = form.fields.map((field) => ({
    contactRole: field.contactRole ?? null,
    id: field.id ?? null,
    label: field.label,
    name: field.name,
    options:
      field.type === 'select'
        ? (field.options ?? []).map(({ label, value }) => ({ label, value }))
        : [],
    required: field.required ?? false,
    type: field.type,
    ...getFormFieldConfiguration(field),
  }))
  const formSnapshot = {
    fields,
    formatVersion: 1,
    formID: form.id,
    slug: form.slug,
    submissionIntent: normalizeFormSubmissionIntent(form.submissionIntent),
    title: form.title,
  }
  // Payload JSON fields parse string input as JSON text; use an object envelope
  // to preserve arbitrary strings and booleans without reinterpretation.
  const answers = fields.map((field) => {
    const value = values[field.name] ?? ''
    return {
      displayValue: formatFormAnswer(field, value),
      fieldID: field.id,
      label: field.label,
      name: field.name,
      type: field.type,
      value: { raw: value },
    }
  })

  // The review engine can provide additional fixed answers not declared by a
  // legacy Form. Retain them explicitly without inventing a schema/row identity.
  const declaredNames = new Set(fields.map((field) => field.name))
  for (const [name, value] of Object.entries(values)) {
    if (declaredNames.has(name)) continue
    answers.push({
      displayValue: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || '—',
      fieldID: null,
      label: name,
      name,
      type: typeof value === 'boolean' ? 'checkbox' : 'text',
      value: { raw: value },
    })
  }

  return {
    answers,
    formRevision: createHash('sha256').update(JSON.stringify(formSnapshot)).digest('hex'),
    formSnapshot,
  }
}
