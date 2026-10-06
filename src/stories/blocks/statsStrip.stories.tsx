import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StatsStripBlockComponent } from '@/blocks/StatsStrip/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof StatsStripBlockComponent>>('statsStrip')

const meta = {
  title: 'Blocks/Stats Strip',
  component: StatsStripBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'statsStrip',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Stats Strip. Source: @/blocks/StatsStrip/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, { size: ['none', 'comfortable', 'compact', 'default'] }),
} satisfies Meta<typeof StatsStripBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
