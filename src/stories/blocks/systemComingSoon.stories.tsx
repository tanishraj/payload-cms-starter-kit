import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SystemComingSoonBlockComponent } from '@/blocks/SystemComingSoon/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof SystemComingSoonBlockComponent>>('systemComingSoon')

const meta = {
  title: 'Blocks/System Coming Soon',
  component: SystemComingSoonBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'systemComingSoon',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: System Coming Soon. Source: @/blocks/SystemComingSoon/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {}),
} satisfies Meta<typeof SystemComingSoonBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const LongDescription: Story = {
  args: {
    description:
      'Longer sample content helps review how this existing block wraps on smaller screens and handles editorial copy.',
  },
}
