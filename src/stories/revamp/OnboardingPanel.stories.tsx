import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { OnboardingPanel, type OnboardingPanelProps } from '@/components/revamp/onboarding-panel'

const meta = {
  title: 'Admin/Getting started',
  component: OnboardingPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Source: @shadcnblocks/empty-empty-actions-2, retrieved through the authenticated registry. https://www.shadcnblocks.com/components/empty. Native Payload adapter supplies current accessible work and account-owned guide preferences. No services or real account data are used here. Scoped styles inherit Payload’s palette in the admin and official Neutral in the workshop.',
      },
    },
  },
  args: {
    title: 'Create a page',
    description:
      'Start with a blank page or a recipe. Add blocks, save a draft and check Live Preview. Publish only when you are ready.',
    action: { label: 'Create a page', href: '#example' },
    collapsed: false,
    dismissible: true,
    ready: true,
    pending: false,
    error: '',
    onToggle: fn(),
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Current next-task title, derived by the server in production.',
    },
    description: { control: 'text', description: 'Short task and access explanation.' },
    action: { control: 'object', description: 'Permitted destination and descriptive link label.' },
    collapsed: { control: 'boolean', name: 'Guide hidden' },
    dismissible: { control: 'boolean', name: 'Allow hiding guidance' },
    ready: { control: 'boolean', name: 'Disclosure controls hydrated' },
    pending: { control: 'boolean', name: 'Saving preference' },
    error: { control: 'text', name: 'Preference failure' },
    onToggle: { control: false },
  },
} satisfies Meta<typeof OnboardingPanel>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Hide guide' }))
    await expect(args.onToggle).toHaveBeenCalledWith(true)
  },
}
export const ContinueDraft: Story = {
  args: {
    title: 'Continue your draft',
    description:
      'Admissions overview is saved as a draft. Add blocks, save your changes and check Live Preview before publishing.',
    action: { label: 'Continue draft', href: '#example-draft' },
  },
}
export const AssignedSections: Story = {
  args: {
    description:
      'You can build pages in Admissions and Campus. Choose a parent in an assigned section, add blocks, save a draft and check Live Preview before publishing.',
  },
}
export const NoSections: Story = {
  args: {
    title: 'No website sections assigned',
    description:
      'Your account is active. Ask the Admin who created it to assign a website section. Then check access again.',
    action: { label: 'Check access again', href: '#refresh' },
    dismissible: false,
  },
}
export const Unavailable: Story = {
  args: {
    title: 'Your next task is unavailable',
    description:
      'We could not load your drafts. Open Pages to continue working, or refresh the dashboard to try again.',
    action: { label: 'Open Pages', href: '#pages' },
  },
}
export const Hidden: Story = { args: { collapsed: true } }
export const Starting: Story = { args: { ready: false } }
export const Saving: Story = { args: { pending: true } }
export const PreferenceFailure: Story = {
  args: {
    error: 'Your guide preference could not be saved. Try again; your content is unchanged.',
  },
}
export const LongContent: Story = {
  args: {
    title: 'Continue your international admissions and student support draft',
    description:
      'You can build pages in InternationalAdmissionsAndStudentSupportServices. Your draft is private until you explicitly publish it. Choose a parent in your assigned section and inspect Live Preview before publishing.',
  },
}
function InteractivePanel(props: OnboardingPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  return <OnboardingPanel {...props} collapsed={collapsed} onToggle={setCollapsed} />
}
export const HideAndReopen: Story = {
  render: (args) => <InteractivePanel {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Hide guide' }))
    await expect(canvas.queryByRole('heading', { name: 'Create a page' })).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Getting started' }))
    await expect(canvas.getByRole('heading', { name: 'Create a page' })).toBeVisible()
  },
}
