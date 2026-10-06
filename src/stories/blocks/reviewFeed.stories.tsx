import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReviewFeed } from '@/components/review-feed'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof ReviewFeed>>('reviewFeed')

const meta = {
  title: 'Blocks/Review Feed',
  component: ReviewFeed,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'reviewFeed',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Review Feed. Source: @/components/review-feed. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof ReviewFeed>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
