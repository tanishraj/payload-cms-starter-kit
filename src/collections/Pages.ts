import { slugField, type CollectionConfig, type RelationshipFieldSingleValidation } from 'payload'

import { AnnouncementBlock } from '@/blocks/Announcement/config'
import { ContentHighlightsBlock } from '@/blocks/ContentHighlights/config'
import { EditorialReasonsBlock } from '@/blocks/EditorialReasons/config'
import { AcademicProgrammesBlock } from '@/blocks/AcademicProgrammes/config'
import { QaAccordionBlock } from '@/blocks/QaAccordion/config'
import { FeatureMatrixBlock } from '@/blocks/FeatureMatrix/config'
import { BannerCtaBlock } from '@/blocks/BannerCta/config'
import { NewsGridBlock } from '@/blocks/NewsGrid/config'
import { NewsEventsTabsBlock } from '@/blocks/NewsEventsTabs/config'
import { StudyPathwaysBlock } from '@/blocks/StudyPathways/config'
import { Cta39Block } from '@/blocks/Cta39/config'
import { GalleryShowcaseBlock } from '@/blocks/GalleryShowcase/config'
import { EventGalleryBlock } from '@/blocks/EventGallery/config'
import { ImageMosaicBlock } from '@/blocks/ImageMosaic/config'
import { StudentExperienceBlock } from '@/blocks/StudentExperience/config'
import { NewsEventsHighlightsBlock } from '@/blocks/NewsEventsHighlights/config'
import { ProfileCarouselBlock } from '@/blocks/ProfileCarousel/config'
import { HeroBannerBlock } from '@/blocks/HeroBanner/config'
import { HeroCarouselBlock } from '@/blocks/HeroCarousel/config'
import { GalleryCoverflowBlock } from '@/blocks/GalleryCoverflow/config'
import { RatingSpotlightBlock } from '@/blocks/RatingSpotlight/config'
import { ReviewFeedBlock } from '@/blocks/ReviewFeed/config'
import { ReviewSubmissionBlock } from '@/blocks/ReviewSubmission/config'
import { Contact24Block } from '@/blocks/Contact24/config'
import { Contact33Block } from '@/blocks/Contact33/config'
import { StatsStripBlock } from '@/blocks/StatsStrip/config'
import { Services21Block } from '@/blocks/Services21/config'
import { TeamShowcaseBlock } from '@/blocks/TeamShowcase/config'
import { FeatureSpotlightBlock } from '@/blocks/FeatureSpotlight/config'
import { TestimonialSpotlightBlock } from '@/blocks/TestimonialSpotlight/config'
import { ReusableSectionBlock } from '@/blocks/ReusableSection/config'
import { RichTextBlock } from '@/blocks/RichTextBlock/config'
import { VideoEmbedBlock } from '@/blocks/VideoEmbed/config'
import { MediaCarouselBlock } from '@/blocks/MediaCarousel/config'
import { ProgramGridBlock } from '@/blocks/ProgramGrid/config'
import { ProgramMatrixBlock } from '@/blocks/ProgramMatrix/config'
import { LogoStripBlock } from '@/blocks/LogoStrip/config'
import { PageHeaderBlock } from '@/blocks/PageHeader/config'
import { BreadcrumbBlock } from '@/blocks/Breadcrumb/config'
import { TimelineBlock } from '@/blocks/Timeline/config'
import { IconCardShowcaseBlock } from '@/blocks/IconCardShowcase/config'
import { IconGridBlock } from '@/blocks/IconGrid/config'
import { QuoteBlockBlock } from '@/blocks/QuoteBlock/config'
import { TabsContentBlock } from '@/blocks/TabsContent/config'
import { DownloadListBlock } from '@/blocks/DownloadList/config'
import { NumberedStepsBlock } from '@/blocks/NumberedSteps/config'
import { BentoGridBlock } from '@/blocks/BentoGrid/config'
import { TestimonialGridBlock } from '@/blocks/TestimonialGrid/config'
import { AwardsListBlock } from '@/blocks/AwardsList/config'
import { AboutSectionBlock } from '@/blocks/AboutSection/config'
import { AccreditationCardsBlock } from '@/blocks/AccreditationCards/config'
import type { Page } from '@/payload-types'
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
import { validateSEOContract } from '@/hooks/validateSEOContract'
import { editorialWorkflowStateOptions } from '@/lib/editorialWorkflow'

import { createRedirectsForChangedPagePath } from '../hooks/createRedirectsForChangedPagePath'
import { populatePageUrlPreview } from '../hooks/populatePageUrlPreview'
import { preventReferencedPageUnpublish } from '../hooks/preventReferencedPageUnpublish'
import {
  syncNavigationLinkAfterChange,
  syncNavigationLinkAfterDelete,
} from '../hooks/syncNavigationLinkForPage'
import { revalidatePagesCache } from '../hooks/revalidateCmsContent'

const extractPageID = (
  value: string | number | Page | null | undefined,
): string | number | null => {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    return value.id
  }

  return null
}

const validateParentRelationship: RelationshipFieldSingleValidation = async (
  value,
  { id, req },
) => {
  const parentID = extractPageID(value as string | number | Page | null | undefined)

  if (!parentID || id == null) {
    return true
  }

  const currentPageID = id

  if (parentID === currentPageID) {
    return 'A page cannot be its own parent.'
  }

  const visited = new Set<string | number>([currentPageID])
  let nextParentID: string | number | null = parentID

  while (nextParentID != null) {
    if (visited.has(nextParentID)) {
      return 'This parent selection would create a circular page hierarchy.'
    }

    visited.add(nextParentID)

    const parentPage = await req.payload.findByID({
      collection: 'pages',
      id: nextParentID,
      depth: 0,
      req,
    })

    nextParentID = extractPageID(parentPage.parent as string | number | Page | null | undefined)
  }

  return true
}

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

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    group: 'Content',
    hidden: hideFromUsersWithoutCapability('manage_pages'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'workflowState', 'updatedAt'],
    description:
      'Flexible website pages with reusable layout blocks, SEO controls, and publishing settings.',
    listSearchableFields: ['title', 'slug'],
    livePreview: {
      breakpoints: [...previewBreakpoints],
      url: ({ data }) => {
        if (!data?.id) {
          return null
        }

        const appURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

        return `${appURL}/preview/page/${data.id}`
      },
    },
  },
  access: {
    create: requireCapability('manage_pages'),
    delete: requireCapability('manage_pages'),
    read: allowPublicReadOrCapability('manage_pages'),
    readVersions: requireCapability('manage_pages'),
    update: requireCapability('manage_pages'),
  },
  hooks: {
    afterRead: [populatePageUrlPreview],
    afterChange: [
      revalidatePagesCache,
      syncNavigationLinkAfterChange,
      createRedirectsForChangedPagePath,
      createWorkflowQueueHook({
        sourceAdminPathPrefix: '/admin/collections/pages',
        sourceCollection: 'pages',
        states: [
          {
            queueType: 'approval',
            reasonCode: 'page-review-required',
            summary: (_doc, title) => `${title} is awaiting editorial approval.`,
            workflowState: 'in_review',
          },
          {
            priority: () => 'high',
            queueType: 'approval',
            reasonCode: 'page-scheduled-publication',
            summary: (_doc, title) => `${title} is scheduled and requires publication oversight.`,
            workflowState: 'scheduled',
          },
        ],
        titleField: 'title',
      }),
      createCollectionAuditHook({
        entityType: 'page',
        getSummary: ({ doc, previousDoc }) =>
          `Workflow moved from ${previousDoc?.workflowState ?? 'draft'} to ${doc.workflowState}.`,
        titleField: 'title',
      }),
    ],
    afterDelete: [syncNavigationLinkAfterDelete],
    beforeChange: [
      validateSEOContract(),
      enforceEditorialWorkflow('publish_pages', 'pages'),
      preventReferencedPageUnpublish,
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
              name: 'layout',
              label: 'Layout',
              type: 'blocks',
              blocks: [
                AnnouncementBlock,
                BannerCtaBlock,
                NewsGridBlock,
                NewsEventsTabsBlock,
                Cta39Block,
                HeroBannerBlock,
                HeroCarouselBlock,
                GalleryCoverflowBlock,
                FeatureSpotlightBlock,
                TestimonialSpotlightBlock,
                FeatureMatrixBlock,
                ContentHighlightsBlock,
                EditorialReasonsBlock,
                AcademicProgrammesBlock,
                NewsEventsHighlightsBlock,
                ProfileCarouselBlock,
                GalleryShowcaseBlock,
                EventGalleryBlock,
                StudyPathwaysBlock,
                ImageMosaicBlock,
                StudentExperienceBlock,
                StatsStripBlock,
                QaAccordionBlock,
                RatingSpotlightBlock,
                ReviewFeedBlock,
                ReviewSubmissionBlock,
                Contact33Block,
                Contact24Block,
                TeamShowcaseBlock,
                Services21Block,
                RichTextBlock,
                VideoEmbedBlock,
                MediaCarouselBlock,
                ProgramGridBlock,
                ProgramMatrixBlock,
                LogoStripBlock,
                PageHeaderBlock,
                BreadcrumbBlock,
                TimelineBlock,
                IconCardShowcaseBlock,
                IconGridBlock,
                QuoteBlockBlock,
                TabsContentBlock,
                DownloadListBlock,
                NumberedStepsBlock,
                BentoGridBlock,
                TestimonialGridBlock,
                AwardsListBlock,
                AboutSectionBlock,
                AccreditationCardsBlock,
                ReusableSectionBlock,
              ],
              required: false,
              admin: {
                description: 'Compose the page using reusable content blocks.',
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
          label: 'Settings',
          fields: [
            {
              name: 'publicUrlPreview',
              label: 'Public URL',
              type: 'text',
              virtual: true,
              admin: {
                readOnly: true,
                description: 'Resolved from the current saved slug and parent hierarchy.',
              },
            },
            {
              name: 'parent',
              type: 'relationship',
              relationTo: 'pages',
              filterOptions: ({ id }) => {
                if (id == null) {
                  return true
                }

                return {
                  id: {
                    not_equals: id,
                  },
                }
              },
              validate: validateParentRelationship,
              admin: {
                description: 'Use this for nested page hierarchies like /services/web-development.',
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
