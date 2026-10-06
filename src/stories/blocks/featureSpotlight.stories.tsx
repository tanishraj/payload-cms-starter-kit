import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FeatureSpotlightBlockComponent } from '@/blocks/FeatureSpotlight/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof FeatureSpotlightBlockComponent>>('featureSpotlight')

const meta = {
  title: 'Blocks/Feature Spotlight',
  component: FeatureSpotlightBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'featureSpotlight',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Feature Spotlight. Source: @/blocks/FeatureSpotlight/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    contentVerticalAlignment: ['center', 'top', 'bottom'],
    imagePosition: ['center', 'top', 'left', 'right', 'bottom'],
    layoutMode: ['split', 'contentOnly'],
    mediaFillMode: ['contained', 'containedFill', 'edgeToEdge'],
    mediaPosition: ['left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof FeatureSpotlightBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
