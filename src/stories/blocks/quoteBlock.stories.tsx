import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QuoteBlockBlockComponent } from '@/blocks/QuoteBlock/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof QuoteBlockBlockComponent>>('quoteBlock')

const meta = {
  title: 'Blocks/Quote Block',
  component: QuoteBlockBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'quoteBlock',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Quote Block. Source: @/blocks/QuoteBlock/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    quoteSize: ['lg', 'sm', 'xl', '2xl'],
    rating: ['none', '2', '3', '4', '1', '5'],
    size: ['none', 'comfortable', 'compact', 'default'],
    variant: ['centered', 'side', 'card', 'highlight'],
  }),
} satisfies Meta<typeof QuoteBlockBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
