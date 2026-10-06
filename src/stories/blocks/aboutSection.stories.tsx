import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AboutSectionBlockComponent } from '@/blocks/AboutSection/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof AboutSectionBlockComponent>>('aboutSection')

const meta = {
  title: 'Blocks/About Section',
  component: AboutSectionBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'aboutSection',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: About Section. Source: @/blocks/AboutSection/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    imageDetailBackground: ['subtle', 'brand', 'gradient-subtle', 'gradient-brand'],
    imageDetailPosition: ['left', 'right'],
    imagePosition: ['left', 'right'],
    listStyle: ['ordered', 'unordered'],
    mediaFillMode: ['contained', 'containedFill', 'edgeToEdge'],
    size: ['none', 'comfortable', 'compact', 'default'],
    variant: ['split', 'centered', 'text'],
  }),
} satisfies Meta<typeof AboutSectionBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
