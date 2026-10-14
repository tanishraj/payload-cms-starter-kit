import { describe, expect, it } from 'vitest'
import {
  getFormFieldConfiguration,
  getFormInitialAnswers,
  validateFormFieldDefinitions,
  validateFormSubmission,
  type SimpleFormField,
} from '@/lib/forms'
import { recoverFormAnswers } from '@/lib/recoverFormAnswers'
import { buildFormSubmissionSnapshot } from '@/lib/formSubmissionSnapshot'

const url: SimpleFormField = {
  id: 'reference',
  name: 'reference_link',
  label: 'Reference',
  type: 'url',
}
const number: SimpleFormField = {
  id: 'quantity',
  name: 'quantity',
  label: 'Quantity',
  type: 'number',
}
const errors = (field: SimpleFormField, value: unknown) =>
  validateFormSubmission({ fields: [field], values: { [field.name]: value } }).errors
describe('URL form control', () => {
  it.each([
    'https://example.com/path?x=1#visit',
    'http://localhost:3011/visit',
    'https://例え.jp/見学',
    'HTTPS://EXAMPLE.COM',
    'https://example.com/a%20b',
  ])('accepts complete HTTP(S) URL %s', (value) => expect(errors(url, value)).toEqual({}))
  it.each([
    'example.com',
    '/visit',
    '//example.com',
    'https:example.com',
    'javascript:alert(1)',
    'data:text/html,hello',
    'ftp://example.com',
    'mailto:a@example.com',
    'https://user:password@example.com',
    'https://example.com/a b',
    'https://example.com/\\visit',
    'https://example.com/a\nvisit',
    'https://',
    'https://example.com:99999',
  ])('rejects incompatible URL %s', (value) =>
    expect(errors(url, value).reference_link).toContain('full http:// or https://'),
  )
  it('caps answers, validates defaults, and keeps omitted defaults out of intake', () => {
    expect(errors(url, 'https://example.com/' + 'x'.repeat(2048)).reference_link).toContain('2,048')
    expect(validateFormFieldDefinitions([{ ...url, defaultValue: 'example.com' }])).toContain(
      'Initial answer',
    )
    expect(
      validateFormSubmission({
        fields: [{ ...url, required: true, defaultValue: 'https://example.com' }],
        values: {},
      }).errors.reference_link,
    ).toContain('required')
    expect(
      validateFormSubmission({ fields: [url], values: { reference_link: ' https://example.com ' } })
        .normalizedData.reference_link,
    ).toBe('https://example.com')
  })
})
describe('decimal number form control', () => {
  it.each([
    '0',
    '-0',
    '2',
    '-2',
    '+2',
    '1.5',
    '.5',
    '-.5',
    '001.500',
    '9007199254740993',
    '0.10000000000000001',
  ])('accepts and preserves decimal text %s', (value) => {
    const result = validateFormSubmission({ fields: [number], values: { quantity: value } })
    expect(result.errors).toEqual({})
    expect(result.normalizedData.quantity).toBe(value)
  })
  it.each([
    'NaN',
    'Infinity',
    '-Infinity',
    '0x10',
    '1e3',
    '1,000',
    '1,5',
    '1.',
    '-',
    '+',
    '1 2',
    'words',
    null,
    3,
    {},
    [],
  ])('rejects non-decimal answer %j', (value) =>
    expect(errors(number, value).quantity).toBeTruthy(),
  )
  it('allows optional blank answers and caps number text', () => {
    expect(errors(number, '  ')).toEqual({})
    expect(errors({ ...number, required: true }, '')).toEqual({ quantity: 'Quantity is required.' })
    expect(errors(number, '1'.repeat(65)).quantity).toContain('64 characters')
  })
  it('compares decimal ranges exactly without rounding to floating point', () => {
    expect(errors({ ...number, minValue: 0.1 }, '0.099999999999999999').quantity).toContain(
      'at least 0.1',
    )
    expect(errors({ ...number, maxValue: 0.1 }, '0.100000000000000001').quantity).toContain(
      '0.1 or less',
    )
    expect(
      errors({ ...number, maxValue: 9007199254740991 }, '9007199254740992').quantity,
    ).toContain('or less')
    expect(errors({ ...number, minValue: -2.5, maxValue: 2.5 }, '-2.5')).toEqual({})
  })
  it('checks decimal steps from the configured minimum, or zero when omitted', () => {
    expect(errors({ ...number, step: 0.1 }, '0.3')).toEqual({})
    expect(errors({ ...number, step: 0.1 }, '0.30000000000000001').quantity).toContain(
      'increments of 0.1',
    )
    expect(errors({ ...number, minValue: 0.25, step: 0.5 }, '1.25')).toEqual({})
    expect(errors({ ...number, minValue: 0.25, step: 0.5 }, '1').quantity).toContain(
      'starting from 0.25',
    )
    expect(errors({ ...number, step: 0.5 }, '-1.5')).toEqual({})
    expect(errors({ ...number, minValue: 0.0000001, step: 0.0000001 }, '0.0000003')).toEqual({})
  })
  it.each([
    { minValue: NaN },
    { maxValue: Infinity },
    { minValue: 10, maxValue: 5 },
    { step: 0 },
    { step: -1 },
    { step: '1' },
    { maxValue: 9007199254740992 },
  ])('rejects impossible numeric configuration %j', (config) =>
    expect(validateFormFieldDefinitions([{ ...number, ...config }])).toContain('Numeric limits'),
  )
  it('validates number defaults and leaves type-specific settings dormant on other controls', () => {
    expect(
      validateFormFieldDefinitions([
        { ...number, minValue: 1, maxValue: 5, step: 1, defaultValue: '2.5' },
      ]),
    ).toContain('Initial answer')
    expect(validateFormFieldDefinitions([{ ...number, minValue: 1, defaultValue: '1' }])).toBe(true)
    expect(getFormInitialAnswers([{ ...number, defaultValue: ' 1.5 ' }])).toEqual({
      quantity: '1.5',
    })
    const text = { ...number, type: 'text' as const, minValue: 5, maxValue: 1, step: -1 }
    expect(validateFormFieldDefinitions([text])).toBe(true)
    expect(getFormFieldConfiguration(text)).toEqual({})
  })
  it('invalidates revisions and clears newly incompatible answers without changing historical values', () => {
    const original = { ...number, minValue: 1, maxValue: 10, step: 0.5 }
    const form = { id: 'form', slug: 'quantity', title: 'Quantity', fields: [original] }
    const captured = buildFormSubmissionSnapshot(form, { quantity: '2.50' })
    const next = { ...original, step: 1, defaultValue: '3' }
    expect(buildFormSubmissionSnapshot({ ...form, fields: [next] }, {}).formRevision).not.toBe(
      captured.formRevision,
    )
    expect(recoverFormAnswers([original], [next], { quantity: '2.50' })).toEqual({
      values: { quantity: '' },
      clearedLabels: ['Quantity'],
      partiallyClearedLabels: [],
    })
    expect(recoverFormAnswers([original], [next], { quantity: '3' }).values).toEqual({
      quantity: '3',
    })
    expect(captured.formSnapshot.fields[0]).toMatchObject({ minValue: 1, maxValue: 10, step: 0.5 })
    expect(captured.answers[0]).toMatchObject({
      type: 'number',
      value: { raw: '2.50' },
      displayValue: '2.50',
    })
  })
})

describe('native URL/number integration contract', () => {
  it('projects new settings without private configuration and rejects the fixed Review presentation', async () => {
    const { projectGenericForm } = await import('@/lib/genericFormShared')
    const { validateFormFieldDefinitionsForIntent } = await import('@/lib/forms')
    const form = {
      slug: 'new-controls',
      _status: 'published' as const,
      submissionIntent: 'general' as const,
      fields: [url, { ...number, minValue: 0.5, maxValue: 4, step: 0.5 }],
      notificationRecipients: [{ email: 'private@example.test' }],
    }
    const projected = projectGenericForm(form)
    expect(projected!.fields[1]).toMatchObject({
      type: 'number',
      minValue: 0.5,
      maxValue: 4,
      step: 0.5,
    })
    expect(JSON.stringify(projected)).not.toContain('private')
    expect(projectGenericForm({ ...form, _status: 'draft' })).toBeNull()
    expect(
      validateFormFieldDefinitionsForIntent({ fields: [url], submissionIntent: 'review' }),
    ).toContain('Change the intent')
    expect(
      validateFormFieldDefinitionsForIntent({ fields: [number], submissionIntent: 'review' }),
    ).toContain('Change the intent')
  })
  it('shows numeric settings only for Number, and lets editors clear configured Review settings', async () => {
    const { Forms } = await import('@/collections/Forms')
    const array = Forms.fields.find((field) => 'name' in field && field.name === 'fields')!
    if (array.type !== 'array') throw new Error('Missing native fields')
    const children = array.fields.flatMap((field) =>
      field.type === 'row' ? field.fields : [field],
    )
    for (const name of ['minValue', 'maxValue', 'step']) {
      const field = children.find((field) => 'name' in field && field.name === name)!
      const condition = field.admin!.condition!
      expect(condition({ submissionIntent: 'general' }, { type: 'number' }, {} as never)).toBe(true)
      expect(condition({ submissionIntent: 'general' }, { type: 'text' }, {} as never)).toBe(false)
      expect(
        condition({ submissionIntent: 'review' }, { type: 'number', [name]: 1 }, {} as never),
      ).toBe(true)
      expect(condition({ submissionIntent: 'review' }, { type: 'number' }, {} as never)).toBe(false)
    }
  })
})

it('keeps new-control answers using legacy contact names out of contact metadata', async () => {
  const { getSubmissionContactMetadata } = await import('@/lib/forms')
  const fields = [
    { ...number, name: 'email' },
    { ...url, name: 'phone' },
    { ...number, name: 'fullName' },
  ]
  expect(
    getSubmissionContactMetadata(
      { email: '2.50', phone: 'https://example.com', fullName: '3' },
      fields,
    ),
  ).toEqual({ email: undefined, name: undefined, phone: undefined })
  expect(
    getSubmissionContactMetadata({
      email: 'legacy@example.com',
      fullName: 'Legacy name',
      phone: '+1 202 555 0123',
    }),
  ).toEqual({ email: 'legacy@example.com', name: 'Legacy name', phone: '+1 202 555 0123' })
})
