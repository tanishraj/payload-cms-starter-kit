import 'server-only'
import path from 'node:path'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { runtimeConfig } from '@/config/runtime.server'
import type { FormAttachmentStorageConfig } from '@/config/formAttachmentStorage'
import { FORM_FILE_MAX_BYTES, isUploadToken } from '@/lib/formAttachments'

export interface FormAttachmentStorage {
  put: (key: string, bytes: Buffer) => Promise<void>
  get: (key: string) => Promise<Buffer>
  remove: (key: string) => Promise<void>
}
export const attachmentStorageAvailable = () =>
  runtimeConfig.formAttachments?.provider !== 'disabled' && Boolean(runtimeConfig.formAttachments)
export function createFormAttachmentStorage(
  config: FormAttachmentStorageConfig,
  directory = path.resolve('.private/form-attachments'),
): FormAttachmentStorage {
  const keyPath = (key: string) => {
    if (!isUploadToken(key)) throw new Error('Invalid attachment storage key.')
    return path.join(directory, key)
  }
  if (config.provider === 'disabled') throw new Error('Private file uploads are not configured.')
  if (config.provider === 'localDisk')
    return {
      put: async (key, bytes) => {
        const target = keyPath(key)
        await mkdir(directory, { recursive: true, mode: 0o700 })
        await writeFile(target, bytes, { mode: 0o600 })
      },
      get: async (key) => readFile(keyPath(key)),
      remove: async (key) => {
        await rm(keyPath(key), { force: true })
      },
    }
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    forcePathStyle: config.forcePathStyle,
  })
  const options = (key: string) => {
    keyPath(key)
    return { Bucket: config.bucket, Key: `form-attachments/${key}` }
  }
  return {
    put: async (key, bytes) => {
      await client.send(
        new PutObjectCommand({
          ...options(key),
          Body: bytes,
          ContentType: 'application/octet-stream',
        }),
      )
    },
    get: async (key) => {
      const result = await client.send(new GetObjectCommand(options(key)))
      if (!result.Body) throw new Error('Attachment unavailable.')
      if ((result.ContentLength ?? 0) > FORM_FILE_MAX_BYTES)
        throw new Error('Attachment exceeds storage limit.')
      const reader = result.Body.transformToWebStream().getReader()
      const chunks: Uint8Array[] = []
      let length = 0
      while (true) {
        const chunk = await reader.read()
        if (chunk.done) break
        length += chunk.value.byteLength
        if (length > FORM_FILE_MAX_BYTES) {
          await reader.cancel()
          throw new Error('Attachment exceeds storage limit.')
        }
        chunks.push(chunk.value)
      }
      return Buffer.concat(chunks, length)
    },
    remove: async (key) => {
      await client.send(new DeleteObjectCommand(options(key)))
    },
  }
}
export const getFormAttachmentStorage = () =>
  createFormAttachmentStorage(runtimeConfig.formAttachments ?? { provider: 'disabled' })
