import type { BlocksFieldValidation, GlobalConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { newsEventsDetailBuilderBlocks } from '@/blocks/blockCatalog'
import { revalidateGlobalsCacheForGlobal } from '@/hooks/revalidateCmsContent'

const capabilities = ['manage_news_events', 'manage_page_settings'] as const

type LayoutBlock = { blockType?: string | null }

export const validateNewsEventsDetailLayout: BlocksFieldValidation = async (value, { data }) => {
  const status = (data as { _status?: 'draft' | 'published' } | undefined)?._status
  if (status !== 'published') return true

  const count = Array.isArray(value)
    ? (value as LayoutBlock[]).filter(({ blockType }) => blockType === 'newsEventsContent').length
    : 0

  return count === 1 || 'Add exactly one News & Events Content block before publishing.'
}

export const NewsEventsDetailTemplate: GlobalConfig = {
  slug: 'news-events-detail-template',
  label: 'Detail Page Template',
  admin: {
    group: 'News & Events',
    description: 'Build the shared page used by every News & Events detail entry.',
    hidden: hideFromUsersWithoutCapability([...capabilities]),
  },
  access: {
    read: allowPublicReadOrCapability([...capabilities]),
    readVersions: requireCapability([...capabilities]),
    update: requireCapability([...capabilities]),
  },
  versions: { drafts: true },
  hooks: { afterChange: [revalidateGlobalsCacheForGlobal] },
  fields: [
    {
      name: 'layout',
      label: 'Layout',
      type: 'blocks',
      blocks: newsEventsDetailBuilderBlocks,
      required: false,
      validate: validateNewsEventsDetailLayout,
      admin: {
        description:
          'Add exactly one News & Events Content block, then arrange shared blocks around it.',
        initCollapsed: true,
      },
    },
  ],
}
