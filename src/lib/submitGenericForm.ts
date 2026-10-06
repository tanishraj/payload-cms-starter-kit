import type { GenericFormResult } from '@/components/revamp/generic-form'

/** No automatic retry: a lost response may follow a successfully stored submission. */
export async function submitGenericForm(
  slug: string,
  values: Record<string, boolean | string>,
): Promise<GenericFormResult> {
  const response = await fetch(`/api/forms/${encodeURIComponent(slug)}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values, metadata: { landingPage: window.location.href } }),
    signal: AbortSignal.timeout(30_000),
  })
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
