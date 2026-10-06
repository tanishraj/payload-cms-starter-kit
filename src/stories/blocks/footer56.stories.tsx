import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Footer56BlockComponent } from '@/blocks/Footer56/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof Footer56BlockComponent>>('footer56')

const meta = {
  title: 'Blocks/Footer 56',
  component: Footer56BlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'footer56',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Footer 56. Source: @/blocks/Footer56/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    logoMode: ['siteDefault', 'customLogo'],
    socialIconStyle: ['plain', 'tile'],
    socialPlacement: ['brand', 'bottomBar'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof Footer56BlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
