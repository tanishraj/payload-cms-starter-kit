import type { FormAnswers } from '@/lib/forms'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
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
          'Authenticated Shadcnblocks source: @shadcnblocks/form-form-patterns-4 (https://www.shadcnblocks.com/components/form), with @shadcnblocks/checkbox-checkbox-standard-1 (https://www.shadcnblocks.com/components/checkbox). Preserves the original stacked FieldGroup, max-w-md layout, typography and full-width button. Fresh Radix Luma dependencies use official Neutral light/dark. Fifteen current Payload controls, custom labels/names, shared validation, unique IDs, accessible errors, pending, success and retry. One catalogue entry covers the shared presentation and its native Payload adapter. Stories use synthetic data and local demonstration callbacks; CMS Preview disables submissions. In production, the block selects a reusable Form, inherits the website theme and submits through the shared endpoint. Edit Fields to configure questions/options/required state; schema changes reset the demo. The supported layout is the upstream vertical layout; use the theme/viewport toolbar to review appearance and responsive shape.',
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
    protectRetries: {
      control: false,
      description: 'Caller-owned retry protection; uses one in-memory random key per attempt.',
    },
    revision: {
      control: false,
      description: 'Caller-owned published identity; never an editor-entered option.',
    },
    entries: {
      name: 'Ordered layout entries',
      control: 'object',
      description:
        'Questions once in their defined order, headings, descriptions, dividers and labelled groups. Plain text only.',
    },
    fields: {
      name: 'Questions and controls',
      control: 'object',
      description:
        'Supported text, email, phone, URL, number, textarea, select, checkbox, radio, checkbox group, multi-select, switch, date, time and private file definitions. Names, labels, help text, initial answers, text length limits, options, placeholders, required state and contact roles are editable.',
    },
    heading: { name: 'Heading', control: 'text' },
    description: { name: 'Description', control: 'text' },
    submitButtonLabel: { name: 'Submit label', control: 'text' },
    pendingLabel: { name: 'Pending label', control: 'text' },
    disabled: { name: 'Disabled', control: 'boolean' },
    onFileUpload: {
      control: false,
      description: 'Caller-owned private upload transport; stories use synthetic callbacks only.',
    },
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

export const ChangedQuestions: Story = {
  name: 'Changed questions — preserve compatible answers',
  args: {
    revision: '1'.repeat(64),
    fields: [
      { id: 'name-field', name: 'visitor', label: 'Your name', type: 'text', required: true },
      { id: 'details-field', name: 'details', label: 'Your question', type: 'textarea' },
    ],
    onSubmit: fn(async (_values: FormAnswers, revision?: string): Promise<GenericFormResult> =>
      revision === '2'.repeat(64)
        ? { success: true, message: 'Demo received. No information has been saved or sent.' }
        : {
            success: false,
            message: 'The form has changed.',
            updatedForm: {
              revision: '2'.repeat(64),
              submitButtonLabel: 'Send updated enquiry',
              fields: [
                {
                  id: 'name-field',
                  name: 'full_name',
                  label: 'Full name',
                  type: 'text',
                  required: true,
                },
                {
                  id: 'details-field',
                  name: 'details',
                  label: 'Email address',
                  type: 'email',
                  required: true,
                },
              ],
            },
          },
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText(/Your name/), 'Alex Taylor')
    await userEvent.type(canvas.getByLabelText(/Your question/), 'I would like to visit')
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(canvas.getByRole('status')).toHaveFocus()
    await expect(canvas.getByLabelText(/Full name/)).toHaveValue('Alex Taylor')
    await expect(canvas.getByLabelText(/Email address/)).toHaveValue('')
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'These answers were cleared because their questions changed: Your question',
    )
    await userEvent.type(canvas.getByLabelText(/Email address/), 'alex@example.test')
    await userEvent.click(canvas.getByRole('button', { name: 'Send updated enquiry' }))
    await expect(canvas.getByRole('status')).toHaveTextContent('Demo received.')
  },
}

const createLostConfirmationDemo = () => {
  const received = new Set<string>()
  return async (
    _values: FormAnswers,
    _revision?: string,
    key?: string,
  ): Promise<GenericFormResult> => {
    if (!key) throw new Error('Missing demo attempt key')
    if (!received.has(key)) {
      received.add(key)
      throw new Error('Demo response lost after storage')
    }
    return {
      success: true,
      message: 'Demo original confirmation returned. No second response saved.',
    }
  }
}
const createDifferentResponseDemo = () => {
  let acceptedKey: string | undefined
  return async (
    _values: FormAnswers,
    _revision?: string,
    key?: string,
  ): Promise<GenericFormResult> => {
    acceptedKey ??= key
    if (key === acceptedKey)
      return {
        success: false,
        requestKeyConflict: true,
        message:
          'An earlier response was already received. Start a new response to send different answers.',
      }
    return { success: true, message: 'Demo new response received.' }
  }
}

export const LostConfirmation: Story = {
  name: 'Lost confirmation — reuse the same attempt',
  args: {
    protectRetries: true,
    fields: [{ name: 'question', label: 'Your question', type: 'text', required: true }],
    onSubmit: fn(createLostConfirmationDemo()),
  },
  beforeEach: ({ args }) => {
    ;(args.onSubmit as ReturnType<typeof fn>).mockImplementation(createLostConfirmationDemo())
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText(/Your question/), 'Please send the details')
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await canvas.findByText(/We couldn’t confirm your submission/)
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Send enquiry' })).toBeEnabled())
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(await canvas.findByRole('status')).toHaveTextContent(
      'Demo original confirmation returned.',
    )
    const calls = (args.onSubmit as ReturnType<typeof fn>).mock.calls
    await expect(calls[0][2]).toEqual(calls[1][2])
    await expect(calls[0][2]).toMatch(/^[a-f0-9-]{36}$/)
  },
}

export const DifferentResponse: Story = {
  name: 'Different answers — explicitly start a new response',
  args: {
    protectRetries: true,
    fields: [{ name: 'question', label: 'Your question', type: 'text', required: true }],
    onSubmit: fn(createDifferentResponseDemo()),
  },
  beforeEach: ({ args }) => {
    ;(args.onSubmit as ReturnType<typeof fn>).mockImplementation(createDifferentResponseDemo())
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText(/Your question/), 'My updated question')
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await waitFor(() => expect(canvas.getByRole('status')).toHaveFocus())
    await expect(canvas.getByRole('button', { name: 'Send enquiry' })).toBeDisabled()
    await userEvent.click(canvas.getByRole('button', { name: 'Start a new response' }))
    await expect(canvas.getByLabelText(/Your question/)).toHaveValue('My updated question')
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Demo new response received.'),
    )
    const calls = (args.onSubmit as ReturnType<typeof fn>).mock.calls
    await expect(calls[0][2]).not.toEqual(calls[1][2])
  },
}

export const ConfiguredQuestions: Story = {
  name: 'Help text, initial answers and character limits',
  args: {
    fields: [
      {
        id: 'subject',
        name: 'subject',
        label: 'Enquiry subject',
        type: 'text',
        required: true,
        defaultValue: 'Campus visit',
        helpText: 'Use 5–40 characters so we can route your enquiry.',
        minLength: 5,
        maxLength: 40,
      },
      {
        id: 'details',
        name: 'details',
        label: 'Visit details',
        type: 'textarea',
        helpText: 'Include dates or accessibility needs. Leave blank if you are unsure.',
        minLength: 10,
        maxLength: 300,
      },
      {
        id: 'updates',
        name: 'updates',
        label: 'Include campus updates',
        type: 'checkbox',
        defaultChecked: true,
        helpText: 'Optional. Uncheck this if you only want a reply to this enquiry.',
      },
    ],
  },
}

export const ConfiguredValidation: Story = {
  args: ConfiguredQuestions.args,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const subject = canvas.getByLabelText(/Enquiry subject/)
    await expect(subject).toHaveValue('Campus visit')
    await expect(subject).toHaveAccessibleDescription(
      'Use 5–40 characters so we can route your enquiry.',
    )
    await expect(subject).toHaveAttribute('maxlength', '40')
    await expect(canvas.getByRole('checkbox', { name: 'Include campus updates' })).toBeChecked()
    await userEvent.clear(subject)
    await userEvent.type(subject, 'Hi')
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(
      await canvas.findByText('Enquiry subject must be at least 5 characters.'),
    ).toBeVisible()
    await expect(subject).toHaveAccessibleDescription(/Use 5–40 characters.*must be at least 5/)
    await expect(args.onSubmit).not.toHaveBeenCalled()
    await userEvent.clear(subject)
    await userEvent.type(subject, 'Campus tour')
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(await canvas.findByRole('status')).toHaveTextContent('Demo received.')
  },
}

export const URLAndNumber: Story = {
  name: 'URL and number questions',
  args: {
    description: 'Share a reference and tell us your group size.',
    fields: [
      {
        id: 'reference',
        name: 'reference_link',
        label: 'Reference link',
        type: 'url',
        required: true,
        placeholder: 'https://example.com',
        helpText: 'Include http:// or https://. Do not include login details.',
      },
      {
        id: 'group',
        name: 'group_size',
        label: 'Group size',
        type: 'number',
        required: true,
        defaultValue: '2',
        minValue: 1,
        maxValue: 20,
        step: 1,
        helpText: 'Enter a whole number from 1 to 20.',
      },
      {
        id: 'duration',
        name: 'visit_hours',
        label: 'Visit duration in hours',
        type: 'number',
        minValue: 0.5,
        maxValue: 4,
        step: 0.5,
        helpText: 'Optional. Use half-hour increments, such as 1.5.',
      },
    ],
  },
}
export const URLAndNumberValidation: Story = {
  args: URLAndNumber.args,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const url = canvas.getByLabelText(/Reference link/)
    const group = canvas.getByLabelText(/Group size/)
    await expect(group).toHaveValue('2')
    await expect(group).toHaveAttribute('inputmode', 'decimal')
    await userEvent.type(url, 'example.com')
    await userEvent.clear(group)
    await userEvent.type(group, '2.5')
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(await canvas.findByText(/Reference link must be a full/)).toBeVisible()
    await expect(
      canvas.getByText('Group size must use increments of 1 starting from 1.'),
    ).toBeVisible()
    await expect(url).toHaveFocus()
    await expect(args.onSubmit).not.toHaveBeenCalled()
    await userEvent.clear(url)
    await userEvent.type(url, 'https://example.com/visit')
    await userEvent.clear(group)
    await userEvent.type(group, '3')
    await userEvent.type(canvas.getByLabelText(/Visit duration/), '1.5')
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(await canvas.findByRole('status')).toHaveTextContent('Demo received.')
    await expect(args.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        reference_link: 'https://example.com/visit',
        group_size: '3',
        visit_hours: '1.5',
      }),
    )
  },
}

const choiceOptions = [
  { id: 'admissions', label: 'Admissions', value: 'admissions' },
  { id: 'library', label: 'Library', value: 'library' },
  { id: 'research', label: 'Research', value: 'research' },
]
const choiceFields: SimpleFormField[] = [
  {
    id: 'route',
    name: 'email',
    label: 'Enquiry route',
    type: 'radio',
    required: true,
    helpText: 'Choose one team.',
    options: choiceOptions,
  },
  {
    id: 'interests',
    name: 'interests',
    label: 'Areas of interest',
    type: 'checkboxGroup',
    required: true,
    minSelections: 1,
    maxSelections: 2,
    helpText: 'Choose one or two areas.',
    options: choiceOptions,
  },
  {
    id: 'services',
    name: 'services',
    label: 'Services',
    type: 'multiSelect',
    helpText: 'Search by name; select an option again to remove it.',
    options: choiceOptions,
  },
]

export const ChoiceControls: Story = {
  name: 'Radio, checkbox group and searchable multi-select',
  args: {
    heading: 'Plan your visit',
    description: 'Choose your route and interests.',
    fields: choiceFields,
  },
}

export const ChoiceValidation: Story = {
  name: 'Choices — validation, selection and removal',
  args: ChoiceControls.args,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await waitFor(() => expect(canvas.getAllByRole('radio')[0]).toHaveFocus())
    await userEvent.click(canvas.getAllByRole('radio')[0])
    for (const item of canvas.getAllByRole('checkbox')) await userEvent.click(item)
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(await canvas.findByText(/choose no more than 2/)).toBeVisible()
    await userEvent.click(canvas.getAllByRole('checkbox')[2])
    await userEvent.click(canvas.getByRole('combobox', { name: 'Services' }))
    await userEvent.type(
      await canvas.findByRole('combobox', { name: 'Search Services' }),
      'Library',
    )
    await userEvent.click(await canvas.findByRole('option', { name: 'Library, not selected' }))
    await userEvent.click(await canvas.findByRole('option', { name: 'Library, selected' }))
    await userEvent.clear(await canvas.findByRole('combobox', { name: 'Search Services' }))
    await userEvent.click(canvas.getByRole('option', { name: 'Research, not selected' }))
    await userEvent.keyboard('{Escape}')
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({
        email: 'admissions',
        interests: ['admissions', 'library'],
        services: ['research'],
        website: '',
      }),
    )
    await expect(await canvas.findByRole('status')).toHaveTextContent('Demo received.')
  },
}

export const ChangedChoices: Story = {
  name: 'Changed choices — retain remaining selections',
  args: {
    ...ChoiceControls.args,
    revision: 'old-choice-revision',
    fields: choiceFields.map((field) => ({
      ...field,
      defaultValue: field.type === 'radio' ? 'admissions' : undefined,
      defaultSelections:
        field.type !== 'radio' ? [{ value: 'admissions' }, { value: 'library' }] : undefined,
    })),
    onSubmit: fn(async (_answers: FormAnswers, revision?: string): Promise<GenericFormResult> =>
      revision === 'new-choice-revision'
        ? { success: true, message: 'Demo received. No information has been saved or sent.' }
        : {
            success: false,
            message: 'Questions changed',
            updatedForm: {
              revision: 'new-choice-revision',
              submitButtonLabel: 'Send reviewed choices',
              fields: choiceFields.map((field) => ({
                ...field,
                options: choiceOptions.filter((option) => option.value !== 'library'),
              })),
            },
          },
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await waitFor(() => expect(canvas.getByRole('status')).toHaveFocus())
    await expect(canvas.getByRole('status')).toHaveTextContent('Removed choices were cleared')
    await expect(canvas.getAllByRole('radio')[0]).toBeChecked()
    await expect(canvas.getAllByRole('checkbox')[0]).toBeChecked()
    await expect(canvas.queryByRole('checkbox', { name: 'Library' })).not.toBeInTheDocument()
    await expect(canvas.getByRole('combobox', { name: 'Services' })).toHaveTextContent(
      '1 option selected',
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Send reviewed choices' }))
    await expect(await canvas.findByRole('status')).toHaveTextContent('Demo received.')
  },
}

const temporalFields: SimpleFormField[] = [
  {
    id: 'visit-date',
    name: 'email',
    label: 'Visit date',
    type: 'date',
    required: true,
    minDate: '2026-10-20',
    maxDate: '2026-10-31',
    defaultValue: '2026-10-22',
  },
  {
    id: 'visit-time',
    name: 'visit_time',
    label: 'Visit time',
    type: 'time',
    required: true,
    minTime: '09:00',
    maxTime: '17:00',
    defaultValue: '10:30',
  },
  {
    id: 'reminder',
    name: 'reminder',
    label: 'Send me a reminder',
    type: 'switch',
    defaultChecked: true,
    helpText: 'You can turn this off.',
  },
  {
    id: 'confirmation',
    name: 'confirmed',
    label: 'I confirm my visit details',
    type: 'switch',
    required: true,
  },
]

export const SwitchDateAndTime: Story = {
  name: 'Switch, Date and Time',
  args: {
    heading: 'Arrange a visit',
    description: 'Pick a calendar date and local time.',
    fields: temporalFields,
  },
}

export const TemporalValidation: Story = {
  name: 'Date/Time limits and explicit switch confirmation',
  args: SwitchDateAndTime.args,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await waitFor(() => expect(canvas.getByRole('switch', { name: /I confirm/ })).toHaveFocus())
    await expect(canvas.getByText('I confirm my visit details must be turned on.')).toBeVisible()
    const date = canvas.getByLabelText(/Visit date/) as HTMLInputElement
    const time = canvas.getByLabelText(/Visit time/) as HTMLInputElement
    // Native temporal input editing is browser-owned; fill its canonical value.
    const setValue = (input: HTMLInputElement, value: string) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
    setValue(date, '2026-10-19')
    setValue(time, '18:00')
    await userEvent.click(canvas.getByRole('switch', { name: /I confirm/ }))
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(await canvas.findByText('Visit date must be 2026-10-20 or later.')).toBeVisible()
    await expect(await canvas.findByText('Visit time must be 17:00 or earlier.')).toBeVisible()
    await expect(date).toHaveFocus()
    setValue(date, '2026-10-20')
    setValue(time, '09:00')
    await userEvent.click(canvas.getByRole('switch', { name: 'Send me a reminder' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({
        email: '2026-10-20',
        visit_time: '09:00',
        reminder: false,
        confirmed: true,
        website: '',
      }),
    )
    await expect(await canvas.findByRole('status')).toHaveTextContent('Demo received.')
  },
}

export const ChangedTemporalRules: Story = {
  name: 'Changed date/time rules — review preserved and cleared answers',
  args: {
    ...SwitchDateAndTime.args,
    revision: 'old-temporal',
    onSubmit: fn(async (_values: FormAnswers, revision?: string): Promise<GenericFormResult> =>
      revision === 'new-temporal'
        ? { success: true, message: 'Demo received. No information has been saved or sent.' }
        : {
            success: false,
            message: 'Questions changed',
            updatedForm: {
              revision: 'new-temporal',
              submitButtonLabel: 'Send reviewed visit',
              fields: temporalFields.map((field) =>
                field.type === 'time'
                  ? { ...field, minTime: '11:00', defaultValue: '12:00' }
                  : field.type === 'switch' && field.name === 'reminder'
                    ? { ...field, required: true, defaultChecked: false }
                    : field,
              ),
            },
          },
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('switch', { name: 'Send me a reminder' }))
    await userEvent.click(canvas.getByRole('switch', { name: /I confirm/ }))
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await waitFor(() => expect(canvas.getByRole('status')).toHaveFocus())
    await expect(canvas.getByLabelText(/Visit date/)).toHaveValue('2026-10-22')
    await expect(canvas.getByLabelText(/Visit time/)).toHaveValue('')
    await expect(canvas.getByRole('switch', { name: 'Send me a reminder' })).not.toBeChecked()
    await expect(canvas.getByRole('status')).toHaveTextContent('Visit time, Send me a reminder')
    const time = canvas.getByLabelText(/Visit time/) as HTMLInputElement
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(time, '11:00')
    time.dispatchEvent(new Event('input', { bubbles: true }))
    await userEvent.click(canvas.getByRole('switch', { name: 'Send me a reminder' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Send reviewed visit' }))
    await expect(await canvas.findByRole('status')).toHaveTextContent('Demo received.')
  },
}

export const PrivateFiles: Story = {
  args: {
    heading: 'Send an application',
    description: 'Attach your supporting documents.',
    revision: 'a'.repeat(64),
    protectRetries: true,
    fields: [
      { id: 'applicant', name: 'applicant', label: 'Your name', type: 'text', required: true },
      {
        id: 'documents',
        name: 'supporting_documents',
        label: 'Supporting documents',
        type: 'file',
        required: true,
        maxFiles: 2,
        maxFileSizeMB: 3,
        allowedFileTypes: ['pdf', 'docx', 'png', 'jpg'],
      },
    ],
    onFileUpload: async (file, _field, _revision, _key, uploadID, signal, onProgress) => {
      for (let progress = 0; progress <= 100; progress += 25) {
        await new Promise((resolve) => setTimeout(resolve, 80))
        signal.throwIfAborted()
        onProgress(progress)
      }
      return { token: uploadID, filename: file.name, size: file.size, fileType: 'pdf' }
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText(/Your name/), 'Alex')
    await userEvent.upload(
      canvas.getByLabelText(/Supporting documents/),
      new File(['%PDF-1.7 demo'], 'application.pdf', { type: 'application/pdf' }),
    )
    await waitFor(() => expect(canvas.getByText('Uploaded — ready to send')).toBeVisible())
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(
      await canvas.findByText('Demo received. No information has been saved or sent.'),
    ).toBeVisible()
  },
}

export const LayoutEntries: Story = {
  args: {
    entries: [
      { kind: 'heading', text: 'Enquiry details' },
      { kind: 'description', text: 'Tell us who you are and where to direct your enquiry.' },
      {
        kind: 'group',
        label: 'Your contact details',
        description: 'We use these details only to reply to your enquiry.',
        questions: ['visitor_name', 'reply_to', 'contact_number'],
      },
      { kind: 'separator' },
      {
        kind: 'group',
        label: 'Your enquiry',
        questions: ['preferred_department', 'enquiry_details'],
      },
      { kind: 'question', name: 'contact_permission' },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: 'Enquiry details' })).toBeVisible()
    await expect(canvas.getByRole('group', { name: 'Your contact details' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await waitFor(() => expect(canvas.getByText('Your name is required.')).toBeVisible())
    await userEvent.type(canvas.getByLabelText(/^Your name/), 'Alex Taylor')
    await userEvent.type(canvas.getByLabelText(/^Email address/), 'alex@example.com')
    await userEvent.click(canvas.getByRole('combobox'))
    await userEvent.click(canvas.getByRole('option', { name: 'Library' }))
    await userEvent.click(canvas.getByRole('checkbox'))
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled())
    const values = (args.onSubmit as ReturnType<typeof fn>).mock.calls.at(-1)?.[0]
    await expect(Object.keys(values)).toEqual([
      ...exampleFields.map((field) => field.name),
      'website',
    ])
  },
}

export const LayoutPreview: Story = { args: LayoutEntries.args }
