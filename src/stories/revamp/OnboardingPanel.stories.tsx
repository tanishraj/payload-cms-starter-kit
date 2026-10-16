import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { getTeamSetupTask } from '@/lib/teamSetupGuide'
import { ADMIN_FEATURE_KEYS } from '@/access/adminFeatures'
import { getSiteStructureTask } from '@/lib/siteStructureGuide'
import { getSiteSetupTask } from '@/lib/siteSetupGuide'
import { getPageEditingTask } from '@/lib/pageEditingGuide'
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
    guideLabel: { control: 'text', description: 'Accessible region and reopen button label.' },
    title: {
      control: 'text',
      description: 'Current next-task title, derived by the server in production.',
    },
    description: { control: 'text', description: 'Short task and access explanation.' },
    action: {
      control: 'object',
      description: 'Permitted destination, label, optional new-tab target and disabled state.',
    },
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

const pageState = {
  previewURL: '/preview/page/example',
  hasBlocks: true,
  modified: false,
  processing: false,
  hasPublishedDoc: false,
  siteManager: true,
  collapsed: false,
}

// The native Page editor reuses this same sourced presentation and catalogue entry.
export const PageFirstDraft: Story = {
  args: getPageEditingTask({ ...pageState, previewURL: null, hasBlocks: false }),
}
export const PageEmptyLayout: Story = {
  args: getPageEditingTask({ ...pageState, hasBlocks: false }),
}
export const PageUnsavedChanges: Story = {
  args: getPageEditingTask({ ...pageState, modified: true }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: /Preview saved page/ })
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  },
}
export const PageSaving: Story = {
  args: getPageEditingTask({ ...pageState, processing: true }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Preview saved page' }),
    ).toBeDisabled()
    await expect(within(canvasElement).queryByRole('link')).not.toBeInTheDocument()
  },
}
export const PageSavedDraft: Story = { args: getPageEditingTask(pageState) }
export const PageWithPublicVersion: Story = {
  args: getPageEditingTask({ ...pageState, hasPublishedDoc: true }),
}

// Site settings share the same sourced presentation, rather than a second catalogue entry.
const siteSetupState = {
  globalSlug: 'site-settings' as const,
  canOpenAppearance: true,
  modified: false,
  processing: false,
  hasPublishedDoc: false,
  collapsed: false,
}
export const SiteIdentity: Story = { args: getSiteSetupTask(siteSetupState) }
export const SiteAppearance: Story = {
  args: getSiteSetupTask({ ...siteSetupState, globalSlug: 'theme-settings' }),
}
export const SiteSetupUnsaved: Story = {
  args: getSiteSetupTask({ ...siteSetupState, modified: true }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Review website appearance' }),
    ).toBeDisabled()
    await expect(within(canvasElement).queryByRole('link')).not.toBeInTheDocument()
  },
}
export const SiteSetupSaving: Story = {
  args: getSiteSetupTask({ ...siteSetupState, processing: true }),
}
export const SiteSetupPublicVersion: Story = {
  args: getSiteSetupTask({ ...siteSetupState, hasPublishedDoc: true }),
}
export const SiteSetupLimitedAccess: Story = {
  args: getSiteSetupTask({ ...siteSetupState, canOpenAppearance: false }),
}
export const SiteSetupHideAndReopen: Story = {
  args: getSiteSetupTask(siteSetupState),
  render: (args) => <InteractivePanel {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Hide guide' }))
    await expect(canvas.getByRole('button', { name: 'Site setup' })).toHaveFocus()
    await userEvent.click(canvas.getByRole('button', { name: 'Site setup' }))
    await expect(canvas.getByRole('heading', { name: 'Review your site identity' })).toBeVisible()
  },
}

// Layout guidance reuses the same production presentation and catalogue entry.
const structureState = {
  menuAction: { label: 'Open Headers', href: '/admin/collections/headers' },
  hasHomepageSelection: false,
  modified: false,
  processing: false,
  hasPublishedDoc: false,
  collapsed: false,
}
export const HomepageNotSelected: Story = { args: getSiteStructureTask(structureState) }
export const HomepageSelected: Story = {
  args: getSiteStructureTask({ ...structureState, hasHomepageSelection: true }),
}
export const HomepageLimitedAccess: Story = {
  args: getSiteStructureTask({ ...structureState, hasHomepageSelection: true, menuAction: null }),
}
export const HomepageUnsaved: Story = {
  args: getSiteStructureTask({ ...structureState, modified: true }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Choose a homepage' }),
    ).toBeDisabled()
    await expect(within(canvasElement).queryByRole('link')).not.toBeInTheDocument()
  },
}
export const HomepageSaving: Story = {
  args: getSiteStructureTask({ ...structureState, processing: true }),
}
export const HomepagePublicVersion: Story = {
  args: getSiteStructureTask({
    ...structureState,
    hasHomepageSelection: true,
    hasPublishedDoc: true,
  }),
}
export const HomepageHideAndReopen: Story = {
  args: getSiteStructureTask(structureState),
  render: (args) => <InteractivePanel {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Hide guide' }))
    await expect(canvas.getByRole('button', { name: 'Homepage and navigation' })).toHaveFocus()
    await userEvent.click(canvas.getByRole('button', { name: 'Homepage and navigation' }))
    await expect(
      canvas.getByRole('heading', { name: 'Choose what visitors see at the homepage' }),
    ).toBeVisible()
  },
}

export const PublishedPageNavigation: Story = {
  args: getPageEditingTask({
    ...pageState,
    hasPublishedDoc: true,
    structureAction: {
      label: 'Review homepage and navigation',
      href: '/admin/globals/page-settings',
    },
  }),
}

const teamState = {
  role: 'siteManager',
  features: {},
  sectionCount: 0,
  modified: false,
  processing: false,
  existingAccount: false,
  collapsed: false,
}
export const TeamNoFeatures: Story = { args: getTeamSetupTask(teamState) }
export const TeamAdmin: Story = { args: getTeamSetupTask({ ...teamState, role: 'admin' }) }
export const TeamMissingSections: Story = {
  args: getTeamSetupTask({ ...teamState, features: { pages: true } }),
}
export const TeamScopedAndSiteWide: Story = {
  args: getTeamSetupTask({
    ...teamState,
    features: { pages: true, articles: true, actionQueue: true },
    sectionCount: 1,
    modified: true,
  }),
}
export const TeamSiteWideOnly: Story = {
  args: getTeamSetupTask({ ...teamState, features: { articles: true }, existingAccount: true }),
}
export const TeamOperationalOnly: Story = {
  args: getTeamSetupTask({ ...teamState, features: { actionQueue: true, auditLog: true } }),
}
export const TeamAllFeatures: Story = {
  args: getTeamSetupTask({
    ...teamState,
    features: Object.fromEntries(ADMIN_FEATURE_KEYS.map((key) => [key, true])),
    sectionCount: 2,
  }),
}
export const TeamSaving: Story = {
  args: getTeamSetupTask({ ...teamState, processing: true }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Review account role' }),
    ).toBeDisabled()
    await expect(within(canvasElement).queryByRole('link')).not.toBeInTheDocument()
  },
}
