import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EditorialReasonsBlockComponent } from '@/blocks/EditorialReasons/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof EditorialReasonsBlockComponent>>('editorialReasons')

const meta = {
  title: 'Blocks/Editorial Reasons',
  component: EditorialReasonsBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'editorialReasons',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Editorial Reasons. Source: @/blocks/EditorialReasons/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    actionsPosition: ['bottom', 'inline'],
    contentAlignment: ['center', 'left', 'right'],
    introVerticalAlignment: ['center', 'top', 'bottom'],
    layoutProportion: ['balanced', 'fullWidth', 'introFocus', 'listFocus'],
    listBorderStyle: ['open', 'ruled', 'framed'],
    listColumns: ['2', '3', '4', '1'],
    listPosition: ['left', 'right'],
    numberLayout: ['stacked', 'inline', 'columns'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof EditorialReasonsBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
