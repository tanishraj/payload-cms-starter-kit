import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { FormExportAction } from '@/components/revamp/form-export-action'

const meta = {
  title: 'Admin/Form export',
  component: FormExportAction,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Existing Button dependency from @shadcnblocks/input-input-special-1. Source: https://www.shadcnblocks.com/components/input. Native inbox integration exports current filters/search across pages; one row per historical answer. No service calls in Storybook. Pending and empty states prevent repeat requests. The admin adapter applies existing Payload shell classes.',
      },
    },
  },
  args: { pending: false, disabled: false, onExport: fn() },
  argTypes: {
    pending: { control: 'boolean', name: 'Preparing download' },
    disabled: { control: 'boolean', name: 'No results / unavailable' },
    className: { control: false },
    onExport: { control: false },
  },
} satisfies Meta<typeof FormExportAction>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Export answers (CSV)' }))
    await expect(args.onExport).toHaveBeenCalledOnce()
  },
}
export const Preparing: Story = { args: { pending: true } }
export const NoResults: Story = { args: { disabled: true } }
