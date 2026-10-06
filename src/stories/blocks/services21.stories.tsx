import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Services21BlockComponent } from '@/blocks/Services21/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof Services21BlockComponent>>('services21')

const meta = {
  title: 'Blocks/Services',
  component: Services21BlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'services21',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Services. Source: @/blocks/Services21/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof Services21BlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const LongTitle: Story = {
  args: { title: 'A longer title to review wrapping and spacing across different screen sizes' },
}
