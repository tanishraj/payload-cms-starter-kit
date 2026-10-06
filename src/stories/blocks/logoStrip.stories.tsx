import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LogoStripBlockComponent } from '@/blocks/LogoStrip/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof LogoStripBlockComponent>>('logoStrip')

const meta = {
  title: 'Blocks/Logo Strip',
  component: LogoStripBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'logoStrip',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Logo Strip. Source: @/blocks/LogoStrip/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    displayMode: ['grid', 'marquee'],
    logoHeight: ['lg', 'md', 'sm'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof LogoStripBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
