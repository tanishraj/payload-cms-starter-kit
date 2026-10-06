import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EventGallery } from '@/components/event-gallery'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof EventGallery>>('eventGallery')

const meta = {
  title: 'Blocks/Event Gallery',
  component: EventGallery,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'eventGallery',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Event Gallery. Source: @/components/event-gallery. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    alignment: ['center', 'left', 'right'],
    overlayCoverage: ['split', 'full'],
    overlayDirection: ['vertical', 'bottomToTop', 'leftToRight', 'rightToLeft', 'topToBottom'],
    overlayStyle: ['dark', 'darker', 'light'],
    size: ['none', 'comfortable', 'compact', 'default'],
    themeMode: ['brand', 'dark', 'light', 'auto'],
  }),
} satisfies Meta<typeof EventGallery>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
