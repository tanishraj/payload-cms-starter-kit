import { describe, expect, it } from 'vitest'

import { FormSubmissions } from '@/collections/FormSubmissions'
import { buildFormSubmissionSnapshot } from '@/lib/formSubmissionSnapshot'
import {
  getSubmissionContactMetadata,
  validateFormFieldDefinitions,
  type SimpleFormField,
} from '@/lib/forms'

const fields: SimpleFormField[] = [
  {
    id: 'person-id',
    label: 'Applicant',
    name: 'applicant_name',
    type: 'text',
    contactRole: 'name',
  },
  { id: 'email-id', label: 'Work email', name: 'work_email', type: 'email', contactRole: 'email' },
  {
    id: 'dept-id',
    label: 'Preferred department',
    name: 'preferred_department',
    type: 'select',
    options: [{ label: 'Admissions', value: 'admissions' }],
  },
  { id: 'consent-id', label: 'Consent', name: 'consent', type: 'checkbox' },
]
const form = { fields, id: 'form-id', slug: 'enquiry', title: 'Enquiry', submissionIntent: 'lead' }
const values = {
  applicant_name: 'Taylor',
  work_email: 'taylor@example.com',
  preferred_department: 'admissions',
  consent: true,
}

describe('dynamic form history and contact roles', () => {
  it('uses explicit custom-name contact roles ahead of legacy aliases', () => {
    expect(getSubmissionContactMetadata({ ...values, email: 'other@example.com' }, fields)).toEqual(
      {
        email: 'taylor@example.com',
        name: 'Taylor',
        phone: undefined,
      },
    )
    expect(getSubmissionContactMetadata({ email: 'legacy@example.com' })).toEqual({
      email: 'legacy@example.com',
      name: undefined,
      phone: undefined,
    })
    expect(
      getSubmissionContactMetadata({ email: 'other@example.com' }, fields).email,
    ).toBeUndefined()
  })

  it('rejects duplicate roles and mismatched control types', () => {
    expect(validateFormFieldDefinitions(fields)).toBe(true)
    expect(
      validateFormFieldDefinitions([
        ...fields,
        { label: 'Personal email', name: 'personal_email', type: 'email', contactRole: 'email' },
      ]),
    ).toContain('only one')
    expect(
      validateFormFieldDefinitions([
        { label: 'Email', name: 'work_email', type: 'text', contactRole: 'email' },
      ]),
    ).toContain('Email type')
    expect(
      validateFormFieldDefinitions([
        { label: 'Phone', name: 'telephone', type: 'text', contactRole: 'phone' },
      ]),
    ).toContain('Phone type')
    expect(
      validateFormFieldDefinitions([
        { label: 'Name', name: 'person', type: 'checkbox', contactRole: 'name' },
      ]),
    ).toContain('Text type')
  })

  it('captures typed answers with original labels and readable option labels', () => {
    const captured = buildFormSubmissionSnapshot(form, values)
    expect(captured.formRevision).toMatch(/^[a-f0-9]{64}$/)
    expect(captured.answers[2]).toEqual({
      displayValue: 'Admissions',
      fieldID: 'dept-id',
      label: 'Preferred department',
      name: 'preferred_department',
      type: 'select',
      value: { raw: 'admissions' },
    })
    expect(captured.answers[3].displayValue).toBe('Yes')
  })

  it('preserves captured history after rename, reorder, relabel, option edits and deletion', () => {
    const editable = structuredClone(form)
    const captured = buildFormSubmissionSnapshot(editable, values)
    const before = structuredClone(captured)
    editable.fields[2].label = 'New department label'
    editable.fields[2].name = 'department'
    editable.fields[2].options![0].label = 'Student services'
    editable.fields.reverse()
    editable.fields.pop()
    expect(captured).toEqual(before)
    const next = buildFormSubmissionSnapshot(editable, { department: 'admissions' })
    expect(next.formRevision).not.toBe(captured.formRevision)
    expect(next.answers.find((answer) => answer.fieldID === 'dept-id')?.name).toBe('department')
    expect(captured.answers[2].displayValue).toBe('Admissions')
  })

  it('keeps revision deterministic and independent of values, placeholder and row option IDs', () => {
    expect(buildFormSubmissionSnapshot(form, {}).formRevision).toBe(
      buildFormSubmissionSnapshot(form, values).formRevision,
    )
    expect(
      buildFormSubmissionSnapshot(
        {
          ...form,
          fields: fields.map((field) => ({
            ...field,
            placeholder: 'Enter a value',
          })),
        },
        values,
      ).formRevision,
    ).toBe(buildFormSubmissionSnapshot(form, values).formRevision)
    expect(
      buildFormSubmissionSnapshot({ ...form, fields: [...fields].reverse() }, values).formRevision,
    ).not.toBe(buildFormSubmissionSnapshot(form, values).formRevision)
  })

  it('marks legacy IDs honestly and retains fixed review engine answers', () => {
    const snapshot = buildFormSubmissionSnapshot(
      {
        ...form,
        fields: [{ label: 'Review', name: 'reviewBody', type: 'textarea' }],
      },
      { reviewBody: 'Good', rating: '5', isGenuineExperience: true },
    )
    expect(snapshot.answers[0].fieldID).toBeNull()
    expect(snapshot.answers.map((answer) => answer.name)).toEqual([
      'reviewBody',
      'rating',
      'isGenuineExperience',
    ])
    expect(snapshot.answers[2].displayValue).toBe('Yes')
  })

  it('does not expose captured history through review dependency access', async () => {
    const sanitize = FormSubmissions.hooks!.afterRead![0]
    const captured = buildFormSubmissionSnapshot(form, values)
    const sanitized = await sanitize({
      doc: { id: 'submission-id', data: values, ...captured },
      req: { user: { role: 'siteManager', features: { reviews: true } } },
    } as never)
    expect(sanitized).toEqual({ id: 'submission-id', submitterEmail: 'Submission #submission-id' })
  })

  it('keeps new history fields read-only and optional for existing submissions', () => {
    for (const name of ['formRevision', 'formSnapshot', 'answers']) {
      const field = FormSubmissions.fields.find((field) => 'name' in field && field.name === name)
      expect(field).toBeDefined()
      if (!field || (field.type !== 'text' && field.type !== 'json' && field.type !== 'array')) {
        throw new Error('Missing history field')
      }
      expect(field.admin?.readOnly).toBe(true)
      expect('required' in field && field.required).toBeFalsy()
      expect(typeof field.access?.update).toBe('function')
      expect(field.access!.update!({} as never)).toBe(false)
    }
  })
})
