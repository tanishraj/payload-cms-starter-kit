import { describe, expect, it, vi } from 'vitest'

import { enforceEditorialWorkflow } from '@/hooks/enforceEditorialWorkflow'

const createReq = (
  user?: {
    id?: number
    role?: string
    capabilities?: Record<string, boolean>
  },
  payload?: {
    find?: (...args: unknown[]) => Promise<{ docs: Array<{ summary?: string | null }> }>
  },
) =>
  ({
    payload,
    user,
  }) as never

describe('editorial workflow guardrails', () => {
  it('prevents editors from publishing directly', async () => {
    const hook = enforceEditorialWorkflow('publish_pages')

    await expect(
      hook({
        data: {
          workflowState: 'published',
        },
        operation: 'update',
        originalDoc: {
          _status: 'draft',
          workflowState: 'draft',
        },
        req: createReq({
          id: 11,
          role: 'editor',
          capabilities: {
            manage_pages: true,
          },
        }),
      } as never),
    ).rejects.toThrow('Only publishers and admins can move content to published.')
  })

  it('allows editors to send content to review', async () => {
    const hook = enforceEditorialWorkflow('publish_pages')

    await expect(
      hook({
        data: {
          workflowState: 'in_review',
        },
        operation: 'update',
        originalDoc: {
          _status: 'draft',
          workflowState: 'draft',
        },
        req: createReq({
          id: 11,
          role: 'editor',
          capabilities: {
            manage_pages: true,
          },
        }),
      } as never),
    ).resolves.toEqual(
      expect.objectContaining({
        _status: 'draft',
        workflowState: 'in_review',
        lastReviewedAt: expect.any(String),
        lastReviewedBy: 11,
      }),
    )
  })

  it('requires a schedule date for scheduled content', async () => {
    const hook = enforceEditorialWorkflow('publish_pages')

    await expect(
      hook({
        data: {
          workflowState: 'scheduled',
        },
        operation: 'update',
        originalDoc: {
          _status: 'draft',
          workflowState: 'in_review',
        },
        req: createReq({
          id: 2,
          role: 'publisher',
          capabilities: {
            publish_pages: true,
          },
        }),
      } as never),
    ).rejects.toThrow('Scheduled content requires scheduledPublishAt.')
  })

  it('allows scheduling even when blocking queue items exist', async () => {
    const find = vi.fn(async () => ({
      docs: [
        {
          summary: 'Homepage is awaiting editorial approval.',
        },
      ],
    }))
    const hook = enforceEditorialWorkflow('publish_pages', 'pages')

    await expect(
      hook({
        data: {
          id: 7,
          workflowState: 'scheduled',
          scheduledPublishAt: '2026-07-10T08:00:00.000Z',
        },
        operation: 'update',
        originalDoc: {
          id: 7,
          _status: 'draft',
          workflowState: 'in_review',
        },
        req: createReq(
          {
            id: 2,
            role: 'publisher',
            capabilities: {
              publish_pages: true,
            },
          },
          {
            find,
          },
        ),
      } as never),
    ).resolves.toEqual(
      expect.objectContaining({
        _status: 'draft',
        workflowState: 'scheduled',
        scheduledPublishAt: '2026-07-10T08:00:00.000Z',
      }),
    )

    expect(find).not.toHaveBeenCalled()
  })

  it('blocks publish when a blocking queue item exists', async () => {
    const find = vi.fn(async () => ({
      docs: [
        {
          summary: 'Homepage is awaiting editorial approval.',
        },
      ],
    }))
    const hook = enforceEditorialWorkflow('publish_pages', 'pages')

    await expect(
      hook({
        data: {
          id: 7,
          workflowState: 'published',
        },
        operation: 'update',
        originalDoc: {
          id: 7,
          _status: 'draft',
          workflowState: 'in_review',
        },
        req: createReq(
          {
            id: 2,
            role: 'publisher',
            capabilities: {
              publish_pages: true,
            },
          },
          {
            find,
          },
        ),
      } as never),
    ).rejects.toThrow('Cannot publish because Work Queue still has a blocking item')
  })

  it('records publish metadata for publishers', async () => {
    const find = vi.fn(async () => ({
      docs: [],
    }))
    const hook = enforceEditorialWorkflow('publish_pages', 'pages')

    await expect(
      hook({
        data: {
          id: 7,
          workflowState: 'published',
          changeSummary: 'Approved for launch.',
        },
        operation: 'update',
        originalDoc: {
          id: 7,
          _status: 'draft',
          workflowState: 'in_review',
        },
        req: createReq(
          {
            id: 2,
            role: 'publisher',
            capabilities: {
              publish_pages: true,
            },
          },
          {
            find,
          },
        ),
      } as never),
    ).resolves.toEqual(
      expect.objectContaining({
        _status: 'published',
        workflowState: 'published',
        publishedAt: expect.any(String),
        publishedBy: 2,
      }),
    )

    expect(find).toHaveBeenCalledTimes(1)
  })
})
