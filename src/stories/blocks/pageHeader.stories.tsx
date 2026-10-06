import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PageHeaderBlockComponent } from '@/blocks/PageHeader/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args = getBlockStoryArgs<ComponentProps<typeof PageHeaderBlockComponent>>('pageHeader')

const meta = {
  title: 'Blocks/Page Header',
  component: PageHeaderBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'pageHeader',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Page Header. Source: @/blocks/PageHeader/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    actionPlacement: ['side', 'below', 'inline'],
    breadcrumbMode: ['automatic', 'custom', 'hidden'],
    contentAlignment: ['center', 'left', 'right'],
    contentWidth: ['default', 'narrow', 'wide'],
    height: ['compact', 'default', 'immersive'],
    overlayCoverage: ['split', 'full'],
    overlayDirection: ['vertical', 'bottomToTop', 'leftToRight', 'rightToLeft', 'topToBottom'],
    overlayStyle: ['dark', 'darker', 'light'],
    size: ['none', 'comfortable', 'compact', 'default'],
    themeMode: ['brand', 'dark', 'light', 'auto'],
    topContent: ['breadcrumb', 'eyebrow'],
    variant: ['split', 'minimal', 'banner'],
  }),
} satisfies Meta<typeof PageHeaderBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
