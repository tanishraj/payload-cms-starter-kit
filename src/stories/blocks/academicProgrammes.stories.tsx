import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AcademicProgrammesBlockComponent } from '@/blocks/AcademicProgrammes/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof AcademicProgrammesBlockComponent>>('academicProgrammes')

const meta = {
  title: 'Blocks/Academic Programmes',
  component: AcademicProgrammesBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'academicProgrammes',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Academic Programmes. Source: @/blocks/AcademicProgrammes/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    columns: ['2', '3', '4'],
    contentAlignment: ['center', 'left', 'right'],
    descriptionPosition: ['side', 'underTitle'],
    headerLayout: ['split', 'stacked'],
    metadataPosition: ['bottom', 'flow'],
    sideContentAlignment: ['top', 'bottom'],
    size: ['none', 'comfortable', 'compact', 'default'],
    viewMode: ['detailedCards', 'grid', 'list'],
  }),
} satisfies Meta<typeof AcademicProgrammesBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
