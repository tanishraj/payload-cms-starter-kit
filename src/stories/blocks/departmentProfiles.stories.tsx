import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DepartmentProfilesBlockComponent } from '@/blocks/DepartmentProfiles/Component'
import { getBlockStoryArgs, getBlockStoryArgTypes } from './support/fixtureArgs'

const args =
  getBlockStoryArgs<ComponentProps<typeof DepartmentProfilesBlockComponent>>('departmentProfiles')

const meta = {
  title: 'Blocks/Department Profiles',
  component: DepartmentProfilesBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'departmentProfiles',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production block: Department Profiles. Source: @/blocks/DepartmentProfiles/Component. Uses the same local sample data as the Payload block-picker thumbnail; controls affect this preview only. CMS reads, submissions and downloads are unavailable in Storybook. This documents the current implementation, not a newly sourced replacement.',
      },
    },
  },
  args,
  argTypes: getBlockStoryArgTypes(args, {
    cardLayout: ['inline', 'overlay'],
    cardFrame: ['boxed', 'open', 'framed'],
    cardSize: ['lg', 'md', 'sm'],
    columns: ['2', '3', '4', '5', '6', '7', '8'],
    contentAlignment: ['center', 'left', 'right'],
    departmentFilterPresentation: ['dropdown', 'tabs'],
    descriptionPosition: ['side', 'underTitle'],
    featuredCarouselCardVariant: ['stacked', 'overlay'],
    featuredCarouselOverlayAlignment: ['center', 'left', 'right'],
    featuredCarouselOverlayCoverage: ['split', 'full'],
    featuredCarouselOverlayDirection: [
      'vertical',
      'bottomToTop',
      'leftToRight',
      'rightToLeft',
      'topToBottom',
    ],
    featuredCarouselOverlayStyle: ['dark', 'darker', 'light'],
    featuredCarouselSize: ['comfortable', 'compact', 'default'],
    featuredCarouselThemeMode: ['brand', 'dark', 'light', 'auto'],
    headerLayout: ['split', 'stacked'],
    mediumColumns: ['2', '3', '4', '5', '6', '7', '8'],
    overlayCoverage: ['split', 'full'],
    overlayDirection: ['vertical', 'bottomToTop', 'leftToRight', 'rightToLeft', 'topToBottom'],
    overlayStyle: ['dark', 'darker', 'light'],
    sideContentAlignment: ['top', 'bottom'],
    size: ['none', 'comfortable', 'compact', 'default'],
    smallColumns: ['2', '3', '4', '5', '6', '7', '8'],
    tabVariant: ['contained', 'underline', 'pill'],
    tabWidth: ['centered', 'content', 'equal'],
    themeMode: ['brand', 'dark', 'light', 'auto'],
  }),
} satisfies Meta<typeof DepartmentProfilesBlockComponent>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Comfortable: Story = { args: { size: 'comfortable' } }
