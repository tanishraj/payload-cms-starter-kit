import { describe, expect, it } from 'vitest'

import { enforceEditorialWorkflow } from '@/hooks/enforceEditorialWorkflow'

const createReq = (
  user?: {
    id?: number
    role?: string
    capabilities?: Record<string, boolean>
  },
) =>
  ({
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

  it('records publish metadata for publishers', async () => {
    const hook = enforceEditorialWorkflow('publish_pages')

    await expect(
      hook({
        data: {
          workflowState: 'published',
          changeSummary: 'Approved for launch.',
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
    ).resolves.toEqual(
      expect.objectContaining({
        _status: 'published',
        workflowState: 'published',
        publishedAt: expect.any(String),
        publishedBy: 2,
      }),
    )
  })
})
