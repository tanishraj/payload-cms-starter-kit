import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AnnouncementBlockComponent } from '@/blocks/Announcement/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof AnnouncementBlockComponent>>('announcement')

const meta = {
  title: 'Blocks/Announcement',
  component: AnnouncementBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'announcement',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Announcement. Source: @/blocks/Announcement/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, { displayMode: ['horizontal', 'marquee', 'vertical'] }),
} satisfies Meta<typeof AnnouncementBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
