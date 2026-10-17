// @vitest-environment node
import type { PayloadRequest } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ restore: vi.fn(), readVersion: vi.fn() }))
vi.mock('payload', async (original) => ({
  ...(await original<typeof import('payload')>()),
  restoreVersionOperation: mocks.restore,
}))
import {
  isPageDraftRestoration,
  markRestoredPageDraft,
  requireSafePageRestoration,
  restorePageVersionAsDraft,
} from '@/lib/pageDraftRestoration'

describe('Page draft restoration operation boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.readVersion.mockResolvedValue({ parent: 'page-1' })
    mocks.restore.mockResolvedValue({ id: 'page-1', _status: 'draft' })
  })
  const request = () =>
    Object.assign(new Request('https://example.test/api/pages/versions/version-1'), {
      context: { callerValue: 'retained' },
      query: { depth: '2' },
      user: { id: 'admin-1', role: 'admin' },
      payload: {
        collections: { pages: { config: { slug: 'pages' } } },
        findVersionByID: mocks.readVersion,
      },
    }) as unknown as PayloadRequest

  it.each([undefined, false, true])('rejects raw restoration even with draft=%s', (draft) => {
    expect(() =>
      requireSafePageRestoration({
        operation: 'restoreVersion',
        args: { draft },
        req: request(),
      } as never),
    ).toThrow('restorePageVersionAsDraft')
  })
  it('leaves ordinary operations and untrusted context unchanged', () => {
    const req = request()
    expect(() =>
      requireSafePageRestoration({ operation: 'update', args: {}, req } as never),
    ).not.toThrow()
    expect(isPageDraftRestoration({ pageDraftRestoration: true })).toBe(false)
    expect(isPageDraftRestoration({ pageDraftRestoration: 'page-draft-restoration' })).toBe(false)
    const data = { _status: 'published', title: 'Normal publication' }
    expect(markRestoredPageDraft({ context: req.context, data } as never)).toBe(data)
  })
  it('isolates its private frame, preserves Request access and enforces user-scoped native reads/writes', async () => {
    const req = request(),
      context = req.context,
      query = req.query
    await restorePageVersionAsDraft({ req, versionID: 'version-1', depth: 0 })
    const args = mocks.restore.mock.calls[0][0]
    expect(args).toMatchObject({ id: 'version-1', draft: true, depth: 0, overrideAccess: false })
    expect(args.req.headers).toBe(req.headers)
    expect(args.req.url).toBe(req.url)
    expect(args.req.user).toBe(req.user)
    expect(isPageDraftRestoration(args.req.context)).toBe(true)
    expect(isPageDraftRestoration(JSON.parse(JSON.stringify(args.req.context)))).toBe(false)
    expect(() =>
      requireSafePageRestoration({ operation: 'restoreVersion', args, req: args.req } as never),
    ).not.toThrow()
    expect(
      markRestoredPageDraft({
        context: args.req.context,
        data: { title: 'Older', _status: 'published' },
      } as never),
    ).toEqual({ title: 'Older', _status: 'draft' })
    expect(mocks.readVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        id: 'version-1',
        user: req.user,
        overrideAccess: false,
        req: args.req,
      }),
    )
    expect(req.context).toBe(context)
    expect(req.query).toBe(query)
    expect(isPageDraftRestoration(req.context)).toBe(false)
  })
  it('does not invoke restoration after a denied source read', async () => {
    const req = request()
    mocks.readVersion.mockRejectedValue(new Error('Denied source'))
    await expect(restorePageVersionAsDraft({ req, versionID: 'version-1' })).rejects.toThrow(
      'Denied source',
    )
    expect(mocks.restore).not.toHaveBeenCalled()
    expect(isPageDraftRestoration(req.context)).toBe(false)
  })
})
