import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'

import {
  canPublishArticles,
  canPublishPages,
  canPublishReviews,
  canPublishSystemPages,
} from '@/access/adminCapabilities'
import type { EditorialWorkflowState } from '@/lib/editorialWorkflow'
import {
  findBlockingPublishQueueItems,
  formatBlockingPublishQueueMessage,
} from '@/lib/workQueue'

type PublishCapability =
  | 'publish_articles'
  | 'publish_pages'
  | 'publish_reviews'
  | 'publish_system_pages'
type DocStatus = 'draft' | 'published'
type QueueAwareCollection = 'pages' | 'articles' | 'reviews' | 'system-pages'

type WorkflowDoc = {
  id?: number | string | null
  _status?: DocStatus | null
  changeSummary?: string | null
  lastReviewedAt?: string | null
  lastReviewedBy?: number | null
  publishedAt?: string | null
  publishedBy?: number | null
  scheduledPublishAt?: string | null
  workflowState?: EditorialWorkflowState | null
}

const canPublish = (capability: PublishCapability, user: unknown) => {
  switch (capability) {
    case 'publish_articles':
      return canPublishArticles(user as never)
    case 'publish_reviews':
      return canPublishReviews(user as never)
    case 'publish_system_pages':
      return canPublishSystemPages(user as never)
    case 'publish_pages':
    default:
      return canPublishPages(user as never)
  }
}

const normalizeUserID = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

const resolveWorkflowState = (
  data: WorkflowDoc,
  originalDoc: WorkflowDoc | undefined,
): EditorialWorkflowState => {
  if (data.workflowState) {
    return data.workflowState
  }

  if (data._status === 'published') {
    return 'published'
  }

  if (originalDoc?.workflowState) {
    return originalDoc.workflowState
  }

  if (originalDoc?._status === 'published') {
    return 'published'
  }

  return 'draft'
}

export const enforceEditorialWorkflow =
  (
    publishCapability: PublishCapability,
    sourceCollection?: QueueAwareCollection,
  ): CollectionBeforeChangeHook<WorkflowDoc> =>
  async ({ data, originalDoc, req }) => {
    const nextData: WorkflowDoc = {
      ...(data ?? {}),
    }
    const nextState = resolveWorkflowState(nextData, originalDoc)
    const now = new Date().toISOString()
    const userID = normalizeUserID(req.user?.id)

    nextData.workflowState = nextState

    if (nextState === 'draft') {
      nextData._status = 'draft'
      return nextData
    }

    if (nextState === 'in_review') {
      nextData._status = 'draft'
      nextData.lastReviewedAt = now
      nextData.lastReviewedBy = userID
      return nextData
    }

    if (!canPublish(publishCapability, req.user)) {
      throw new APIError('Only publishers and admins can move content to published.', 400)
    }

    if (nextState === 'scheduled') {
      if (!nextData.scheduledPublishAt) {
        throw new APIError('Scheduled content requires scheduledPublishAt.', 400)
      }

      nextData._status = 'draft'
      return nextData
    }

    if (nextState === 'published' || nextState === 'reverted') {
      const sourceID = nextData.id ?? originalDoc?.id

      if (nextState === 'published' && sourceCollection && sourceID != null) {
        const blockingItems = await findBlockingPublishQueueItems({
          req,
          sourceCollection,
          sourceID,
        })

        if (blockingItems.length > 0) {
          throw new APIError(formatBlockingPublishQueueMessage(blockingItems), 400)
        }
      }

      nextData._status = 'published'
      nextData.publishedAt = now
      nextData.publishedBy = userID
      nextData.scheduledPublishAt = null
      return nextData
    }

    return nextData
  }
