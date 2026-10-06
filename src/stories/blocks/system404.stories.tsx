import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { System404BlockComponent } from '@/blocks/System404/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof System404BlockComponent>>('system404')

const meta = {
  title: 'Blocks/System 404',
  component: System404BlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'system404',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: System 404. Source: @/blocks/System404/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {}),
} satisfies Meta<typeof System404BlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const LongDescription: Story = {
  args: {
    description:
      'Longer sample content helps review how this existing block wraps on smaller screens and handles editorial copy.',
  },
}
