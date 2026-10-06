import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReviewSubmissionBlockComponent } from '@/blocks/ReviewSubmission/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof ReviewSubmissionBlockComponent>>('reviewSubmission')

const meta = {
  title: 'Blocks/Review Submission',
  component: ReviewSubmissionBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'reviewSubmission',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Review Submission. Source: @/blocks/ReviewSubmission/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof ReviewSubmissionBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
