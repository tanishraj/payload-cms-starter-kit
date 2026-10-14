import { describe, expect, it } from 'vitest'
import {
  getFormFieldConfiguration,
  getFormInitialAnswers,
  getSubmissionContactMetadata,
  validateFormFieldDefinitions,
  validateFormFieldDefinitionsForIntent,
  validateFormSubmission,
  type SimpleFormField,
} from '@/lib/forms'
import { buildFormSubmissionSnapshot, formatFormAnswer } from '@/lib/formSubmissionSnapshot'
import { recoverFormAnswers } from '@/lib/recoverFormAnswers'
import { projectFormFields, projectGenericForm } from '@/lib/genericFormShared'

const field: SimpleFormField = {
  id: 'interests',
  name: 'email',
  label: 'Interests',
  type: 'checkboxGroup',
  options: [
    { id: 'a', value: 'alpha', label: 'Alpha' },
    { id: 'b', value: 'beta', label: 'Beta' },
    { id: 'c', value: 'gamma', label: 'Gamma' },
  ],
}
const validate = (value: unknown, config: Partial<SimpleFormField> = {}) =>
  validateFormSubmission({ fields: [{ ...field, ...config }], values: { email: value } })

describe('choice answer contract', () => {
  it.each(['checkboxGroup', 'multiSelect'] as const)(
    'keeps %s arrays in authored order and never coerces values',
    (type) => {
      expect(validate(['gamma', 'alpha'], { type })).toEqual({
        errors: {},
        normalizedData: { email: ['alpha', 'gamma'] },
      })
      expect(validate([], { type }).normalizedData.email).toEqual([])
      expect(
        validateFormSubmission({ fields: [{ ...field, type }], values: {} }).normalizedData.email,
      ).toEqual([])
    },
  )
  it.each([
    null,
    true,
    2,
    'alpha',
    'alpha,beta',
    {},
    ['missing'],
    ['alpha', 'alpha'],
    [' alpha'],
    [1],
    ['alpha', null],
    Array(101).fill('alpha'),
  ])('rejects malformed, unknown or repeated selection %j', (value) => {
    expect(validate(value).errors.email).toBeTruthy()
  })
  it('enforces required, minimum and maximum counts without filling missing defaults', () => {
    expect(validate([], { required: true }).errors.email).toContain('at least 1')
    expect(validate(['alpha'], { minSelections: 2 }).errors.email).toContain('at least 2')
    expect(validate(['alpha', 'beta'], { maxSelections: 1 }).errors.email).toContain(
      'no more than 1',
    )
    expect(
      validateFormSubmission({
        fields: [{ ...field, required: true, defaultSelections: [{ value: 'alpha' }] }],
        values: {},
      }).errors.email,
    ).toContain('at least 1')
    expect(validate(['alpha'], { required: true, maxSelections: 1 }).errors).toEqual({})
  })
  it('validates Radio as one exact option value and formats its original label', () => {
    const radio = { ...field, type: 'radio' as const }
    expect(validate('beta', { type: 'radio' }).errors).toEqual({})
    expect(validate(['beta'], { type: 'radio' }).errors.email).toContain('text')
    expect(validate('other', { type: 'radio' }).errors.email).toContain('invalid option')
    expect(validate('', { type: 'radio', required: true }).errors.email).toContain('required')
    expect(formatFormAnswer(radio, 'beta')).toBe('Beta')
  })
  it.each([
    { minSelections: -1 },
    { maxSelections: 0 },
    { maxSelections: 4 },
    { minSelections: 2, maxSelections: 1 },
    { minSelections: 1.5 },
    { maxSelections: Infinity },
  ])('rejects inconsistent configuration %j', (config) =>
    expect(validateFormFieldDefinitions([{ ...field, ...config }])).toContain('Selection limits'),
  )
  it('validates initial choices, IDs, bounds and explicit default types', () => {
    expect(
      validateFormFieldDefinitions([{ ...field, defaultSelections: [{ value: 'beta' }] }]),
    ).toBe(true)
    for (const defaults of [
      [{ value: 'missing' }],
      [{ value: 'beta' }, { value: 'beta' }],
      [{ value: 2 }],
      ['beta'],
    ])
      expect(validateFormFieldDefinitions([{ ...field, defaultSelections: defaults }])).not.toBe(
        true,
      )
    expect(validateFormFieldDefinitions([{ ...field, options: [] }])).not.toBe(true)
    expect(
      validateFormFieldDefinitions([{ ...field, options: [field.options![0], field.options![0]] }]),
    ).toContain('duplicate')
    expect(
      validateFormFieldDefinitions([
        {
          ...field,
          options: [
            { value: 'x', label: 'X', id: 'same' },
            { value: 'y', label: 'Y', id: 'same' },
          ],
        },
      ]),
    ).toContain('identities')
    expect(validateFormFieldDefinitions([{ ...field, options: [null] }])).not.toBe(true)
    expect(
      validateFormFieldDefinitions([{ ...field, options: [{ value: ' x ', label: 'X' }] }]),
    ).not.toBe(true)
    expect(
      validateFormFieldDefinitions([
        {
          ...field,
          options: Array.from({ length: 101 }, (_, i) => ({ value: String(i), label: String(i) })),
        },
      ]),
    ).toContain('100')
    expect(
      validateFormFieldDefinitions([{ ...field, minSelections: 2, defaultSelections: [] }]),
    ).toBe(true)
    expect(
      validateFormFieldDefinitions([
        { ...field, minSelections: 2, defaultSelections: [{ value: 'alpha' }] },
      ]),
    ).toContain('Initial selections')
  })
  it('keeps dormant settings inactive and projects no private configuration', () => {
    const configured = {
      ...field,
      minSelections: 1,
      maxSelections: 2,
      defaultSelections: [{ value: 'beta', id: 'private-default-row' }],
      defaultValue: 'unused',
      step: 1,
    }
    expect(getFormInitialAnswers([configured])).toEqual({ email: ['beta'] })
    expect(getFormFieldConfiguration(configured)).toEqual({
      minSelections: 1,
      maxSelections: 2,
      defaultSelections: [{ value: 'beta' }],
    })
    expect(getFormFieldConfiguration({ ...configured, type: 'text', defaultValue: '' })).toEqual({})
    const form = {
      fields: [configured],
      _status: 'published' as const,
      slug: 'choices',
      submissionIntent: 'general' as const,
      notificationRecipients: [{ email: 'private@example.test' }],
    }
    expect(projectGenericForm(form)?.fields).toEqual(projectFormFields(form))
    expect(JSON.stringify(projectGenericForm(form))).not.toContain('private')
    expect(projectGenericForm({ ...form, _status: 'draft' })).toBeNull()
    expect(
      validateFormFieldDefinitionsForIntent({ fields: [field], submissionIntent: 'review' }),
    ).toContain('General/Lead')
  })
  it('does not infer contact metadata from choice questions with arbitrary legacy names', () => {
    expect(getSubmissionContactMetadata({ email: ['alpha'] }, [field])).toEqual({
      email: undefined,
      name: undefined,
      phone: undefined,
    })
    expect(
      getSubmissionContactMetadata({ email: 'alpha' }, [{ ...field, type: 'radio' }]).email,
    ).toBeUndefined()
  })
})

describe('choice history and recovery', () => {
  it('captures arrays and original labels immutably, with active configuration in the revision', () => {
    const form = {
      id: 'form',
      slug: 'choices',
      title: 'Choices',
      fields: [{ ...field, maxSelections: 2 }],
    }
    const snapshot = buildFormSubmissionSnapshot(form, { email: ['alpha', 'beta'] })
    expect(snapshot.answers[0]).toMatchObject({
      displayValue: 'Alpha; Beta',
      value: { raw: ['alpha', 'beta'] },
      type: 'checkboxGroup',
    })
    expect(snapshot.formSnapshot.fields[0].options).toEqual([
      { label: 'Alpha', value: 'alpha' },
      { label: 'Beta', value: 'beta' },
      { label: 'Gamma', value: 'gamma' },
    ])
    expect(
      buildFormSubmissionSnapshot(
        { ...form, fields: [{ ...field, maxSelections: 1 }] },
        { email: ['alpha'] },
      ).formRevision,
    ).not.toBe(snapshot.formRevision)
    expect(formatFormAnswer(field, [])).toBe('—')
  })
  it('preserves still-valid selections by unique field identity after relabel/reorder/rename/removal', () => {
    const next = {
      ...field,
      name: 'topics',
      label: 'Topics',
      options: [
        { value: 'gamma', label: 'New Gamma' },
        { value: 'alpha', label: 'New Alpha' },
      ],
    }
    expect(recoverFormAnswers([field], [next], { email: ['alpha', 'beta', 'gamma'] })).toEqual({
      values: { topics: ['gamma', 'alpha'] },
      clearedLabels: [],
      partiallyClearedLabels: ['Interests'],
    })
  })
  it('clears an answer that no longer satisfies counts, changed type or recreated identity; never refills defaults', () => {
    for (const changed of [
      { ...field, maxSelections: 1 },
      { ...field, type: 'multiSelect' as const },
      { ...field, id: 'recreated' },
    ])
      expect(
        recoverFormAnswers([field], [{ ...changed, defaultSelections: [{ value: 'gamma' }] }], {
          email: ['alpha', 'beta'],
        }),
      ).toMatchObject({ values: { email: [] }, clearedLabels: ['Interests'] })
    expect(
      recoverFormAnswers([field], [{ ...field, options: [field.options![0]], minSelections: 1 }], {
        email: ['beta'],
      }),
    ).toMatchObject({ values: { email: [] }, clearedLabels: ['Interests'] })
    expect(
      recoverFormAnswers([field], [{ ...field, options: [field.options![0]] }], {
        email: ['beta'],
      }),
    ).toMatchObject({ values: { email: [] }, partiallyClearedLabels: ['Interests'] })
  })
})

it('copies captured raw arrays independently of the caller’s mutable answers', () => {
  const selected = ['alpha']
  const snapshot = buildFormSubmissionSnapshot(
    { id: 'f', slug: 'choices', title: 'Choices', fields: [field] },
    { email: selected },
  )
  selected.push('beta')
  expect(snapshot.answers[0].value).toEqual({ raw: ['alpha'] })
})
