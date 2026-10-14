import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { FORM_FILE_MAX_BYTES, isUploadToken } from '@/lib/formAttachments'
import {
  stageFormAttachment,
  hasFormAttachmentIndexes,
  FormAttachmentValidationError,
  FormAttachmentUploadLimitError,
} from '@/lib/formAttachments.server'
import { attachmentStorageAvailable } from '@/lib/formAttachmentStorage.server'
import { projectFormFields } from '@/lib/genericFormShared'
import { projectPublishedGenericForm } from '@/lib/genericFormRevision.server'
import {
  findSubmissionReceipt,
  hasSubmissionKeyIndex,
  submissionIdentity,
} from '@/lib/formSubmissionIdempotency.server'
import { InMemoryRateLimiter } from '@/domains/forms/rateLimiter'
import { getClientIPAddress } from '@/lib/formSpamProtection'

const limiter = new InMemoryRateLimiter({
  maxAttempts: 30,
  maxKeys: 10000,
  windowMs: 10 * 60 * 1000,
})
const json = (body: object, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
  suppliedPayload?: Payload,
) {
  const { slug } = await context.params
  if (!attachmentStorageAvailable())
    return json({ message: 'File uploads are unavailable. Please contact the website team.' }, 503)
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/octet-stream')
    return json({ message: 'Invalid upload format.' }, 415)
  const revision = request.headers.get('x-form-revision')
  const identity = submissionIdentity(slug, request.headers.get('x-submission-key'), {}, revision)
  const uploadID = request.headers.get('x-upload-id')
  const fieldID = request.headers.get('x-field-id')
  let filename: string
  try {
    filename = decodeURIComponent(request.headers.get('x-file-name') ?? '')
  } catch {
    return json({ message: 'Invalid filename.' }, 400)
  }
  if (
    !identity ||
    !isUploadToken(uploadID) ||
    !fieldID ||
    fieldID.length > 100 ||
    !revision ||
    !/^[a-f0-9]{64}$/.test(revision) ||
    !filename ||
    filename.length > 150
  )
    return json({ message: 'Invalid upload identity.' }, 400)
  const rateKey = `${getClientIPAddress(request)}:${slug}`
  const rate = limiter.check(rateKey)
  if (rate.limited)
    return Response.json(
      { message: 'Too many uploads. Please wait before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rate.retryAfterSeconds), 'Cache-Control': 'no-store' },
      },
    )
  limiter.record(rateKey)
  const payload = suppliedPayload ?? (await getPayload({ config: configPromise }))
  if (await findSubmissionReceipt(payload, identity.submissionKeyHash))
    return json(
      {
        code: 'SUBMISSION_KEY_REUSED',
        message: 'This response was already received. Start a new response before uploading files.',
      },
      409,
    )
  if (!(await hasSubmissionKeyIndex(payload)) || !(await hasFormAttachmentIndexes(payload)))
    return json({ message: 'File upload service is temporarily unavailable.' }, 503)
  const form = (
    await payload.find({
      collection: 'forms',
      where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]
  if (!form) return json({ message: 'This form is unavailable.' }, 404)
  const published = projectPublishedGenericForm(form)
  if (!published) return json({ message: 'This form is unavailable.' }, 404)
  if (published.revision !== revision)
    return json(
      {
        code: 'FORM_CHANGED',
        message: 'The questions changed. Review the updated form and choose your files again.',
        form: published,
      },
      409,
    )
  const field = projectFormFields(form).find(
    (field) => field.id === fieldID && field.type === 'file',
  )
  if (!field) return json({ message: 'This file question is unavailable.' }, 400)
  // Read incrementally: no unbounded request.arrayBuffer()/multipart buffering.
  const declaredLength = Number(request.headers.get('content-length'))
  if (declaredLength > FORM_FILE_MAX_BYTES)
    return json({ message: 'This file exceeds the upload size limit.' }, 413)
  const reader = request.body?.getReader()
  if (!reader) return json({ message: 'Choose a file with content.' }, 400)
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      length += chunk.value.byteLength
      if (length > FORM_FILE_MAX_BYTES) {
        await reader.cancel()
        return json({ message: 'This file exceeds the upload size limit.' }, 413)
      }
      chunks.push(chunk.value)
    }
  } catch {
    return json({ message: 'Upload interrupted. Retry or remove this file.' }, 400)
  }
  try {
    const file = await stageFormAttachment({
      payload,
      bytes: Buffer.concat(chunks, length),
      filename,
      field,
      formID: String(form.id),
      keyHash: identity.submissionKeyHash,
      uploadID,
    })
    return json({ file })
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Private form file upload was not confirmed.' })
    if (error instanceof FormAttachmentUploadLimitError)
      return json({ code: 'UPLOAD_LIMIT_REACHED', message: error.message }, 409)
    return json(
      {
        message:
          error instanceof FormAttachmentValidationError
            ? error.message
            : 'Upload could not be confirmed. Retry or remove this file.',
      },
      error instanceof FormAttachmentValidationError ? 400 : 503,
    )
  }
}
