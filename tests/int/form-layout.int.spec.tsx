import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { GenericForm } from '@/components/revamp/generic-form'
import {
  getFormQuestions,
  projectFormLayout,
  validateFormEntries,
  validateFormLayout,
  type FormEntry,
} from '@/lib/formLayout'
import { projectFormFields, projectGenericForm } from '@/lib/genericFormShared'
import { projectPublishedGenericForm } from '@/lib/genericFormRevision.server'
import { buildFormSubmissionSnapshot } from '@/lib/formSubmissionSnapshot'
import { buildFormNotificationEmail } from '@/lib/formNotifications'
import { recoverFormAnswers } from '@/lib/recoverFormAnswers'
import { parseGenericFormResponse } from '@/lib/submitGenericForm'
import { validateFormSubmission, type SimpleFormField } from '@/lib/forms'
import type { Form } from '@/payload-types'

const first: SimpleFormField = {
  id: 'q1',
  name: 'custom_name',
  label: 'Your name',
  type: 'text',
  required: true,
}
const second: SimpleFormField = {
  id: 'q2',
  name: 'custom_email',
  label: 'Reply address',
  type: 'email',
  required: true,
}
const raw: FormEntry[] = [
  { id: 'heading', entryType: 'heading', displayText: 'About you' },
  { id: 'description', entryType: 'description', displayText: 'Plain instructions.\nNo markup.' },
  {
    id: 'group',
    entryType: 'group',
    displayText: 'Contact details',
    groupDescription: 'For our reply only.',
    questions: [first, second],
  },
  { id: 'separator', entryType: 'separator' },
]
const form = (entries = raw) =>
  ({
    id: 'form1',
    title: 'Enquiry',
    slug: 'enquiry',
    _status: 'published',
    submissionIntent: 'general',
    submitButtonLabel: 'Send',
    fields: entries,
  }) as Form
afterEach(cleanup)

describe('ordered form entries and answer boundary', () => {
  it('flattens only questions in authored order and leaves their identities untouched', () => {
    expect(validateFormEntries(raw, 'general')).toBe(true)
    expect(getFormQuestions(raw)).toEqual([first, second])
    expect(projectFormFields(form()).map((field) => field.id)).toEqual(['q1', 'q2'])
    expect(projectFormLayout(raw)).toEqual([
      { kind: 'heading', text: 'About you' },
      { kind: 'description', text: 'Plain instructions.\nNo markup.' },
      {
        kind: 'group',
        label: 'Contact details',
        description: 'For our reply only.',
        questions: ['custom_name', 'custom_email'],
      },
      { kind: 'separator' },
    ])
  })
  it('keeps legacy definitions and revisions byte-compatible after adding the default question discriminator', () => {
    const legacy = form([first, second])
    const explicit = form([
      { ...first, entryType: 'question' },
      { ...second, entryType: 'question' },
    ])
    expect(projectGenericForm(legacy)).toEqual(projectGenericForm(explicit))
    expect(projectFormLayout(legacy.fields)).toBeUndefined()
    expect(buildFormSubmissionSnapshot(legacy, {}).formRevision).toBe(
      buildFormSubmissionSnapshot(explicit, {}).formRevision,
    )
    expect(projectPublishedGenericForm(explicit)?.revision).toBe(
      buildFormSubmissionSnapshot(legacy, {}).formRevision,
    )
  })
  it('captures layout and changes revision for display/group changes, with no phantom answers', () => {
    const stored = buildFormSubmissionSnapshot(form(), {
      custom_name: 'Alex',
      custom_email: 'a@example.com',
    })
    expect(stored.formSnapshot.entries).toEqual(projectFormLayout(raw))
    expect(stored.answers.map((answer) => answer.name)).toEqual(['custom_name', 'custom_email'])
    expect(projectPublishedGenericForm(form())?.revision).toBe(stored.formRevision)
    const changed = structuredClone(raw)
    changed[0].displayText = 'Updated introduction'
    expect(buildFormSubmissionSnapshot(form(changed), {}).formRevision).not.toBe(
      stored.formRevision,
    )
    expect(stored.formSnapshot.entries?.[0]).toEqual({ kind: 'heading', text: 'About you' })
  })
  it('preserves compatible answers when a stable question moves into/out of a group', () => {
    expect(
      recoverFormAnswers([first, second], getFormQuestions(raw), {
        custom_name: 'Alex',
        custom_email: 'a@example.com',
      }).values,
    ).toEqual({ custom_name: 'Alex', custom_email: 'a@example.com' })
  })
  it('does not collect dormant question settings on display rows or inject display keys', () => {
    const entries = [
      { ...first, entryType: 'heading' as const, displayText: 'Title' },
      { ...second },
    ]
    expect(getFormQuestions(entries)).toEqual([second])
    expect(
      validateFormSubmission({
        fields: getFormQuestions(entries),
        values: { custom_email: 'a@example.com', heading: 'injected' },
      }).errors,
    ).toHaveProperty('values')
  })
  it.each([
    [{ entryType: 'script', displayText: 'X' }, first],
    [{ entryType: 'heading', displayText: '' }, first],
    [{ entryType: 'heading', displayText: 'x'.repeat(201) }, first],
    [{ entryType: 'description', displayText: 'x'.repeat(2001) }, first],
    [{ entryType: 'group', displayText: 'Group', questions: [] }, first],
    [
      {
        entryType: 'group',
        displayText: 'Group',
        questions: [{ entryType: 'group', questions: [first] }],
      },
    ],
    [{ entryType: 'group', displayText: 'Group', questions: [first] }, first],
    [{ entryType: 'group', id: 'q1', displayText: 'Group', questions: [first] }],
    [{ entryType: 'group', displayText: 'Group', groupDescription: 42, questions: [first] }],
    [{ entryType: 'group', displayText: 'Group', questions: [{ ...first, type: 'unknown' }] }],
    [{ entryType: 'separator' }],
  ])(
    'rejects invalid display/group definitions before publication or public projection',
    (...entries) => {
      expect(validateFormEntries(entries, 'general')).not.toBe(true)
      expect(projectGenericForm(form(entries as FormEntry[]))).toBeNull()
    },
  )
  it('enforces the global question cap across groups and layout row cap separately', () => {
    const questions = Array.from({ length: 100 }, (_, i) => ({
      ...first,
      id: `q${i}`,
      name: `q${i}`,
    }))
    expect(
      validateFormEntries([
        { entryType: 'group', displayText: 'A', questions },
        { entryType: 'separator' },
      ]),
    ).toBe(true)
    expect(
      validateFormEntries([
        { entryType: 'group', displayText: 'A', questions },
        { ...first, id: 'q100', name: 'q100' },
      ]),
    ).not.toBe(true)
    expect(
      validateFormEntries([
        ...Array.from({ length: 200 }, () => ({ entryType: 'separator' })),
        first,
      ]),
    ).not.toBe(true)
  })
  it('rejects layout entries for the fixed Review engine', () => {
    expect(
      validateFormEntries(
        [
          { entryType: 'heading', displayText: 'Title' },
          { name: 'reviewerName', label: 'Name', type: 'text' },
        ],
        'review',
      ),
    ).not.toBe(true)
  })
  it('includes every question once in order in the public layout, rejecting duplicate/omitted/unknown references', () => {
    expect(validateFormLayout([{ kind: 'question', name: first.name }], [first, second])).not.toBe(
      true,
    )
    expect(
      validateFormLayout(
        [
          { kind: 'question', name: second.name },
          { kind: 'question', name: first.name },
        ],
        [first, second],
      ),
    ).not.toBe(true)
    expect(
      validateFormLayout(
        [{ kind: 'group', label: 'G', questions: [first.name, first.name] }],
        [first, second],
      ),
    ).not.toBe(true)
  })
  it('escapes notification answers and omits headings, separators and groups as answer rows', () => {
    const email = buildFormNotificationEmail({
      form: form(),
      submittedAt: new Date('2026-01-01'),
      values: { custom_name: '<script>x</script>', custom_email: 'a@example.com' },
    })
    expect(email.text).toContain('Your name: <script>x</script>')
    expect(email.html).toContain('&lt;script&gt;')
    expect(email.text).not.toContain('About you:')
    expect(email.text).not.toContain('Contact details:')
  })
  it('carries layout in changed-form responses and rejects invalid layout protocols', async () => {
    const projected = projectPublishedGenericForm(form())!
    const response = () =>
      new Response(JSON.stringify({ message: 'Changed', code: 'FORM_CHANGED', form: projected }), {
        status: 409,
      })
    expect((await parseGenericFormResponse(response(), 'enquiry')).updatedForm?.entries).toEqual(
      projected.entries,
    )
    projected.entries = [{ kind: 'question', name: 'unknown' }]
    await expect(parseGenericFormResponse(response(), 'enquiry')).rejects.toThrow(
      'Unconfirmed changed-form',
    )
  })
})

describe('grouped visitor form', () => {
  it('renders accessible group description and plain text without phantom controls', () => {
    render(
      <GenericForm
        fields={[first, second]}
        entries={projectFormLayout(raw)}
        onSubmit={async () => ({ success: true, message: 'Received' })}
      />,
    )
    const group = screen.getByRole('group', { name: 'Contact details' })
    expect(document.getElementById(group.getAttribute('aria-describedby')!)?.textContent).toBe(
      'For our reply only.',
    )
    expect(within(group).getAllByRole('textbox')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'About you' }).tagName).toBe('H3')
  })
  it('focuses first invalid grouped question and submits only normalized question answers', async () => {
    const submit = vi.fn(async () => ({ success: true, message: 'Received' }))
    render(
      <GenericForm fields={[first, second]} entries={projectFormLayout(raw)} onSubmit={submit} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText(/Your name/)))
    fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: ' Alex ' } })
    fireEvent.change(screen.getByLabelText(/Reply address/), { target: { value: 'a@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }))
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith({
        custom_name: 'Alex',
        custom_email: 'a@example.com',
        website: '',
      }),
    )
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Received'))
  })
  it('refreshes layout while preserving valid stable-ID answers and requires a second submission', async () => {
    const updated = { ...projectGenericForm(form())!, revision: 'b'.repeat(64) }
    const submit = vi.fn(async () => ({ success: false, message: 'Changed', updatedForm: updated }))
    render(<GenericForm fields={[first, second]} revision={'a'.repeat(64)} onSubmit={submit} />)
    fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: 'Alex' } })
    fireEvent.change(screen.getByLabelText(/Reply address/), { target: { value: 'a@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }))
    await waitFor(() => expect(screen.getByRole('group', { name: 'Contact details' })).toBeTruthy())
    expect((screen.getByLabelText(/Your name/) as HTMLInputElement).value).toBe('Alex')
    expect(submit).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/Review the updated questions/)).toBeTruthy()
  })
})
