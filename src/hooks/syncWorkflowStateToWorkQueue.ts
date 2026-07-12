import type { CollectionAfterChangeHook } from 'payload'

import { requiresEditorialWorkflow } from '@/access/adminCapabilities'
import type { WorkQueueCondition } from '@/lib/workQueue'
import { buildWorkQueueDedupeKey, syncWorkQueueConditions } from '@/lib/workQueue'

type WorkflowLikeDoc = {
  [key: string]: unknown
  _status?: 'draft' | 'published' | null
  changeSummary?: string | null
  id: number | string
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
}): CollectionAfterChangeHook => {
  return async ({ doc, req }) => {
    const typedDoc = doc as Partial<WorkflowLikeDoc>

    if (!typedDoc?.id) {
      return doc
    }

    const sourceID = typedDoc.id

    const title = toSourceTitle(typedDoc as WorkflowLikeDoc, titleField, `${sourceCollection} ${typedDoc.id}`)
    const conditions = states.map<WorkQueueCondition>((state) => ({
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection,
        sourceID,
        queueType: state.queueType,
        reasonCode: state.reasonCode,
      }),
      details: state.details?.(typedDoc as WorkflowLikeDoc) ?? typedDoc.changeSummary,
      priority: state.priority?.(typedDoc as WorkflowLikeDoc) ?? 'normal',
      queueType: state.queueType,
      reasonCode: state.reasonCode,
      resolutionSummary: `${title} no longer matches ${state.workflowState}.`,
      sourceAdminPath: `${sourceAdminPathPrefix}/${typedDoc.id}`,
      sourceCollection,
      sourceID,
      sourceSlug: typedDoc.slug ?? null,
      sourceTitle: title,
      sourceUpdatedAt: typedDoc.updatedAt ?? null,
      summary: state.summary(typedDoc as WorkflowLikeDoc, title),
    }))

    const workflowRequired = requiresEditorialWorkflow(req.user as never)
    const activeCondition = workflowRequired
      ? conditions.find((_, index) => states[index]?.workflowState === typedDoc.workflowState) ?? null
      : null

    await syncWorkQueueConditions({
      activeCondition,
      conditions,
      req,
    })

    return typedDoc
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
}): CollectionAfterChangeHook => {
  return async ({ doc, req }) => {
    const typedDoc = doc as Partial<WorkflowLikeDoc>

    if (!typedDoc?.id) {
      return doc
    }

    const sourceID = typedDoc.id

    const title = toSourceTitle(typedDoc as WorkflowLikeDoc, titleField, `${sourceCollection} ${typedDoc.id}`)
    const condition: WorkQueueCondition = {
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection,
        sourceID,
        queueType: 'publish_issue',
        reasonCode: 'draft-change-pending-publication',
      }),
      details: typedDoc.changeSummary,
      priority: 'normal',
      queueType: 'publish_issue',
      reasonCode: 'draft-change-pending-publication',
      resolutionSummary: `${title} no longer has unpublished draft changes.`,
      sourceAdminPath: `${sourceAdminPathPrefix}/${typedDoc.id}`,
      sourceCollection,
      sourceID,
      sourceSlug: typedDoc.slug ?? null,
      sourceTitle: title,
      sourceUpdatedAt: typedDoc.updatedAt ?? null,
      summary: summary(typedDoc as WorkflowLikeDoc, title),
    }

    const actionable =
      typedDoc._status === 'draft' && (isActionable?.(typedDoc as WorkflowLikeDoc) ?? true)

    await syncWorkQueueConditions({
      activeCondition: actionable ? condition : null,
      conditions: [condition],
      req,
    })

    return typedDoc
  }
}
