import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NewsEventsHighlightsBlockPresentation } from '@/blocks/NewsEventsHighlights/Presentation'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof NewsEventsHighlightsBlockPresentation>>(
    'newsEventsHighlights',
  )

const meta = {
  title: 'Blocks/News & Events Highlights',
  component: NewsEventsHighlightsBlockPresentation,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'newsEventsHighlights',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: News & Events Highlights. Source: @/blocks/NewsEventsHighlights/Presentation. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    carouselControlsPosition: ['top', 'bottom'],
    contentAlignment: ['center', 'left', 'right'],
    imagePositionOverride: ['center', 'top', 'left', 'right', 'bottom', 'item'],
    overlayCoverage: ['split', 'full'],
    overlayDirection: ['vertical', 'bottomToTop', 'leftToRight', 'rightToLeft', 'topToBottom'],
    overlayStyle: ['dark', 'darker', 'light'],
    size: ['none', 'comfortable', 'compact', 'default'],
    themeMode: ['brand', 'dark', 'light', 'auto'],
  }),
} satisfies Meta<typeof NewsEventsHighlightsBlockPresentation>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
