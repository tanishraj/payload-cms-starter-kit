import type { CollectionConfig } from 'payload'

import { AnnouncementBlock } from '@/blocks/Announcement/config'
import { ContentHighlightsBlock } from '@/blocks/ContentHighlights/config'
import { QaAccordionBlock } from '@/blocks/QaAccordion/config'
import { FeatureMatrixBlock } from '@/blocks/FeatureMatrix/config'
import { Cta39Block } from '@/blocks/Cta39/config'
import { GalleryShowcaseBlock } from '@/blocks/GalleryShowcase/config'
import { EventGalleryBlock } from '@/blocks/EventGallery/config'
import { ImageMosaicBlock } from '@/blocks/ImageMosaic/config'
import { NewsEventsHighlightsBlock } from '@/blocks/NewsEventsHighlights/config'
import { ProfileCarouselBlock } from '@/blocks/ProfileCarousel/config'
import { HeroBannerBlock } from '@/blocks/HeroBanner/config'
import { RatingSpotlightBlock } from '@/blocks/RatingSpotlight/config'
import { ReviewFeedBlock } from '@/blocks/ReviewFeed/config'
import { ReviewSubmissionBlock } from '@/blocks/ReviewSubmission/config'
import { Contact24Block } from '@/blocks/Contact24/config'
import { Contact33Block } from '@/blocks/Contact33/config'
import { StatsStripBlock } from '@/blocks/StatsStrip/config'
import { Services21Block } from '@/blocks/Services21/config'
import { TeamShowcaseBlock } from '@/blocks/TeamShowcase/config'
import { FeatureSpotlightBlock } from '@/blocks/FeatureSpotlight/config'
import { RichTextBlock } from '@/blocks/RichTextBlock/config'
import { VideoEmbedBlock } from '@/blocks/VideoEmbed/config'
import { MediaCarouselBlock } from '@/blocks/MediaCarousel/config'
import { ProgramGridBlock } from '@/blocks/ProgramGrid/config'
import { LogoStripBlock } from '@/blocks/LogoStrip/config'
import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { createCollectionAuditHook } from '@/hooks/logOperationalAuditEvent'
import { revalidateGlobalsCache } from '@/hooks/revalidateCmsContent'

export const ReusableSections: CollectionConfig = {
  slug: 'reusable-sections',
  labels: {
    singular: 'Reusable Section',
    plural: 'Reusable Sections',
  },
  admin: {
    description: 'Shared block groups that sync across every page that references them. Edit once, update everywhere.',
    group: 'Site Structure',
    hidden: hideFromUsersWithoutCapability('manage_pages'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
  },
  access: {
    create: requireCapability('manage_pages'),
    delete: requireCapability('manage_pages'),
    read: allowPublicReadOrCapability('manage_pages'),
    readVersions: requireCapability('manage_pages'),
    update: requireCapability('manage_pages'),
  },
  hooks: {
    afterChange: [
      revalidateGlobalsCache,
      createCollectionAuditHook({
        entityType: 'reusable-section',
        getSummary: ({ doc }) => `Reusable section "${doc.title}" was updated.`,
        titleField: 'title',
      }),
    ],
  },
  versions: { drafts: true },
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal name shown in the admin and in the block picker.',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      // ReusableSectionBlock is intentionally excluded here to prevent circular nesting.
      blocks: [
        AnnouncementBlock,
        Cta39Block,
        HeroBannerBlock,
        FeatureSpotlightBlock,
        FeatureMatrixBlock,
        ContentHighlightsBlock,
        NewsEventsHighlightsBlock,
        ProfileCarouselBlock,
        GalleryShowcaseBlock,
        EventGalleryBlock,
        ImageMosaicBlock,
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
        LogoStripBlock,
      ],
    },
  ],
}
