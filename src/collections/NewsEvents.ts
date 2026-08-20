import { type CollectionConfig } from 'payload'

import {
  allowPublishedReadOrCapability,
  canShowEditorialWorkflow,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import { bodyEditor } from '@/fields/bodyEditorConfig'
import { buildSEOFields } from '@/fields/buildSEOFields'
import { projectSlugField } from '@/fields/projectSlugField'
import { enforceEditorialWorkflow } from '@/hooks/enforceEditorialWorkflow'
import { createCollectionAuditHook } from '@/hooks/logOperationalAuditEvent'
import { normalizeNewsEventFields } from '@/hooks/normalizeNewsEventFields'
import { resolveNewsEventClassification } from '@/hooks/resolveNewsEventClassification'
import { syncPrimaryCategoryMembership } from '@/hooks/syncPrimaryCategoryMembership'
import { createWorkflowQueueHook } from '@/hooks/syncWorkflowStateToWorkQueue'
import { validateSEOContract } from '@/hooks/validateSEOContract'
import { editorialWorkflowStateOptions } from '@/lib/editorialWorkflow'
import { NEWS_EVENT_CLASSIFICATIONS } from '@/lib/newsEventClassifications'
import { revalidateNewsEventsCache } from '@/hooks/revalidateCmsContent'

const previewBreakpoints = [
  { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
  { name: 'tablet', label: 'Tablet', width: 834, height: 1112 },
  { name: 'mobile', label: 'Mobile', width: 390, height: 844 },
] as const

export const NewsEvents: CollectionConfig = {
  slug: 'news-events',
  labels: {
    singular: 'News & Event Entry',
    plural: 'News & Events',
  },
  admin: {
    group: 'News & Events',
    hidden: hideFromUsersWithoutCapability('manage_news_events'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'classification', '_status', 'workflowState', 'updatedAt'],
    description: 'Published news stories and scheduled events for the public website.',
    listSearchableFields: ['title', 'slug', 'eventLocation'],
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
    beforeValidate: [resolveNewsEventClassification],
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
    projectSlugField({
      useAsSlug: 'title',
    }),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'classification',
              label: 'Entry Classification',
              type: 'relationship',
              relationTo: 'news-event-classifications',
              required: true,
              filterOptions: { active: { equals: true } },
              admin: {
                allowCreate: true,
                description: 'Controls the public badge, tab, date behavior, and detail metadata.',
              },
            },
            {
              name: 'contentType',
              label: 'Legacy Entry Classification',
              type: 'select',
              options: NEWS_EVENT_CLASSIFICATIONS.map(({ adminLabel, value }) => ({
                label: adminLabel,
                value,
              })),
              admin: {
                hidden: true,
              },
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
              admin: {
                hidden: true,
                description:
                  'Legacy field retained for existing entries. The shared detail template now controls the public author label.',
              },
            },
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
              label: 'Image Position',
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
            {
              type: 'collapsible',
              label: 'Topics & Tags',
              admin: {
                description: 'Optional subject metadata for grouping and cross-linking.',
                initCollapsed: true,
              },
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
              name: 'body',
              type: 'richText',
              editor: bodyEditor,
              required: true,
              admin: {
                description: 'Complete story or event description.',
              },
            },
          ],
        },
        {
          label: 'Event Details',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'eventStart',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    description:
                      'Required only when the selected classification uses Event behavior.',
                    width: '50%',
                  },
                },
                {
                  name: 'eventEnd',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Optional, but cannot be earlier than Event Start.',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'eventLocation',
              type: 'text',
              admin: {
                description: 'Required only when the selected classification uses Event behavior.',
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
                initCollapsed: true,
              },
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
