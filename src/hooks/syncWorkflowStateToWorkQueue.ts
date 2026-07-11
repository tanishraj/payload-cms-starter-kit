import type { CollectionAfterChangeHook } from 'payload'

import { requiresEditorialWorkflow } from '@/access/adminCapabilities'
import type { WorkQueueCondition } from '@/lib/workQueue'
import { buildWorkQueueDedupeKey, syncWorkQueueConditions } from '@/lib/workQueue'

type WorkflowLikeDoc = {
  [key: string]: unknown
  _status?: 'draft' | 'published' | null
  changeSummary?: string | null
  id?: number | string
  slug?: string | null
  title?: string | null
  updatedAt?: string | null
  workflowState?: string | null
}

const toSourceTitle = (doc: WorkflowLikeDoc, titleField: string, fallback: string) => {
  const value = doc?.[titleField]
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

export const createWorkflowQueueHook = ({
  sourceCollection,
  sourceAdminPathPrefix,
  titleField,
  states,
}: {
  sourceAdminPathPrefix: string
  sourceCollection: string
  states: Array<{
    details?: (doc: WorkflowLikeDoc) => string | null | undefined
    priority?: (doc: WorkflowLikeDoc) => WorkQueueCondition['priority']
    queueType: WorkQueueCondition['queueType']
    reasonCode: string
    summary: (doc: WorkflowLikeDoc, title: string) => string
    workflowState: string
  }>
  titleField: string
}): CollectionAfterChangeHook<WorkflowLikeDoc> => {
  return async ({ doc, req }) => {
    if (!doc?.id) {
      return doc
    }

    const title = toSourceTitle(doc, titleField, `${sourceCollection} ${doc.id}`)
    const conditions = states.map<WorkQueueCondition>((state) => ({
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection,
        sourceID: doc.id!,
        queueType: state.queueType,
        reasonCode: state.reasonCode,
      }),
      details: state.details?.(doc) ?? doc.changeSummary,
      priority: state.priority?.(doc) ?? 'normal',
      queueType: state.queueType,
      reasonCode: state.reasonCode,
      resolutionSummary: `${title} no longer matches ${state.workflowState}.`,
      sourceAdminPath: `${sourceAdminPathPrefix}/${doc.id}`,
      sourceCollection,
      sourceID: doc.id,
      sourceSlug: doc.slug ?? null,
      sourceTitle: title,
      sourceUpdatedAt: doc.updatedAt ?? null,
      summary: state.summary(doc, title),
    }))

    const workflowRequired = requiresEditorialWorkflow(req.user as never)
    const activeCondition = workflowRequired
      ? conditions.find((_, index) => states[index]?.workflowState === doc.workflowState) ?? null
      : null

    await syncWorkQueueConditions({
      activeCondition,
      conditions,
      req,
    })

    return doc
  }
}

export const createDraftPublishQueueHook = ({
  isActionable,
  sourceCollection,
  sourceAdminPathPrefix,
  summary,
  titleField,
}: {
  isActionable?: (doc: WorkflowLikeDoc) => boolean
  sourceAdminPathPrefix: string
  sourceCollection: string
  summary: (doc: WorkflowLikeDoc, title: string) => string
  titleField: string
}): CollectionAfterChangeHook<WorkflowLikeDoc> => {
  return async ({ doc, req }) => {
    if (!doc?.id) {
      return doc
    }

    const title = toSourceTitle(doc, titleField, `${sourceCollection} ${doc.id}`)
    const condition: WorkQueueCondition = {
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection,
        sourceID: doc.id!,
        queueType: 'publish_issue',
        reasonCode: 'draft-change-pending-publication',
      }),
      details: doc.changeSummary,
      priority: 'normal',
      queueType: 'publish_issue',
      reasonCode: 'draft-change-pending-publication',
      resolutionSummary: `${title} no longer has unpublished draft changes.`,
      sourceAdminPath: `${sourceAdminPathPrefix}/${doc.id}`,
      sourceCollection,
      sourceID: doc.id,
      sourceSlug: doc.slug ?? null,
      sourceTitle: title,
      sourceUpdatedAt: doc.updatedAt ?? null,
      summary: summary(doc, title),
    }

    const actionable = doc._status === 'draft' && (isActionable?.(doc) ?? true)

    await syncWorkQueueConditions({
      activeCondition: actionable ? condition : null,
      conditions: [condition],
      req,
    })

    return doc
  }
}
