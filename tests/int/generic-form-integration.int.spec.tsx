import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { projectGenericForm } from '@/lib/genericFormShared'
import { submitGenericForm } from '@/lib/submitGenericForm'
import { GenericFormPreviewBlockComponent } from '@/blocks/GenericForm/PreviewComponent'
import { GenericFormBlockPresentation } from '@/blocks/GenericForm/Presentation'
import { validateGenericFormRelationship } from '@/blocks/GenericForm/config'
import type { Form } from '@/payload-types'

const form = {
  id: 'form-id',
  slug: 'custom-enquiry',
  title: 'Enquiry',
  _status: 'published',
  submissionIntent: 'general',
  submitButtonLabel: 'Send enquiry',
  successMessage: 'Received',
  internalNotes: 'private note',
  notificationRecipients: [{ email: 'private@example.test' }],
  fields: [
    { name: 'preferred_department', label: 'Which department?', type: 'text', required: true },
    { name: 'contact_permission', label: 'Contact me', type: 'checkbox' },
  ],
} as Form

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
)
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('generic form CMS integration', () => {
  it('projects only public supported definitions and rejects review, unpublished and invalid schemas', () => {
    expect(projectGenericForm(form)).toEqual({
      slug: form.slug,
      submitButtonLabel: 'Send enquiry',
      fields: [
        { name: 'preferred_department', label: 'Which department?', type: 'text', required: true },
        { name: 'contact_permission', label: 'Contact me', type: 'checkbox' },
      ],
    })
    expect(JSON.stringify(projectGenericForm(form))).not.toContain('private')
    expect(projectGenericForm({ ...form, _status: 'draft' })).toBeNull()
    expect(projectGenericForm({ ...form, submissionIntent: 'review' })).toBeNull()
    expect(projectGenericForm({ ...form, fields: [] })).toBeNull()
    expect(
      projectGenericForm({ ...form, fields: [{ ...form.fields[0], name: 'website' }] }),
    ).toBeNull()
    expect(projectGenericForm({ ...form, _status: 'draft' }, true)?.slug).toBe(form.slug)
  })
  it('rechecks selected relationships through access-enforced published reads rather than trusting populated values', async () => {
    const findByID = vi.fn(async () => form)
    const options = { req: { payload: { findByID } } } as unknown as Parameters<
      typeof validateGenericFormRelationship
    >[1]
    expect(await validateGenericFormRelationship('form-id', options)).toBe(true)
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        depth: 0,
        draft: false,
        id: 'form-id',
        overrideAccess: false,
        req: options.req,
      }),
    )
    findByID.mockRejectedValueOnce(new Error('denied'))
    expect(await validateGenericFormRelationship('form-id', options)).toContain('you can access')
    expect(await validateGenericFormRelationship(null, options)).toBe(true)
  })
  it('renders drafts in preview with every control disabled and no network writes', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    render(
      <GenericFormPreviewBlockComponent
        blockType="genericForm"
        size="default"
        heading="Enquiry preview"
        form={{ ...form, _status: 'draft' }}
      />,
    )
    expect(screen.getByText(/Preview only/)).toBeTruthy()
    expect((screen.getByLabelText(/Which department/) as HTMLInputElement).disabled).toBe(true)
    fireEvent.submit(screen.getByRole('form'))
    expect(fetch).not.toHaveBeenCalled()
  })
  it('explains an unavailable relationship instead of presenting an active empty form', () => {
    render(
      <GenericFormPreviewBlockComponent
        blockType="genericForm"
        size="default"
        form="unpopulated"
      />,
    )
    expect(screen.getByText(/This form is unavailable/)).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })
  it('submits arbitrary machine names to the existing endpoint and confirms only after server acceptance', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      Response.json({ message: 'Your enquiry is received.' }),
    )
    vi.stubGlobal('fetch', fetch)
    render(<GenericFormBlockPresentation heading="Enquiry" definition={projectGenericForm(form)} />)
    fireEvent.change(screen.getByLabelText(/Which department/), {
      target: { value: ' Admissions ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }))
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toBe('Your enquiry is received.'),
    )
    expect(fetch.mock.calls[0]?.[0]).toBe('/api/forms/custom-enquiry/submit')
    const init = fetch.mock.calls[0]?.[1] as RequestInit
    expect(JSON.parse(init.body as string)).toEqual({
      values: { preferred_department: 'Admissions', contact_permission: false, website: '' },
      metadata: { landingPage: window.location.href },
    })
  })
  it('preserves server field errors and rate-limit retry information', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          {
            message: 'Correct the field.',
            errors: { preferred_department: 'Choose again.', unsafe: 4 },
          },
          { status: 400 },
        ),
      ),
    )
    expect(await submitGenericForm('custom', {})).toEqual({
      success: false,
      message: 'Correct the field.',
      errors: { preferred_department: 'Choose again.' },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ message: 'Limited' }, { status: 429, headers: { 'Retry-After': '120' } }),
      ),
    )
    expect((await submitGenericForm('custom', {})).message).toContain('120 seconds')
  })
  it('keeps failed or malformed confirmation responses unconfirmed and does not automatically retry', async () => {
    const fetch = vi.fn(async () => Response.json({ message: 'Server error' }, { status: 500 }))
    vi.stubGlobal('fetch', fetch)
    await expect(submitGenericForm('custom', {})).rejects.toThrow('Unconfirmed')
    expect(fetch).toHaveBeenCalledTimes(1)
    fetch.mockResolvedValueOnce(Response.json({ stored: true }))
    await expect(submitGenericForm('custom', {})).rejects.toThrow('Unconfirmed')
  })
})
