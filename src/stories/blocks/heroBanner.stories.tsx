import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HeroBannerBlockComponent } from '@/blocks/HeroBanner/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof HeroBannerBlockComponent>>('heroBanner')

const meta = {
  title: 'Blocks/Hero Banner',
  component: HeroBannerBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'heroBanner',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Hero Banner. Source: @/blocks/HeroBanner/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentWidth: ['default', 'narrow', 'wide'],
    height: ['compact', 'default', 'immersive', 'balanced', '40', '60', '80'],
    horizontalAlignment: ['center', 'left', 'right'],
    overlayCoverage: ['split', 'full'],
    overlayDirection: ['vertical', 'bottomToTop', 'leftToRight', 'rightToLeft', 'topToBottom'],
    overlayStyle: ['brand', 'dark', 'darker', 'light', 'darkest', 'ink', 'soft'],
    themeMode: ['brand', 'dark', 'light', 'auto'],
    verticalAlignment: ['center', 'top', 'bottom'],
  }),
} satisfies Meta<typeof HeroBannerBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const LongTitle: Story = {
  args: { title: 'A longer title to review wrapping and spacing across different screen sizes' },
}
