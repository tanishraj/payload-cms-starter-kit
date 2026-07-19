import type { Page } from '@/payload-types'

import { AnnouncementBlockComponent } from './Announcement/Component'
import { ContentHighlightsBlockComponent } from './ContentHighlights/Component'
import { QaAccordionBlockComponent } from './QaAccordion/Component'
import { FeatureMatrixBlockComponent } from './FeatureMatrix/Component'
import { GalleryShowcaseBlockComponent } from './GalleryShowcase/Component'
import { HeroBannerBlockComponent } from './HeroBanner/Component'
import { ImageMosaicBlockComponent } from './ImageMosaic/Component'
import { NewsEventsHighlightsBlockComponent } from './NewsEventsHighlights/Component'
import { ProfileCarouselBlockComponent } from './ProfileCarousel/Component'
import { RatingSpotlightBlockComponent } from './RatingSpotlight/Component'
import { ReviewFeedBlockComponent } from './ReviewFeed/Component'
import { ReviewSubmissionBlockComponent } from './ReviewSubmission/Component'
import { FeatureSpotlightBlockComponent } from './FeatureSpotlight/Component'
import { PageBlockStack } from './PageBlockStack'
import { StatsStripBlockComponent } from './StatsStrip/Component'

export type PageBlock = NonNullable<Page['layout']>[number]

export function renderPageBlocks(blocks?: PageBlock[] | null) {
  if (!blocks?.length) {
    return null
  }

  return (
    <PageBlockStack>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'announcement':
            return (
              <AnnouncementBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'heroBanner':
            return (
              <HeroBannerBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'qaAccordion':
            return (
              <QaAccordionBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'featureMatrix':
            return (
              <FeatureMatrixBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'contentHighlights':
            return (
              <ContentHighlightsBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'newsEventsHighlights':
            return (
              <NewsEventsHighlightsBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'profileCarousel':
            return (
              <ProfileCarouselBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'galleryShowcase':
            return (
              <GalleryShowcaseBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'imageMosaic':
            return (
              <ImageMosaicBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'reviewSubmission':
            return (
              <ReviewSubmissionBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'ratingSpotlight':
            return (
              <RatingSpotlightBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'reviewFeed':
            return (
              <ReviewFeedBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'featureSpotlight':
            return (
              <FeatureSpotlightBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          case 'statsStrip':
            return (
              <StatsStripBlockComponent
                key={block.id ?? `${block.blockType}-${index}`}
                {...block}
              />
            )
          default:
            return null
        }
      })}
    </PageBlockStack>
  )
}
