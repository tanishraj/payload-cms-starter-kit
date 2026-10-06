import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconCardShowcaseBlockComponent } from '@/blocks/IconCardShowcase/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof IconCardShowcaseBlockComponent>>('iconCardShowcase')

const meta = {
  title: 'Blocks/Icon Card Showcase',
  component: IconCardShowcaseBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'iconCardShowcase',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Icon Card Showcase. Source: @/blocks/IconCardShowcase/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    cardHeight: ['compact', 'standard', 'tall'],
    cardContentAlignment: ['center', 'left', 'right'],
    cardWidth: ['compact', 'wide', 'standard'],
    contentAlignment: ['center', 'left', 'right'],
    defaultCardBackground: [
      'subtle',
      'brand',
      'gradient-subtle',
      'gradient-brand',
      'default',
      'muted',
      'primary',
      'secondary',
      'accent',
    ],
    headerLayout: ['split', 'stacked'],
    iconSize: ['large', 'small', 'standard', 'extraLarge'],
    overlayCoverage: ['split', 'full'],
    overlayDirection: ['vertical', 'bottomToTop', 'leftToRight', 'rightToLeft', 'topToBottom'],
    overlayStyle: ['dark', 'darker', 'light'],
    size: ['none', 'comfortable', 'compact', 'default'],
    splitContentAlignment: ['center', 'top', 'bottom'],
    themeMode: ['brand', 'dark', 'light', 'auto'],
  }),
} satisfies Meta<typeof IconCardShowcaseBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
