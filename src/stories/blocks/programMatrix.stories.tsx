import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProgramMatrixBlockComponent } from '@/blocks/ProgramMatrix/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof ProgramMatrixBlockComponent>>('programMatrix')

const meta = {
  title: 'Blocks/Program Matrix',
  component: ProgramMatrixBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'programMatrix',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Program Matrix. Source: @/blocks/ProgramMatrix/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    actionMode: ['link', 'button'],
    actionVariant: ['default', 'link', 'outline', 'primary', 'secondary', 'white', 'whiteOutline'],
    columns: ['2', '3', '4', '1'],
    contentAlignment: ['center', 'left', 'right'],
    headerLayout: ['split', 'stacked'],
    headerPosition: ['left', 'right'],
    headerVerticalAlignment: ['center', 'top', 'bottom'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof ProgramMatrixBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
