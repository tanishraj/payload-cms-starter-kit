import { validateFormLayout, type FormLayoutEntry } from '@/lib/formLayout'
import type { FormAnswers } from '@/lib/forms'
import { validateFormFieldDefinitions, type SimpleFormField } from '@/lib/forms'
import type { GenericFormResult } from '@/components/revamp/generic-form'

/** No automatic retry: a lost response may follow a successfully stored submission. */
export async function submitGenericForm(
  slug: string,
  values: FormAnswers,
  revision?: string,
  submissionKey?: string,
): Promise<GenericFormResult> {
  const response = await fetch(`/api/forms/${encodeURIComponent(slug)}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      values,
      formRevision: revision,
      submissionKey,
      metadata: { landingPage: window.location.href },
    }),
    signal: AbortSignal.timeout(30_000),
  })
  return parseGenericFormResponse(response, slug)
}

/** Shared response protocol for question refresh and accepted-attempt conflicts. */
export async function parseGenericFormResponse(
  response: Response,
  slug: string,
): Promise<GenericFormResult> {
  const body: unknown = await response.json()
  if (
    !body ||
    typeof body !== 'object' ||
    !('message' in body) ||
    typeof body.message !== 'string'
  ) {
    throw new Error('Unconfirmed submission response')
  }
  if (response.ok) return { success: true, message: body.message }
  if (response.status === 409 && 'code' in body && body.code === 'FORM_CHANGED' && 'form' in body) {
    const updated = body.form
    if (
      updated &&
      typeof updated === 'object' &&
      'slug' in updated &&
      updated.slug === slug &&
      'revision' in updated &&
      typeof updated.revision === 'string' &&
      /^[a-f0-9]{64}$/.test(updated.revision) &&
      'fields' in updated &&
      validateFormFieldDefinitions(updated.fields) === true &&
      validateFormLayout(
        'entries' in updated ? updated.entries : undefined,
        updated.fields as SimpleFormField[],
      ) === true &&
      'submitButtonLabel' in updated &&
      typeof updated.submitButtonLabel === 'string'
    ) {
      return {
        success: false,
        message: body.message,
        updatedForm: {
          ...('entries' in updated && updated.entries
            ? { entries: updated.entries as FormLayoutEntry[] }
            : {}),
          fields: updated.fields as SimpleFormField[],
          revision: updated.revision,
          submitButtonLabel: updated.submitButtonLabel,
        },
      }
    }
    throw new Error('Unconfirmed changed-form response')
  }
  if (
    response.status === 409 &&
    'code' in body &&
    ['SUBMISSION_KEY_REUSED', 'UPLOAD_LIMIT_REACHED'].includes(String(body.code))
  ) {
    return { success: false, message: body.message, requestKeyConflict: true }
  }
  if (response.status === 429) {
    const seconds = Number(response.headers.get('Retry-After'))
    const wait =
      Number.isFinite(seconds) && seconds > 0
        ? `Please wait ${Math.ceil(seconds)} seconds before trying again.`
        : 'Please wait before trying again.'
    return { success: false, message: `Too many attempts. ${wait}` }
  }
  if (response.status === 400) {
    const errors =
      'errors' in body &&
      body.errors &&
      typeof body.errors === 'object' &&
      !Array.isArray(body.errors)
        ? Object.fromEntries(
            Object.entries(body.errors).filter(
              (entry): entry is [string, string] => typeof entry[1] === 'string',
            ),
          )
        : undefined
    return { success: false, message: body.message, errors }
  }
  if (response.status === 404)
    return {
      success: false,
      message: 'This form is unavailable. Please try another way to contact us.',
    }
  // A server failure is not proof that persistence failed.
  throw new Error('Unconfirmed submission response')
}
