import {
  APIError,
  type CollectionBeforeOperationHook,
  type CollectionBeforeChangeHook,
  type CollectionBeforeValidateHook,
  type FieldAccess,
} from 'payload'
import { hasFeature, isAdmin, isSiteManager } from '@/access/featureAccess'
import { grantedSectionRoots, relationshipID } from '@/access/sectionAccess'
import { enforceSectionOwnership } from '@/fields/sectionOwnership'
import { findMediaUsage } from '@/lib/mediaUsage'

/** Only owners see internal governance notes; shared published assets expose presentation data. */
export const scopedMediaPrivateRead: FieldAccess = ({ req, doc, data, id }) => {
  if (isAdmin(req.user)) return true
  if (!hasFeature(req.user, 'media')) return false
  return grantedSectionRoots(req).then((roots) => {
    // Native form state passes fullData as data; persisted read hooks pass doc.
    const record = doc ?? data
    if (!id && !record?.id && !record?._id && !record?.createdAt) return roots.length > 0
    const root = relationshipID(record?.sectionRoot)
    return Boolean(root && roots.includes(root))
  })
}

/** Assign a blank section only during creation when exactly one active grant exists. */
export const enforceMediaOwnership: CollectionBeforeValidateHook = async (args) => {
  let data = args.data
  if (
    args.operation === 'create' &&
    data &&
    isSiteManager(args.req.user) &&
    data.sectionRoot == null
  ) {
    const roots = await grantedSectionRoots(args.req)
    if (roots.length === 1) data = { ...data, sectionRoot: roots[0] }
  }
  return enforceSectionOwnership({ ...args, data })
}

const storedFileFields = ['filename', 'mimeType', 'filesize', 'width', 'height', 'sizes'] as const
/** Upload side effects can affect an already-used file even when the editor saves a draft. */
export const protectReferencedMediaFile: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (operation !== 'update' || !originalDoc || !isSiteManager(req.user) || req.file) return data
  const fileChanged = storedFileFields.some(
    (field) =>
      Object.hasOwn(data, field) &&
      JSON.stringify(data[field]) !== JSON.stringify(originalDoc[field]),
  )
  const movingToTrash = Boolean(data.deletedAt) && !originalDoc.deletedAt
  if (!fileChanged && !movingToTrash) return data
  const references = await findMediaUsage({ mediaID: originalDoc.id, payload: req.payload })
  if (references.length)
    throw new APIError(
      'This asset is in use. Upload a separate asset and update the page reference, or ask an Admin to review replacement.',
      400,
    )
  return data
}

/** Reject ownership/file changes before native field normalization or upload side effects. */
export const protectMediaUploadBeforeOperation: CollectionBeforeOperationHook = async ({
  operation,
  args,
  req,
  collection,
  context,
}) => {
  if (operation !== 'update' || !isSiteManager(req.user)) return
  const data = (
    'data' in args && args.data && typeof args.data === 'object' ? args.data : {}
  ) as Record<string, unknown>
  if (
    !req.file &&
    data.sectionRoot == null &&
    !storedFileFields.some((field) => Object.hasOwn(data, field))
  )
    return
  if (!hasFeature(req.user, 'media')) throw new APIError('Media authoring access is required.', 403)
  if (!('id' in args) || (typeof args.id !== 'string' && typeof args.id !== 'number'))
    throw new APIError('Change files or ownership from an individual asset editor.', 400)
  const originalDoc = await req.payload.findByID({
    collection: 'media',
    id: args.id,
    depth: 0,
    draft: true,
    overrideAccess: false,
    user: req.user,
    req,
  })
  await enforceMediaOwnership({ collection, context, operation: 'update', originalDoc, data, req })
  const originalFile: Record<string, unknown> = { ...originalDoc }
  const fileChanged =
    Boolean(req.file) ||
    storedFileFields.some(
      (field) =>
        Object.hasOwn(data, field) &&
        JSON.stringify(data[field]) !== JSON.stringify(originalFile[field]),
    )
  if (!fileChanged) return
  const references = await findMediaUsage({ mediaID: originalDoc.id, payload: req.payload })
  if (references.length)
    throw new APIError(
      'This asset is in use. Upload a separate asset and update the page reference, or ask an Admin to review replacement.',
      400,
    )
  if (!req.file) throw new APIError('File metadata can only change through a file upload.', 400)
}
