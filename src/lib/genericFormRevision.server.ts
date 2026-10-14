import 'server-only'
import { buildFormSubmissionSnapshot } from '@/lib/formSubmissionSnapshot'
import { projectGenericForm } from '@/lib/genericFormShared'
import type { Form } from '@/payload-types'

/** Same fingerprint as stored intake history; private settings never cross this boundary. */
export function projectPublishedGenericForm(
  form: (Pick<Form, 'id' | 'title' | 'slug'> & Partial<Form>) | null,
) {
  const definition = projectGenericForm(form)
  if (!form || !definition) return null
  const revision = buildFormSubmissionSnapshot(
    { ...form, fields: definition.fields },
    {},
  ).formRevision
  return { ...definition, revision }
}
