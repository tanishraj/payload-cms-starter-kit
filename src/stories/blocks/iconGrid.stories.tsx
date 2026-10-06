import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconGridBlockComponent } from '@/blocks/IconGrid/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof IconGridBlockComponent>>('iconGrid')

const meta = {
  title: 'Blocks/Icon Grid',
  component: IconGridBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'iconGrid',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Icon Grid. Source: @/blocks/IconGrid/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    actionMode: ['link', 'button'],
    actionVariant: ['default', 'link', 'outline', 'primary', 'secondary', 'white', 'whiteOutline'],
    columns: ['2', '3', '4'],
    contentAlignment: ['center', 'left', 'right'],
    iconStyle: ['circle', 'outline', 'plain', 'square'],
    size: ['none', 'comfortable', 'compact', 'default'],
    variant: ['ruled', 'card', 'contactCards', 'minimal', 'iconTop'],
  }),
} satisfies Meta<typeof IconGridBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
