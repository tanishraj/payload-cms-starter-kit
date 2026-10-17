// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { PayloadRequest } from 'payload'
import { isPageDraftSave, scopePageDraftSave } from '@/lib/pageDraftSave'

function request() {
  return Object.assign(new Request('http://localhost/api/pages/page-1?draft=true'), {
    context: { caller: 'retained', pageDraftSave: true },
    query: { draft: 'true' },
    transactionID: Promise.resolve('transaction-1'),
  }) as unknown as PayloadRequest
}

async function frame(req: PayloadRequest, options: Record<string, unknown> = {}) {
  return (await scopePageDraftSave({
    operation: 'update',
    args: { req, draft: true, data: { _status: 'draft' }, ...options },
    req,
  } as never)) as { req: PayloadRequest }
}

describe('Page draft-save operation frame', () => {
  it('preserves the Request and transaction while keeping draft intent out of its caller', async () => {
    const req = request()
    const context = req.context
    const scoped = (await frame(req)).req
    expect(isPageDraftSave(scoped.context)).toBe(true)
    expect(isPageDraftSave(req.context)).toBe(false)
    expect(req.context).toBe(context)
    expect(scoped.context.caller).toBe('retained')
    expect(scoped.headers).toBe(req.headers)
    expect(scoped.url).toBe(req.url)
    expect(scoped.transactionID).toBe(req.transactionID)
    expect(isPageDraftSave(JSON.parse(JSON.stringify(scoped.context)))).toBe(false)
  })

  it.each([
    { draft: false },
    { draft: undefined },
    { data: { _status: 'published' } },
    { unpublishAllLocales: true },
  ])('does not inherit draft authority in nested writes: %j', async (options) => {
    const parent = (await frame(request())).req
    const nested = (await frame(parent, options)).req
    expect(isPageDraftSave(nested.context)).toBe(false)
    expect(isPageDraftSave(parent.context)).toBe(true)
  })

  it('does not trust query or serializable context flags', () => {
    expect(isPageDraftSave(request().context)).toBe(false)
    expect(isPageDraftSave({ pageDraftSave: 'page-draft-save' })).toBe(false)
    expect(isPageDraftSave(undefined)).toBe(false)
  })
})
