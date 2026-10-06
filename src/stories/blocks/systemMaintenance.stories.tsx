import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SystemMaintenanceBlockComponent } from '@/blocks/SystemMaintenance/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof SystemMaintenanceBlockComponent>>('systemMaintenance')

const meta = {
  title: 'Blocks/System Maintenance',
  component: SystemMaintenanceBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'systemMaintenance',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: System Maintenance. Source: @/blocks/SystemMaintenance/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {}),
} satisfies Meta<typeof SystemMaintenanceBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const LongDescription: Story = {
  args: {
    description:
      'Longer sample content helps review how this existing block wraps on smaller screens and handles editorial copy.',
  },
}
