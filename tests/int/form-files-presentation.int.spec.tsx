import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GenericForm, type GenericFormProps } from '@/components/revamp/generic-form'
import { FormUploadError } from '@/lib/uploadFormAttachment'
import type { SimpleFormField } from '@/lib/forms'
import type { UploadedFormFile } from '@/lib/formAttachments'

afterEach(cleanup)
const field: SimpleFormField = {
  id: 'files',
  name: 'documents',
  label: 'Supporting documents',
  type: 'file',
  required: true,
  maxFiles: 2,
}
const file = new File(['%PDF-1.7 test'], 'résumé.pdf', { type: 'application/pdf' })
const success = { success: true, message: 'Received.' }
const select = () =>
  fireEvent.change(screen.getByLabelText(/Supporting documents/), { target: { files: [file] } })
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Send Message' }))
const uploadSuccess = (
  file: File,
  _field: SimpleFormField,
  _revision: string,
  _key: string,
  uploadID: string,
  ..._rest: unknown[]
): UploadedFormFile => ({ token: uploadID, filename: file.name, size: file.size, fileType: 'pdf' })
describe('private form upload presentation', () => {
  it('focuses a missing required file and disables preview uploads', async () => {
    const onSubmit = vi.fn<GenericFormProps['onSubmit']>(async () => success)
    const view = render(
      <GenericForm
        fields={[field]}
        revision={'a'.repeat(64)}
        onSubmit={onSubmit}
        onFileUpload={async (...args) => uploadSuccess(...args)}
      />,
    )
    submit()
    await waitFor(() =>
      expect(screen.getByText('Supporting documents: upload at least one file.')).toBeTruthy(),
    )
    expect(document.activeElement).toBe(screen.getByLabelText(/Supporting documents/))
    expect(onSubmit).not.toHaveBeenCalled()
    view.unmount()
    render(<GenericForm fields={[field]} revision={'a'.repeat(64)} disabled onSubmit={onSubmit} />)
    expect((screen.getByLabelText(/Supporting documents/) as HTMLInputElement).disabled).toBe(true)
  })
  it('blocks submit during upload and uses the same response key for capture and lost-confirmation retry', async () => {
    let complete!: (file: UploadedFormFile) => void
    const onUpload = vi.fn(
      (..._args) =>
        new Promise<UploadedFormFile>((resolve) => {
          complete = resolve
        }),
    )
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('lost')).mockResolvedValue(success)
    render(
      <GenericForm
        fields={[field]}
        revision={'a'.repeat(64)}
        onSubmit={onSubmit}
        onFileUpload={onUpload}
      />,
    )
    select()
    expect(
      (screen.getByRole('button', { name: 'Send Message' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    const args = onUpload.mock.calls[0]
    await act(async () => complete(uploadSuccess(args[0], args[1], args[2], args[3], args[4])))
    await waitFor(() => expect(screen.getByText('Uploaded — ready to send')).toBeTruthy())
    submit()
    await waitFor(() =>
      expect(screen.getByText(/We couldn’t confirm your submission/)).toBeTruthy(),
    )
    submit()
    await waitFor(() => expect(screen.getByText('Received.')).toBeTruthy())
    expect(onSubmit.mock.calls[0]).toEqual(onSubmit.mock.calls[1])
    expect(onSubmit.mock.calls[0][2]).toBe(args[3])
    expect(onSubmit.mock.calls[0][0].documents).toEqual([args[4]])
  })
  it('requires retry or removal after failed upload and reuses upload identity for explicit retry', async () => {
    const onUpload = vi
      .fn()
      .mockRejectedValueOnce(new Error('Connection lost. Retry or remove this file.'))
      .mockImplementation(async (...args) =>
        uploadSuccess(args[0], args[1], args[2], args[3], args[4]),
      )
    render(
      <GenericForm
        fields={[field]}
        revision={'a'.repeat(64)}
        onSubmit={async () => success}
        onFileUpload={onUpload}
      />,
    )
    select()
    const retry = await screen.findByRole('button', { name: 'Retry résumé.pdf' })
    expect(
      (screen.getByRole('button', { name: 'Send Message' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    fireEvent.click(retry)
    await waitFor(() => expect(screen.getByText('Uploaded — ready to send')).toBeTruthy())
    expect(onUpload.mock.calls[0][3]).toBe(onUpload.mock.calls[1][3])
    expect(onUpload.mock.calls[0][4]).toBe(onUpload.mock.calls[1][4])
    fireEvent.click(screen.getByRole('button', { name: 'Remove résumé.pdf' }))
    expect(screen.queryByText('résumé.pdf')).toBeNull()
  })
  it('removal aborts in-flight uploads and ignores their late confirmation', async () => {
    let complete!: (file: UploadedFormFile) => void
    const onUpload = vi.fn(
      (..._args) =>
        new Promise<UploadedFormFile>((resolve) => {
          complete = resolve
        }),
    )
    const onSubmit = vi.fn<GenericFormProps['onSubmit']>(async () => success)
    render(
      <GenericForm
        fields={[{ ...field, required: false }]}
        revision={'a'.repeat(64)}
        onSubmit={onSubmit}
        onFileUpload={onUpload}
      />,
    )
    select()
    const args = onUpload.mock.calls[0]
    fireEvent.click(screen.getByRole('button', { name: 'Remove résumé.pdf' }))
    expect(args[5].aborted).toBe(true)
    await act(async () => complete(uploadSuccess(args[0], args[1], args[2], args[3], args[4])))
    submit()
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0].documents).toEqual([])
  })
  it('starts a genuinely new upload attempt, clearing failed files while preserving other answers', async () => {
    const onUpload = vi
      .fn()
      .mockRejectedValueOnce(
        new FormUploadError({
          success: false,
          requestKeyConflict: true,
          message: 'Upload limit reached. Start a new response.',
        }),
      )
      .mockImplementation(async (...args) =>
        uploadSuccess(args[0], args[1], args[2], args[3], args[4]),
      )
    render(
      <GenericForm
        fields={[{ id: 'name', name: 'name', label: 'Name', type: 'text' }, field]}
        revision={'a'.repeat(64)}
        onSubmit={async () => success}
        onFileUpload={onUpload}
      />,
    )
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alex' } })
    select()
    fireEvent.click(await screen.findByRole('button', { name: 'Start a new response' }))
    await waitFor(() => expect(screen.queryByText('résumé.pdf')).toBeNull())
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Alex')
    expect(screen.getByText(/Files were cleared for this new response/)).toBeTruthy()
    select()
    await waitFor(() => expect(screen.getByText('Uploaded — ready to send')).toBeTruthy())
    expect(onUpload.mock.calls[0][3]).not.toBe(onUpload.mock.calls[1][3])
    expect(onUpload.mock.calls[0][4]).not.toBe(onUpload.mock.calls[1][4])
  })
  it('refreshes a changed definition during upload rather than trapping a required question', async () => {
    const onUpload = vi.fn().mockRejectedValueOnce(
      new FormUploadError({
        success: false,
        message: 'Changed',
        updatedForm: {
          revision: 'b'.repeat(64),
          fields: [{ ...field, label: 'Updated documents' }],
          submitButtonLabel: 'Send updated',
        },
      }),
    )
    render(
      <GenericForm
        fields={[field]}
        revision={'a'.repeat(64)}
        onSubmit={async () => success}
        onFileUpload={onUpload}
      />,
    )
    select()
    await waitFor(() => expect(screen.getByLabelText(/Updated documents/)).toBeTruthy())
    expect(screen.queryByText('résumé.pdf')).toBeNull()
    expect(screen.getByText(/Review the updated questions/)).toBeTruthy()
  })
})
