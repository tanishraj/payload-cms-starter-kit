import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DownloadListBlockComponent } from '@/blocks/DownloadList/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof DownloadListBlockComponent>>('downloadList')

const meta = {
  title: 'Blocks/Download List',
  component: DownloadListBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'downloadList',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Download List. Source: @/blocks/DownloadList/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    columns: ['2', '3', '4', '1', '5', '6', '7', '8'],
    contentAlignment: ['center', 'left', 'right'],
    documentIconSize: ['large', 'medium', 'small'],
    displayMode: ['compact', 'list', 'cards', 'framedGrid', 'openGrid'],
    gridActionDisplay: ['icons', 'labelled'],
    gridIconPosition: ['inline', 'above'],
    introPosition: ['left', 'right'],
    introVerticalAlignment: ['center', 'top', 'bottom'],
    sectionLayout: ['split', 'stacked'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof DownloadListBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
