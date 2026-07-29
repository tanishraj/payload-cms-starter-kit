import React from 'react'
import type { Page } from '@/payload-types'
import type { ReviewPreviewSnapshot } from '@/lib/reviewPreviewShared'
import type { NewsEventsPreviewSnapshot } from '@/lib/newsEventsPreviewShared'
import type { SiteOfficeLocation } from '@/lib/siteOfficesShared'
import type { EventGalleryAlbum } from '@/lib/eventGalleryShared'

import { AnnouncementBlockComponent } from './Announcement/Component'
import { ContentHighlightsBlockComponent } from './ContentHighlights/Component'
import { FeatureMatrixBlockComponent } from './FeatureMatrix/Component'
import { FeatureSpotlightBlockComponent } from './FeatureSpotlight/Component'
import { Cta39BlockComponent } from './Cta39/Component'
import { GalleryShowcaseBlockComponent } from './GalleryShowcase/Component'
import { EventGalleryPreviewBlockComponent } from './EventGallery/PreviewComponent'
import { HeroBannerBlockComponent } from './HeroBanner/Component'
import { ImageMosaicBlockComponent } from './ImageMosaic/Component'
import { NewsEventsHighlightsPreviewBlockComponent } from './NewsEventsHighlights/PreviewComponent'
import { PageBlockStack } from './PageBlockStack'
import { ProfileCarouselBlockComponent } from './ProfileCarousel/Component'
import { QaAccordionBlockComponent } from './QaAccordion/Component'
import { RatingSpotlightPreviewBlockComponent } from './RatingSpotlight/PreviewComponent'
import { ReviewFeedPreviewBlockComponent } from './ReviewFeed/PreviewComponent'
import { ReviewSubmissionBlockComponent } from './ReviewSubmission/Component'
import { Contact24PreviewBlockComponent } from './Contact24/PreviewComponent'
import { Contact33BlockComponent } from './Contact33/Component'
import { TeamShowcaseBlockComponent } from './TeamShowcase/Component'
import { StatsStripBlockComponent } from './StatsStrip/Component'
import { Services21BlockComponent } from './Services21/Component'
import { RichTextBlockComponent } from './RichTextBlock/Component'
import { VideoEmbedBlockComponent } from './VideoEmbed/Component'
import { MediaCarouselBlockComponent } from './MediaCarousel/Component'
import { ProgramGridBlockComponent } from './ProgramGrid/Component'
import { LogoStripBlockComponent } from './LogoStrip/Component'
import { PageHeaderBlockComponent } from './PageHeader/Component'
import { TimelineBlockComponent } from './Timeline/Component'

export type LivePreviewPageBlock = NonNullable<Page['layout']>[number]

type PopulatedReusableSection = {
  id: string | number
  title: string
  layout?: LivePreviewPageBlock[] | null
}

type SnapshotArgs = {
  snapshot: ReviewPreviewSnapshot
  newsEventsSnapshot: NewsEventsPreviewSnapshot
  officeLocations: SiteOfficeLocation[]
  eventGalleryAlbums: EventGalleryAlbum[]
}

function renderSingleLivePreviewBlock(
  block: LivePreviewPageBlock,
  index: number,
  args: SnapshotArgs,
  depth = 0,
): React.ReactNode {
  if (depth > 10) return null

  const key = block.id ?? `${block.blockType}-${index}`
  const { snapshot, newsEventsSnapshot, officeLocations, eventGalleryAlbums } = args

  switch (block.blockType) {
    case 'announcement':
      return <AnnouncementBlockComponent key={key} {...block} />
    case 'heroBanner':
      return <HeroBannerBlockComponent key={key} {...block} />
    case 'qaAccordion':
      return <QaAccordionBlockComponent key={key} {...block} />
    case 'featureMatrix':
      return <FeatureMatrixBlockComponent key={key} {...block} />
    case 'contentHighlights':
      return <ContentHighlightsBlockComponent key={key} {...block} />
    case 'newsEventsHighlights':
      return (
        <NewsEventsHighlightsPreviewBlockComponent
          key={key}
          snapshot={newsEventsSnapshot}
          {...block}
        />
      )
    case 'profileCarousel':
      return <ProfileCarouselBlockComponent key={key} {...block} />
    case 'galleryShowcase':
      return <GalleryShowcaseBlockComponent key={key} {...block} />
    case 'eventGallery':
      return (
        <EventGalleryPreviewBlockComponent albums={eventGalleryAlbums} key={key} {...block} />
      )
    case 'imageMosaic':
      return <ImageMosaicBlockComponent key={key} {...block} />
    case 'reviewSubmission':
      return <ReviewSubmissionBlockComponent key={key} {...block} />
    case 'contact33':
      return <Contact33BlockComponent key={key} {...block} />
    case 'contact24':
      return (
        <Contact24PreviewBlockComponent key={key} officeLocations={officeLocations} {...block} />
      )
    case 'ratingSpotlight':
      return <RatingSpotlightPreviewBlockComponent key={key} snapshot={snapshot} {...block} />
    case 'reviewFeed':
      return <ReviewFeedPreviewBlockComponent key={key} snapshot={snapshot} {...block} />
    case 'featureSpotlight':
      return <FeatureSpotlightBlockComponent key={key} {...block} />
    case 'statsStrip':
      return <StatsStripBlockComponent key={key} {...block} />
    case 'teamShowcase':
      return <TeamShowcaseBlockComponent key={key} {...block} />
    case 'services21':
      return <Services21BlockComponent key={key} {...block} />
    case 'cta39':
      return <Cta39BlockComponent key={key} {...block} />
    case 'richText':
      return <RichTextBlockComponent key={key} {...block} />
    case 'videoEmbed':
      return <VideoEmbedBlockComponent key={key} {...block} />
    case 'mediaCarousel':
      return <MediaCarouselBlockComponent key={key} {...block} />
    case 'programGrid':
      return <ProgramGridBlockComponent key={key} {...block} />
    case 'logoStrip':
      return <LogoStripBlockComponent key={key} {...block} />
    case 'pageHeader':
      return <PageHeaderBlockComponent key={key} {...block} />
    case 'timeline':
      return <TimelineBlockComponent key={key} {...block} />
    case 'reusableSection': {
      const populated = block.section as PopulatedReusableSection | string | null | undefined
      if (!populated || typeof populated === 'string') return null
      const innerBlocks = populated.layout ?? []
      if (!innerBlocks.length) return null
      return (
        <React.Fragment key={key}>
          {innerBlocks.map((inner, i) => renderSingleLivePreviewBlock(inner, i, args, depth + 1))}
        </React.Fragment>
      )
    }
    default:
      return null
  }
}

export function renderLivePreviewPageBlocks(
  blocks: Page['layout'] | null | undefined,
  snapshot: ReviewPreviewSnapshot,
  newsEventsSnapshot: NewsEventsPreviewSnapshot,
  officeLocations: SiteOfficeLocation[],
  eventGalleryAlbums: EventGalleryAlbum[],
) {
  if (!blocks?.length) {
    return null
  }

  const args: SnapshotArgs = { snapshot, newsEventsSnapshot, officeLocations, eventGalleryAlbums }

  return (
    <PageBlockStack>
      {blocks.map((block, index) => renderSingleLivePreviewBlock(block, index, args))}
    </PageBlockStack>
  )
}
