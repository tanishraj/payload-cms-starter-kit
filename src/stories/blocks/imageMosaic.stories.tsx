import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ImageMosaicBlockPresentation } from '@/blocks/ImageMosaic/Presentation'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof ImageMosaicBlockPresentation>>('imageMosaic')

const meta = {
  title: 'Blocks/Image Mosaic',
  component: ImageMosaicBlockPresentation,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'imageMosaic',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Image Mosaic. Source: @/blocks/ImageMosaic/Presentation. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    overlayCoverage: ['split', 'full'],
    overlayDisplay: ['always', 'hover'],
    overlayDirection: ['vertical', 'bottomToTop', 'leftToRight', 'rightToLeft', 'topToBottom'],
    overlayStyle: ['dark', 'darker', 'light'],
    size: ['none', 'comfortable', 'compact', 'default'],
    themeMode: ['brand', 'dark', 'light', 'auto'],
  }),
} satisfies Meta<typeof ImageMosaicBlockPresentation>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
