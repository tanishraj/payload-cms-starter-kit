import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { slugField, type CollectionConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  canShowEditorialWorkflow,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { buildSEOFields } from '@/fields/buildSEOFields'
import { enforceEditorialWorkflow } from '@/hooks/enforceEditorialWorkflow'
import { createCollectionAuditHook } from '@/hooks/logOperationalAuditEvent'
import { createWorkflowQueueHook } from '@/hooks/syncWorkflowStateToWorkQueue'
import { syncPrimaryCategoryMembership } from '@/hooks/syncPrimaryCategoryMembership'
import { validateSEOContract } from '@/hooks/validateSEOContract'
import { editorialWorkflowStateOptions } from '@/lib/editorialWorkflow'
import { revalidateArticlesCache } from '@/hooks/revalidateCmsContent'

const previewBreakpoints = [
  {
    name: 'desktop',
    label: 'Desktop',
    width: 1440,
    height: 900,
  },
  {
    name: 'tablet',
    label: 'Tablet',
    width: 834,
    height: 1112,
  },
  {
    name: 'mobile',
    label: 'Mobile',
    width: 390,
    height: 844,
  },
] as const

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Article',
    plural: 'Articles',
  },
  admin: {
    group: 'Website Content',
    hidden: hideFromUsersWithoutCapability('manage_articles'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'primaryCategory', 'slug', 'workflowState', 'updatedAt'],
    description: 'Editorial long-form content with writing-first authoring and SEO controls.',
    listSearchableFields: ['title', 'slug', 'authorName'],
    livePreview: {
      breakpoints: [...previewBreakpoints],
      url: ({ data }) => {
        if (!data?.slug || typeof data.slug !== 'string') {
          return null
        }

        const appURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

        return `${appURL}/articles/${data.slug}`
      },
    },
  },
  access: {
    create: requireCapability('manage_articles'),
    delete: requireCapability('manage_articles'),
    read: allowPublicReadOrCapability('manage_articles'),
    readVersions: requireCapability('manage_articles'),
    update: requireCapability('manage_articles'),
  },
  hooks: {
    afterChange: [
      revalidateArticlesCache,
      createWorkflowQueueHook({
        sourceAdminPathPrefix: '/admin/collections/articles',
        sourceCollection: 'articles',
        states: [
          {
            queueType: 'approval',
            reasonCode: 'article-review-required',
            summary: (_doc, title) => `${title} is awaiting editorial approval.`,
            workflowState: 'in_review',
          },
          {
            priority: () => 'high',
            queueType: 'approval',
            reasonCode: 'article-scheduled-publication',
            summary: (_doc, title) => `${title} is scheduled and requires publication oversight.`,
            workflowState: 'scheduled',
          },
        ],
        titleField: 'title',
      }),
      createCollectionAuditHook({
        entityType: 'article',
        getSummary: ({ doc, previousDoc }) =>
          `Workflow moved from ${previousDoc?.workflowState ?? 'draft'} to ${doc.workflowState}.`,
        titleField: 'title',
      }),
    ],
    beforeChange: [
      syncPrimaryCategoryMembership,
      validateSEOContract(),
      enforceEditorialWorkflow('publish_articles', 'articles'),
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
              type: 'row',
              fields: [
                {
                  name: 'primaryCategory',
                  type: 'relationship',
                  relationTo: 'categories',
                  required: true,
                  admin: {
                    description:
                      'Primary category that owns article archive placement and related-content priority.',
                    width: '50%',
                  },
                },
                {
                  name: 'tags',
                  type: 'relationship',
                  relationTo: 'tags',
                  hasMany: true,
                  admin: {
                    description: 'Optional topical tags for cross-linking and tag archives.',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              admin: {
                description:
                  'Supporting categories for cross-linking. The primary category is always included automatically.',
              },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              required: true,
            },
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              filterOptions: {
                mimeType: {
                  contains: 'image',
                },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'authorName',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'publishedAtOverride',
                  type: 'date',
                  admin: {
                    description:
                      'Optional. Override the visible publication date without changing workflow metadata.',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'body',
              type: 'richText',
              editor: lexicalEditor(),
              required: true,
              admin: {
                description: 'Primary long-form article body.',
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
