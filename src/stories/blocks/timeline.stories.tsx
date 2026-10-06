import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TimelineBlockComponent } from '@/blocks/Timeline/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof TimelineBlockComponent>>('timeline')

const meta = {
  title: 'Blocks/Timeline',
  component: TimelineBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'timeline',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Timeline. Source: @/blocks/Timeline/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
    variant: ['horizontal', 'vertical', 'alternating'],
  }),
} satisfies Meta<typeof TimelineBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
