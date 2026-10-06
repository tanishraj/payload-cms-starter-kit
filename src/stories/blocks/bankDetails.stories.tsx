import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BankDetailsBlockComponent } from '@/blocks/BankDetails/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof BankDetailsBlockComponent>>('bankDetails')

const meta = {
  title: 'Blocks/Bank Details',
  component: BankDetailsBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'bankDetails',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Bank Details. Source: @/blocks/BankDetails/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    displayMode: ['text', 'scanner'],
    panelPosition: ['left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
    tabStyle: ['boxed', 'pills', 'underline'],
    tabWidth: ['centered', 'content', 'equal'],
  }),
} satisfies Meta<typeof BankDetailsBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
