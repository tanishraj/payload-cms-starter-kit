import 'server-only'
import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import { createHash, randomUUID } from 'node:crypto'
import { fileTypeFromBuffer } from 'file-type'
import { createLocalReq, type Payload, type PayloadRequest } from 'payload'
import {
  getClientFileError,
  isCompatibleFormFile,
  getFormFilePolicy,
  isUploadToken,
  FORM_ATTEMPT_MAX_FILES,
  type UploadedFormFile,
} from '@/lib/formAttachments'
import type { FormAnswers, SimpleFormField } from '@/lib/forms'
import {
  getFormAttachmentStorage,
  type FormAttachmentStorage,
} from '@/lib/formAttachmentStorage.server'
import type { FormAttachment } from '@/payload-types'

export class FormAttachmentValidationError extends Error {}
export class FormAttachmentUploadLimitError extends FormAttachmentValidationError {}

export async function hasFormAttachmentIndexes(payload: Payload) {
  const indexes = await (payload.db as MongooseAdapter).collections[
    'form-attachments'
  ].collection.indexes()
  return ['token', 'uploadIdentity', 'attemptSlot'].every((field) =>
    indexes.some(
      (index) =>
        index.unique === true &&
        !index.partialFilterExpression &&
        Object.keys(index.key).length === 1 &&
        index.key[field] === 1,
    ),
  )
}

const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
export const toUploadedFormFile = (doc: FormAttachment): UploadedFormFile => ({
  token: doc.token,
  filename: doc.filename,
  size: doc.size,
  fileType: doc.fileType,
})
export async function verifyFormFileBytes(bytes: Buffer, filename: string, field: SimpleFormField) {
  const error = getClientFileError({ name: filename, size: bytes.length }, field)
  if (error) throw new FormAttachmentValidationError(error)
  let detected
  try {
    detected = await fileTypeFromBuffer(bytes)
  } catch {
    throw new FormAttachmentValidationError(
      'This file could not be read. Choose a valid PDF, DOCX, PNG or JPEG.',
    )
  }
  if (!detected || !['pdf', 'docx', 'png', 'jpg'].includes(detected.ext))
    throw new FormAttachmentValidationError('The file content does not match an allowed format.')
  const fileType = detected.ext as UploadedFormFile['fileType']
  const extension = filename.split('.').pop()?.toLowerCase()
  if (extension !== fileType && !(fileType === 'jpg' && extension === 'jpeg'))
    throw new FormAttachmentValidationError(
      'The filename extension does not match the file content.',
    )
  if (!isCompatibleFormFile({ token: '', filename, size: bytes.length, fileType }, field))
    throw new FormAttachmentValidationError('This file type or size is no longer allowed.')
  return { fileType, sha256: createHash('sha256').update(bytes).digest('hex') }
}
/** Unique request identity makes a lost upload confirmation safe to retry. Slots bound
 * all staged uploads for a single response durably, including removed/failed files. */
export async function stageFormAttachment({
  payload,
  bytes,
  filename,
  field,
  formID,
  keyHash,
  uploadID,
  storage = getFormAttachmentStorage(),
}: {
  payload: Payload
  bytes: Buffer
  filename: string
  field: SimpleFormField
  formID: string
  keyHash: string
  uploadID: string
  storage?: FormAttachmentStorage
}) {
  if (!field.id || !isUploadToken(uploadID))
    throw new FormAttachmentValidationError('Invalid file upload identity.')
  const content = await verifyFormFileBytes(bytes, filename, field)
  const uploadIdentity = hash([keyHash, uploadID])
  const lookup = async () =>
    (
      await payload.find({
        collection: 'form-attachments',
        where: { uploadIdentity: { equals: uploadIdentity } },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]
  let doc = await lookup()
  if (!doc) {
    // Twenty slots allow replacements/retries without unlimited staged storage.
    for (let slot = 0; slot < 20 && !doc; slot++) {
      const attemptSlot = hash([keyHash, slot])
      if (
        (
          await payload.count({
            collection: 'form-attachments',
            where: { attemptSlot: { equals: attemptSlot } },
            overrideAccess: true,
          })
        ).totalDocs
      )
        continue
      try {
        doc = await payload.create({
          collection: 'form-attachments',
          overrideAccess: true,
          data: {
            token: randomUUID(),
            uploadIdentity,
            attemptSlot,
            submissionKeyHash: keyHash,
            formID,
            fieldID: field.id,
            filename,
            size: bytes.length,
            ...content,
            state: 'staging',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        })
      } catch (error) {
        doc = await lookup()
        if (
          !doc &&
          !(
            await payload.count({
              collection: 'form-attachments',
              where: { attemptSlot: { equals: attemptSlot } },
              overrideAccess: true,
            })
          ).totalDocs
        )
          throw error
      }
    }
  }
  if (!doc)
    throw new FormAttachmentUploadLimitError(
      'This response has reached its upload limit. Start a new response to upload more files.',
    )
  if (
    doc.sha256 !== content.sha256 ||
    doc.filename !== filename ||
    doc.fieldID !== field.id ||
    doc.formID !== formID ||
    !['ready', 'staging'].includes(doc.state) ||
    Date.parse(doc.expiresAt) <= Date.now()
  )
    throw new FormAttachmentValidationError(
      'This upload attempt is expired or has changed. Remove the file and choose it again.',
    )
  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) throw new Error('Private attachments require database transactions.')
  try {
    const req = await createLocalReq({ req: { transactionID } }, payload)
    doc = await payload.findByID({
      collection: 'form-attachments',
      id: doc.id,
      overrideAccess: true,
      depth: 0,
      req,
    })
    if (!['ready', 'staging'].includes(doc.state) || Date.parse(doc.expiresAt) <= Date.now())
      throw new FormAttachmentValidationError('This file expired. Remove it and choose it again.')
    await payload.update({
      collection: 'form-attachments',
      id: doc.id,
      overrideAccess: true,
      req,
      data: { expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
    })
    await storage.put(doc.token, bytes)
    doc = await payload.update({
      collection: 'form-attachments',
      id: doc.id,
      overrideAccess: true,
      req,
      data: { state: 'ready' },
    })
    await payload.db.commitTransaction(transactionID)
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }

  return toUploadedFormFile(doc)
}
export type CapturedFormAttachment = UploadedFormFile & {
  fieldID: string
  fieldName: string
  label: string
}
/** Call inside the submission transaction: writing every attachment prevents cleanup
 * from winning between validation and receipt creation. Tokens never authorize reads. */
export async function claimFormAttachments({
  payload,
  fields,
  values,
  keyHash,
  formID,
  req,
}: {
  payload: Payload
  fields: SimpleFormField[]
  values: FormAnswers
  keyHash: string
  formID: string
  req: PayloadRequest
}) {
  const attachments: CapturedFormAttachment[] = []
  for (const field of fields.filter((field) => field.type === 'file')) {
    const tokens = values[field.name]
    if (!Array.isArray(tokens)) throw new FormAttachmentValidationError('Invalid file answer.')
    for (const token of tokens) {
      const doc = (
        await payload.find({
          collection: 'form-attachments',
          where: { token: { equals: token } },
          depth: 0,
          limit: 1,
          overrideAccess: true,
          req,
          pagination: false,
        })
      ).docs[0]
      if (
        !doc ||
        doc.state !== 'ready' ||
        doc.submissionKeyHash !== keyHash ||
        doc.formID !== formID ||
        doc.fieldID !== field.id ||
        Date.parse(doc.expiresAt) <= Date.now() ||
        !isCompatibleFormFile(toUploadedFormFile(doc), field)
      )
        throw new FormAttachmentValidationError(
          `${field.label}: a file expired or no longer matches this question. Remove it and upload it again.`,
        )
      await payload.update({
        collection: 'form-attachments',
        id: doc.id,
        data: { state: 'attached' },
        overrideAccess: true,
        req,
      })
      attachments.push({
        ...toUploadedFormFile(doc),
        fieldID: field.id!,
        fieldName: field.name,
        label: field.label,
      })
    }
    if (tokens.length > getFormFilePolicy(field).maxFiles)
      throw new FormAttachmentValidationError('Too many files.')
  }
  if (attachments.length > FORM_ATTEMPT_MAX_FILES)
    throw new FormAttachmentValidationError(
      `Attach no more than ${FORM_ATTEMPT_MAX_FILES} files to one response.`,
    )
  return attachments
}

/** Bounded maintenance. Trash retains accepted files; permanent deletion releases
 * them. Mark deletion transactionally before external I/O; failed I/O retries later. */
export async function cleanupFormAttachments(
  payload: Payload,
  storage = getFormAttachmentStorage(),
  now = new Date(),
) {
  const result = { scanned: 0, deleted: 0, retained: 0, failed: 0 }
  const candidates = await payload.find({
    collection: 'form-attachments',
    where: {
      or: [
        { state: { equals: 'deleting' } },
        { expiresAt: { less_than_equal: now.toISOString() } },
      ],
    },
    depth: 0,
    limit: 100,
    sort: 'expiresAt',
    overrideAccess: true,
  })
  for (const candidate of candidates.docs) {
    result.scanned++
    let transactionID
    try {
      transactionID = await payload.db.beginTransaction()
      if (!transactionID) throw new Error('Attachment cleanup requires transactions.')
      const req = await createLocalReq({ req: { transactionID } }, payload)
      const doc = await payload.findByID({
        collection: 'form-attachments',
        id: candidate.id,
        depth: 0,
        overrideAccess: true,
        req,
      })
      if (doc.state !== 'deleting' && Date.parse(doc.expiresAt) > now.getTime()) {
        await payload.db.commitTransaction(transactionID)
        transactionID = undefined
        result.retained++
        continue
      }
      const receipt = (
        await payload.find({
          collection: 'form-submissions',
          where: { submissionKeyHash: { equals: doc.submissionKeyHash } },
          trash: true,
          depth: 0,
          limit: 1,
          overrideAccess: true,
          req,
          pagination: false,
        })
      ).docs[0]
      if (receipt?.attachments?.some((file) => file.token === doc.token)) {
        // Revisit tomorrow; failed deletion-hook scheduling cannot orphan files forever.
        await payload.update({
          collection: 'form-attachments',
          id: doc.id,
          overrideAccess: true,
          req,
          data: { expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
        })
        await payload.db.commitTransaction(transactionID)
        transactionID = undefined
        result.retained++
        continue
      }
      await payload.update({
        collection: 'form-attachments',
        id: doc.id,
        data: { state: 'deleting' },
        overrideAccess: true,
        req,
      })
      await payload.db.commitTransaction(transactionID)
      transactionID = undefined
      await storage.remove(doc.token)
      await payload.delete({ collection: 'form-attachments', id: doc.id, overrideAccess: true })
      result.deleted++
    } catch (error) {
      if (transactionID) await payload.db.rollbackTransaction(transactionID)
      result.failed++
      payload.logger.error({
        err: error,
        msg: 'Private attachment cleanup failed; it will be retried.',
      })
    }
  }
  return result
}
