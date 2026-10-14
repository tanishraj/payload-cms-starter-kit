import { renderToString } from 'react-dom/server'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { GenericForm, type GenericFormResult } from '@/components/revamp/generic-form'
import type { SimpleFormField } from '@/lib/forms'

const fields: SimpleFormField[] = [
  { name: 'custom_question', label: 'Your question', type: 'text', required: true },
  { name: 'permission', label: 'Contact me', type: 'checkbox' },
]
const success = { success: true, message: 'Received.' }
beforeAll(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
)
afterAll(() => vi.unstubAllGlobals())
afterEach(cleanup)
const answer = () =>
  fireEvent.change(screen.getByLabelText(/Your question/), { target: { value: ' My question ' } })
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Send Message' }))

describe('generic form presentation', () => {
  it('keeps server-rendered controls inactive and never defaults answers to GET', () => {
    const container = document.createElement('div')
    container.innerHTML = renderToString(
      <GenericForm fields={fields} onSubmit={async () => success} />,
    )
    expect(container.querySelector('form')?.getAttribute('method')).toBe('post')
    for (const control of container.querySelectorAll('input, button')) {
      expect(control.hasAttribute('disabled')).toBe(true)
    }
    expect(container.textContent).toContain('Enable JavaScript to send this form.')
  })

  it('focuses the first invalid control and associates its error with the control', async () => {
    const onSubmit = vi.fn(async () => success)
    render(<GenericForm fields={fields} onSubmit={onSubmit} />)
    submit()
    await waitFor(() => expect(screen.getByText('Your question is required.')).toBeTruthy())
    const input = screen.getByLabelText(/Your question/)
    expect(document.activeElement).toBe(input)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toBe(
      'Your question is required.',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })
  it('normalizes custom answers, locks controls during submission, and confirms once', async () => {
    let resolve!: (value: GenericFormResult) => void
    const onSubmit = vi.fn(
      () =>
        new Promise<GenericFormResult>((done) => {
          resolve = done
        }),
    )
    render(<GenericForm fields={fields} onSubmit={onSubmit} />)
    answer()
    submit()
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith({
      custom_question: 'My question',
      permission: false,
      website: '',
    })
    expect((screen.getByLabelText(/Your question/) as HTMLInputElement).disabled).toBe(true)
    fireEvent.submit(screen.getByRole('form'))
    await act(async () => resolve(success))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Received.'))
    expect(document.activeElement).toBe(screen.getByRole('status'))
    expect(screen.queryByRole('button', { name: 'Send Message' })).toBeNull()
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
  it('preserves answers after an unconfirmed request and permits a deliberate retry', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(success)
    render(<GenericForm fields={fields} onSubmit={onSubmit} />)
    answer()
    submit()
    await waitFor(() => expect(screen.getByText(/We couldn’t confirm/)).toBeTruthy())
    expect((screen.getByLabelText(/Your question/) as HTMLInputElement).value).toBe(' My question ')
    submit()
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Received.'))
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })
  it('focuses a server-rejected field while keeping the original answer', async () => {
    render(
      <GenericForm
        fields={fields}
        onSubmit={async () => ({
          success: false,
          message: 'Correct this answer.',
          errors: { custom_question: 'Please clarify your question.' },
        })}
      />,
    )
    answer()
    submit()
    await waitFor(() => expect(screen.getByText('Please clarify your question.')).toBeTruthy())
    expect(document.activeElement).toBe(screen.getByLabelText(/Your question/))
    expect((screen.getByLabelText(/Your question/) as HTMLInputElement).value).toBe(' My question ')
  })
  it('focuses a server-rejected answer after a genuinely pending request re-enables controls', async () => {
    let resolve!: (value: GenericFormResult) => void
    const onSubmit = vi.fn(
      () =>
        new Promise<GenericFormResult>((done) => {
          resolve = done
        }),
    )
    render(<GenericForm fields={fields} onSubmit={onSubmit} />)
    answer()
    submit()
    await waitFor(() =>
      expect((screen.getByLabelText(/Your question/) as HTMLInputElement).disabled).toBe(true),
    )
    await act(async () =>
      resolve({
        success: false,
        message: 'Correct this answer.',
        errors: { custom_question: 'Please clarify your question.' },
      }),
    )
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText(/Your question/)))
  })

  it('uses unique labels/IDs for multiple instances on one page', () => {
    render(
      <>
        <GenericForm fields={fields} onSubmit={async () => success} />
        <GenericForm fields={fields} onSubmit={async () => success} />
      </>,
    )
    const inputs = screen.getAllByLabelText(/Your question/)
    expect(inputs[0].id).not.toBe(inputs[1].id)
    expect(inputs.every((input) => input.id)).toBe(true)
  })
  it('resets removed answers when the schema is changed', async () => {
    const onSubmit = vi.fn(async () => success)
    const { rerender } = render(<GenericForm fields={fields} onSubmit={onSubmit} />)
    answer()
    rerender(
      <GenericForm
        fields={[{ name: 'new_question', label: 'New question', type: 'text' }]}
        onSubmit={onSubmit}
      />,
    )
    submit()
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ new_question: '', website: '' }))
  })
  it('does not mount invalid schemas or allow unavailable/disabled submissions', () => {
    const onSubmit = vi.fn(async () => success)
    const { rerender } = render(<GenericForm fields={[]} onSubmit={onSubmit} />)
    expect(screen.getByText(/This form is unavailable/)).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
    rerender(<GenericForm fields={fields} disabled onSubmit={onSubmit} />)
    submit()
    expect(onSubmit).not.toHaveBeenCalled()
  })
  it('keeps separate form instances independent even when their answers match', async () => {
    const onSubmit = vi.fn(async (): Promise<GenericFormResult> => success)
    render(
      <>
        <GenericForm heading="First response" fields={fields} protectRetries onSubmit={onSubmit} />
        <GenericForm heading="Second response" fields={fields} protectRetries onSubmit={onSubmit} />
      </>,
    )
    for (const heading of ['First response', 'Second response']) {
      const form = within(screen.getByRole('form', { name: heading }))
      fireEvent.change(form.getByLabelText(/Your question/), { target: { value: 'Same answer' } })
      fireEvent.click(form.getByRole('button', { name: 'Send Message' }))
      await waitFor(() => expect(form.getByRole('status').textContent).toBe('Received.'))
    }
    expect(onSubmit).toHaveBeenCalledTimes(2)
    const calls = onSubmit.mock.calls as unknown as Array<[unknown, unknown, string]>
    expect(calls[0][0]).toEqual(calls[1][0])
    expect(calls[0][2]).not.toBe(calls[1][2])
  })

  it('reuses the same key after a lost response and requires an explicit new attempt on conflicting answers', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('Unconfirmed'))
      .mockResolvedValueOnce({
        success: false,
        requestKeyConflict: true,
        message: 'Already received. Start a new response.',
      })
      .mockResolvedValue({ success: true, message: 'New response received.' })
    render(
      <GenericForm
        fields={[{ name: 'question', label: 'Question', type: 'text' }]}
        protectRetries
        onSubmit={onSubmit}
      />,
    )
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'First answer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }))
    await waitFor(() => expect(screen.getByText(/We couldn’t confirm/)).toBeTruthy())
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'Updated answer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Start a new response' })).toBeTruthy(),
    )
    expect(onSubmit.mock.calls[0][2]).toBe(onSubmit.mock.calls[1][2])
    expect(screen.getByRole('status')).toBe(document.activeElement)
    expect(
      (screen.getByRole('button', { name: 'Send Message' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Start a new response' }))
    expect((screen.getByLabelText('Question') as HTMLInputElement).value).toBe('Updated answer')
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }))
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toBe('New response received.'),
    )
    expect(onSubmit.mock.calls[2][2]).not.toBe(onSubmit.mock.calls[0][2])
  })
})

describe('configured questions presentation', () => {
  it.each(['stacked', 'contact6'] as const)(
    'uses accessible help and limits in the %s layout',
    async (layout) => {
      const onSubmit = vi.fn(async () => success)
      render(
        <GenericForm
          layout={layout}
          fields={[
            {
              id: 'question',
              name: 'custom_question',
              label: 'Your question',
              type: 'text',
              required: true,
              defaultValue: 'Initial answer',
              minLength: 5,
              maxLength: 20,
              helpText: 'Use 5–20 characters.',
            },
          ]}
          onSubmit={onSubmit}
        />,
      )
      const input = screen.getByLabelText(/Your question/) as HTMLInputElement
      expect(input.value).toBe('Initial answer')
      expect(input.maxLength).toBe(20)
      expect(input.minLength).toBe(5)
      expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toBe(
        'Use 5–20 characters.',
      )
      fireEvent.change(input, { target: { value: 'Hi' } })
      submit()
      await waitFor(() =>
        expect(screen.getByText('Your question must be at least 5 characters.')).toBeTruthy(),
      )
      expect(
        input
          .getAttribute('aria-describedby')!
          .split(' ')
          .map((id) => document.getElementById(id)?.textContent),
      ).toEqual(['Use 5–20 characters.', 'Your question must be at least 5 characters.'])
      expect(document.activeElement).toBe(input)
      expect(input.value).toBe('Hi')
      expect(onSubmit).not.toHaveBeenCalled()
    },
  )
})

describe('URL and decimal number presentation', () => {
  it.each(['stacked', 'contact6'] as const)(
    'validates URL and numeric answers with recovery-friendly inputs in %s',
    async (layout) => {
      const onSubmit = vi.fn(async () => success)
      render(
        <GenericForm
          layout={layout}
          fields={[
            {
              name: 'reference',
              label: 'Reference',
              type: 'url',
              required: true,
              helpText: 'Use a complete address.',
            },
            {
              name: 'quantity',
              label: 'Quantity',
              type: 'number',
              required: true,
              minValue: 0.5,
              maxValue: 5,
              step: 0.5,
            },
          ]}
          onSubmit={onSubmit}
        />,
      )
      const url = screen.getByLabelText(/Reference/) as HTMLInputElement
      const numeric = screen.getByLabelText(/Quantity/) as HTMLInputElement
      expect(url.type).toBe('url')
      expect(url.maxLength).toBe(2048)
      expect(numeric.type).toBe('text')
      expect(numeric.inputMode).toBe('decimal')
      expect(numeric.maxLength).toBe(64)
      fireEvent.change(url, { target: { value: 'example.com' } })
      fireEvent.change(numeric, { target: { value: 'not a number' } })
      submit()
      await waitFor(() =>
        expect(screen.getByText('Quantity must be a number, such as 2 or 1.5.')).toBeTruthy(),
      )
      expect(numeric.value).toBe('not a number')
      expect(document.activeElement).toBe(url)
      expect(onSubmit).not.toHaveBeenCalled()
      fireEvent.change(url, { target: { value: 'https://example.com' } })
      fireEvent.change(numeric, { target: { value: '1.50' } })
      submit()
      await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Received.'))
      expect(onSubmit).toHaveBeenCalledWith({
        reference: 'https://example.com',
        quantity: '1.50',
        website: '',
      })
    },
  )
})
