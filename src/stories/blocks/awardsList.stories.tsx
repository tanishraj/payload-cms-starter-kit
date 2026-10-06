import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AwardsListBlockComponent } from '@/blocks/AwardsList/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof AwardsListBlockComponent>>('awardsList')

const meta = {
  title: 'Blocks/Awards List',
  component: AwardsListBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'awardsList',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Awards List. Source: @/blocks/AwardsList/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
    variant: ['cards', 'table', 'rows'],
  }),
} satisfies Meta<typeof AwardsListBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
