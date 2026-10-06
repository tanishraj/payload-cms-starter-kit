import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ContentHighlightsBlockComponent } from '@/blocks/ContentHighlights/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof ContentHighlightsBlockComponent>>('contentHighlights')

const meta = {
  title: 'Blocks/Content Highlights',
  component: ContentHighlightsBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'contentHighlights',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Content Highlights. Source: @/blocks/ContentHighlights/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    cardLayout: ['grid', 'list'],
    cardStyle: ['boxed', 'open', 'divided', 'leftRule'],
    contentAlignment: ['center', 'left', 'right'],
    eyebrowPlacement: ['stacked', 'inline'],
    gridColumns: ['2', '3'],
    headerLayout: ['split', 'stacked'],
    itemsLayout: ['2', '3', '4', 'list', '1'],
    itemTreatment: ['boxed', 'open', 'auto', 'ruled'],
    layout: ['numberedSteps', 'editorialRow', 'highlightsGrid', 'simpleGrid'],
    ruledDividers: ['grid', 'rows', 'individual'],
    size: ['none', 'comfortable', 'compact', 'default'],
    splitContentAlignment: ['center', 'top', 'bottom'],
  }),
} satisfies Meta<typeof ContentHighlightsBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
