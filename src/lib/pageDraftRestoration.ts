import {
  APIError,
  isolateObjectProperty,
  restoreVersionOperation,
  type CollectionBeforeOperationHook,
  type CollectionBeforeValidateHook,
  type CollectionAfterOperationHook,
  type PayloadRequest,
  type PopulateType,
} from 'payload'
import { recordOperationalAuditEvent } from '@/lib/operationalAudit'

const PAGE_DRAFT_RESTORE = Symbol('page-draft-restoration')

/** Server-only operation context, isolated from other operations on the same request. */
export function isPageDraftRestoration(context: unknown): boolean {
  return Boolean(
    context &&
    typeof context === 'object' &&
    (context as Record<string, unknown>).pageDraftRestoration === PAGE_DRAFT_RESTORE,
  )
}

export const requireSafePageRestoration: CollectionBeforeOperationHook = ({
  operation,
  args,
  req,
}) => {
  if (
    operation === 'restoreVersion' &&
    (!('draft' in args) || args.draft !== true || !isPageDraftRestoration(req.context))
  ) {
    throw new APIError(
      'Restore Pages through Page History or restorePageVersionAsDraft. Review the new draft before publishing.',
      400,
    )
  }
}

export const markRestoredPageDraft: CollectionBeforeValidateHook = ({ context, data }) =>
  isPageDraftRestoration(context) ? { ...data, _status: 'draft' } : data

export const auditPageRestoration: CollectionAfterOperationHook = async ({
  operation,
  args,
  req,
  result,
}) => {
  if (operation !== 'restoreVersion') return result
  const doc = result as { id: string | number; title?: unknown }
  await recordOperationalAuditEvent({
    action: 'restore_version_as_draft',
    entityId: String(doc.id),
    entityTitle: typeof doc.title === 'string' ? doc.title : `#${doc.id}`,
    entityType: 'page',
    feature: 'pages',
    req,
    summary: `Restored Page version ${String(args.id)} as a new draft. Publishing remains a separate action.`,
  })
  return result
}

export async function restorePageVersionAsDraft({
  req,
  versionID,
  depth,
  populate,
}: {
  req: PayloadRequest
  versionID: string
  depth?: number
  populate?: PopulateType
}) {
  if (!req.user) throw new APIError('Authentication is required.', 401)
  // Payload's own request proxy preserves Request private fields and the transaction,
  // while restoration-specific context and query settings stay local to this operation.
  const scopedReq = isolateObjectProperty(req, ['context', 'query'])
  scopedReq.context = { ...req.context, pageDraftRestoration: PAGE_DRAFT_RESTORE }
  scopedReq.query = { ...req.query }
  await req.payload.findVersionByID({
    collection: 'pages',
    id: versionID,
    depth: 0,
    req: scopedReq,
    user: req.user,
    overrideAccess: false,
  })
  // Payload 3.90.2's Local API wrapper drops `draft`; the public native operation
  // accepts it. Keep native access, field hooks, versions and transaction behavior.
  return restoreVersionOperation({
    collection: req.payload.collections.pages,
    id: versionID,
    draft: true,
    depth,
    populate,
    overrideAccess: false,
    req: scopedReq,
  })
}
