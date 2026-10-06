import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Mail, MapPin, MessagesSquare, Phone } from 'lucide-react'
import type { Contact6Props } from '@/components/revamp/contact6'
import type { GenericFormProps, GenericFormResult } from '@/components/revamp/generic-form'
import type { Contact6Block } from '@/payload-types'
import { Contact6BlockPresentation } from '@/blocks/Contact6/Presentation'
import { Contact6 } from '@/components/revamp/contact6'

type StoryArgs = Omit<Contact6Props, 'form' | 'contactInfo'> & {
  unavailable?: boolean
  contactInfo?: Contact6Block['contactInfo']
} & Pick<
    GenericFormProps,
    'fields' | 'submitButtonLabel' | 'pendingLabel' | 'disabled' | 'onSubmit'
  >

function Contact6StoryPresentation(args: StoryArgs) {
  return (
    <Contact6
      {...args}
      contactInfo={args.contactInfo?.map(({ icon, ...info }) => ({
        ...info,
        icon: { email: Mail, chat: MessagesSquare, phone: Phone, location: MapPin }[icon],
      }))}
      form={
        args.unavailable
          ? null
          : {
              fields: args.fields,
              submitButtonLabel: args.submitButtonLabel,
              pendingLabel: args.pendingLabel,
              disabled: args.disabled,
              onSubmit: args.onSubmit,
            }
      }
    />
  )
}

const meta = {
  title: 'Blocks/Contact6',
  component: Contact6StoryPresentation,
  tags: ['autodocs'],

  parameters: {
    blockSlug: 'contact6',
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Authenticated @shadcnblocks/contact6 (2026-10-07), https://www.shadcnblocks.com/block/contact6. Original contact cards, message card, centered introduction and information footer. Questions come from a reusable Form; no fixed contact inputs. The first two short controls share a row on wider screens; textarea/checkbox pairs stay stacked. All six current controls, custom names/labels and the same generic validation/submission engine. Source-supported layout and official Neutral light/dark; production inherits the existing website theme. Synthetic data and local callbacks only. CMS preview never submits. Edit Form to change questions, options, required state, labels and pending text.',
      },
    },
  },
  args: {
    heading: 'Contact Us',
    description:
      'Ready to start your next project? Our team is here to help you succeed. Reach out and let’s discuss how we can bring your ideas to life.',
    formTitle: 'Send us a message',
    formDescription: 'Fill out the form below and we’ll get back to you within 24 hours.',
    contactInfo: [
      {
        icon: 'email',
        title: 'Email',
        description: 'Get a response within 24 hours',
        value: 'hello@company.com',
        href: 'mailto:hello@company.com',
      },
      {
        icon: 'chat',
        title: 'Live Chat',
        description: 'Instant support available now',
        value: 'Start chatting',
        href: '#chat',
      },
      {
        icon: 'phone',
        title: 'Phone',
        description: 'Mon-Fri, 9AM-6PM EST',
        value: '+1 (555) 123-4567',
        href: 'tel:+15551234567',
      },
      {
        icon: 'location',
        title: 'Office',
        description: 'Schedule an in-person meeting',
        value: '123 Innovation St, Tech City',
      },
    ],
    officeHoursTitle: 'Office Hours',
    officeHours: [
      { label: 'Monday - Friday', value: '9:00 AM - 6:00 PM EST' },
      { label: 'Saturday', value: '10:00 AM - 4:00 PM EST' },
      { label: 'Sunday', value: 'Closed' },
    ],
    contactDetailsTitle: 'Contact Information',
    contactDetails: [
      { label: 'Email', value: 'hello@company.com' },
      { label: 'Phone', value: '+1 (555) 123-4567' },
      { label: 'Address', value: '123 Innovation St, Tech City' },
    ],
    fields: [
      { name: 'visitor_name', label: 'Your name', type: 'text', required: true },
      { name: 'reply_address', label: 'Your email', type: 'email', required: true },
      {
        name: 'preferred_department',
        label: 'Department',
        type: 'select',
        required: true,
        options: [
          { label: 'Admissions', value: 'admissions' },
          { label: 'Library', value: 'library' },
        ],
      },
      { name: 'phone_number', label: 'Phone number', type: 'phone' },
      { name: 'enquiry_details', label: 'How can we help?', type: 'textarea' },
      {
        name: 'contact_permission',
        label: 'You may contact me about this enquiry',
        type: 'checkbox',
        required: true,
      },
    ],
    submitButtonLabel: 'Send enquiry',
    pendingLabel: 'Sending…',
    disabled: false,
    onSubmit: fn(async () => ({
      success: true,
      message: 'Demo received. No information has been saved or sent.',
    })),
    preview: false,
  },
  argTypes: {
    heading: { control: 'text' },
    description: { control: 'text' },
    formTitle: { control: 'text' },
    formDescription: { control: 'text' },
    contactInfo: {
      control: 'object',
      description:
        'Editable contact cards with email, chat, phone or location icon keys. The presentation receives typed Lucide icon objects.',
    },
    unavailable: { control: 'boolean' },
    fields: { name: 'Questions and controls', control: 'object' },
    submitButtonLabel: { control: 'text' },
    pendingLabel: { control: 'text' },
    disabled: { control: 'boolean' },
    onSubmit: { control: false },
    officeHoursTitle: { control: 'text' },
    officeHours: { control: 'object' },
    contactDetailsTitle: { control: 'text' },
    contactDetails: { control: 'object' },
    preview: { control: 'boolean' },
    className: { control: false },
  },
} satisfies Meta<StoryArgs>
export default meta
type Story = StoryObj<StoryArgs>
export const Default: Story = {}
export const CMSPreview: Story = {
  args: { preview: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Send enquiry' })).toBeDisabled()
  },
}
export const Unavailable: Story = { args: { unavailable: true } }
export const OneQuestion: Story = {
  args: {
    fields: [{ name: 'question', label: 'Your question', type: 'textarea', required: true }],
  },
}
export const LongContent: Story = {
  args: {
    contactDetails: [
      {
        label: 'Office address',
        value:
          'International Admissions and Student Support Centre, 123 Innovation Street, Technology City',
      },
    ],
    fields: [
      {
        name: 'accessibility',
        label:
          'Tell us about any accessibility adjustments you would like us to consider before your upcoming visit',
        type: 'textarea',
        required: true,
      },
    ],
  },
}
export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(canvas.getByText('Your name is required.')).toBeVisible()
    await expect(canvas.getByLabelText(/Your name/)).toHaveFocus()
  },
}
export const SuccessfulSubmission: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText(/Your name/), 'Alex')
    await userEvent.type(canvas.getByLabelText(/Your email/), 'alex@example.com')
    await userEvent.click(canvas.getByRole('combobox'))
    await userEvent.click(await within(document.body).findByRole('option', { name: 'Admissions' }))
    await userEvent.click(canvas.getByRole('checkbox'))
    await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }))
    await expect(args.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        visitor_name: 'Alex',
        preferred_department: 'admissions',
        contact_permission: true,
      }),
    )
    await expect(canvas.getByRole('status')).toHaveTextContent('Demo received.')
    await expect(canvas.getByRole('status')).toHaveFocus()
  },
}

export const WebsitePreview: Story = {
  name: 'Website CMS preview',
  parameters: { websiteBlock: true },
  render: (args) => (
    <Contact6BlockPresentation
      heading={args.heading}
      description={args.description}
      formTitle={args.formTitle}
      formDescription={args.formDescription}
      officeHoursTitle={args.officeHoursTitle}
      officeHours={args.officeHours}
      contactDetailsTitle={args.contactDetailsTitle}
      contactDetails={args.contactDetails}
      contactInfo={args.contactInfo ?? []}
      preview
      size="compact"
      definition={{
        slug: 'storybook-demo',
        fields: args.fields,
        submitButtonLabel: args.submitButtonLabel ?? 'Submit',
      }}
    />
  ),
}
export const Pending: Story = {
  args: { onSubmit: fn(() => new Promise<GenericFormResult>(() => {})) },
}
export const NetworkFailure: Story = {
  args: {
    onSubmit: fn(async () => {
      throw new Error('Demo connection loss')
    }),
  },
}
