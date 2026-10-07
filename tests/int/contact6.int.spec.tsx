import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Mail } from 'lucide-react'
import { Contact6 } from '@/components/revamp/contact6'
import { Contact6BlockPresentation } from '@/blocks/Contact6/Presentation'
import { Contact6PreviewBlockComponent } from '@/blocks/Contact6/PreviewComponent'
import { isContact6Href, validateContact6Href } from '@/lib/contact6Shared'
import type { Form } from '@/payload-types'
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const fields = [
  { name: 'custom_question', label: 'Your question', type: 'text' as const, required: true },
  { name: 'custom_reply', label: 'Reply email', type: 'email' as const, required: true },
]
describe('Contact6 reusable form', () => {
  it('accepts arbitrary questions through the shared validation/submission engine, without fixed example controls', async () => {
    const onSubmit = vi.fn(async () => ({ success: true, message: 'Received.' }))
    render(
      <Contact6
        heading="Contact us"
        form={{ fields, onSubmit }}
        contactInfo={[
          {
            icon: Mail,
            title: 'Email',
            value: 'hello@example.com',
            href: 'mailto:hello@example.com',
          },
        ]}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }))
    await waitFor(() => expect(screen.getByText('Your question is required.')).toBeTruthy())
    expect(document.activeElement).toBe(screen.getByLabelText(/Your question/))
    fireEvent.change(screen.getByLabelText(/Your question/), { target: { value: ' My enquiry ' } })
    fireEvent.change(screen.getByLabelText(/Reply email/), {
      target: { value: 'alex@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Received.'))
    expect(onSubmit).toHaveBeenCalledWith({
      custom_question: 'My enquiry',
      custom_reply: 'alex@example.com',
      website: '',
    })
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(screen.queryByLabelText(/First Name/)).toBeNull()
  })
  it('posts to the selected reusable form slug with custom answers', async () => {
    const fetch = vi.fn(async () => Response.json({ message: 'Saved.' }))
    vi.stubGlobal('fetch', fetch)
    render(
      <Contact6BlockPresentation
        size="default"
        definition={{ slug: 'custom-enquiry', fields, submitButtonLabel: 'Send' }}
      />,
    )
    fireEvent.change(screen.getByLabelText(/Your question/), { target: { value: 'Hello' } })
    fireEvent.change(screen.getByLabelText(/Reply email/), {
      target: { value: 'alex@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Saved.'))
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0]).toEqual([
      '/api/forms/custom-enquiry/submit',
      expect.objectContaining({ method: 'POST', body: expect.stringContaining('custom_question') }),
    ])
  })
  it('never submits from native preview, and keeps contact cards available if the form is missing', () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const form = {
      id: 'form',
      slug: 'draft',
      _status: 'draft',
      submissionIntent: 'general',
      fields,
      submitButtonLabel: 'Submit',
    } as Form
    const { rerender } = render(
      <Contact6PreviewBlockComponent blockType="contact6" size="default" form={form} />,
    )
    expect((screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
    fireEvent.submit(screen.getByRole('form'))
    expect(fetch).not.toHaveBeenCalled()
    rerender(
      <Contact6
        heading="Contact us"
        form={null}
        contactInfo={[
          {
            icon: Mail,
            title: 'Email',
            value: 'hello@example.com',
            href: 'mailto:hello@example.com',
          },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'hello@example.com' })).toBeTruthy()
    expect(screen.getByText(/This form is unavailable/)).toBeTruthy()
  })
  it.each([
    'javascript:alert(1)',
    'data:text/html,test',
    '//evil.example',
    '/\\evil',
    'https://example.com\n',
  ])('does not expose an executable or ambiguous contact link: %s', (href) => {
    expect(isContact6Href(href)).toBe(false)
    expect(validateContact6Href(href)).not.toBe(true)
    render(
      <Contact6
        form={null}
        contactInfo={[{ icon: Mail, title: 'Email', value: 'Contact us', href }]}
      />,
    )
    expect(screen.queryByRole('link')).toBeNull()
  })
  it.each([
    'https://example.com/contact',
    '/contact',
    '#office',
    'mailto:hello@example.com',
    'tel:+971501234567',
  ])('accepts a supported contact link: %s', (href) => expect(isContact6Href(href)).toBe(true))
})
