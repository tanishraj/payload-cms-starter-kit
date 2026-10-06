import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MediaCarouselBlockComponent } from '@/blocks/MediaCarousel/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof MediaCarouselBlockComponent>>('mediaCarousel')

const meta = {
  title: 'Blocks/Media Carousel',
  component: MediaCarouselBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'mediaCarousel',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Media Carousel. Source: @/blocks/MediaCarousel/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    columns: ['2', '3', '4'],
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof MediaCarouselBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
