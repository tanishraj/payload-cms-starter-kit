import { describe, expect, it, vi } from 'vitest'

import { OperationalAuditEvents } from '@/collections/OperationalAuditEvents'
import { WorkQueue } from '@/collections/WorkQueue'
import {
  createCollectionAuditHook,
  createGlobalAuditHook,
} from '@/hooks/logOperationalAuditEvent'

describe('operational audit collection', () => {
  it('is read-only for operators and grouped under Administration', () => {
    expect(OperationalAuditEvents.slug).toBe('operational-audit-events')
    expect(OperationalAuditEvents.admin?.group).toBe('Administration')
    expect(OperationalAuditEvents.access?.create?.({} as never)).toBe(false)
    expect(OperationalAuditEvents.access?.update?.({} as never)).toBe(false)
  })

  it('stores human-readable audit summaries through the collection hook factory', async () => {
    const create = vi.fn(async () => ({}))
    const hook = createCollectionAuditHook({
      entityType: 'page',
      getSummary: ({ doc, previousDoc }) =>
        `Workflow moved from ${previousDoc?.workflowState ?? 'draft'} to ${doc.workflowState}.`,
      titleField: 'title',
    })

    await hook({
      doc: {
        id: 44,
        title: 'About',
        workflowState: 'published',
      },
      operation: 'update',
      previousDoc: {
        workflowState: 'in_review',
      },
      req: {
        payload: {
          create,
        },
        user: {
          email: 'publisher@example.com',
          role: 'publisher',
        },
      },
    } as never)

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'operational-audit-events',
        data: expect.objectContaining({
          action: 'update',
          actorEmail: 'publisher@example.com',
          actorRole: 'publisher',
          entityId: '44',
          entityTitle: 'About',
          entityType: 'page',
          summary: 'Workflow moved from in_review to published.',
        }),
        overrideAccess: true,
      }),
    )
  })

  it('stores global updates with stable titles through the global hook factory', async () => {
    const create = vi.fn(async () => ({}))
    const hook = createGlobalAuditHook({
      entityType: 'system_mode_settings',
      getSummary: ({ doc, previousDoc }) =>
        `Site mode changed from ${previousDoc?.siteMode ?? 'off'} to ${doc.siteMode}.`,
      title: 'System Modes',
    })

    await hook({
      doc: {
        siteMode: 'maintenance',
      },
      previousDoc: {
        siteMode: 'off',
      },
      req: {
        payload: {
          create,
        },
        user: {
          email: 'ops@example.com',
          role: 'marketingOps',
        },
      },
    } as never)

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'operational-audit-events',
        data: expect.objectContaining({
          action: 'update',
          actorEmail: 'ops@example.com',
          actorRole: 'marketingOps',
          entityId: 'system_mode_settings',
          entityTitle: 'System Modes',
          entityType: 'system_mode_settings',
          summary: 'Site mode changed from off to maintenance.',
        }),
        overrideAccess: true,
      }),
    )
  })

  it('records operator-driven work queue updates while ignoring sync-context writes', async () => {
    const create = vi.fn(async () => ({}))
    const hook = WorkQueue.hooks?.afterChange?.[0]

    if (!hook) {
      throw new Error('Expected Work Queue afterChange hook to exist.')
    }

    await hook({
      doc: {
        id: 9,
        assignee: 21,
        priority: 'high',
        status: 'in_progress',
      },
      operation: 'update',
      previousDoc: {
        assignee: null,
        priority: 'normal',
        status: 'open',
      },
      req: {
        context: {},
        payload: {
          create,
        },
        user: {
          email: 'ops@example.com',
          role: 'marketingOps',
        },
      },
    } as never)

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'operational-audit-events',
        data: expect.objectContaining({
          action: 'work_queue_updated',
          entityId: '9',
          entityType: 'work_queue',
        }),
        overrideAccess: true,
      }),
    )

    create.mockClear()

    await hook({
      doc: {
        id: 9,
        status: 'resolved',
      },
      operation: 'update',
      previousDoc: {
        status: 'open',
      },
      req: {
        context: {
          workQueueSync: true,
        },
        payload: {
          create,
        },
      },
    } as never)

    expect(create).not.toHaveBeenCalled()
  })
})
