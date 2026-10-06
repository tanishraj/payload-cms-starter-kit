import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Logos20BlockComponent } from '@/blocks/Logos20/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof Logos20BlockComponent>>('logos20')

const meta = {
  title: 'Blocks/Logo Marquee',
  component: Logos20BlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'logos20',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Logo Marquee. Source: @/blocks/Logos20/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    logoHeight: ['lg', 'md', 'sm'],
    size: ['none', 'comfortable', 'compact', 'default'],
    speed: ['slow', 'normal', 'fast'],
  }),
} satisfies Meta<typeof Logos20BlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
