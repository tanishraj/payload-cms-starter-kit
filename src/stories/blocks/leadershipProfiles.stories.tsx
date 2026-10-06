import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LeadershipProfilesBlockComponent } from '@/blocks/LeadershipProfiles/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof LeadershipProfilesBlockComponent>>('leadershipProfiles')

const meta = {
  title: 'Blocks/Leadership Profiles',
  component: LeadershipProfilesBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'leadershipProfiles',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Leadership Profiles. Source: @/blocks/LeadershipProfiles/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    cardLayout: ['standard', 'imageOverlay'],
    columns: ['2', '3', '4'],
    contentAlignment: ['center', 'left', 'right'],
    descriptionPosition: ['side', 'underTitle'],
    headerLayout: ['split', 'stacked'],
    overlayCoverage: ['split', 'full'],
    overlayDirection: ['vertical', 'bottomToTop', 'leftToRight', 'rightToLeft', 'topToBottom'],
    overlayStyle: ['dark', 'darker', 'light'],
    sideContentAlignment: ['top', 'bottom'],
    size: ['none', 'comfortable', 'compact', 'default'],
    themeMode: ['brand', 'dark', 'light', 'auto'],
  }),
} satisfies Meta<typeof LeadershipProfilesBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
