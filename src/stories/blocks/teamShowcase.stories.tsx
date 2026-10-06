import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TeamShowcase } from '@/components/team-showcase'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof TeamShowcase>>('teamShowcase')

const meta = {
  title: 'Blocks/Team Showcase',
  component: TeamShowcase,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'teamShowcase',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Team Showcase. Source: @/components/team-showcase. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof TeamShowcase>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
