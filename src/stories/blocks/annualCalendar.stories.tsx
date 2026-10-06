import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AnnualCalendarBlockPresentation } from '@/blocks/AnnualCalendar/Presentation'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof AnnualCalendarBlockPresentation>>('annualCalendar')

const meta = {
  title: 'Blocks/Annual Calendar',
  component: AnnualCalendarBlockPresentation,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'annualCalendar',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Annual Calendar. Source: @/blocks/AnnualCalendar/Presentation. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    periodMode: ['currentYear', 'customAcademicYear'],
    contentAlignment: ['center', 'left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof AnnualCalendarBlockPresentation>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
