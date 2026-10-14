import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within, waitFor } from 'storybook/test'
import { FormFileControl, type FormFileUpload } from '@/components/revamp/form-file-control'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/revamp/ui/field'
import { getFormFileHelp, type UploadedFormFile } from '@/lib/formAttachments'

const demoUpload: FormFileUpload = async (file, uploadID, signal, onProgress) => {
  for (let progress = 0; progress <= 100; progress += 25) {
    await new Promise((resolve) => setTimeout(resolve, 80))
    signal.throwIfAborted()
    onProgress(progress)
  }
  return { token: uploadID, filename: file.name, size: file.size, fileType: 'pdf' }
}
const meta = {
  title: 'Components/Form File Control',
  component: FormFileControl,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Source: @shadcnblocks/input-input-special-1; progress from @shadcnblocks/file-upload-file-upload-special-7. Native file selection, labelled remove/retry, real callback progress. Synthetic callbacks only; no files are saved or sent in Storybook. The form block owns questions; storage and transport stay outside presentation.',
      },
    },
  },
  args: {
    policy: { allowedFileTypes: ['pdf', 'docx', 'png', 'jpg'], maxFileSizeMB: 3, maxFiles: 2 },
    disabled: false,
    value: [],
    onChange: () => {},
    onUpload: demoUpload,
  },
  argTypes: {
    policy: { name: 'Allowed types and limits', control: 'object' },
    disabled: { name: 'Disabled', control: 'boolean' },
    value: { control: false },
    onChange: { control: false },
    onUpload: { control: false },
    onBlockedChange: { control: false },
    controlRef: { control: false },
  },
  render: function Demo(args) {
    const [value, setValue] = useState<UploadedFormFile[]>([])
    return (
      <div className="w-full max-w-md">
        <FieldGroup>
          <Field data-disabled={args.disabled}>
            <FieldLabel htmlFor="demo-file">Supporting documents</FieldLabel>
            <FormFileControl
              {...args}
              id="demo-file"
              value={value}
              onChange={setValue}
              aria-describedby="demo-file-help"
            />
            <FieldDescription id="demo-file-help">
              {getFormFileHelp(args.policy)} Demo only — no files leave this workshop.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </div>
    )
  },
} satisfies Meta<typeof FormFileControl>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
export const FailedUpload: Story = {
  args: {
    onUpload: async () => {
      throw new Error('Connection lost. Retry or remove this file before sending.')
    },
  },
}
export const UploadAndRemove: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.upload(
      canvas.getByLabelText('Supporting documents'),
      new File(['%PDF-1.7 demo'], 'application.pdf', { type: 'application/pdf' }),
    )
    await waitFor(() => expect(canvas.getByText('Uploaded — ready to send')).toBeVisible())
    await userEvent.click(canvas.getByRole('button', { name: 'Remove application.pdf' }))
    await expect(canvas.queryByText('application.pdf')).not.toBeInTheDocument()
  },
}
export const RetryUpload: Story = {
  render: function Retry(args) {
    const [value, setValue] = useState<UploadedFormFile[]>([])
    const [attempted, setAttempted] = useState(false)
    return (
      <div className="w-full max-w-md">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="retry-file">Application document</FieldLabel>
            <FormFileControl
              {...args}
              id="retry-file"
              value={value}
              onChange={setValue}
              onUpload={async (...uploadArgs) => {
                if (!attempted) {
                  setAttempted(true)
                  throw new Error('Connection lost. Retry or remove this file.')
                }
                return demoUpload(...uploadArgs)
              }}
            />
          </Field>
        </FieldGroup>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.upload(
      canvas.getByLabelText('Application document'),
      new File(['%PDF-1.7 demo'], 'résumé.pdf', { type: 'application/pdf' }),
    )
    await userEvent.click(await canvas.findByRole('button', { name: 'Retry résumé.pdf' }))
    await waitFor(() => expect(canvas.getByText('Uploaded — ready to send')).toBeVisible())
  },
}
