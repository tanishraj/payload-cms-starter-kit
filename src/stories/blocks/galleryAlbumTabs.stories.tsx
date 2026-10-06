import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { GalleryAlbumTabsBlockPresentation } from '@/blocks/GalleryAlbumTabs/Presentation'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof GalleryAlbumTabsBlockPresentation>>('galleryAlbumTabs')

const meta = {
  title: 'Blocks/Gallery Album Tabs',
  component: GalleryAlbumTabsBlockPresentation,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'galleryAlbumTabs',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Gallery Album Tabs. Source: @/blocks/GalleryAlbumTabs/Presentation. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    displayOrder: ['latestEventDate', 'manual'],
    headerActionAlignment: ['center', 'top', 'bottom'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof GalleryAlbumTabsBlockPresentation>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
