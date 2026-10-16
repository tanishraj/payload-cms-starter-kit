import { describe, expect, it } from 'vitest'

import {
  getVisibleFormFields,
  validateFormVisibilityConditions,
} from '@/lib/formConditions'
import { validateFormSubmission, type SimpleFormField } from '@/lib/forms'
import { buildFormSubmissionSnapshot } from '@/lib/formSubmissionSnapshot'

const fields: SimpleFormField[] = [
  {
    id: 'department-id',
    name: 'department',
    label: 'Department',
    type: 'select',
    options: [
      { label: 'Admissions', value: 'admissions' },
      { label: 'Library', value: 'library' },
    ],
  },
  {
    id: 'details-id',
    name: 'details',
    label: 'Details',
    type: 'textarea',
    requiredWhenVisible: true,
    visibilityConditions: [{ fieldID: 'department-id', operator: 'equals', value: 'admissions' }],
  },
  {
    id: 'library-reason-id',
    name: 'library_reason',
    label: 'Library reason',
    type: 'text',
    visibilityConditions: [{ fieldID: 'department-id', operator: 'equals', value: 'library' }],
  },
]

describe('conditional form visibility', () => {
  it('shows questions when every stable-ID rule matches', () => {
    expect(getVisibleFormFields(fields, { department: 'admissions' }).map(({ name }) => name)).toEqual([
      'department',
      'details',
    ])
  })

  it('skips required validation for hidden questions and requires a visible conditional question', () => {
    expect(validateFormSubmission({ fields, values: { department: 'library' } }).errors).toEqual({})
    const result = validateFormSubmission({ fields, values: { department: 'admissions' } })
    expect(result.errors.details).toBe('Details is required.')
    expect(result.normalizedData).not.toHaveProperty('library_reason')
  })

  it('rejects nonempty forged answers for hidden questions and omits them from normalized answers', () => {
    const result = validateFormSubmission({
      fields,
      values: { department: 'library', details: 'secret hidden answer' },
    })
    expect(result.errors.details).toContain('is hidden')
    expect(result.normalizedData).not.toHaveProperty('details')
  })

  it('rejects even an empty submitted key for a hidden question', () => {
    const result = validateFormSubmission({
      fields,
      values: { department: 'library', details: '' },
    })
    expect(result.errors.details).toContain('is hidden')
    expect(result.normalizedData).not.toHaveProperty('details')
  })

  it('never normalizes an uploaded private-file token for a hidden question', () => {
    const fileField: SimpleFormField = {
      id: 'private-file-id',
      name: 'private_file',
      label: 'Private file',
      type: 'file',
      allowedFileTypes: ['pdf'],
      maxFileSizeMB: 1,
      maxFiles: 1,
      visibilityConditions: [{ fieldID: 'department-id', operator: 'equals', value: 'admissions' }],
    }
    const result = validateFormSubmission({
      fields: [fields[0], fileField],
      values: { department: 'library', private_file: ['upload_private_token'] },
    })
    expect(result.errors.private_file).toContain('is hidden')
    expect(result.normalizedData).not.toHaveProperty('private_file')
  })

  it('validates only the options and earlier questions allowed by the schema', () => {
    expect(validateFormVisibilityConditions(fields)).toBe(true)
    expect(
      validateFormVisibilityConditions([
        { ...fields[0], visibilityConditions: [{ fieldID: 'details-id', operator: 'answered' }] },
        fields[1],
      ]),
    ).toContain('earlier question')
    expect(
      validateFormVisibilityConditions([
        fields[0],
        { ...fields[1], visibilityConditions: [{ fieldID: 'department-id', operator: 'equals', value: 'unknown' }] },
      ]),
    ).toContain('available option')
  })

  it('includes rules in the published revision and excludes hidden answers from stored response rows', () => {
    const form = {
      id: 'form-id',
      slug: 'conditional',
      title: 'Conditional form',
      fields: fields.map((field) => ({ ...field })),
    }
    const current = buildFormSubmissionSnapshot(form, {
      department: 'library',
      library_reason: 'Borrow a book',
    })
    expect(current.answers.map((answer) => answer.name)).toEqual(['department', 'library_reason'])
    const changed = buildFormSubmissionSnapshot(
      { ...form, fields: fields.map((field, index) => index === 1 ? { ...field, requiredWhenVisible: false } : field) },
      {},
    )
    expect(changed.formRevision).not.toBe(current.formRevision)
  })
})
