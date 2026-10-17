import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('@payloadcms/ui', () => ({
  useConfig: () => ({
    config: {
      routes: { admin: '/cms', api: '/backend' },
      serverURL: 'https://example.test',
    },
  }),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))

vi.mock('@/components/revamp/page-section-select', () => ({
  PageSectionSelect: (props: {
    status: string
    value: string
    options: { id: string; label: string }[]
    disabled: boolean
    onChange: (value: string) => void
    onRetry: () => void
  }) => (
    <div>
      <label htmlFor="test-section">Website section</label>
      <select
        id="test-section"
        value={props.value}
        disabled={props.disabled || props.status !== 'ready'}
        onChange={(event) => props.onChange(event.target.value)}
      >
        <option value="">Choose a section</option>
        {props.options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <span>{`Sections: ${props.status}`}</span>
      {props.status === 'error' || props.status === 'empty' ? (
        <button type="button" onClick={props.onRetry}>
          Retry sections
        </button>
      ) : null}
    </div>
  ),
}))

import { PageRecipeSetup } from '@/components/admin/PageRecipeSetup'

describe('Page recipe setup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.push.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('starts with Blank selected and describes both recipes', () => {
    render(<PageRecipeSetup />)

    const titleInput = screen.getByRole('textbox', { name: 'Page title' })
    const blankRadio = screen.getByRole('radio', { name: /Blank Page/ }) as HTMLInputElement

    expect(screen.getByRole('heading', { name: 'Create a Page' })).toBeTruthy()
    expect(document.activeElement).toBe(titleInput)
    expect(blankRadio.checked).toBe(true)
    expect(screen.getByText('Page Header → Breadcrumb')).toBeTruthy()
  })

  it('rejects an empty title before requesting creation', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<PageRecipeSetup />)

    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByText('Enter a Page title.')).toBeTruthy()
  })

  it('submits Landing and opens the returned native editor', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ editURL: '/cms/collections/pages/page-17', id: 'page-17' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 201,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    render(<PageRecipeSetup />)

    fireEvent.change(screen.getByRole('textbox', { name: 'Page title' }), {
      target: { value: '  Admissions  ' },
    })
    fireEvent.click(screen.getByRole('radio', { name: /Landing Page/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/backend/pages/create-from-recipe', {
        body: JSON.stringify({ recipe: 'landing', title: 'Admissions' }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      expect(mocks.push).toHaveBeenCalledWith('/cms/collections/pages/page-17')
    })
  })

  it('locks the form and communicates progress while creating', async () => {
    let resolveRequest: ((response: Response) => void) | undefined
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise<Response>((resolve) => {
          resolveRequest = resolve
        }),
      ),
    )
    render(<PageRecipeSetup />)

    const titleInput = screen.getByRole('textbox', { name: 'Page title' }) as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Admissions' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))

    expect(titleInput.disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Creating draft…' })).toBeTruthy()

    resolveRequest?.(
      new Response(JSON.stringify({ editURL: '/cms/collections/pages/page-17', id: 'page-17' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 201,
      }),
    )
    await waitFor(() => expect(mocks.push).toHaveBeenCalled())
  })

  it('announces server errors and allows retry', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Unable to create the Page draft.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }),
      ),
    )
    render(<PageRecipeSetup />)

    fireEvent.change(screen.getByRole('textbox', { name: 'Page title' }), {
      target: { value: 'Admissions' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))

    expect((await screen.findByRole('status')).textContent).toContain(
      'Unable to create the Page draft.',
    )
    expect(
      (screen.getByRole('button', { name: 'Create draft' }) as HTMLButtonElement).disabled,
    ).toBe(false)
  })

  it('offers the created draft when client navigation fails', async () => {
    mocks.push.mockImplementation(() => {
      throw new Error('navigation failed')
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ editURL: '/cms/collections/pages/page-17', id: 'page-17' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 201,
        }),
      ),
    )
    render(<PageRecipeSetup />)

    fireEvent.change(screen.getByRole('textbox', { name: 'Page title' }), {
      target: { value: 'Admissions' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))

    expect(
      (await screen.findByRole('link', { name: 'Open the created draft' })).getAttribute('href'),
    ).toBe('/cms/collections/pages/page-17')
  })
  const sectionResult = (
    docs: unknown[] = [{ id: 'root-a', title: 'Admissions', slug: 'admissions', parent: null }],
  ) => new Response(JSON.stringify({ docs, hasNextPage: false }), { status: 200 })
  const createdResult = () =>
    new Response(JSON.stringify({ editURL: '/cms/collections/pages/new-page' }), { status: 201 })

  it('loads current assigned roots with a minimal uncached native query and infers a single section', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(sectionResult())
      .mockResolvedValueOnce(createdResult())
    vi.stubGlobal('fetch', fetchMock)
    render(<PageRecipeSetup sectionRequired />)
    await screen.findByText('Sections: ready')
    expect((screen.getByLabelText('Website section') as HTMLSelectElement).value).toBe('root-a')
    const [url, options] = fetchMock.mock.calls[0]
    const query = new URL(url, 'https://example.test').searchParams
    expect(query.get('where[parent][exists]')).toBe('false')
    expect(query.get('draft')).toBe('true')
    expect(query.get('depth')).toBe('0')
    expect(query.get('limit')).toBe('50')
    expect(options).toMatchObject({
      cache: 'no-store',
      credentials: 'include',
      signal: expect.any(AbortSignal),
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Page title' }), {
      target: { value: 'Scoped Landing' },
    })
    fireEvent.click(screen.getByRole('radio', { name: /Landing Page/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/backend/pages/create-from-recipe',
        expect.objectContaining({
          body: JSON.stringify({ recipe: 'landing', title: 'Scoped Landing', parent: 'root-a' }),
        }),
      ),
    )
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/cms/collections/pages/new-page'))
  })

  it('requires an explicit section when multiple choices exist', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sectionResult([
        { id: 'root-a', title: 'Admissions' },
        { id: 'root-b', title: 'Campus' },
      ]),
    )
    vi.stubGlobal('fetch', fetchMock)
    render(<PageRecipeSetup sectionRequired />)
    await screen.findByText('Sections: ready')
    fireEvent.change(screen.getByRole('textbox', { name: 'Page title' }), {
      target: { value: 'New page' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))
    expect(screen.getByText('Choose a website section.')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    fetchMock.mockResolvedValueOnce(createdResult())
    fireEvent.change(screen.getByLabelText('Website section'), { target: { value: 'root-b' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/backend/pages/create-from-recipe',
        expect.objectContaining({
          body: JSON.stringify({ recipe: 'blank', title: 'New page', parent: 'root-b' }),
        }),
      ),
    )
  })

  it('distinguishes failed loading from no available sections and preserves entered content on retry', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(sectionResult([]))
      .mockResolvedValueOnce(sectionResult())
    vi.stubGlobal('fetch', fetchMock)
    render(<PageRecipeSetup sectionRequired />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Page title' }), {
      target: { value: 'Keep my title' },
    })
    fireEvent.click(screen.getByRole('radio', { name: /Landing Page/ }))
    await screen.findByText('Sections: error')
    expect(
      (screen.getByRole('button', { name: 'Create draft' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Retry sections' }))
    await screen.findByText('Sections: empty')
    fireEvent.click(screen.getByRole('button', { name: 'Retry sections' }))
    await screen.findByText('Sections: ready')
    expect((screen.getByRole('textbox', { name: 'Page title' }) as HTMLInputElement).value).toBe(
      'Keep my title',
    )
    expect((screen.getByRole('radio', { name: /Landing Page/ }) as HTMLInputElement).checked).toBe(
      true,
    )
  })

  it.each([401, 500])('keeps HTTP %s out of the empty state', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })))
    render(<PageRecipeSetup sectionRequired />)
    await screen.findByText('Sections: error')
  })

  it('describes a native permission denial as unavailable access and blocks creation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 403 })))
    render(<PageRecipeSetup sectionRequired />)
    await screen.findByText('Sections: empty')
    expect(
      (screen.getByRole('button', { name: 'Create draft' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it('aborts outstanding section reads on unmount', () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    const view = render(<PageRecipeSetup sectionRequired />)
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal
    expect(signal.aborted).toBe(false)
    view.unmount()
    expect(signal.aborted).toBe(true)
  })

  it('never offers a second creation after a confirmed save whose navigation failed', async () => {
    mocks.push.mockImplementation(() => {
      throw new Error('navigation failed')
    })
    const fetchMock = vi.fn().mockResolvedValue(createdResult())
    vi.stubGlobal('fetch', fetchMock)
    render(<PageRecipeSetup />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Page title' }), {
      target: { value: 'Already saved' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))
    await screen.findByRole('link', { name: 'Open the created draft' })
    const button = screen.getByRole('button', { name: 'Create draft' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    fireEvent.click(button)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps a native-editor alternative without making an API mutation', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<PageRecipeSetup />)
    expect(
      screen.getByRole('link', { name: 'Use the native Page editor' }).getAttribute('href'),
    ).toBe('/cms/collections/pages/create?editor=native')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
