import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TestimonialGridBlockComponent } from '@/blocks/TestimonialGrid/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof TestimonialGridBlockComponent>>('testimonialGrid')

const meta = {
  title: 'Blocks/Testimonial Grid',
  component: TestimonialGridBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'testimonialGrid',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Testimonial Grid. Source: @/blocks/TestimonialGrid/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    columns: ['2', '3', '4'],
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
    variant: ['grid', 'list', 'featured'],
  }),
} satisfies Meta<typeof TestimonialGridBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
