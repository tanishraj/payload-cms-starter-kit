import { describe, expect, it } from 'vitest'
import {
  getFormInitialAnswers,
  getFormFieldMaxLength,
  validateFormFieldDefinitions,
  validateFormSubmission,
  type SimpleFormField,
} from '@/lib/forms'
import { recoverFormAnswers } from '@/lib/recoverFormAnswers'

const field: SimpleFormField = {
  id: 'question',
  name: 'question',
  label: 'Question',
  type: 'text',
  minLength: 5,
  maxLength: 20,
  helpText: 'Be specific.',
  defaultValue: 'Campus visit',
}
describe('form field configuration', () => {
  it('accepts valid configuration and initializes answers without server substitution', () => {
    expect(validateFormFieldDefinitions([field])).toBe(true)
    expect(getFormInitialAnswers([field])).toEqual({ question: 'Campus visit' })
    expect(
      validateFormSubmission({ fields: [{ ...field, required: true }], values: {} }).errors
        .question,
    ).toBe('Question is required.')
  })
  it.each([
    { minLength: -1 },
    { minLength: 21 },
    { minLength: 1.5 },
    { maxLength: 0 },
    { maxLength: 501 },
    { maxLength: NaN },
  ])('rejects impossible limits %j', (configuration) => {
    expect(validateFormFieldDefinitions([{ ...field, ...configuration }])).toContain(
      'Character limits',
    )
  })
  it('validates trimmed non-empty answers and allows optional blank answers', () => {
    expect(
      validateFormSubmission({ fields: [field], values: { question: '    ' } }).errors,
    ).toEqual({})
    expect(
      validateFormSubmission({ fields: [field], values: { question: '  Hi  ' } }).errors.question,
    ).toContain('at least 5')
    expect(
      validateFormSubmission({ fields: [field], values: { question: 'x'.repeat(21) } }).errors
        .question,
    ).toContain('20 characters or fewer')
    expect(
      validateFormSubmission({ fields: [field], values: { question: 'x'.repeat(20) } }).errors,
    ).toEqual({})
  })
  it.each([{ defaultValue: 'Hi' }, { defaultValue: 'x'.repeat(21) }, { defaultValue: 1 }])(
    'rejects invalid initial answers %j',
    (configuration) => {
      expect(validateFormFieldDefinitions([{ ...field, ...configuration }])).toContain('answer')
    },
  )
  it('validates select, email and telephone defaults against the same intake rules', () => {
    for (const invalid of [
      {
        ...field,
        type: 'select',
        options: [{ label: 'One', value: 'one' }],
        defaultValue: 'missing',
      },
      { ...field, type: 'email', defaultValue: 'not-email' },
      { ...field, type: 'phone', defaultValue: '123' },
    ])
      expect(validateFormFieldDefinitions([invalid])).toContain('Initial answer')
  })
  it('keeps required checkboxes unchecked and permits optional initial checks', () => {
    const checkbox: SimpleFormField = {
      name: 'permission',
      label: 'Permission',
      type: 'checkbox',
      defaultChecked: true,
    }
    expect(validateFormFieldDefinitions([checkbox])).toBe(true)
    expect(getFormInitialAnswers([checkbox])).toEqual({ permission: true })
    expect(validateFormFieldDefinitions([{ ...checkbox, required: true }])).toContain(
      'must start unchecked',
    )
    expect(getFormInitialAnswers([{ ...checkbox, required: true }])).toEqual({ permission: false })
  })
  it('ignores dormant type-specific settings and retains email/phone global caps', () => {
    const email: SimpleFormField = {
      ...field,
      type: 'email',
      minLength: 500,
      maxLength: 1,
      defaultValue: 'a@b.com',
      defaultChecked: true,
    }
    expect(validateFormFieldDefinitions([email])).toBe(true)
    expect(getFormFieldMaxLength(email)).toBe(320)
    expect(
      validateFormSubmission({ fields: [email], values: { question: 'a@b.com' } }).errors,
    ).toEqual({})
    expect(getFormFieldMaxLength({ ...field, maxLength: 5_000 })).toBe(500)
  })
  it('rejects duplicate field/choice identities while preserving legacy rows without IDs', () => {
    expect(
      validateFormFieldDefinitions([
        { ...field, id: undefined },
        { name: 'second', label: 'Second', type: 'text' },
      ]),
    ).toBe(true)
    expect(validateFormFieldDefinitions([field, { ...field, name: 'second' }])).toContain(
      'row identity',
    )
    expect(
      validateFormFieldDefinitions([
        {
          name: 'department',
          label: 'Department',
          type: 'select',
          options: [
            { id: 'one', label: 'One', value: 'one' },
            { id: 'one', label: 'Two', value: 'two' },
          ],
        },
      ]),
    ).toContain('row identities')
  })
  it('preserves valid renamed/reordered answers but clears answers invalidated by limits without applying new defaults', () => {
    const next = [{ ...field, name: 'renamed', maxLength: 10, defaultValue: 'New answer' }]
    expect(recoverFormAnswers([field], next, { question: 'My visit' }).values).toEqual({
      renamed: 'My visit',
    })
    expect(recoverFormAnswers([field], next, { question: 'A longer answer' })).toEqual({
      values: { renamed: '' },
      clearedLabels: ['Question'],
    })
  })
})

it('rejects malformed choice definitions before validating a configured initial answer', () => {
  for (const options of [null, {}, [null], [{ value: '' }]]) {
    expect(
      validateFormFieldDefinitions([
        { name: 'choice', label: 'Choice', type: 'select', defaultValue: 'one', options },
      ]),
    ).not.toBe(true)
  }
})

describe('configured revision compatibility', () => {
  it('keeps legacy fingerprints byte-compatible when no meaningful configuration is set', async () => {
    const { createHash } = await import('node:crypto')
    const { buildFormSubmissionSnapshot } = await import('@/lib/formSubmissionSnapshot')
    const legacy = {
      id: 'one',
      slug: 'enquiry',
      title: 'Enquiry',
      submissionIntent: 'general',
      fields: [{ id: 'field', name: 'question', label: 'Question', type: 'text' as const }],
    }
    const expected = createHash('sha256')
      .update(
        JSON.stringify({
          fields: [
            {
              contactRole: null,
              id: 'field',
              label: 'Question',
              name: 'question',
              options: [],
              required: false,
              type: 'text',
            },
          ],
          formatVersion: 1,
          formID: 'one',
          slug: 'enquiry',
          submissionIntent: 'general',
          title: 'Enquiry',
        }),
      )
      .digest('hex')
    expect(buildFormSubmissionSnapshot(legacy, {}).formRevision).toBe(expected)
    expect(
      buildFormSubmissionSnapshot(
        {
          ...legacy,
          fields: [
            {
              ...legacy.fields[0],
              helpText: '',
              defaultValue: '',
              defaultChecked: false,
              minLength: null,
              maxLength: null,
            },
          ],
        },
        {},
      ).formRevision,
    ).toBe(expected)
  })
  it('captures active settings independently of later edits and changes the revision', async () => {
    const { buildFormSubmissionSnapshot } = await import('@/lib/formSubmissionSnapshot')
    const form = { id: 'one', slug: 'enquiry', title: 'Enquiry', fields: [structuredClone(field)] }
    const captured = buildFormSubmissionSnapshot(form, { question: 'My question' })
    expect(captured.formSnapshot.fields[0]).toMatchObject({
      helpText: 'Be specific.',
      defaultValue: 'Campus visit',
      minLength: 5,
      maxLength: 20,
    })
    form.fields[0].maxLength = 15
    expect(buildFormSubmissionSnapshot(form, {}).formRevision).not.toBe(captured.formRevision)
    expect(captured.formSnapshot.fields[0].maxLength).toBe(20)
  })
  it('keeps choice row IDs out of the legacy fingerprint, but projects them for safe editor identity', async () => {
    const { buildFormSubmissionSnapshot } = await import('@/lib/formSubmissionSnapshot')
    const { projectFormFields } = await import('@/lib/genericFormShared')
    const form = {
      id: 'one',
      slug: 'enquiry',
      title: 'Enquiry',
      fields: [
        {
          name: 'department',
          label: 'Department',
          type: 'select' as const,
          options: [{ id: 'choice', label: 'One', value: 'one' }],
        },
      ],
    }
    expect(projectFormFields(form)[0].options![0].id).toBe('choice')
    expect(buildFormSubmissionSnapshot(form, {}).formRevision).toBe(
      buildFormSubmissionSnapshot(
        { ...form, fields: [{ ...form.fields[0], options: [{ label: 'One', value: 'one' }] }] },
        {},
      ).formRevision,
    )
  })
  it('rejects configuration the fixed review presentation cannot render', async () => {
    const { validateFormFieldDefinitionsForIntent } = await import('@/lib/forms')
    expect(
      validateFormFieldDefinitionsForIntent({ fields: [field], submissionIntent: 'review' }),
    ).toContain('fixed Review Submission')
    expect(
      validateFormFieldDefinitionsForIntent({
        fields: [{ name: 'reviewBody', label: 'Review', type: 'textarea' }],
        submissionIntent: 'review',
      }),
    ).toBe(true)
  })
})
