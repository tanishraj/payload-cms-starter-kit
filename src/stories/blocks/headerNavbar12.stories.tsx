import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HeaderNavbar12BlockComponent } from '@/blocks/HeaderNavbar12/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof HeaderNavbar12BlockComponent>>('headerNavbar12')

const meta = {
  title: 'Blocks/Header Navbar 12',
  component: HeaderNavbar12BlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'headerNavbar12',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Header Navbar 12. Source: @/blocks/HeaderNavbar12/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    logoMode: ['siteDefault', 'customLogo'],
    size: ['compact', 'default', 'large'],
    navAlignment: ['center', 'left', 'right'],
  }),
} satisfies Meta<typeof HeaderNavbar12BlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const AlternateSpacing: Story = { args: { size: 'large' } }
