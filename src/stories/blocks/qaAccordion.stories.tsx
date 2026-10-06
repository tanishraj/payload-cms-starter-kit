import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QaAccordionBlockComponent } from '@/blocks/QaAccordion/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof QaAccordionBlockComponent>>('qaAccordion')

const meta = {
  title: 'Blocks/Q&A Accordion',
  component: QaAccordionBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'qaAccordion',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Q&A Accordion. Source: @/blocks/QaAccordion/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    accordionPlacement: ['left', 'right'],
    size: ['none', 'comfortable', 'compact', 'default'],
    supportingActionsPosition: ['bottom', 'inline'],
  }),
} satisfies Meta<typeof QaAccordionBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
