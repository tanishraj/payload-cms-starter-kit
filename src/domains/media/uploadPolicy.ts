import path from 'node:path'

import { fileTypeFromBuffer } from 'file-type'
import { APIError, type PayloadRequest } from 'payload'

import { ALLOWED_MEDIA_MIME_TYPES } from '@/config/uploadLimits'

type AllowedMediaMimeType = (typeof ALLOWED_MEDIA_MIME_TYPES)[number]
type UploadedMediaFile = Pick<
  NonNullable<PayloadRequest['file']>,
  'data' | 'mimetype' | 'name' | 'size'
>

const mimeTypeByExtension: Record<string, AllowedMediaMimeType> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

const rejectUpload = (message: string): never => {
  throw new APIError(message, 400)
}

const hasPdfSignature = (data: Buffer): boolean =>
  data.length >= 5 && data.subarray(0, 5).toString('ascii') === '%PDF-'

const detectRasterMimeType = async (data: Buffer): Promise<string | undefined> => {
  try {
    return (await fileTypeFromBuffer(Uint8Array.from(data)))?.mime
  } catch {
    return undefined
  }
}

export const validateUploadedMedia = async (file: UploadedMediaFile): Promise<void> => {
  if (!Buffer.isBuffer(file.data)) {
    rejectUpload('The uploaded media file is missing its binary data.')
  }

  if (file.data.length === 0 || file.size === 0) {
    rejectUpload('Empty media files are not allowed.')
  }

  const extension = path.extname(file.name).toLowerCase()
  const expectedMimeType = mimeTypeByExtension[extension]

  if (!expectedMimeType) {
    rejectUpload('The uploaded media filename has an unsupported extension.')
  }

  const declaredMimeType = file.mimetype.trim().toLowerCase()

  if (!ALLOWED_MEDIA_MIME_TYPES.includes(declaredMimeType as AllowedMediaMimeType)) {
    rejectUpload('The uploaded media file declares an unsupported MIME type.')
  }

  if (declaredMimeType !== expectedMimeType) {
    rejectUpload('The uploaded media filename extension does not match its declared MIME type.')
  }

  const detectedMimeType =
    expectedMimeType === 'application/pdf'
      ? hasPdfSignature(file.data)
        ? 'application/pdf'
        : undefined
      : await detectRasterMimeType(file.data)

  if (detectedMimeType !== expectedMimeType) {
    rejectUpload('The uploaded media content does not match its filename and declared MIME type.')
  }
}
