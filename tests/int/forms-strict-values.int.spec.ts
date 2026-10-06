import { describe, expect, it } from 'vitest'
import {
  FORM_MAX_FIELDS,
  REVIEW_SUBMISSION_FIELD_NAMES,
  validateFormFieldDefinitions,
  validateFormSubmission,
} from '@/lib/forms'

const fields = [
  {
    name: 'preferred_department',
    label: 'Preferred department',
    type: 'select' as const,
    options: [{ label: 'Library', value: 'library' }],
  },
  { name: 'question', label: 'Question', type: 'text' as const },
  { name: 'permission', label: 'Permission', type: 'checkbox' as const },
]
describe('typed generic form intake', () => {
  it.each([null, [], new Date(), Object.create({ question: 'inherited' })])(
    'rejects a non-plain answer record (%s)',
    (values) => {
      expect(validateFormSubmission({ fields, values }).errors.values).toBe(
        'Submitted values must be an object.',
      )
    },
  )
  it('accepts a null-prototype record and ignores inherited Object methods', () => {
    const values = Object.assign(Object.create(null), { question: ' hello ', permission: true })
    expect(validateFormSubmission({ fields, values })).toEqual({
      errors: {},
      normalizedData: { question: 'hello', permission: true, preferred_department: '' },
    })
    expect(
      validateFormSubmission({
        fields: [{ name: 'toString', label: 'Text', type: 'text' }],
        values: {},
      }).normalizedData,
    ).toEqual({ toString: '' })
  })
  it.each([1, true, null, {}, []])(
    'rejects malformed text instead of silently storing empty text (%s)',
    (question) => {
      const result = validateFormSubmission({ fields, values: { question } })
      expect(result.errors.question).toBe('Question must contain text.')
      expect(Object.hasOwn(result.normalizedData, 'question')).toBe(false)
    },
  )
  it.each([null, {}, [], 'yes', 2])('rejects an arbitrary checkbox encoding (%s)', (permission) => {
    expect(validateFormSubmission({ fields, values: { permission } }).errors.permission).toBe(
      'Permission must be a checkbox value.',
    )
  })
  it.each([true, 'true', 'on', '1', 1])(
    'keeps known legacy checked encodings (%s)',
    (permission) => {
      expect(
        validateFormSubmission({ fields, values: { permission } }).normalizedData.permission,
      ).toBe(true)
    },
  )
  it.each([false, 'false', 'off', '0', '', 0, undefined])(
    'keeps known legacy unchecked encodings (%s)',
    (permission) => {
      expect(
        validateFormSubmission({ fields, values: { permission } }).normalizedData.permission,
      ).toBe(false)
    },
  )
  it('rejects undeclared names and prototype-related input instead of dropping it silently', () => {
    for (const values of [
      { unexpected: 'answer' },
      JSON.parse('{"__proto__":{"polluted":true}}'),
      { rating: '5' },
    ]) {
      expect(validateFormSubmission({ fields, values }).errors.values).toContain('not in this form')
    }
  })
  it('allows only the fixed review engine to opt into its separately validated additional fields', () => {
    expect(
      validateFormSubmission({
        fields,
        values: { rating: 5 },
        additionalFieldNames: REVIEW_SUBMISSION_FIELD_NAMES,
      }).errors,
    ).toEqual({})
    expect(
      validateFormSubmission({
        fields,
        values: { rating: 5, surprise: 'x' },
        additionalFieldNames: REVIEW_SUBMISSION_FIELD_NAMES,
      }).errors.values,
    ).toContain('not in this form')
  })
  it('accepts 100 answers plus the transport honeypot and rejects a malformed honeypot', () => {
    const many = Array.from({ length: FORM_MAX_FIELDS }, (_, index) => ({
      name: `field${index}`,
      label: `Field ${index}`,
      type: 'text' as const,
    }))
    const values = {
      ...Object.fromEntries(many.map((field) => [field.name, 'answer'])),
      website: '',
    }
    expect(validateFormSubmission({ fields: many, values }).errors).toEqual({})
    expect(
      validateFormSubmission({ fields: many, values: { ...values, website: {} } }).errors.values,
    ).toContain('invalid field')
  })
  it.each(['constructor', 'prototype', 'website'])(
    'rejects reserved authoring names (%s)',
    (name) => {
      expect(validateFormFieldDefinitions([{ name, label: 'Question', type: 'text' }])).toContain(
        'reserved',
      )
    },
  )
  it('rejects unsupported controls and schema sizes that cannot be submitted', () => {
    expect(
      validateFormFieldDefinitions([{ name: 'question', label: 'Question', type: 'invented' }]),
    ).toContain('unsupported control type')
    expect(
      validateFormFieldDefinitions(
        Array.from({ length: 101 }, (_, index) => ({
          name: `field${index}`,
          label: 'Field',
          type: 'text',
        })),
      ),
    ).toBe('Add no more than 100 fields.')
  })
})
