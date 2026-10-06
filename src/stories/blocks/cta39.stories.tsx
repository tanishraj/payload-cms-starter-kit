import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Cta39BlockComponent } from '@/blocks/Cta39/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof Cta39BlockComponent>>('cta39')

const meta = {
  title: 'Blocks/Call to Action',
  component: Cta39BlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'cta39',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Call to Action. Source: @/blocks/Cta39/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    actionLayout: ['stacked', 'inline'],
    contentAlignment: ['center', 'left', 'right'],
    headerLayout: ['split', 'stacked', 'actionSplit'],
    size: ['none', 'comfortable', 'compact', 'default'],
    splitContentAlignment: ['center', 'top', 'bottom'],
  }),
} satisfies Meta<typeof Cta39BlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
