import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Integration23BlockComponent } from '@/blocks/Integration23/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof Integration23BlockComponent>>('integration23')

const meta = {
  title: 'Blocks/Partner Directory',
  component: Integration23BlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'integration23',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Partner Directory. Source: @/blocks/Integration23/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    columns: ['2', '3', '4', '1', '6'],
    contentAlignment: ['center', 'left', 'right'],
    layoutMode: ['split', 'stacked'],
    gridPosition: ['left', 'right'],
    splitProportion: ['balanced', 'directoryFocus', 'sectionFocus'],
    itemLayout: ['inline', 'block'],
    itemAlignment: ['center', 'left'],
    gridStyle: ['grid', 'ruled'],
    sectionVerticalAlignment: ['center', 'top', 'bottom'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof Integration23BlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
