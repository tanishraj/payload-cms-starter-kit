import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HeroCarouselBlockComponent } from '@/blocks/HeroCarousel/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof HeroCarouselBlockComponent>>('heroCarousel')

const meta = {
  title: 'Blocks/Hero Carousel',
  component: HeroCarouselBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'heroCarousel',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Hero Carousel. Source: @/blocks/HeroCarousel/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    height: ['compact', 'default', 'immersive'],
    overlayCoverage: ['split', 'full'],
    overlayDirection: ['vertical', 'bottomToTop', 'leftToRight', 'rightToLeft', 'topToBottom'],
    overlayStyle: ['dark', 'darker', 'light'],
    themeMode: ['brand', 'dark', 'light', 'auto'],
  }),
} satisfies Meta<typeof HeroCarouselBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
