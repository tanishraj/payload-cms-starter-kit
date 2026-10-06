import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProfileCarouselBlockComponent } from '@/blocks/ProfileCarousel/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof ProfileCarouselBlockComponent>>('profileCarousel')

const meta = {
  title: 'Blocks/Profile Carousel',
  component: ProfileCarouselBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'profileCarousel',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Profile Carousel. Source: @/blocks/ProfileCarousel/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    cardVariant: ['stacked', 'overlay'],
    contentAlignment: ['center', 'left', 'right'],
    overlayCoverage: ['split', 'full'],
    overlayDirection: ['vertical', 'bottomToTop', 'leftToRight', 'rightToLeft', 'topToBottom'],
    overlayStyle: ['dark', 'darker', 'light'],
    overlayAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
    themeMode: ['brand', 'dark', 'light', 'auto'],
  }),
} satisfies Meta<typeof ProfileCarouselBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
