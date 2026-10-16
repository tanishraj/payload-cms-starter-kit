import type { OnboardingTask } from './adminOnboardingShared'

/** Visibility only; independent of the dashboard guide and never access authority. */
export const PAGE_EDITING_GUIDE_KEY = 'forma-page-editing-guide-v1'

export function getPageEditingTask(input: {
  previewURL: string | null
  hasBlocks: boolean
  modified: boolean
  processing: boolean
  hasPublishedDoc: boolean
  siteManager: boolean
  collapsed: boolean
  preferenceUnavailable?: boolean
}): OnboardingTask {
  const base = {
    collapsed: input.collapsed,
    dismissible: true,
    preferenceUnavailable: input.preferenceUnavailable,
  }
  const blocks = { label: 'Go to page blocks', href: '#field-layout' }
  const preview = input.previewURL
    ? { label: 'Preview saved page', href: input.previewURL, target: '_blank' as const }
    : blocks
  if (input.processing)
    return {
      ...base,
      title: 'Page update in progress',
      description:
        'Wait for Payload to confirm the result. If saving fails, correct the reported fields and try again; a pending request is not a saved page.',
      action: { ...preview, disabled: true },
    }
  if (!input.previewURL)
    return {
      ...base,
      title: 'Create your first draft',
      description: `Enter a page title${input.siteManager ? ' and choose a Parent in an assigned section' : ''}. Add blocks in Content, then use Save Draft. After the editor confirms the save, you can preview the page. Nothing is published automatically.`,
      action: blocks,
    }
  if (input.modified)
    return {
      ...base,
      title: 'Save your changes before previewing',
      description:
        'Use Save Draft and wait for confirmation. Preview saved page opens the last saved version in a new tab; it does not include unsaved edits. Live Preview above can show your current edits while you work.',
      action: preview,
    }
  if (!input.hasBlocks)
    return {
      ...base,
      title: 'Add your first block',
      description:
        'In Layout, choose Add Block and fill in its content. Use Save Draft, then check the result in Live Preview. A blank page has no blocks to display; publishing is a separate action.',
      action: blocks,
    }
  return {
    ...base,
    title: 'Check your saved page',
    description: input.hasPublishedDoc
      ? 'A public version of this page exists. Preview saved page opens the latest saved version in a new tab. Save Draft keeps new changes separate from the public version; use Publish only when those changes are ready.'
      : 'Preview saved page opens the latest saved draft in a new tab. Use Live Preview above to check desktop, tablet and mobile. This page stays private until you choose Publish; publishing does not automatically make it the homepage.',
    action: preview,
  }
}
