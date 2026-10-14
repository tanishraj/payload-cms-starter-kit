import { isUploadToken, isCompatibleFormFile, type UploadedFormFile } from '@/lib/formAttachments'
import type { SimpleFormField } from '@/lib/forms'
import { parseGenericFormResponse } from '@/lib/submitGenericForm'
import type { GenericFormResult } from '@/components/revamp/generic-form'

export class FormUploadError extends Error {
  constructor(public result: GenericFormResult) {
    super(result.message)
  }
}
/** One explicit upload attempt; callers reuse uploadID on deliberate retry.
 * XHR reports actual upload progress; server verification completes before 100%. */
export async function uploadFormAttachment(
  slug: string,
  file: File,
  field: SimpleFormField,
  revision: string,
  submissionKey: string,
  uploadID: string,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
): Promise<UploadedFormFile> {
  const response = await new Promise<Response>((resolve, reject) => {
    signal.throwIfAborted()
    const xhr = new XMLHttpRequest()
    const abort = () => xhr.abort()
    const finish = () => signal.removeEventListener('abort', abort)
    xhr.open('POST', `/api/forms/${encodeURIComponent(slug)}/attachments`)
    xhr.timeout = 60000
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.setRequestHeader('x-form-revision', revision)
    xhr.setRequestHeader('x-submission-key', submissionKey)
    xhr.setRequestHeader('x-upload-id', uploadID)
    xhr.setRequestHeader('x-field-id', field.id ?? '')
    xhr.setRequestHeader('x-file-name', encodeURIComponent(file.name))
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress((100 * event.loaded) / event.total)
    }
    xhr.onload = () => {
      finish()
      resolve(
        new Response(xhr.responseText, {
          status: xhr.status,
          headers: { 'Retry-After': xhr.getResponseHeader('Retry-After') ?? '' },
        }),
      )
    }
    xhr.onerror = xhr.ontimeout = () => {
      finish()
      reject(
        new Error(
          'Upload could not be confirmed. Check your connection and retry or remove this file.',
        ),
      )
    }
    xhr.onabort = () => {
      finish()
      reject(new Error('Upload cancelled.'))
    }
    signal.addEventListener('abort', abort, { once: true })
    xhr.send(file)
  })
  if (!response.ok) {
    if ([400, 409, 429].includes(response.status))
      throw new FormUploadError(await parseGenericFormResponse(response, slug))
    throw new Error(
      response.status === 413
        ? 'This file exceeds the upload size limit. Choose a smaller file.'
        : 'File uploads are unavailable. Retry later or remove this file.',
    )
  }
  const body: unknown = await response.json()
  if (
    !body ||
    typeof body !== 'object' ||
    !('file' in body) ||
    !body.file ||
    typeof body.file !== 'object'
  )
    throw new Error('Upload could not be confirmed. Retry or remove this file.')
  const uploaded = body.file as UploadedFormFile
  if (
    !isUploadToken(uploaded.token) ||
    uploaded.filename !== file.name ||
    uploaded.size !== file.size ||
    !isCompatibleFormFile(uploaded, field)
  )
    throw new Error('Upload could not be confirmed. Retry or remove this file.')
  return uploaded
}
