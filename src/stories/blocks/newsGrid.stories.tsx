import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NewsGridBlockPresentation } from '@/blocks/NewsGrid/Presentation'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof NewsGridBlockPresentation>>('newsGrid')

const meta = {
  title: 'Blocks/News Grid',
  component: NewsGridBlockPresentation,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'newsGrid',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: News Grid. Source: @/blocks/NewsGrid/Presentation. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    cardsPerRow: ['2', '3', '4'],
    contentAlignment: ['center', 'left', 'right'],
    headerActionAlignment: ['center', 'top', 'bottom'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof NewsGridBlockPresentation>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
