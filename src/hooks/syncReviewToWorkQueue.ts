import type { CollectionAfterChangeHook } from 'payload'

import { buildWorkQueueDedupeKey, syncWorkQueueConditions, type WorkQueueCondition } from '@/lib/workQueue'

type ReviewDoc = {
  changeSummary?: string | null
  id: number | string
  internalModerationNotes?: string | null
  slug?: string | null
  title?: string | null
  updatedAt?: string | null
  workflowState?: string | null
}

export const syncReviewToWorkQueue: CollectionAfterChangeHook = async ({ doc, req }) => {
  const typedDoc = doc as Partial<ReviewDoc>

  if (!typedDoc?.id) {
    return doc
  }

  const title = typedDoc.title || `Review ${typedDoc.id}`
  const conditions: WorkQueueCondition[] = [
    {
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection: 'reviews',
        sourceID: typedDoc.id,
        queueType: 'moderation',
        reasonCode: 'review-moderation-required',
      }),
      details: typedDoc.internalModerationNotes ?? typedDoc.changeSummary,
      priority: 'normal',
      queueType: 'moderation',
      reasonCode: 'review-moderation-required',
      resolutionSummary: `${title} no longer requires moderation review.`,
      sourceAdminPath: `/admin/collections/reviews/${typedDoc.id}`,
      sourceCollection: 'reviews',
      sourceID: typedDoc.id,
      sourceSlug: typedDoc.slug ?? null,
      sourceTitle: title,
      sourceUpdatedAt: typedDoc.updatedAt ?? null,
      summary: `${title} requires review moderation.`,
    },
    {
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection: 'reviews',
        sourceID: typedDoc.id,
        queueType: 'approval',
        reasonCode: 'review-scheduled-publication',
      }),
      details: typedDoc.changeSummary,
      priority: 'high',
      queueType: 'approval',
      reasonCode: 'review-scheduled-publication',
      resolutionSummary: `${title} no longer requires scheduled publication handling.`,
      sourceAdminPath: `/admin/collections/reviews/${typedDoc.id}`,
      sourceCollection: 'reviews',
      sourceID: typedDoc.id,
      sourceSlug: typedDoc.slug ?? null,
      sourceTitle: title,
      sourceUpdatedAt: typedDoc.updatedAt ?? null,
      summary: `${title} is scheduled and requires publication oversight.`,
    },
  ]

  const activeCondition =
    typedDoc.workflowState === 'in_review'
      ? conditions[0]
      : typedDoc.workflowState === 'scheduled'
        ? conditions[1]
        : null

  await syncWorkQueueConditions({
    activeCondition,
    conditions,
    req,
  })

  return typedDoc
}
