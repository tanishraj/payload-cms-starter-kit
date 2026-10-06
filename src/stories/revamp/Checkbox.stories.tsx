import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import { Checkbox } from '@/components/revamp/ui/checkbox'
import { Field, FieldLabel } from '@/components/revamp/ui/field'
type Args = ComponentProps<typeof Checkbox> & { label: string }
const meta = {
  title: 'Components/Forms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'padded',
    controls: { include: ['label', 'checked', 'disabled', 'required', 'aria-invalid'] },
    docs: {
      description: {
        component:
          'Fresh @shadcn/checkbox, Radix Luma. Dependency of authenticated @shadcnblocks/checkbox-checkbox-standard-1. Source: https://ui.shadcn.com/docs/components/radix/checkbox. The sourced checkbox/label row is preserved. Clicking updates the checked control.',
      },
    },
  },
  args: {
    label: 'Accept terms and conditions',
    checked: false,
    disabled: false,
    required: false,
    'aria-invalid': false,
  },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'select', options: [false, true, 'indeterminate'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    'aria-invalid': { name: 'Invalid appearance', control: 'boolean' },
    onCheckedChange: { control: false },
  },
  render: function Render({ label, ...args }) {
    const [, updateArgs] = useArgs<Args>()
    return (
      <Field
        orientation="horizontal"
        data-disabled={args.disabled}
        data-invalid={args['aria-invalid']}
        className="gap-2"
      >
        <Checkbox
          {...args}
          id="sample-checkbox"
          aria-required={args.required}
          onCheckedChange={(checked) => updateArgs({ checked })}
        />
        <FieldLabel htmlFor="sample-checkbox">{label}</FieldLabel>
      </Field>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Checked: Story = { args: { checked: true } }
export const Indeterminate: Story = { args: { checked: 'indeterminate' } }
export const Disabled: Story = { args: { disabled: true } }
