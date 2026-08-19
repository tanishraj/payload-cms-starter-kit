import type { CollectionConfig } from 'payload'

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
import { GalleryAlbumTabsBlock } from '@/blocks/GalleryAlbumTabs/config'
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
    description:
      'Shared block groups that sync across every page that references them. Edit once, update everywhere.',
    group: 'Content',
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
        GalleryAlbumTabsBlock,
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
      ],
    },
  ],
}
