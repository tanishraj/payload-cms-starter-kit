import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RatingSpotlightBlockPresentation } from '@/blocks/RatingSpotlight/Presentation'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof RatingSpotlightBlockPresentation>>('ratingSpotlight')

const meta = {
  title: 'Blocks/Rating Spotlight',
  component: RatingSpotlightBlockPresentation,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'ratingSpotlight',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Rating Spotlight. Source: @/blocks/RatingSpotlight/Presentation. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof RatingSpotlightBlockPresentation>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
