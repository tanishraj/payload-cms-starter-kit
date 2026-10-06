import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FooterMinimalBlockComponent } from '@/blocks/FooterMinimal/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof FooterMinimalBlockComponent>>('footerMinimal')

const meta = {
  title: 'Blocks/Footer Minimal',
  component: FooterMinimalBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'footerMinimal',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Footer Minimal. Source: @/blocks/FooterMinimal/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    logoMode: ['none', 'siteDefault', 'customLogo', 'nameOnly'],
    size: ['none', 'comfortable', 'compact', 'default'],
    socialIconStyle: ['plain', 'tile'],
    socialPlacement: ['brand', 'bottomBar'],
  }),
} satisfies Meta<typeof FooterMinimalBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
