import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FeatureMatrixBlockComponent } from '@/blocks/FeatureMatrix/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof FeatureMatrixBlockComponent>>('featureMatrix')

const meta = {
  title: 'Blocks/Feature Matrix',
  component: FeatureMatrixBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'featureMatrix',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Feature Matrix. Source: @/blocks/FeatureMatrix/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof FeatureMatrixBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
