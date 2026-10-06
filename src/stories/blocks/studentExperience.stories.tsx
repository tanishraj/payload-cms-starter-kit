import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StudentExperienceBlockComponent } from '@/blocks/StudentExperience/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof StudentExperienceBlockComponent>>('studentExperience')

const meta = {
  title: 'Blocks/Student Experience',
  component: StudentExperienceBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'studentExperience',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Student Experience. Source: @/blocks/StudentExperience/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    cardHeight: ['comfortable', 'compact', 'default'],
    contentAlignment: ['center', 'left', 'right'],
    headerLayout: ['split', 'stacked'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof StudentExperienceBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
