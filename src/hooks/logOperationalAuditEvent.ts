import type {
  CollectionAfterChangeHook,
  GlobalAfterChangeHook,
} from 'payload'

import { recordOperationalAuditEvent } from '@/lib/operationalAudit'

type HookConfig<TDoc> = {
  entityType: string
  getSummary: (args: { doc: TDoc; previousDoc?: Partial<TDoc> | null }) => string
  titleField: keyof TDoc
}

export const createCollectionAuditHook = <TDoc extends { id?: number | string }>(
  config: HookConfig<TDoc>,
): CollectionAfterChangeHook<TDoc> => {
  return async ({ doc, operation, previousDoc, req }) => {
    await recordOperationalAuditEvent({
      action: operation,
      entityId: String(doc.id ?? ''),
      entityTitle: String(doc[config.titleField] ?? `#${doc.id}`),
      entityType: config.entityType,
      req,
      summary: config.getSummary({ doc, previousDoc }),
    })

    return doc
  }
}

export const createGlobalAuditHook = <TDoc extends Record<string, unknown>>(
  config: Omit<HookConfig<TDoc>, 'titleField'> & { title: string },
): GlobalAfterChangeHook<TDoc> => {
  return async ({ doc, previousDoc, req }) => {
    await recordOperationalAuditEvent({
      action: 'update',
      entityId: config.entityType,
      entityTitle: config.title,
      entityType: config.entityType,
      req,
      summary: config.getSummary({ doc, previousDoc }),
    })

    return doc
  }
}
