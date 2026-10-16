import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FormSubmissionExport } from '@/components/admin/FormSubmissionExport'

const state = vi.hoisted(() => ({
  user: { role: 'admin' } as unknown,
  query: { where: { status: { equals: 'new' } }, search: 'Ada' } as Record<string, unknown>,
  data: { totalDocs: 4 },
  success: vi.fn(),
  error: vi.fn(),
}))
vi.mock('@payloadcms/ui', () => ({
  useAuth: () => ({ user: state.user }),
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useListQuery: () => ({ query: state.query, data: state.data }),
  toast: { success: state.success, error: state.error },
}))
const fetchMock = vi.fn()
const createObjectURL = vi.fn(() => 'blob:test-export')
const revokeObjectURL = vi.fn()
beforeEach(() => {
  vi.useFakeTimers()
  state.user = { role: 'admin' }
  state.query = { where: { status: { equals: 'new' } }, search: 'Ada' }
  state.data = { totalDocs: 4 }
  vi.stubGlobal('fetch', fetchMock)
  const OriginalURL = URL
  vi.stubGlobal(
    'URL',
    class extends OriginalURL {
      static createObjectURL = createObjectURL
      static revokeObjectURL = revokeObjectURL
    },
  )
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})
describe('native inbox export action', () => {
  it.each(['1', '4'])(
    'uses current filters/search, downloads the CSV and announces %s submissions',
    async (count) => {
      fetchMock.mockResolvedValue({
        ok: true,
        blob: async () => new Blob(['csv']),
        headers: new Headers({ 'X-Submission-Count': count }),
      })
      render(<FormSubmissionExport />)
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Export answers (CSV)' }))
      })
      const url = new URL(fetchMock.mock.calls[0][0], 'http://localhost')
      expect(JSON.parse(url.searchParams.get('filter')!)).toEqual(state.query.where)
      expect(url.searchParams.get('search')).toBe('Ada')
      expect(fetchMock.mock.calls[0][1]).toEqual({ credentials: 'same-origin', cache: 'no-store' })
      expect(createObjectURL).toHaveBeenCalledOnce()
      expect(state.success).toHaveBeenCalledWith(
        `Exported ${count} ${count === '1' ? 'submission' : 'submissions'}. Each answer has its own row.`,
      )
      expect(document.querySelector('a[download]')).toBeNull()
      vi.runOnlyPendingTimers()
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-export')
    },
  )
  it('prevents repeat clicks while pending and preserves the inbox on a recoverable error', async () => {
    let finish!: (value: unknown) => void
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    render(<FormSubmissionExport />)
    fireEvent.click(screen.getByRole('button', { name: 'Export answers (CSV)' }))
    const pending = screen.getByRole('button', { name: 'Preparing CSV…' })
    expect(pending.hasAttribute('disabled')).toBe(true)
    fireEvent.click(pending)
    expect(fetchMock).toHaveBeenCalledOnce()
    await act(async () => {
      finish({
        ok: false,
        json: async () => ({ message: 'Narrow the inbox filters and try again.' }),
      })
    })
    expect(state.error).toHaveBeenCalledWith('Narrow the inbox filters and try again.')
    expect(
      screen.getByRole('button', { name: 'Export answers (CSV)' }).hasAttribute('disabled'),
    ).toBe(false)
    expect(createObjectURL).not.toHaveBeenCalled()
    expect(state.query.search).toBe('Ada')
  })
  it('hides the action without full inbox access and disables empty/trash exports', () => {
    state.user = { role: 'siteManager', features: { reviews: true } }
    const { rerender } = render(<FormSubmissionExport />)
    expect(screen.queryByRole('button')).toBeNull()
    state.user = { role: 'admin' }
    state.data = { totalDocs: 0 }
    rerender(<FormSubmissionExport />)
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true)
    state.data = { totalDocs: 1 }
    state.query = { trash: true }
    rerender(<FormSubmissionExport />)
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true)
  })
})
