import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NumberedStepsBlockComponent } from '@/blocks/NumberedSteps/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof NumberedStepsBlockComponent>>('numberedSteps')

const meta = {
  title: 'Blocks/Numbered Steps',
  component: NumberedStepsBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'numberedSteps',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Numbered Steps. Source: @/blocks/NumberedSteps/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    numberStyle: ['circle', 'outlined', 'serif'],
    size: ['none', 'comfortable', 'compact', 'default'],
    variant: ['vertical', 'cards', 'alternating'],
  }),
} satisfies Meta<typeof NumberedStepsBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
