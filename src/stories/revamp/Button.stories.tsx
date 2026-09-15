import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ArrowRight, Plus } from 'lucide-react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button } from '@/components/revamp/ui/button'

type PlaygroundArgs = ComponentProps<typeof Button> & {
  icon: 'none' | 'arrow' | 'plus'
  iconPosition: 'start' | 'end'
}
const icons = { arrow: ArrowRight, plus: Plus }

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    controls: {
      include: [
        'children',
        'variant',
        'size',
        'disabled',
        'icon',
        'iconPosition',
        'type',
        'aria-label',
      ],
    },
    docs: {
      description: {
        component:
          'Fresh official @shadcn/button, Radix Luma style, installed with the shadcn CLI. Source: https://ui.shadcn.com/docs/components/radix/button. Uses official Neutral light/dark tokens. Icon controls compose Lucide icons inside the original Button; no upstream styles are changed. Payload integration is deferred.',
      },
    },
  },
  args: {
    children: 'Continue',
    variant: 'default',
    size: 'default',
    disabled: false,
    icon: 'none',
    iconPosition: 'end',
    type: 'button',
    'aria-label': 'Continue',
    onClick: fn(),
  },
  argTypes: {
    children: {
      name: 'Label',
      control: 'text',
      description: 'Visible button text; icon-only sizes use the accessible label.',
    },
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
      description: 'Original upstream visual variant.',
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
    disabled: { control: 'boolean' },
    icon: {
      control: 'select',
      options: ['none', 'arrow', 'plus'],
      description: 'Sample icon composition; icon-only sizes default to an arrow.',
    },
    iconPosition: { control: 'inline-radio', options: ['start', 'end'] },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
    'aria-label': {
      name: 'Accessible label',
      control: 'text',
      description: 'Required for icon-only buttons.',
    },
  },
  render: ({ icon, iconPosition, children, ...args }) => {
    const iconOnly = args.size?.startsWith('icon')
    const Icon = icon === 'none' ? (iconOnly ? ArrowRight : null) : icons[icon]
    return (
      <Button {...args} aria-label={iconOnly ? args['aria-label'] : undefined}>
        {Icon && (iconOnly || iconPosition === 'start') ? <Icon data-icon="inline-start" /> : null}
        {iconOnly ? null : children}
        {Icon && !iconOnly && iconPosition === 'end' ? <Icon data-icon="inline-end" /> : null}
      </Button>
    )
  },
} satisfies Meta<PlaygroundArgs>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button')
    // Controls may disable the button; exercise the state currently displayed.
    if (args.disabled) {
      await expect(button).toBeDisabled()
    } else {
      await userEvent.click(button)
      await expect(args.onClick).toHaveBeenCalled()
    }
  },
}
export const Outline: Story = { args: { variant: 'outline' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete' } }
export const Disabled: Story = { args: { disabled: true } }
export const WithIcon: Story = { args: { icon: 'arrow' } }
export const IconOnly: Story = { args: { size: 'icon', icon: 'plus', 'aria-label': 'Add item' } }
export const AsLink: Story = {
  parameters: { controls: { exclude: ['type', 'icon', 'iconPosition', 'disabled', 'aria-label'] } },
  render: ({ variant, size, children }) => (
    <Button asChild variant={variant} size={size}>
      <a href="#button-example">{children}</a>
    </Button>
  ),
  args: { variant: 'link', children: 'View details' },
}
