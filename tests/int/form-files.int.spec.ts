import { describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { getFormAttachmentStorageConfig } from '@/config/formAttachmentStorage'
import {
  getClientFileError,
  getFormFilePolicy,
  validateFormFilePolicy,
  getFormFileAccept,
  type UploadedFormFile,
} from '@/lib/formAttachments'
import {
  getFormInitialAnswers,
  getFormFieldConfiguration,
  getSubmissionContactMetadata,
  validateFormFieldDefinitions,
  validateFormFieldDefinitionsForIntent,
  validateFormSubmission,
  type SimpleFormField,
} from '@/lib/forms'
import { recoverFormAnswers } from '@/lib/recoverFormAnswers'
import { buildFormSubmissionSnapshot } from '@/lib/formSubmissionSnapshot'
import { buildFormNotificationEmail } from '@/lib/formNotifications'
import { FormAttachments } from '@/collections/FormAttachments'
import type { Form } from '@/payload-types'

const field: SimpleFormField = {
  id: 'file-row',
  name: 'email',
  label: 'Application documents',
  type: 'file',
  required: true,
  allowedFileTypes: ['pdf', 'png'],
  maxFiles: 2,
  maxFileSizeMB: 2,
}
const token = randomUUID()
describe('private form file contracts', () => {
  it('uses bounded defaults and typed accept extensions', () => {
    expect(getFormFilePolicy({})).toMatchObject({ maxFiles: 1, maxFileSizeMB: 3 })
    expect(getFormFileAccept(field)).toBe('.pdf,.png')
    expect(getFormFilePolicy({ allowedFileTypes: [] })).toEqual(getFormFilePolicy({}))
    expect(validateFormFieldDefinitions([field])).toBe(true)
  })
  it.each([
    { maxFiles: 0 },
    { maxFiles: 6 },
    { maxFiles: 1.5 },
    { maxFileSizeMB: 0 },
    { maxFileSizeMB: 4 },
    { maxFileSizeMB: 1.5 },
    { allowedFileTypes: ['pdf', 'pdf'] },
    { allowedFileTypes: ['exe'] },
  ])('rejects unsafe file policy %j', (policy) => {
    expect(validateFormFilePolicy({ ...field, ...policy } as SimpleFormField)).toBe(false)
    expect(validateFormFieldDefinitions([{ ...field, ...policy }])).not.toBe(true)
  })
  it.each([
    null,
    '',
    token,
    true,
    [token, token],
    ['not-a-token'],
    [token, randomUUID(), randomUUID()],
    [{ token }],
  ])('rejects malformed file answers %j', (answer) => {
    expect(
      validateFormSubmission({ fields: [field], values: { email: answer } }).errors.email,
    ).toBeTruthy()
  })
  it('accepts unique tokens structurally; authorization is a separate server check', () => {
    expect(validateFormSubmission({ fields: [field], values: { email: [token] } })).toEqual({
      errors: {},
      normalizedData: { email: [token] },
    })
    expect(validateFormSubmission({ fields: [field], values: {} }).errors.email).toContain(
      'at least one',
    )
    expect(
      validateFormSubmission({ fields: [{ ...field, required: false }], values: {} }).normalizedData
        .email,
    ).toEqual([])
  })
  it('never supplies file defaults or turns a contact-like name into contact metadata', () => {
    expect(getFormInitialAnswers([{ ...field, defaultValue: 'untrusted.pdf' }])).toEqual({
      email: [],
    })
    expect(
      getFormFieldConfiguration({ ...field, defaultValue: 'untrusted.pdf' }),
    ).not.toHaveProperty('defaultValue')
    expect(getSubmissionContactMetadata({ email: [token] }, [field]).email).toBeUndefined()
    expect(
      validateFormFieldDefinitionsForIntent({ fields: [field], submissionIntent: 'review' }),
    ).not.toBe(true)
    expect(getFormFieldConfiguration({ ...field, type: 'text' })).not.toHaveProperty('maxFiles')
  })
  it.each([
    ['bad.exe', 10],
    ['empty.pdf', 0],
    ['huge.pdf', 3 * 1024 * 1024],
    ['../secret.pdf', 100],
    ['bad\n.pdf', 100],
  ])('rejects unusable client file %s', (name, size) =>
    expect(getClientFileError({ name: String(name), size: Number(size) }, field)).toBeTruthy(),
  )
  it('preserves compatible files by stable question ID through rename; explains removed formats', () => {
    const png = randomUUID()
    const files = new Map<string, UploadedFormFile>([
      [token, { token, filename: 'résumé.pdf', fileType: 'pdf', size: 100 }],
      [png, { token: png, filename: 'proof.png', fileType: 'png', size: 100 }],
    ])
    const next = {
      ...field,
      name: 'new_files',
      label: 'New label',
      allowedFileTypes: ['pdf'] as const,
    }
    const recovered = recoverFormAnswers(
      [field],
      [{ ...next, allowedFileTypes: ['pdf'] }],
      { email: [token, png] },
      files,
    )
    expect(recovered.values.new_files).toEqual([token])
    expect(recovered.partiallyClearedLabels).toEqual(['Application documents'])
    expect(recoverFormAnswers([field], [field], { email: [token] }).clearedLabels).toContain(
      field.label,
    )
    expect(
      recoverFormAnswers([field], [{ ...field, id: 'replacement' }], { email: [token] }, files)
        .values.email,
    ).toEqual([])
  })
  it('captures original file names and escapes notifications without exposing tokens or public URLs', () => {
    const form = {
      id: 'form',
      title: 'Applications',
      slug: 'applications',
      fields: [field],
      submissionIntent: 'general',
    } as Form
    const attachments = [{ token, filename: '<application>.pdf', fieldName: 'email' }]
    expect(
      buildFormSubmissionSnapshot(form, { email: [token] }, attachments).answers[0],
    ).toMatchObject({ displayValue: '<application>.pdf', value: { raw: [token] } })
    const email = buildFormNotificationEmail({
      form,
      submittedAt: new Date(),
      values: { email: [token] },
      attachments,
      submissionURL: 'https://example.test/admin/collections/form-submissions/123',
    })
    expect(email.html).toContain('&lt;application&gt;.pdf')
    expect(email.html).toContain('sign-in required')
    expect(email.html).not.toContain(token)
    expect(email.html).not.toContain('mailto:')
  })
  it('denies direct metadata access even for Admin', async () => {
    for (const action of ['create', 'read', 'update', 'delete'] as const)
      expect(
        await FormAttachments.access?.[action]?.({ req: { user: { role: 'admin' } } } as never),
      ).toBe(false)
    expect(FormAttachments).not.toHaveProperty('upload')
  })
})
describe('private attachment deployment contract', () => {
  const production: NodeJS.ProcessEnv = { NODE_ENV: 'production' }
  const s3: NodeJS.ProcessEnv = {
    ...production,
    FORM_ATTACHMENTS_PROVIDER: 's3',
    FORM_ATTACHMENTS_S3_BUCKET: 'private-forms',
    FORM_ATTACHMENTS_S3_ENDPOINT: 'https://private.example.test',
    FORM_ATTACHMENTS_S3_REGION: 'auto',
    FORM_ATTACHMENTS_S3_ACCESS_KEY_ID: 'test-only',
    FORM_ATTACHMENTS_S3_SECRET_ACCESS_KEY: 'test-only',
  }
  it('defaults production to disabled and development to private local disk', () => {
    expect(getFormAttachmentStorageConfig(production)).toEqual({ provider: 'disabled' })
    expect(getFormAttachmentStorageConfig({ NODE_ENV: 'test' })).toEqual({ provider: 'localDisk' })
  })
  it.each([
    { FORM_ATTACHMENTS_PROVIDER: 'public' },
    { FORM_ATTACHMENTS_PROVIDER: 'localDisk' },
    { FORM_ATTACHMENTS_PROVIDER: 's3' },
  ])('fails closed for production configuration %j', (env) =>
    expect(() => getFormAttachmentStorageConfig({ ...production, ...env })).toThrow(),
  )
  it('rejects shared public bucket, non-HTTPS endpoint and invalid path-style', () => {
    expect(() => getFormAttachmentStorageConfig({ ...s3, S3_BUCKET: 'private-forms' })).toThrow(
      'separate private bucket',
    )
    expect(() =>
      getFormAttachmentStorageConfig({
        ...s3,
        FORM_ATTACHMENTS_S3_ENDPOINT: 'http://example.test',
      }),
    ).toThrow()
    expect(() =>
      getFormAttachmentStorageConfig({ ...s3, FORM_ATTACHMENTS_S3_FORCE_PATH_STYLE: 'yes' }),
    ).toThrow()
    expect(getFormAttachmentStorageConfig(s3).provider).toBe('s3')
  })
})
