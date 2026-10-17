import { isolateObjectProperty, type CollectionBeforeOperationHook } from 'payload'

const PAGE_DRAFT_SAVE = Symbol('page-draft-save')

/** Read native operation arguments, never a client query/context flag. */
export const scopePageDraftSave: CollectionBeforeOperationHook = ({ args, operation }) => {
  if (operation !== 'update' && operation !== 'create') return

  // Keep this intent local to the operation, including nested writes on the same
  // request. Payload's request proxy retains its transaction and Request fields.
  const req = isolateObjectProperty(args.req, ['context'])
  req.context = {
    ...args.req.context,
    pageDraftSave:
      operation === 'update' &&
      args.draft === true &&
      (args.data as { _status?: unknown } | undefined)?._status !== 'published' &&
      !args.unpublishAllLocales
        ? PAGE_DRAFT_SAVE
        : undefined,
  }
  return { ...args, req }
}

export const isPageDraftSave = (context: unknown): boolean =>
  Boolean(
    context &&
    typeof context === 'object' &&
    (context as Record<string, unknown>).pageDraftSave === PAGE_DRAFT_SAVE,
  )
