import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BannerCtaBlockComponent } from '@/blocks/BannerCta/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof BannerCtaBlockComponent>>('bannerCta')

const meta = {
  title: 'Blocks/Banner CTA',
  component: BannerCtaBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'bannerCta',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Banner CTA. Source: @/blocks/BannerCta/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    actionPlacement: ['side', 'below'],
    contentAlignment: ['center', 'left', 'right'],
    contentWidth: ['default', 'narrow', 'wide'],
    height: ['compact', 'default', 'immersive'],
    overlayCoverage: ['split', 'full'],
    overlayDirection: ['vertical', 'bottomToTop', 'leftToRight', 'rightToLeft', 'topToBottom'],
    overlayStyle: ['dark', 'darker', 'light'],
    size: ['none', 'comfortable', 'compact', 'default'],
    themeMode: ['brand', 'dark', 'light', 'auto'],
  }),
} satisfies Meta<typeof BannerCtaBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const LongTitle: Story = {
  args: { title: 'A longer title to review wrapping and spacing across different screen sizes' },
}
