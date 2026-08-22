import type { BlocksFieldValidation, GlobalConfig } from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { AboutSectionBlock } from '@/blocks/AboutSection/config'
import { AcademicProgrammesBlock } from '@/blocks/AcademicProgrammes/config'
import { LeadershipProfilesBlock } from '@/blocks/LeadershipProfiles/config'
import { AccreditationCardsBlock } from '@/blocks/AccreditationCards/config'
import { AnnouncementBlock } from '@/blocks/Announcement/config'
import { AwardsListBlock } from '@/blocks/AwardsList/config'
import { BannerCtaBlock } from '@/blocks/BannerCta/config'
import { BentoGridBlock } from '@/blocks/BentoGrid/config'
import { BreadcrumbBlock } from '@/blocks/Breadcrumb/config'
import { Contact24Block } from '@/blocks/Contact24/config'
import { Contact33Block } from '@/blocks/Contact33/config'
import { ContentHighlightsBlock } from '@/blocks/ContentHighlights/config'
import { Cta39Block } from '@/blocks/Cta39/config'
import { DownloadListBlock } from '@/blocks/DownloadList/config'
import { FeeStructureBlock } from '@/blocks/FeeStructure/config'
import { EditorialReasonsBlock } from '@/blocks/EditorialReasons/config'
import { EventGalleryBlock } from '@/blocks/EventGallery/config'
import { GalleryAlbumTabsBlock } from '@/blocks/GalleryAlbumTabs/config'
import { FeatureMatrixBlock } from '@/blocks/FeatureMatrix/config'
import { FeatureSpotlightBlock } from '@/blocks/FeatureSpotlight/config'
import { GalleryCoverflowBlock } from '@/blocks/GalleryCoverflow/config'
import { GalleryShowcaseBlock } from '@/blocks/GalleryShowcase/config'
import { HeroBannerBlock } from '@/blocks/HeroBanner/config'
import { HeroCarouselBlock } from '@/blocks/HeroCarousel/config'
import { IconCardShowcaseBlock } from '@/blocks/IconCardShowcase/config'
import { IconGridBlock } from '@/blocks/IconGrid/config'
import { ImageMosaicBlock } from '@/blocks/ImageMosaic/config'
import { LogoStripBlock } from '@/blocks/LogoStrip/config'
import { MediaCarouselBlock } from '@/blocks/MediaCarousel/config'
import { NewsEventsContentBlock } from '@/blocks/NewsEventsContent/config'
import { NewsEventsHighlightsBlock } from '@/blocks/NewsEventsHighlights/config'
import { NewsEventsTabsBlock } from '@/blocks/NewsEventsTabs/config'
import { NewsGridBlock } from '@/blocks/NewsGrid/config'
import { NumberedStepsBlock } from '@/blocks/NumberedSteps/config'
import { PageHeaderBlock } from '@/blocks/PageHeader/config'
import { ProfileCarouselBlock } from '@/blocks/ProfileCarousel/config'
import { ProgramMatrixBlock } from '@/blocks/ProgramMatrix/config'
import { QaAccordionBlock } from '@/blocks/QaAccordion/config'
import { QuoteBlockBlock } from '@/blocks/QuoteBlock/config'
import { RatingSpotlightBlock } from '@/blocks/RatingSpotlight/config'
import { ReusableSectionBlock } from '@/blocks/ReusableSection/config'
import { ReviewFeedBlock } from '@/blocks/ReviewFeed/config'
import { ReviewSubmissionBlock } from '@/blocks/ReviewSubmission/config'
import { RichTextBlock } from '@/blocks/RichTextBlock/config'
import { Services21Block } from '@/blocks/Services21/config'
import { StatsStripBlock } from '@/blocks/StatsStrip/config'
import { StudentExperienceBlock } from '@/blocks/StudentExperience/config'
import { TabsContentBlock } from '@/blocks/TabsContent/config'
import { TeamShowcaseBlock } from '@/blocks/TeamShowcase/config'
import { TestimonialGridBlock } from '@/blocks/TestimonialGrid/config'
import { TestimonialSpotlightBlock } from '@/blocks/TestimonialSpotlight/config'
import { TimelineBlock } from '@/blocks/Timeline/config'
import { VideoEmbedBlock } from '@/blocks/VideoEmbed/config'
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

const detailTemplateBlocks = [
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
  LeadershipProfilesBlock,
  NewsEventsHighlightsBlock,
  ProfileCarouselBlock,
  GalleryShowcaseBlock,
  EventGalleryBlock,
  GalleryAlbumTabsBlock,
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
  FeeStructureBlock,
  NumberedStepsBlock,
  BentoGridBlock,
  TestimonialGridBlock,
  AwardsListBlock,
  AboutSectionBlock,
  AccreditationCardsBlock,
  ReusableSectionBlock,
  NewsEventsContentBlock,
]

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
      blocks: detailTemplateBlocks,
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
