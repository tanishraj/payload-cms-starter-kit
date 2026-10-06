import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Textarea } from '@/components/revamp/ui/textarea'
import { Field, FieldLabel } from '@/components/revamp/ui/field'
type Args = ComponentProps<typeof Textarea> & { label: string }
const meta = {
  title: 'Components/Forms/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'label',
        'placeholder',
        'rows',
        'disabled',
        'required',
        'readOnly',
        'aria-invalid',
        'maxLength',
      ],
    },
    docs: {
      description: {
        component:
          'Fresh official @shadcn/textarea, Radix Luma. Installed as a dependency of authenticated @shadcnblocks/form-form-patterns-4. Source: https://ui.shadcn.com/docs/components/radix/textarea. Upstream styling preserved; layout wrapper only.',
      },
    },
  },
  args: {
    label: 'Your answer',
    placeholder: 'Enter an answer',
    disabled: false,
    required: false,
    readOnly: false,
    'aria-invalid': false,
  },
  argTypes: {
    label: { name: 'Label', control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    'aria-invalid': { name: 'Invalid appearance', control: 'boolean' },
    maxLength: { name: 'Character limit', control: 'number' },
    rows: { name: 'Rows', control: 'number' },
  },
  render: ({ label, ...args }) => (
    <div className="w-full max-w-md">
      <Field data-disabled={args.disabled} data-invalid={args['aria-invalid']}>
        <FieldLabel htmlFor="sample-textarea">{label}</FieldLabel>
        <Textarea {...args} id="sample-textarea" />
      </Field>
    </div>
  ),
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
export const Invalid: Story = { args: { 'aria-invalid': true } }
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'An existing answer' } }
