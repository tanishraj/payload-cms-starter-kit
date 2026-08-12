import { describe, expect, it, vi } from 'vitest'

import { WorkQueue } from '@/collections/WorkQueue'
import { syncFormSubmissionToWorkQueue } from '@/hooks/syncFormSubmissionToWorkQueue'
import { syncMediaToWorkQueue } from '@/hooks/syncMediaToWorkQueue'
import { syncReviewToWorkQueue } from '@/hooks/syncReviewToWorkQueue'
import {
  createDraftPublishQueueHook,
  createWorkflowQueueHook,
} from '@/hooks/syncWorkflowStateToWorkQueue'
import {
  buildWorkQueueDedupeKey,
  findBlockingPublishQueueItems,
  formatBlockingPublishQueueMessage,
  resolveWorkQueueItem,
  upsertWorkQueueItem,
} from '@/lib/workQueue'

type TestReq = {
  context?: Record<string, unknown>
  payload: {
    create: ReturnType<typeof vi.fn>
    find: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  user?: { capabilities?: Record<string, boolean>; role?: string }
}

const createReq = ({
  docs = [],
  context,
  user,
}: {
  context?: Record<string, unknown>
  docs?: Array<Record<string, unknown>>
  user?: { capabilities?: Record<string, boolean>; role?: string }
} = {}) => {
  const create = vi.fn(async () => ({}))
  const find = vi.fn(async () => ({
    docs,
  }))
  const update = vi.fn(async () => ({}))

  return {
    context,
    payload: {
      create,
      find,
      update,
    },
    user,
  } as TestReq
}

describe('work queue collection', () => {
  it('registers under Administration with system-managed create and delete', () => {
    expect(WorkQueue.slug).toBe('work-queue')
    expect(WorkQueue.admin?.group).toBe('Administration')
    expect(WorkQueue.access?.create?.({ req: {} } as never)).toBe(false)
    expect(WorkQueue.access?.delete?.({ req: {} } as never)).toBe(false)
  })

  it('uses operator-facing list defaults and the expected editable fields', () => {
    expect(WorkQueue.admin?.defaultColumns).toEqual([
      'summary',
      'sourceCollection',
      'sourceTitle',
      'queueType',
      'status',
      'assignee',
      'priority',
      'dueDate',
      'lastSyncedAt',
    ])

    const tabsField = WorkQueue.fields[0]
    if (!tabsField || !('tabs' in tabsField)) {
      throw new Error('Expected tabbed work queue field layout.')
    }

    const tabNames = tabsField.tabs.map((tab) => tab.label)
    expect(tabNames).toEqual(['Details', 'Source', 'System'])
  })

  it('builds stable dedupe keys per source condition', () => {
    expect(
      buildWorkQueueDedupeKey({
        sourceCollection: 'pages',
        sourceID: 12,
        queueType: 'approval',
        reasonCode: 'workflow-action-required',
      }),
    ).toBe('pages:12:approval:workflow-action-required')
  })

  it('finds blocking publish queue items by source identity, status, and queue type', async () => {
    const docs = [
      {
        id: 17,
        queueType: 'approval',
        sourceCollection: 'pages',
        sourceID: '12',
        status: 'open',
        summary: 'Homepage is awaiting editorial approval.',
      },
    ]
    const req = createReq({ docs })

    await expect(
      findBlockingPublishQueueItems({
        req: req as never,
        sourceCollection: 'pages',
        sourceID: 12,
      }),
    ).resolves.toEqual(docs)

    expect(req.payload.find).toHaveBeenCalledWith({
      collection: 'work-queue',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      req: req as never,
      sort: 'summary',
      where: {
        and: [
          {
            sourceCollection: {
              equals: 'pages',
            },
          },
          {
            sourceID: {
              equals: '12',
            },
          },
          {
            status: {
              in: ['open', 'blocked'],
            },
          },
          {
            queueType: {
              in: ['approval', 'publish_issue'],
            },
          },
        ],
      },
    })
  })

  it('formats one blocking queue summary into a publish-safe error message', () => {
    expect(
      formatBlockingPublishQueueMessage([
        {
          summary: 'Homepage is awaiting editorial approval.',
        },
      ]),
    ).toBe(
      'Cannot publish because Work Queue still has a blocking item: "Homepage is awaiting editorial approval.". Resolve it in Work Queue before publishing.',
    )
  })

  it('formats multiple blocking queue summaries with an additional blocker count', () => {
    expect(
      formatBlockingPublishQueueMessage([
        {
          summary: 'Homepage is awaiting editorial approval.',
        },
        {
          summary: 'Publish checklist is incomplete.',
        },
      ]),
    ).toBe(
      'Cannot publish because Work Queue still has blocking items: "Homepage is awaiting editorial approval." and 1 more. Resolve them in Work Queue before publishing.',
    )
  })

  it('creates a new queue item when no matching dedupe key exists', async () => {
    const req = createReq()

    await upsertWorkQueueItem({
      dedupeKey: 'pages:12:approval:workflow-action-required',
      queueType: 'approval',
      reasonCode: 'workflow-action-required',
      req: req as never,
      sourceCollection: 'pages',
      sourceID: 12,
      sourceTitle: 'About',
      summary: 'About requires workflow action.',
    })

    expect(req.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'work-queue',
        data: expect.objectContaining({
          dedupeKey: 'pages:12:approval:workflow-action-required',
          queueType: 'approval',
          reasonCode: 'workflow-action-required',
          sourceCollection: 'pages',
          sourceID: '12',
          sourceTitle: 'About',
          status: 'open',
          summary: 'About requires workflow action.',
        }),
        overrideAccess: true,
      }),
    )
  })

  it('updates an existing queue item in place and reopens resolved entries', async () => {
    const req = createReq({
      docs: [
        {
          id: 99,
          status: 'resolved',
        },
      ],
    })

    await upsertWorkQueueItem({
      dedupeKey: 'pages:12:approval:workflow-action-required',
      queueType: 'approval',
      reasonCode: 'workflow-action-required',
      req: req as never,
      sourceCollection: 'pages',
      sourceID: 12,
      sourceTitle: 'About',
      summary: 'About requires workflow action.',
    })

    expect(req.payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'work-queue',
        id: 99,
        data: expect.objectContaining({
          autoResolved: false,
          resolvedAt: null,
          sourceTitle: 'About',
          status: 'open',
          summary: 'About requires workflow action.',
        }),
        overrideAccess: true,
      }),
    )
  })

  it('resolves a matching queue item without deleting it', async () => {
    const req = createReq({
      docs: [
        {
          id: 44,
          status: 'open',
        },
      ],
    })

    await resolveWorkQueueItem({
      dedupeKey: 'pages:12:approval:workflow-action-required',
      req: req as never,
      resolutionSummary: 'The page was published.',
    })

    expect(req.payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'work-queue',
        id: 44,
        data: expect.objectContaining({
          autoResolved: true,
          resolutionSummary: 'The page was published.',
          status: 'resolved',
        }),
        overrideAccess: true,
      }),
    )
  })

  it('creates an approval queue item when a workflow collection enters in_review', async () => {
    const req = createReq({
      user: {
        role: 'contentManager',
        capabilities: {
          require_editorial_workflow: true,
        },
      },
    })
    const hook = createWorkflowQueueHook({
      sourceAdminPathPrefix: '/admin/collections/pages',
      sourceCollection: 'pages',
      states: [
        {
          queueType: 'approval',
          reasonCode: 'page-review-required',
          summary: (_doc, title) => `${title} is awaiting editorial approval.`,
          workflowState: 'in_review',
        },
      ],
      titleField: 'title',
    })

    await hook({
      doc: {
        id: 12,
        title: 'About',
        workflowState: 'in_review',
      },
      req: req as never,
    } as never)

    expect(req.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'work-queue',
        data: expect.objectContaining({
          queueType: 'approval',
          reasonCode: 'page-review-required',
          sourceCollection: 'pages',
          sourceID: '12',
        }),
      }),
    )
  })

  it('resolves workflow queue items instead of creating new ones for direct-publish users', async () => {
    const req = createReq({
      docs: [
        {
          id: 44,
          status: 'open',
        },
      ],
      user: {
        role: 'siteManager',
        capabilities: {
          publish_pages: true,
        },
      },
    })
    const hook = createWorkflowQueueHook({
      sourceAdminPathPrefix: '/admin/collections/pages',
      sourceCollection: 'pages',
      states: [
        {
          queueType: 'approval',
          reasonCode: 'page-review-required',
          summary: (_doc, title) => `${title} is awaiting editorial approval.`,
          workflowState: 'in_review',
        },
      ],
      titleField: 'title',
    })

    await hook({
      doc: {
        id: 12,
        title: 'About',
        workflowState: 'published',
      },
      req: req as never,
    } as never)

    expect(req.payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'work-queue',
        id: 44,
        data: expect.objectContaining({
          autoResolved: true,
          status: 'resolved',
        }),
        overrideAccess: true,
      }),
    )
    expect(req.payload.create).not.toHaveBeenCalled()
  })

  it('creates a publish queue item for draft-only collections', async () => {
    const req = createReq()
    const hook = createDraftPublishQueueHook({
      sourceAdminPathPrefix: '/admin/collections/headers',
      sourceCollection: 'headers',
      summary: (_doc, title) => `${title} has unpublished draft changes.`,
      titleField: 'title',
    })

    await hook({
      doc: {
        _status: 'draft',
        id: 8,
        title: 'Primary Header',
      },
      req: req as never,
    } as never)

    expect(req.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          queueType: 'publish_issue',
          reasonCode: 'draft-change-pending-publication',
          sourceCollection: 'headers',
          sourceID: '8',
        }),
      }),
    )
  })

  it('creates a follow-up queue item for new form submissions', async () => {
    const req = createReq()

    await syncFormSubmissionToWorkQueue({
      doc: {
        id: 22,
        status: 'new',
        submissionIntent: 'lead',
        submitterEmail: 'lead@example.com',
      },
      req: req as never,
    } as never)

    expect(req.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          queueType: 'follow_up',
          priority: 'high',
          reasonCode: 'submission-new',
          sourceCollection: 'form-submissions',
        }),
      }),
    )
  })

  it('creates a moderation queue item for in-review reviews', async () => {
    const req = createReq()

    await syncReviewToWorkQueue({
      doc: {
        id: 31,
        title: 'Review Title',
        workflowState: 'in_review',
      },
      req: req as never,
    } as never)

    expect(req.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          queueType: 'moderation',
          reasonCode: 'review-moderation-required',
          sourceCollection: 'reviews',
        }),
      }),
    )
  })

  it('creates a media issue queue item for critical assets without replacement guidance', async () => {
    const req = createReq()

    await syncMediaToWorkQueue({
      doc: {
        id: 51,
        isCriticalAsset: true,
        replacementNotes: '',
        title: 'Homepage Logo',
      },
      req: req as never,
    } as never)

    expect(req.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          queueType: 'media_issue',
          reasonCode: 'critical-media-replacement-guidance-missing',
          sourceCollection: 'media',
        }),
      }),
    )
  })
})
