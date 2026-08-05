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
import { syncReviewToWorkQueue } from '@/hooks/syncReviewToWorkQueue'
import { syncPrimaryCategoryMembership } from '@/hooks/syncPrimaryCategoryMembership'
import { validateSEOContract } from '@/hooks/validateSEOContract'
import { editorialWorkflowStateOptions } from '@/lib/editorialWorkflow'
import { reviewRatingOptions } from '@/lib/reviews'
import { revalidateReviewsCache } from '@/hooks/revalidateCmsContent'

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

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: 'Review',
    plural: 'Reviews',
  },
  admin: {
    group: 'Content',
    hidden: hideFromUsersWithoutCapability('manage_reviews'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'primaryCategory', 'rating', '_status', 'workflowState', 'updatedAt'],
    description: 'Moderated public reviews with structured rating, reviewer, taxonomy, SEO, and workflow fields.',
    listSearchableFields: ['title', 'reviewTitle', 'reviewerName', 'subjectLabel'],
    livePreview: {
      breakpoints: [...previewBreakpoints],
      url: ({ data }) => {
        if (!data?.slug || typeof data.slug !== 'string') {
          return null
        }

        const appURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

        return `${appURL}/reviews/${data.slug}`
      },
    },
  },
  access: {
    create: requireCapability('manage_reviews'),
    delete: requireCapability('manage_reviews'),
    read: allowPublicReadOrCapability('manage_reviews'),
    readVersions: requireCapability('manage_reviews'),
    update: requireCapability('manage_reviews'),
  },
  hooks: {
    afterChange: [
      revalidateReviewsCache,
      syncReviewToWorkQueue,
      createCollectionAuditHook({
        entityType: 'review',
        getSummary: ({ doc, previousDoc }) =>
          `Workflow moved from ${previousDoc?.workflowState ?? 'draft'} to ${doc.workflowState}.`,
        titleField: 'title',
      }),
    ],
    beforeChange: [
      syncPrimaryCategoryMembership,
      validateSEOContract(),
      enforceEditorialWorkflow('publish_reviews', 'reviews'),
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
                  label: 'Primary Topic',
                  type: 'relationship',
                  relationTo: 'categories',
                  required: true,
                  admin: {
                    description:
                      'Main editorial topic — owns the archive placement and related-content priority.',
                    width: '50%',
                  },
                },
                {
                  name: 'tags',
                  type: 'relationship',
                  relationTo: 'tags',
                  hasMany: true,
                  admin: {
                    description:
                      'Keyword tags for related-content matching and cross-linking.',
                    width: '50%',
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
                  'Additional topics for cross-linking. The primary topic is always included automatically.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'rating',
                  type: 'select',
                  options: [...reviewRatingOptions],
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'subjectLabel',
                  type: 'text',
                  admin: {
                    description: 'Optional short subject like product, service, or campaign label.',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'reviewTitle',
              type: 'text',
              required: true,
            },
            {
              name: 'reviewBody',
              type: 'textarea',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'reviewerName',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'reviewerEmail',
                  type: 'email',
                  admin: {
                    description: 'Optional contact email used only for moderation follow-up.',
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'displayName',
                  type: 'text',
                  admin: {
                    description:
                      'Optional public-safe name shown on the frontend instead of the raw reviewer name.',
                    width: '50%',
                  },
                },
                {
                  name: 'isGenuineExperience',
                  type: 'checkbox',
                  defaultValue: false,
                  required: true,
                  admin: {
                    description:
                      'Confirms the reviewer stated this review is based on their own genuine experience.',
                    width: '50%',
                  },
                },
              ],
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
              name: 'internalModerationNotes',
              type: 'textarea',
              admin: {
                description:
                  'Internal notes for moderation, rewriting decisions, or publication checks.',
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
              name: 'sourceSubmission',
              type: 'relationship',
              relationTo: 'form-submissions',
              admin: {
                condition: (_data, _siblingData, { user }) =>
                  canShowEditorialWorkflow(user as never),
                description:
                  'Immutable link back to the public intake submission that generated this review.',
                readOnly: true,
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
