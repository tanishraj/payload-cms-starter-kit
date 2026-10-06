import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BentoGridBlockComponent } from '@/blocks/BentoGrid/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof BentoGridBlockComponent>>('bentoGrid')

const meta = {
  title: 'Blocks/Bento Grid',
  component: BentoGridBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'bentoGrid',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Bento Grid. Source: @/blocks/BentoGrid/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof BentoGridBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
