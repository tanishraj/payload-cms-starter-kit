import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/revamp/ui/field'
import { Input } from '@/components/revamp/ui/input'
type Args = ComponentProps<typeof Field> & {
  label: string
  description: string
  placeholder: string
  invalid: boolean
  errorMessage: string
  disabled: boolean
}
const meta = {
  title: 'Components/Forms/Field',
  component: Field,
  parameters: {
    layout: 'padded',
    controls: {
      include: [
        'label',
        'description',
        'placeholder',
        'orientation',
        'invalid',
        'disabled',
        'errorMessage',
      ],
    },
    docs: {
      description: {
        component:
          'Fresh @shadcn/field, Radix Luma. Dependency of authenticated @shadcnblocks/form-form-patterns-4. Source: https://ui.shadcn.com/docs/components/radix/field. Uses original FieldGroup/Field/FieldContent/Label/Description/Error composition and upstream orientations.',
      },
    },
  },
  args: {
    label: 'Your name',
    description: 'The name we should use when replying.',
    placeholder: 'Alex Taylor',
    orientation: 'vertical',
    invalid: false,
    disabled: false,
    errorMessage: 'Enter your name.',
  },
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    placeholder: { control: 'text' },
    orientation: { control: 'select', options: ['vertical', 'horizontal', 'responsive'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    errorMessage: { name: 'Error message', control: 'text' },
  },
  render: ({ label, description, placeholder, invalid, disabled, errorMessage, ...args }) => (
    <div className="w-full max-w-md">
      <FieldGroup>
        <Field {...args} data-invalid={invalid} data-disabled={disabled}>
          <FieldContent>
            <FieldLabel htmlFor="sample-field">{label}</FieldLabel>
            {description && (
              <FieldDescription id="sample-field-description">{description}</FieldDescription>
            )}
          </FieldContent>
          <Input
            id="sample-field"
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={
              invalid ? 'sample-field-error' : description ? 'sample-field-description' : undefined
            }
          />
          {invalid && <FieldError id="sample-field-error">{errorMessage}</FieldError>}
        </Field>
      </FieldGroup>
    </div>
  ),
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Invalid: Story = { args: { invalid: true } }
export const Horizontal: Story = { args: { orientation: 'horizontal' } }
export const Responsive: Story = { args: { orientation: 'responsive' } }
export const Disabled: Story = { args: { disabled: true } }
