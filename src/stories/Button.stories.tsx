import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Existing components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Source: @shadcn/button — https://ui.shadcn.com/docs/components/radix/button. This renders the existing project adaptation; it is not an untouched upstream copy.',
      },
    },
  },
  args: {
    children: 'Continue',
    variant: 'default',
    size: 'default',
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    children: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
    },
    size: { control: 'select', options: ['default', 'xs', 'sm', 'lg'] },
  },
} satisfies Meta<typeof Button>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button'))
    await expect(args.onClick).toHaveBeenCalled()
  },
}
export const Outline: Story = { args: { variant: 'outline' } }
export const Disabled: Story = { args: { disabled: true } }
