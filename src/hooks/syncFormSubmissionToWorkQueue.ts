import type { CollectionAfterChangeHook } from 'payload'

import { buildWorkQueueDedupeKey, syncWorkQueueConditions, type WorkQueueCondition } from '@/lib/workQueue'

type FormSubmissionDoc = {
  id?: number | string
  internalNotes?: string | null
  submissionIntent?: 'general' | 'lead' | 'review' | null
  status?: string | null
  submitterEmail?: string | null
  submitterName?: string | null
  updatedAt?: string | null
}

export const syncFormSubmissionToWorkQueue: CollectionAfterChangeHook<FormSubmissionDoc> = async ({
  doc,
  req,
}) => {
  if (!doc?.id) {
    return doc
  }

  const title = doc.submitterEmail || doc.submitterName || `Submission ${doc.id}`
  const conditions: WorkQueueCondition[] = [
    {
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection: 'form-submissions',
        sourceID: doc.id,
        queueType: 'follow_up',
        reasonCode: 'submission-new',
      }),
      details: doc.internalNotes,
      priority: doc.submissionIntent === 'lead' ? 'high' : 'normal',
      queueType: 'follow_up',
      reasonCode: 'submission-new',
      resolutionSummary: `${title} is no longer new.`,
      sourceAdminPath: `/admin/collections/form-submissions/${doc.id}`,
      sourceCollection: 'form-submissions',
      sourceID: doc.id,
      sourceTitle: title,
      sourceUpdatedAt: doc.updatedAt ?? null,
      summary: `${title} requires initial follow-up.`,
    },
    {
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection: 'form-submissions',
        sourceID: doc.id,
        queueType: 'follow_up',
        reasonCode: 'submission-in-review',
      }),
      details: doc.internalNotes,
      priority: doc.submissionIntent === 'lead' ? 'high' : 'normal',
      queueType: 'follow_up',
      reasonCode: 'submission-in-review',
      resolutionSummary: `${title} is no longer in review.`,
      sourceAdminPath: `/admin/collections/form-submissions/${doc.id}`,
      sourceCollection: 'form-submissions',
      sourceID: doc.id,
      sourceTitle: title,
      sourceUpdatedAt: doc.updatedAt ?? null,
      summary: `${title} still requires follow-up review.`,
    },
  ]

  const activeCondition =
    doc.status === 'new' ? conditions[0] : doc.status === 'in_review' ? conditions[1] : null

  await syncWorkQueueConditions({
    activeCondition,
    conditions,
    req,
  })

  return doc
}
