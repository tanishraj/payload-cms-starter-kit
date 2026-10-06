import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { GenericForm, type GenericFormResult } from '@/components/revamp/generic-form'
import type { SimpleFormField } from '@/lib/forms'
import { GenericFormBlockPresentation } from '@/blocks/GenericForm/Presentation'
import type { RegularBlockSize } from '@/blocks/shared/blockSpacing'

type StoryArgs = ComponentProps<typeof GenericForm> & { size?: RegularBlockSize }

const exampleFields: SimpleFormField[] = [
  {
    name: 'visitor_name',
    label: 'Your name',
    type: 'text',
    placeholder: 'Alex Taylor',
    required: true,
    contactRole: 'name',
  },
  {
    name: 'reply_to',
    label: 'Email address',
    type: 'email',
    placeholder: 'alex@example.com',
    required: true,
    contactRole: 'email',
  },
  { name: 'contact_number', label: 'Phone number', type: 'phone', placeholder: '+971 50 123 4567' },
  {
    name: 'preferred_department',
    label: 'Preferred department',
    type: 'select',
    required: true,
    placeholder: 'Choose a department',
    options: [
      { label: 'Admissions', value: 'admissions' },
      { label: 'Library', value: 'library' },
      { label: 'Administration', value: 'administration' },
    ],
  },
  {
    name: 'enquiry_details',
    label: 'How can we help?',
    type: 'textarea',
    placeholder: 'Tell us what you would like to know.',
  },
  {
    name: 'contact_permission',
    label: 'You may contact me about this enquiry',
    type: 'checkbox',
    required: true,
  },
]

const meta = {
  title: 'Blocks/Generic Form',
  component: GenericForm,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'genericForm',
    layout: 'padded',
    docs: {
      description: {
        component:
          'Authenticated Shadcnblocks source: @shadcnblocks/form-form-patterns-4 (https://www.shadcnblocks.com/components/form), with @shadcnblocks/checkbox-checkbox-standard-1 (https://www.shadcnblocks.com/components/checkbox). Preserves the original stacked FieldGroup, max-w-md layout, typography and full-width button. Fresh Radix Luma dependencies use official Neutral light/dark. Six current Payload controls, custom labels/names, shared validation, unique IDs, accessible errors, pending, success and retry. One catalogue entry covers the shared presentation and its native Payload adapter. Stories use synthetic data and local demonstration callbacks; CMS Preview disables submissions. In production, the block selects a reusable Form, inherits the website theme and submits through the shared endpoint. Edit Fields to configure questions/options/required state; schema changes reset the demo. The supported layout is the upstream vertical layout; use the theme/viewport toolbar to review appearance and responsive shape.',
      },
    },
  },
  args: {
    fields: exampleFields,
    heading: 'Send an enquiry',
    description: 'Choose a department and tell us how we can help.',
    submitButtonLabel: 'Send enquiry',
    pendingLabel: 'Sending…',
    disabled: false,
    onSubmit: fn(async () => ({
      success: true,
      message: 'Demo received. No information has been saved or sent.',
    })),
  },
  argTypes: {
    fields: {
      name: 'Questions and controls',
      control: 'object',
      description:
        'Supported text, email, phone, textarea, select and checkbox definitions. Names, labels, options, placeholders, required state and contact roles are editable.',
    },
    heading: { name: 'Heading', control: 'text' },
    description: { name: 'Description', control: 'text' },
    submitButtonLabel: { name: 'Submit label', control: 'text' },
    pendingLabel: { name: 'Pending label', control: 'text' },
    disabled: { name: 'Disabled', control: 'boolean' },
    onSubmit: {
      control: false,
      description:
        'Caller-owned asynchronous submission. Returns confirmation or field errors. Throws for an unconfirmed network result.',
    },
  },
} satisfies Meta<StoryArgs>
export default meta
type Story = StoryObj<StoryArgs>

export const Default: Story = {}
export const TextOnly: Story = {
  args: {
    fields: [{ name: 'question', label: 'Your question', type: 'text', required: true }],
    description: 'A reusable form can ask just one question.',
  },
}
export const Disabled: Story = { args: { disabled: true } }
export const Unavailable: Story = { args: { fields: [] } }
export const LongLabels: Story = {
  args: {
    fields: [
      {
        name: 'accessibility_request',
        label:
          'Tell us about any accessibility adjustments you would like us to consider before your visit',
        type: 'textarea',
        required: true,
      },
      {
        name: 'permission',
        label:
          'I give permission to contact me about the accessibility arrangements for my upcoming visit',
        type: 'checkbox',
        required: true,
      },
    ],
  },
}
export const TwoForms: Story = {
  render: (args) => (
    <div className="flex flex-col gap-12">
      <GenericForm {...args} />
      <GenericForm {...args} heading="Another enquiry" />
    </div>
  ),
}
export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(canvas.getByLabelText(/Your name/)).toHaveFocus()
    await expect(canvas.getByText('Your name is required.')).toBeVisible()
    await expect(canvas.getByText('Preferred department is required.')).toBeVisible()
  },
}
const fill = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement)
  await userEvent.type(canvas.getByLabelText(/Your name/), 'Alex Taylor')
  await userEvent.type(canvas.getByLabelText(/Email address/), 'alex@example.com')
  await userEvent.click(canvas.getByRole('combobox', { name: /Preferred department/ }))
  await userEvent.click(await within(document.body).findByRole('option', { name: 'Admissions' }))
  await userEvent.click(canvas.getByRole('checkbox', { name: /You may contact me/ }))
  return canvas
}
export const SuccessfulSubmission: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(args.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        preferred_department: 'admissions',
        contact_permission: true,
        visitor_name: 'Alex Taylor',
      }),
    )
    await expect(canvas.getByRole('status')).toHaveTextContent('Demo received.')
    await expect(canvas.getByRole('status')).toHaveFocus()
  },
}
export const Pending: Story = {
  args: { onSubmit: fn(() => new Promise<GenericFormResult>(() => {})) },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(canvas.getByRole('button', { name: 'Sending…' })).toBeDisabled()
    await expect(canvas.getByLabelText(/Your name/)).toBeDisabled()
  },
}
export const NetworkFailure: Story = {
  args: {
    onSubmit: fn(async () => {
      throw new Error('Demonstration connection loss')
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(canvas.getByText(/We couldn’t confirm your submission/)).toBeVisible()
    await expect(canvas.getByLabelText(/Your name/)).toHaveValue('Alex Taylor')
    await expect(canvas.getByRole('button', { name: 'Send enquiry' })).toBeEnabled()
  },
}
export const ServerFieldError: Story = {
  args: {
    onSubmit: fn(async () => ({
      success: false,
      message: 'Please correct the highlighted field and try again.',
      errors: { reply_to: 'Please use a different email address.' },
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(canvas.getByLabelText(/Email address/)).toHaveFocus()
    await expect(canvas.getByText('Please use a different email address.')).toBeVisible()
  },
}

// Native adapter states stay beside the shared form rather than duplicating the block catalogue.
export const CMSPreview: Story = {
  name: 'CMS preview',
  args: { size: 'compact' },
  argTypes: {
    size: {
      name: 'Section padding',
      control: 'select',
      options: ['none', 'compact', 'default', 'comfortable'],
    },
    disabled: { control: false },
    pendingLabel: { control: false },
  },
  render: (args) => (
    <GenericFormBlockPresentation
      heading={args.heading}
      description={args.description}
      size={args.size}
      preview
      definition={{
        slug: 'storybook-example',
        fields: args.fields,
        submitButtonLabel: args.submitButtonLabel ?? 'Submit',
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/Preview only — submissions are disabled/)).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Send enquiry' })).toBeDisabled()
  },
}

export const CMSUnavailable: Story = {
  name: 'CMS unavailable form',
  render: (args) => (
    <GenericFormBlockPresentation
      heading={args.heading}
      description={args.description}
      size={args.size}
      definition={null}
      preview
    />
  ),
}
