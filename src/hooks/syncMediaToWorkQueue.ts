import type { CollectionAfterChangeHook } from 'payload'

import { buildWorkQueueDedupeKey, syncWorkQueueConditions, type WorkQueueCondition } from '@/lib/workQueue'

type MediaDoc = {
  id?: number | string
  isCriticalAsset?: boolean | null
  replacementNotes?: string | null
  storageStatus?: 'unchecked' | 'healthy' | 'missing' | 'check_failed' | 'local_only' | null
  title?: string | null
  updatedAt?: string | null
}

export const syncMediaToWorkQueue: CollectionAfterChangeHook<MediaDoc> = async ({ doc, req }) => {
  if (!doc?.id) {
    return doc
  }

  const title = doc.title || `Media ${doc.id}`
  const conditions: WorkQueueCondition[] = [
    {
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection: 'media',
        sourceID: doc.id,
        queueType: 'media_issue',
        reasonCode: 'media-object-missing',
      }),
      details:
        'The media record still exists in Payload, but the backing object was not found in storage. Restore the object or replace the asset.',
      priority: doc.isCriticalAsset ? 'urgent' : 'high',
      queueType: 'media_issue',
      reasonCode: 'media-object-missing',
      resolutionSummary: `${title} is available in storage again.`,
      sourceAdminPath: `/admin/collections/media/${doc.id}`,
      sourceCollection: 'media',
      sourceID: doc.id,
      sourceTitle: title,
      sourceUpdatedAt: doc.updatedAt ?? null,
      summary: `${title} is missing from object storage.`,
    },
    {
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection: 'media',
        sourceID: doc.id,
        queueType: 'media_issue',
        reasonCode: 'media-title-missing',
      }),
      details: 'Media assets should have an internal title for easier governance and reuse.',
      priority: 'normal',
      queueType: 'media_issue',
      reasonCode: 'media-title-missing',
      resolutionSummary: `${title} now has an internal media title.`,
      sourceAdminPath: `/admin/collections/media/${doc.id}`,
      sourceCollection: 'media',
      sourceID: doc.id,
      sourceTitle: title,
      sourceUpdatedAt: doc.updatedAt ?? null,
      summary: `${title} is missing internal governance metadata.`,
    },
    {
      dedupeKey: buildWorkQueueDedupeKey({
        sourceCollection: 'media',
        sourceID: doc.id,
        queueType: 'media_issue',
        reasonCode: 'critical-media-replacement-guidance-missing',
      }),
      details:
        'Critical assets should include replacement notes so operators can manage change safely.',
      priority: 'high',
      queueType: 'media_issue',
      reasonCode: 'critical-media-replacement-guidance-missing',
      resolutionSummary: `${title} now has critical asset replacement guidance.`,
      sourceAdminPath: `/admin/collections/media/${doc.id}`,
      sourceCollection: 'media',
      sourceID: doc.id,
      sourceTitle: title,
      sourceUpdatedAt: doc.updatedAt ?? null,
      summary: `${title} needs critical asset governance guidance.`,
    },
  ]

  const activeCondition =
    doc.storageStatus === 'missing'
      ? conditions[0]
      : !doc.title || doc.title.trim().length === 0
        ? conditions[1]
        : doc.isCriticalAsset && (!doc.replacementNotes || doc.replacementNotes.trim().length === 0)
          ? conditions[2]
        : null

  await syncWorkQueueConditions({
    activeCondition,
    conditions,
    req,
  })

  return doc
}
