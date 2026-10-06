import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AccreditationCardsBlockComponent } from '@/blocks/AccreditationCards/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof AccreditationCardsBlockComponent>>('accreditationCards')

const meta = {
  title: 'Blocks/Accreditation Cards',
  component: AccreditationCardsBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'accreditationCards',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Accreditation Cards. Source: @/blocks/AccreditationCards/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    cardFrame: ['boxed', 'grouped', 'open', 'stepped'],
    cardSize: ['comfortable', 'compact', 'default'],
    columns: ['2', '3', '4'],
    contentAlignment: ['center', 'left', 'right'],
    iconStyle: ['circle', 'outline', 'plain', 'square'],
    size: ['none', 'comfortable', 'compact', 'default'],
  }),
} satisfies Meta<typeof AccreditationCardsBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
