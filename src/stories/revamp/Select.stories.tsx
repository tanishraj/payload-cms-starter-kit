import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/revamp/ui/select'
import { Field, FieldLabel } from '@/components/revamp/ui/field'
type Args = ComponentProps<typeof Select> & {
  label: string
  placeholder: string
  size: 'sm' | 'default'
  options: { label: string; value: string }[]
  invalid: boolean
}
const meta = {
  title: 'Components/Forms/Select',
  component: Select,
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'label',
        'placeholder',
        'value',
        'size',
        'options',
        'disabled',
        'required',
        'invalid',
      ],
    },
    docs: {
      description: {
        component:
          'Fresh @shadcn/select, Radix Luma. Dependency of authenticated @shadcnblocks/form-form-patterns-4. Source: https://ui.shadcn.com/docs/components/radix/select. Preserves upstream trigger/menu shape and keyboard interaction. Selection updates the value control.',
      },
    },
  },
  args: {
    label: 'Department',
    placeholder: 'Choose a department',
    value: '',
    size: 'default',
    options: [
      { label: 'Admissions', value: 'admissions' },
      { label: 'Library', value: 'library' },
    ],
    disabled: false,
    required: false,
    invalid: false,
  },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'default'] },
    options: { control: 'object' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { name: 'Invalid appearance', control: 'boolean' },
    onValueChange: { control: false },
  },
  render: function Render({ label, placeholder, size, options, invalid, ...args }) {
    const [, updateArgs] = useArgs<Args>()
    return (
      <div className="w-full max-w-md">
        <Field data-disabled={args.disabled} data-invalid={invalid}>
          <FieldLabel htmlFor="sample-select">{label}</FieldLabel>
          <Select {...args} onValueChange={(value) => updateArgs({ value })}>
            <SelectTrigger id="sample-select" size={size} aria-invalid={invalid}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options
                  .filter((option) => option.value)
                  .map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Small: Story = { args: { size: 'sm' } }
export const Disabled: Story = { args: { disabled: true } }
export const Invalid: Story = { args: { invalid: true } }
