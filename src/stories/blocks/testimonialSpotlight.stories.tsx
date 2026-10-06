import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TestimonialSpotlightBlockComponent } from '@/blocks/TestimonialSpotlight/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof TestimonialSpotlightBlockComponent>>(
    'testimonialSpotlight',
  )

const meta = {
  title: 'Blocks/Testimonial Spotlight',
  component: TestimonialSpotlightBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'testimonialSpotlight',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Testimonial Spotlight. Source: @/blocks/TestimonialSpotlight/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    containerBackground: ['default', 'muted', 'primary', 'secondary', 'accent'],
    containerOutline: ['none', 'outline'],
    contentAlignment: ['center', 'left', 'right'],
    contentVerticalAlignment: ['center', 'top', 'bottom'],
    imagePosition: ['center', 'top', 'left', 'right', 'bottom'],
    mediaFillMode: ['contained', 'containedFill', 'edgeToEdge'],
    mediaPosition: ['left', 'right'],
    sectionContentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof TestimonialSpotlightBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
