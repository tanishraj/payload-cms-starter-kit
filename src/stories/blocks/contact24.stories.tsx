import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Contact24 } from '@/components/contact24'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof Contact24>>('contact24')

const meta = {
  title: 'Blocks/Regional Offices',
  component: Contact24,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'contact24',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Regional Offices. Source: @/components/contact24. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    detailsAlignment: ['center', 'left', 'right'],
    mapActionMode: ['link', 'button'],
    mapActionVariant: [
      'default',
      'link',
      'outline',
      'primary',
      'secondary',
      'white',
      'whiteOutline',
    ],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof Contact24>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
