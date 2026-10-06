import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NewsEventsTabsBlockPresentation } from '@/blocks/NewsEventsTabs/Presentation'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof NewsEventsTabsBlockPresentation>>('newsEventsTabs')

const meta = {
  title: 'Blocks/News & Events Tabs',
  component: NewsEventsTabsBlockPresentation,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'newsEventsTabs',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: News & Events Tabs. Source: @/blocks/NewsEventsTabs/Presentation. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    cardsPerRow: ['2', '3', '4'],
    contentAlignment: ['center', 'left', 'right'],
    headerActionAlignment: ['center', 'top', 'bottom'],
    layoutStyle: ['cardGrid', 'editorialList'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof NewsEventsTabsBlockPresentation>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
