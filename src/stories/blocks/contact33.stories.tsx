import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Contact33BlockComponent } from '@/blocks/Contact33/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof Contact33BlockComponent>>('contact33')

const meta = {
  title: 'Blocks/Contact Form',
  component: Contact33BlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'contact33',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Contact Form. Source: @/blocks/Contact33/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    imagePosition: ['left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof Contact33BlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
