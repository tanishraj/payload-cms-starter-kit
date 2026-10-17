import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import {
  PageSectionSelect,
  type PageSectionSelectProps,
} from '@/components/revamp/page-section-select'

const meta = {
  title: 'Admin/Page section',
  component: PageSectionSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Sources: authenticated @shadcnblocks/field-field-selects-2 and @shadcnblocks/select-select-full-width. Production Page creation supplies only assigned, access-checked roots through native Pages REST. No account data or API calls in this workshop.',
      },
    },
  },
  args: {
    options: [
      { id: 'admissions', label: 'Admissions (/admissions)' },
      { id: 'campus', label: 'Campus (/campus)' },
    ],
    value: '',
    status: 'ready',
    disabled: false,
    invalid: false,
    onChange: fn(),
    onRetry: fn(),
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Available root IDs and labels, authorized by the native API.',
    },
    value: {
      control: 'text',
      description: 'Selected section ID; a single available root is inferred by the controller.',
    },
    status: { control: 'select', options: ['loading', 'ready', 'empty', 'error'] },
    disabled: { control: 'boolean', name: 'Draft creation pending' },
    invalid: { control: 'boolean', name: 'Section choice required' },
    onChange: { control: false },
    onRetry: { control: false },
  },
} satisfies Meta<typeof PageSectionSelect>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Website section' }))
    await userEvent.click(await canvas.findByRole('option', { name: 'Campus (/campus)' }))
    await expect(args.onChange).toHaveBeenCalledWith('campus')
  },
}
export const SingleSection: Story = {
  args: { options: [{ id: 'admissions', label: 'Admissions (/admissions)' }], value: 'admissions' },
}
export const Loading: Story = { args: { options: [], status: 'loading' } }
export const NoSections: Story = { args: { options: [], status: 'empty' } }
export const LoadFailed: Story = {
  args: { options: [], status: 'error' },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Try loading sections again' }),
    )
    await expect(args.onRetry).toHaveBeenCalled()
  },
}
export const CreatingDraft: Story = { args: { value: 'campus', disabled: true } }
export const MissingChoice: Story = { args: { invalid: true } }
export const LongSection: Story = {
  args: {
    options: [
      {
        id: 'long',
        label:
          'International admissions and student support services (/international-admissions-and-student-support)',
      },
    ],
    value: 'long',
  },
}
function Interactive(props: PageSectionSelectProps) {
  const [value, setValue] = useState(props.value)
  return <PageSectionSelect {...props} value={value} onChange={setValue} />
}
export const Playground: Story = { render: (args) => <Interactive {...args} /> }
