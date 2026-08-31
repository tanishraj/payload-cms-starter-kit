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
  it('lets admins publish directly without manually moving workflow state', async () => {
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
          _status: 'published',
          id: 7,
          workflowState: 'draft',
        },
        operation: 'update',
        originalDoc: {
          id: 7,
          _status: 'draft',
          workflowState: 'in_review',
        },
        req: createReq(
          {
            id: 1,
            role: 'admin',
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
        publishedBy: 1,
      }),
    )

    expect(find).not.toHaveBeenCalled()
  })

  it('lets non-workflow users publish directly when they have publish capability', async () => {
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
          _status: 'published',
          id: 7,
          workflowState: 'draft',
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
            role: 'siteManager',
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
        publishedBy: 2,
      }),
    )

    expect(find).not.toHaveBeenCalled()
  })

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
          role: 'contentManager',
          capabilities: {
            manage_pages: true,
            require_editorial_workflow: true,
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
          role: 'contentManager',
          capabilities: {
            manage_pages: true,
            require_editorial_workflow: true,
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
          role: 'siteManager',
          capabilities: {
            publish_pages: true,
            require_editorial_workflow: true,
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
            role: 'siteManager',
            capabilities: {
              publish_pages: true,
              require_editorial_workflow: true,
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
            role: 'siteManager',
            capabilities: {
              publish_pages: true,
              require_editorial_workflow: true,
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
            role: 'siteManager',
            capabilities: {
              publish_pages: true,
              require_editorial_workflow: true,
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

  it('allows an already-normalized published Page only for the exact legal migration context', async () => {
    const find = vi.fn(async () => ({ docs: [] }))
    const hook = enforceEditorialWorkflow('publish_pages', 'pages')

    await expect(
      hook({
        context: {
          systemProvisioning: 'legal-pages-migration',
        },
        data: {
          _status: 'published',
          changeSummary: 'Provisioned the website Privacy Policy.',
          publishedAt: '2026-08-31T00:00:00.000Z',
          workflowState: 'published',
        },
        operation: 'create',
        req: createReq(undefined, { find }),
      } as never),
    ).resolves.toEqual({
      _status: 'published',
      changeSummary: 'Provisioned the website Privacy Policy.',
      publishedAt: '2026-08-31T00:00:00.000Z',
      workflowState: 'published',
    })

    expect(find).not.toHaveBeenCalled()
  })

  it.each([
    ['missing context', undefined],
    ['boolean context', { systemProvisioning: true }],
    ['different context', { systemProvisioning: 'another-migration' }],
  ])('keeps ordinary publish enforcement for %s', async (_label, context) => {
    const hook = enforceEditorialWorkflow('publish_pages', 'pages')

    await expect(
      hook({
        context,
        data: {
          _status: 'published',
          workflowState: 'published',
        },
        operation: 'create',
        req: createReq(),
      } as never),
    ).rejects.toThrow('Only publishers and admins can move content to published.')
  })

  it('does not bypass workflow for a mismatched legal migration payload', async () => {
    const hook = enforceEditorialWorkflow('publish_pages', 'pages')

    await expect(
      hook({
        context: {
          systemProvisioning: 'legal-pages-migration',
        },
        data: {
          _status: 'published',
          workflowState: 'draft',
        },
        operation: 'create',
        req: createReq(),
      } as never),
    ).rejects.toThrow('Only publishers and admins can move content to published.')
  })
})
