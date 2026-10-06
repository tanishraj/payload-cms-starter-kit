import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TabsContentBlockComponent } from '@/blocks/TabsContent/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof TabsContentBlockComponent>>('tabsContent')

const meta = {
  title: 'Blocks/Tabs Content',
  component: TabsContentBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'tabsContent',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Tabs Content. Source: @/blocks/TabsContent/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    contentAlignment: ['center', 'left', 'right'],
    contentLayout: ['imageRight', 'imageLeft', 'imageTop', 'textOnly', 'curriculum'],
    curriculumColumns: ['2', '3', '1'],
    sectionLayout: ['split', 'stacked'],
    size: ['none', 'comfortable', 'compact', 'default'],
    tabContentAlignment: ['center', 'left'],
    tabAlignment: ['center', 'left', 'right', 'stretch'],
    tabStyle: ['boxed', 'pills', 'underline', 'segmented'],
  }),
} satisfies Meta<typeof TabsContentBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
