import { slugField, type CollectionConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { ContentSpotlightBlock } from '@/blocks/ContentSpotlight/config'
import { enforceEditorialWorkflow } from '@/hooks/enforceEditorialWorkflow'
import { createCollectionAuditHook } from '@/hooks/logOperationalAuditEvent'
import { editorialWorkflowStateOptions } from '@/lib/editorialWorkflow'
import { reviewRatingOptions } from '@/lib/reviews'
import { robotsFieldOptions } from '@/lib/seo'

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
    defaultColumns: ['title', 'rating', 'workflowState', 'updatedAt'],
    description: 'Moderated public reviews with structured fields and supplemental layout blocks.',
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
      createCollectionAuditHook({
        entityType: 'review',
        getSummary: ({ doc, previousDoc }) =>
          `Workflow moved from ${previousDoc?.workflowState ?? 'draft'} to ${doc.workflowState}.`,
        titleField: 'title',
      }),
    ],
    beforeChange: [enforceEditorialWorkflow('publish_reviews')],
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
                    description:
                      'Optional short subject like product, service, or campaign label.',
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
                  required: true,
                  admin: {
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
              name: 'layout',
              type: 'blocks',
              blocks: [ContentSpotlightBlock],
              admin: {
                description:
                  'Optional supplemental sections. Structured review content stays primary.',
                initCollapsed: true,
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
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              required: true,
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'canonicalURL',
                  label: 'Canonical URL Override',
                  type: 'text',
                  admin: {
                    description:
                      'Optional. Leave empty to use the resolved public review URL. Supports relative paths or full URLs.',
                    width: '50%',
                  },
                },
                {
                  name: 'robots',
                  type: 'select',
                  options: [...robotsFieldOptions],
                  admin: {
                    description:
                      'Optional. Leave empty to inherit the global robots setting for this review.',
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'ogTitle',
                  label: 'Open Graph Title',
                  type: 'text',
                  admin: {
                    description:
                      'Optional. Leave empty to use the review SEO title, then global defaults.',
                    width: '50%',
                  },
                },
                {
                  name: 'ogImage',
                  label: 'Open Graph Image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Optional. Leave empty to use the global default social image.',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'ogDescription',
              label: 'Open Graph Description',
              type: 'textarea',
              admin: {
                description:
                  'Optional. Leave empty to use the review SEO description, then global defaults.',
              },
            },
          ],
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
            },
            {
              name: 'scheduledPublishAt',
              type: 'date',
              admin: {
                condition: (_, siblingData) => siblingData?.workflowState === 'scheduled',
              },
            },
            {
              name: 'changeSummary',
              type: 'textarea',
              admin: {
                description: 'Short operator-facing note explaining why this change exists.',
              },
            },
            {
              name: 'lastReviewedAt',
              type: 'date',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'lastReviewedBy',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'publishedAt',
              type: 'date',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'publishedBy',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
  ],
}
