import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FeeStructureBlockComponent } from '@/blocks/FeeStructure/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof FeeStructureBlockComponent>>('feeStructure')

const meta = {
  title: 'Blocks/Fee Structure',
  component: FeeStructureBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'feeStructure',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Fee Structure. Source: @/blocks/FeeStructure/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    downloadActionMode: ['link', 'button'],
    downloadButtonVariant: ['default', 'outline', 'primary', 'secondary', 'white', 'whiteOutline'],
    layout: ['table', 'programmeCostAtlas'],
    size: ['none', 'comfortable', 'compact', 'default'],
    tabStyle: ['boxed', 'pills', 'underline'],
    tabWidth: ['centered', 'content', 'equal'],
  }),
} satisfies Meta<typeof FeeStructureBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
