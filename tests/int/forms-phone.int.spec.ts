import { describe, expect, it } from 'vitest'

import {
  getSubmissionContactMetadata,
  isValidPhoneNumber,
  sanitizePhoneNumberInput,
  validateFormFieldDefinitionsForIntent,
  validateFormSubmission,
} from '@/lib/forms'

describe('form phone and review contracts', () => {
  it('sanitizes common phone formatting and enforces 7 to 15 digits', () => {
    expect(sanitizePhoneNumberInput('+971 abc (50) 123-4567')).toBe('+971  (50) 123-4567')
    expect(isValidPhoneNumber('+971 (50) 123-4567')).toBe(true)
    expect(isValidPhoneNumber('12345')).toBe(false)
    expect(isValidPhoneNumber('+1234567890123456')).toBe(false)
  })

  it('validates phone fields while preserving the starter value limits', () => {
    const field = { label: 'Telephone', name: 'phone', required: true, type: 'phone' as const }
    expect(
      validateFormSubmission({ fields: [field], values: { phone: '+971 50 123 4567' } }).errors,
    ).toEqual({})
    expect(
      validateFormSubmission({ fields: [field], values: { phone: 'call me' } }).errors.phone,
    ).toContain('valid phone number')
    expect(
      validateFormSubmission({ fields: [field], values: { phone: '1'.repeat(26) } }).errors.phone,
    ).toContain('25 characters or fewer')
  })

  it('stores phone metadata using known aliases', () => {
    expect(getSubmissionContactMetadata({ mobile: '+971 50 123 4567' })).toEqual({
      email: undefined,
      name: undefined,
      phone: '+971 50 123 4567',
    })
  })

  it('rejects required fields that the fixed review UI cannot render', () => {
    expect(
      validateFormFieldDefinitionsForIntent({
        fields: [{ label: 'Company', name: 'company', required: true, type: 'text' }],
        submissionIntent: 'review',
      }),
    ).toBe('Review Submission cannot render required field "company".')
    expect(
      validateFormFieldDefinitionsForIntent({
        fields: [{ label: 'Review', name: 'reviewBody', required: true, type: 'textarea' }],
        submissionIntent: 'review',
      }),
    ).toBe(true)
  })
})
