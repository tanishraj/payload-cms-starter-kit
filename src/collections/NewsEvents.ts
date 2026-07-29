import { lexicalEditor } from '@payloadcms/richtext-lexical'
import {
  slugField,
  type CollectionConfig,
  type DateFieldValidation,
  type TextFieldSingleValidation,
} from 'payload'

import {
  allowPublishedReadOrCapability,
  canShowEditorialWorkflow,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { buildSEOFields } from '@/fields/buildSEOFields'
import { enforceEditorialWorkflow } from '@/hooks/enforceEditorialWorkflow'
import { createCollectionAuditHook } from '@/hooks/logOperationalAuditEvent'
import { normalizeNewsEventFields } from '@/hooks/normalizeNewsEventFields'
import { syncPrimaryCategoryMembership } from '@/hooks/syncPrimaryCategoryMembership'
import { createWorkflowQueueHook } from '@/hooks/syncWorkflowStateToWorkQueue'
import { validateSEOContract } from '@/hooks/validateSEOContract'
import { editorialWorkflowStateOptions } from '@/lib/editorialWorkflow'
import { revalidateNewsEventsCache } from '@/hooks/revalidateCmsContent'

const previewBreakpoints = [
  { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
  { name: 'tablet', label: 'Tablet', width: 834, height: 1112 },
  { name: 'mobile', label: 'Mobile', width: 390, height: 844 },
] as const

const isEventEntry = (data: Record<string, unknown> | undefined) => data?.contentType === 'event'

const validateEventStart: DateFieldValidation = (value, { data }) => {
  const entryData = data as Record<string, unknown> | undefined

  if (!isEventEntry(entryData)) {
    return true
  }

  if (typeof value !== 'string' || Number.isNaN(new Date(value).getTime())) {
    return 'Event Start is required for Event entries.'
  }

  return true
}

const validateEventEnd: DateFieldValidation = (value, { data }) => {
  const entryData = data as Record<string, unknown> | undefined

  if (!isEventEntry(entryData) || !value) {
    return true
  }

  const start = typeof entryData?.eventStart === 'string' ? new Date(entryData.eventStart) : null
  const end = new Date(value)

  if (!start || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Enter a valid Event End date.'
  }

  return end.getTime() >= start.getTime() ? true : 'Event End cannot be earlier than Event Start.'
}

const validateEventLocation: TextFieldSingleValidation = (value, { data }) => {
  if (!isEventEntry(data as Record<string, unknown> | undefined)) {
    return true
  }

  return typeof value === 'string' && value.trim()
    ? true
    : 'Event Location is required for Event entries.'
}

export const NewsEvents: CollectionConfig = {
  slug: 'news-events',
  labels: {
    singular: 'News & Event Entry',
    plural: 'News & Events',
  },
  admin: {
    group: 'Content',
    hidden: hideFromUsersWithoutCapability('manage_news_events'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'contentType', 'workflowState', 'eventStart', 'updatedAt'],
    description: 'Published news stories and scheduled events for the public website.',
    listSearchableFields: ['title', 'slug', 'authorName', 'eventLocation'],
    livePreview: {
      breakpoints: [...previewBreakpoints],
      url: ({ data }) => {
        if (!data?.slug || typeof data.slug !== 'string') {
          return null
        }

        const appURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

        return `${appURL}/news-events/${data.slug}?preview=true`
      },
    },
  },
  access: {
    create: requireCapability('manage_news_events'),
    delete: requireCapability('manage_news_events'),
    read: allowPublishedReadOrCapability('manage_news_events'),
    readVersions: requireCapability('manage_news_events'),
    update: requireCapability('manage_news_events'),
  },
  hooks: {
    afterChange: [
      revalidateNewsEventsCache,
      createWorkflowQueueHook({
        sourceAdminPathPrefix: '/admin/collections/news-events',
        sourceCollection: 'news-events',
        states: [
          {
            queueType: 'approval',
            reasonCode: 'news-event-review-required',
            summary: (_doc, title) => `${title} is awaiting editorial approval.`,
            workflowState: 'in_review',
          },
          {
            priority: () => 'high',
            queueType: 'approval',
            reasonCode: 'news-event-scheduled-publication',
            summary: (_doc, title) => `${title} is scheduled and requires publication oversight.`,
            workflowState: 'scheduled',
          },
        ],
        titleField: 'title',
      }),
      createCollectionAuditHook({
        entityType: 'news_event',
        getSummary: ({ doc, previousDoc }) =>
          `Workflow moved from ${previousDoc?.workflowState ?? 'draft'} to ${doc.workflowState}.`,
        titleField: 'title',
      }),
    ],
    beforeChange: [
      normalizeNewsEventFields,
      syncPrimaryCategoryMembership,
      validateSEOContract(),
      enforceEditorialWorkflow('publish_news_events', 'news-events'),
    ],
  },
  versions: {
    drafts: true,
  },
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      useAsSlug: 'title',
    }),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'contentType',
              label: 'Entry Type',
              type: 'select',
              defaultValue: 'news',
              options: [
                { label: 'News', value: 'news' },
                { label: 'Event', value: 'event' },
              ],
              required: true,
            },
            {
              name: 'excerpt',
              type: 'textarea',
              required: true,
              admin: {
                description: 'Short summary used in cards, archives, previews, and SEO fallbacks.',
              },
            },
            {
              name: 'authorName',
              label: 'Byline',
              type: 'text',
            },
            {
              name: 'body',
              type: 'richText',
              editor: lexicalEditor(),
              required: true,
              admin: {
                description: 'Complete story or event description.',
              },
            },
          ],
        },
        {
          label: 'Classification',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'primaryCategory',
                  label: 'Primary Topic',
                  type: 'relationship',
                  relationTo: 'categories',
                  admin: {
                    width: '50%',
                    description: 'Main editorial topic for archive placement.',
                  },
                },
                {
                  name: 'tags',
                  type: 'relationship',
                  relationTo: 'tags',
                  hasMany: true,
                  admin: {
                    width: '50%',
                    description: 'Keyword tags for cross-linking.',
                  },
                },
              ],
            },
            {
              name: 'categories',
              label: 'Additional Topics',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              admin: {
                description:
                  'Additional topics for cross-linking. The primary topic is included automatically.',
              },
            },
          ],
        },
        {
          label: 'Event Details',
          admin: {
            condition: isEventEntry,
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'eventStart',
                  type: 'date',
                  validate: validateEventStart,
                  admin: {
                    condition: isEventEntry,
                    date: { pickerAppearance: 'dayAndTime' },
                    width: '50%',
                  },
                },
                {
                  name: 'eventEnd',
                  type: 'date',
                  validate: validateEventEnd,
                  admin: {
                    condition: isEventEntry,
                    date: { pickerAppearance: 'dayAndTime' },
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'eventLocation',
              type: 'text',
              validate: validateEventLocation,
              admin: {
                condition: isEventEntry,
              },
            },
            {
              ...createContentActionsField({
                includeDisplayMode: true,
                label: 'Registration Action',
                maxRows: 1,
                name: 'eventRegistrationAction',
              }),
              admin: {
                condition: isEventEntry,
                initCollapsed: true,
              },
            },
          ],
        },
        {
          label: 'Presentation',
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              filterOptions: {
                mimeType: { contains: 'image' },
              },
            },
            {
              name: 'featuredImagePosition',
              label: 'Background Position',
              type: 'select',
              defaultValue: 'center',
              options: [
                { label: 'Center', value: 'center' },
                { label: 'Top', value: 'top' },
                { label: 'Bottom', value: 'bottom' },
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
              ],
              required: true,
            },
          ],
        },
        {
          label: 'SEO',
          fields: [...buildSEOFields()],
        },
        {
          label: 'Workflow',
          fields: [
            {
              name: 'workflowState',
              type: 'select',
              defaultValue: 'draft',
              options: [...editorialWorkflowStateOptions],
              required: true,
              admin: {
                condition: (_data, _siblingData, { user }) =>
                  canShowEditorialWorkflow(user as never),
              },
            },
            {
              name: 'scheduledPublishAt',
              type: 'date',
              admin: {
                condition: (_data, siblingData, { user }) =>
                  canShowEditorialWorkflow(user as never) &&
                  siblingData?.workflowState === 'scheduled',
              },
            },
            {
              name: 'changeSummary',
              type: 'textarea',
              admin: {
                condition: (_data, _siblingData, { user }) =>
                  canShowEditorialWorkflow(user as never),
                description: 'Short operator-facing note explaining why this change exists.',
              },
            },
            {
              name: 'lastReviewedAt',
              type: 'date',
              admin: {
                condition: (_data, _siblingData, { user }) =>
                  canShowEditorialWorkflow(user as never),
                readOnly: true,
              },
            },
            {
              name: 'lastReviewedBy',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                condition: (_data, _siblingData, { user }) =>
                  canShowEditorialWorkflow(user as never),
                readOnly: true,
              },
            },
            {
              name: 'publishedAt',
              type: 'date',
              admin: {
                condition: (_data, _siblingData, { user }) =>
                  canShowEditorialWorkflow(user as never),
                readOnly: true,
              },
            },
            {
              name: 'publishedBy',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                condition: (_data, _siblingData, { user }) =>
                  canShowEditorialWorkflow(user as never),
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
  ],
}
