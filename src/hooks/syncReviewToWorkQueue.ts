import type { CollectionAfterChangeHook } from 'payload'

import { buildWorkQueueDedupeKey, syncWorkQueueConditions, type WorkQueueCondition } from '@/lib/workQueue'

type ReviewDoc = {
  changeSummary?: string | null
  id?: number | string
  internalModerationNotes?: string | null
  slug?: string | null
  title?: string | null
  updatedAt?: string | null
  workflowState?: string | null
}

export const syncReviewToWorkQueue: CollectionAfterChangeHook<ReviewDoc> = async ({ doc, req }) => {
  if (!doc?.id) {
    return doc
  }

  const title = doc.title || `Review ${doc.id}`
  const conditions: WorkQueueCondition[] = [
    {
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection: 'reviews',
        sourceID: doc.id,
        queueType: 'moderation',
        reasonCode: 'review-moderation-required',
      }),
      details: doc.internalModerationNotes ?? doc.changeSummary,
      priority: 'normal',
      queueType: 'moderation',
      reasonCode: 'review-moderation-required',
      resolutionSummary: `${title} no longer requires moderation review.`,
      sourceAdminPath: `/admin/collections/reviews/${doc.id}`,
      sourceCollection: 'reviews',
      sourceID: doc.id,
      sourceSlug: doc.slug ?? null,
      sourceTitle: title,
      sourceUpdatedAt: doc.updatedAt ?? null,
      summary: `${title} requires review moderation.`,
    },
    {
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection: 'reviews',
        sourceID: doc.id,
        queueType: 'approval',
        reasonCode: 'review-scheduled-publication',
      }),
      details: doc.changeSummary,
      priority: 'high',
      queueType: 'approval',
      reasonCode: 'review-scheduled-publication',
      resolutionSummary: `${title} no longer requires scheduled publication handling.`,
      sourceAdminPath: `/admin/collections/reviews/${doc.id}`,
      sourceCollection: 'reviews',
      sourceID: doc.id,
      sourceSlug: doc.slug ?? null,
      sourceTitle: title,
      sourceUpdatedAt: doc.updatedAt ?? null,
      summary: `${title} is scheduled and requires publication oversight.`,
    },
  ]

  const activeCondition =
    doc.workflowState === 'in_review'
      ? conditions[0]
      : doc.workflowState === 'scheduled'
        ? conditions[1]
        : null

  await syncWorkQueueConditions({
    activeCondition,
    conditions,
    req,
  })

  return doc
}
