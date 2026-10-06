import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BreadcrumbBlockComponent } from '@/blocks/Breadcrumb/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof BreadcrumbBlockComponent>>('breadcrumb')

const meta = {
  title: 'Blocks/Breadcrumb',
  component: BreadcrumbBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'breadcrumb',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Breadcrumb. Source: @/blocks/Breadcrumb/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    alignment: ['center', 'left', 'right'],
    breadcrumbMode: ['automatic', 'custom'],
    sectionPadding: ['none', 'compact', 'default'],
    separator: ['arrow', 'chevron', 'dot', 'slash'],
    size: ['compact', 'default'],
  }),
} satisfies Meta<typeof BreadcrumbBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const AlternateSpacing: Story = { args: { size: 'default' } }
