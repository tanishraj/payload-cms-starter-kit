import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { VideoEmbedBlockComponent } from '@/blocks/VideoEmbed/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof VideoEmbedBlockComponent>>('videoEmbed')

const meta = {
  title: 'Blocks/Video Embed',
  component: VideoEmbedBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'videoEmbed',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Video Embed. Source: @/blocks/VideoEmbed/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    aspectRatio: ['16/9', '4/3', '1/1', '9/16'],
    contentAlignment: ['center', 'left', 'right'],
    maxWidth: ['full', 'lg', 'md'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof VideoEmbedBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
