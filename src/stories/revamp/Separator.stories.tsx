import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Separator } from '@/components/revamp/ui/separator'
const meta = {
  title: 'Components/Forms/Separator',
  component: Separator,
  parameters: {
    layout: 'padded',
    controls: { include: ['orientation', 'decorative'] },
    docs: {
      description: {
        component:
          'Fresh @shadcn/separator, Radix Luma. Dependency of the Field composition used by authenticated @shadcnblocks/form-form-patterns-4. Source: https://ui.shadcn.com/docs/components/radix/separator. Preserves upstream horizontal/vertical geometry.',
      },
    },
  },
  args: { orientation: 'horizontal', decorative: true },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    decorative: {
      control: 'boolean',
      description: 'A decorative separator is hidden from assistive technology.',
    },
  },
  render: (args) =>
    args.orientation === 'vertical' ? (
      <div className="flex h-12 items-center gap-4">
        <span>First group</span>
        <Separator {...args} />
        <span>Second group</span>
      </div>
    ) : (
      <div className="flex w-full max-w-md flex-col gap-4">
        <span>First group</span>
        <Separator {...args} />
        <span>Second group</span>
      </div>
    ),
} satisfies Meta<typeof Separator>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Vertical: Story = { args: { orientation: 'vertical' } }
export const Semantic: Story = { args: { decorative: false } }
