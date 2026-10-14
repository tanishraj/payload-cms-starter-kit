import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GenericForm } from '@/components/revamp/generic-form'
import {
  projectFormAppearance,
  validateFormAppearance,
  validateFormAppearanceForIntent,
  type FormAppearance,
} from '@/lib/formAppearance'
import { projectGenericForm } from '@/lib/genericFormShared'
import { projectPublishedGenericForm } from '@/lib/genericFormRevision.server'
import { buildFormSubmissionSnapshot } from '@/lib/formSubmissionSnapshot'
import { parseGenericFormResponse } from '@/lib/submitGenericForm'
import { validateContact33FormDefinition } from '@/lib/contact33Form'
import type { SimpleFormField } from '@/lib/forms'
import type { Form } from '@/payload-types'

const fields: SimpleFormField[] = [
  { id: 'q1', name: 'custom_question', label: 'Your question', type: 'text', required: true },
]
const form = {
  id: 'form1',
  title: 'Questions',
  slug: 'questions',
  _status: 'published',
  submissionIntent: 'general',
  submitButtonLabel: 'Send',
  fields,
} as Form
const appearance: FormAppearance = {
  width: 'wide',
  spacing: 'compact',
  columns: 'two',
  buttonVariant: 'outline',
  buttonSize: 'lg',
  buttonShape: 'pill',
  buttonWidth: 'content',
}
afterEach(cleanup)

describe('bounded form appearance and legacy compatibility', () => {
  it.each([
    undefined,
    null,
    {},
    { width: null },
    {
      width: 'default',
      spacing: 'default',
      columns: 'default',
      buttonVariant: 'default',
      buttonSize: 'default',
      buttonShape: 'default',
      buttonWidth: 'default',
    },
  ])(
    'keeps unset and explicit defaults byte-compatible with legacy projections/history',
    (value) => {
      expect(validateFormAppearance(value)).toBe(true)
      expect(projectFormAppearance(value as FormAppearance)).toBeUndefined()
      const explicit = { ...form, appearance: value as FormAppearance }
      expect(projectGenericForm(explicit)).toEqual(projectGenericForm(form))
      expect(buildFormSubmissionSnapshot(explicit, {}).formSnapshot).toEqual(
        buildFormSubmissionSnapshot(form, {}).formSnapshot,
      )
      expect(projectPublishedGenericForm(explicit)?.revision).toBe(
        buildFormSubmissionSnapshot(form, {}).formRevision,
      )
    },
  )
  it.each([
    true,
    [],
    'wide',
    { width: 'huge' },
    { spacing: 12 },
    { columns: 3 },
    { buttonVariant: 'destructive' },
    { buttonSize: 'icon' },
    { buttonSize: 'xs' },
    { buttonShape: 'circle' },
    { buttonWidth: '100px' },
    { className: 'hidden' },
    { style: { display: 'none' } },
    Object.create({ width: 'wide' }),
  ])('rejects unsupported configuration instead of executing arbitrary style', (value) => {
    expect(validateFormAppearance(value)).not.toBe(true)
    expect(projectGenericForm({ ...form, appearance: value as FormAppearance })).toBeNull()
  })
  it('projects supported settings minimally and captures original appearance without answer rows', () => {
    const source = {
      ...form,
      appearance: { ...appearance },
      internalNotes: 'PRIVATE',
      notificationRecipients: [{ email: 'private@example.com' }],
    }
    const definition = projectPublishedGenericForm(source)!
    expect(definition.appearance).toEqual(appearance)
    expect(JSON.stringify(definition)).not.toContain('PRIVATE')
    expect(JSON.stringify(definition)).not.toContain('private@example.com')
    const captured = buildFormSubmissionSnapshot(source, { custom_question: 'Campus visit' })
    expect(captured.formRevision).toBe(definition.revision)
    expect(captured.formSnapshot.appearance).toEqual(appearance)
    expect(captured.answers.map((answer) => answer.name)).toEqual(['custom_question'])
    source.appearance.width = 'narrow'
    expect(captured.formSnapshot.appearance?.width).toBe('wide')
  })
  it('canonicalizes setting order and defaults for revision matching', () => {
    const one = { ...form, appearance: { width: 'wide' as const, buttonShape: 'pill' as const } }
    const two = {
      ...form,
      appearance: {
        buttonShape: 'pill' as const,
        spacing: 'default' as const,
        width: 'wide' as const,
      },
    }
    expect(buildFormSubmissionSnapshot(one, {}).formRevision).toBe(
      buildFormSubmissionSnapshot(two, {}).formRevision,
    )
    expect(buildFormSubmissionSnapshot(one, {}).formRevision).not.toBe(
      buildFormSubmissionSnapshot(form, {}).formRevision,
    )
    expect(projectGenericForm({ ...one, _status: 'draft' })).toBeNull()
    expect(projectGenericForm({ ...one, _status: 'draft' }, true)?.appearance).toEqual(
      one.appearance,
    )
  })
  it('rejects active appearance for fixed review/contact clients and allows explicit defaults', () => {
    expect(validateFormAppearanceForIntent(appearance, 'review')).not.toBe(true)
    expect(validateFormAppearanceForIntent({ width: 'default' }, 'review')).toBe(true)
    expect(validateContact33FormDefinition({ fields: form.fields, appearance })).toContain(
      'fixed presentation',
    )
    expect(
      validateContact33FormDefinition({
        fields: form.fields,
        appearance: { buttonSize: 'icon' } as unknown as FormAppearance,
      }),
    ).toContain('fixed presentation')
  })
  it('validates refreshed appearance and refuses a malformed changed-form response', async () => {
    const response = (settings: unknown) =>
      new Response(
        JSON.stringify({
          code: 'FORM_CHANGED',
          message: 'Review the current form.',
          form: { ...projectPublishedGenericForm(form), appearance: settings },
        }),
        { status: 409 },
      )
    expect(
      (await parseGenericFormResponse(response(appearance), form.slug)).updatedForm?.appearance,
    ).toEqual(appearance)
    await expect(
      parseGenericFormResponse(response({ width: 'javascript:bad' }), form.slug),
    ).rejects.toThrow('Unconfirmed changed-form')
  })
  it('updates appearance without losing typed answers when a playground or live preview prop changes', async () => {
    const onSubmit = vi.fn(async () => ({ success: true, message: 'Received' }))
    const { rerender } = render(
      <GenericForm fields={fields} onSubmit={onSubmit} submitButtonLabel="Send" />,
    )
    fireEvent.change(screen.getByLabelText(/Your question/), { target: { value: 'Campus visit' } })
    rerender(
      <GenericForm
        fields={fields}
        appearance={appearance}
        onSubmit={onSubmit}
        submitButtonLabel="Send"
      />,
    )
    expect((screen.getByLabelText(/Your question/) as HTMLInputElement).value).toBe('Campus visit')
    expect(screen.getByRole('button', { name: 'Send' }).getAttribute('data-variant')).toBe(
      'outline',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ custom_question: 'Campus visit', website: '' }),
    )
  })
  it('refreshes published appearance and preserves compatible answers for deliberate resubmission', async () => {
    const onSubmit = vi
      .fn()
      .mockResolvedValueOnce({
        success: false,
        message: 'Review form',
        updatedForm: {
          fields,
          appearance,
          revision: 'b'.repeat(64),
          submitButtonLabel: 'Send updated',
        },
      })
      .mockResolvedValueOnce({ success: true, message: 'Received' })
    render(
      <GenericForm
        fields={fields}
        onSubmit={onSubmit}
        revision={'a'.repeat(64)}
        submitButtonLabel="Send"
        protectRetries
      />,
    )
    fireEvent.change(screen.getByLabelText(/Your question/), { target: { value: 'Campus visit' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Send updated' }).getAttribute('data-variant'),
      ).toBe('outline'),
    )
    expect((screen.getByLabelText(/Your question/) as HTMLInputElement).value).toBe('Campus visit')
    expect(onSubmit).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Send updated' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
    expect(onSubmit.mock.calls[1][0]).toEqual({ custom_question: 'Campus visit', website: '' })
    expect(onSubmit.mock.calls[1][1]).toBe('b'.repeat(64))
  })
  it('fails closed for malformed presentation props', () => {
    render(
      <GenericForm
        fields={fields}
        appearance={{ width: 'bad' } as unknown as FormAppearance}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText(/This form is unavailable/)).not.toBeNull()
  })
})
