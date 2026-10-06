import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Label } from '@/components/revamp/ui/label'
import { Input } from '@/components/revamp/ui/input'
const meta = {
  title: 'Components/Forms/Label',
  component: Label,
  parameters: {
    layout: 'padded',
    controls: { include: ['children'] },
    docs: {
      description: {
        component:
          'Fresh @shadcn/label, Radix Luma. Dependency of the sourced Field and Checkbox examples. Source: https://ui.shadcn.com/docs/components/radix/label. Clicking the label focuses its associated control.',
      },
    },
  },
  args: { children: 'Your name', htmlFor: 'sample-label-input' },
  argTypes: { children: { name: 'Label', control: 'text' }, htmlFor: { control: false } },
  render: (args) => (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Label {...args} />
      <Input id="sample-label-input" placeholder="Alex Taylor" />
    </div>
  ),
} satisfies Meta<typeof Label>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const LongLabel: Story = {
  args: { children: 'The name you would like us to use when replying to your enquiry' },
}
