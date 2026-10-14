import { APIError, type CollectionBeforeChangeHook } from 'payload'
import { attachmentStorageAvailable } from '@/lib/formAttachmentStorage.server'
/** Draft authoring remains available; publication must not advertise unusable uploads. */
export const requireFormAttachmentStorage: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const status = data?._status ?? originalDoc?._status
  const fields = data?.fields ?? originalDoc?.fields ?? []
  if (
    status === 'published' &&
    fields.some((field: { type?: string }) => field.type === 'file') &&
    !attachmentStorageAvailable()
  )
    throw new APIError(
      'Private file uploads are not configured. Set up a separate private attachment bucket before publishing this Form.',
      400,
    )
  return data
}
