import type { Page } from '@/payload-types'
import type { ReviewPreviewSnapshot } from '@/lib/reviewPreviewShared'

import { AnnouncementBlockComponent } from './Announcement/Component'
import { ContentHighlightsBlockComponent } from './ContentHighlights/Component'
import { FeatureMatrixBlockComponent } from './FeatureMatrix/Component'
import { FeatureSpotlightBlockComponent } from './FeatureSpotlight/Component'
import { GalleryShowcaseBlockComponent } from './GalleryShowcase/Component'
import { HeroBannerBlockComponent } from './HeroBanner/Component'
import { ImageMosaicBlockComponent } from './ImageMosaic/Component'
import { PageBlockStack } from './PageBlockStack'
import { ProfileCarouselBlockComponent } from './ProfileCarousel/Component'
import { QaAccordionBlockComponent } from './QaAccordion/Component'
import { RatingSpotlightPreviewBlockComponent } from './RatingSpotlight/PreviewComponent'
import { ReviewFeedPreviewBlockComponent } from './ReviewFeed/PreviewComponent'
import { ReviewSubmissionBlockComponent } from './ReviewSubmission/Component'
import { StatsStripBlockComponent } from './StatsStrip/Component'

export type LivePreviewPageBlock = NonNullable<Page['layout']>[number]

export function renderLivePreviewPageBlocks(
  blocks: Page['layout'] | null | undefined,
  snapshot: ReviewPreviewSnapshot,
) {
  if (!blocks?.length) {
    return null
  }

  return (
    <PageBlockStack>
      {blocks.map((block, index) => {
        const key = block.id ?? `${block.blockType}-${index}`

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
          case 'profileCarousel':
            return <ProfileCarouselBlockComponent key={key} {...block} />
          case 'galleryShowcase':
            return <GalleryShowcaseBlockComponent key={key} {...block} />
          case 'imageMosaic':
            return <ImageMosaicBlockComponent key={key} {...block} />
          case 'reviewSubmission':
            return <ReviewSubmissionBlockComponent key={key} {...block} />
          case 'ratingSpotlight':
            return <RatingSpotlightPreviewBlockComponent key={key} snapshot={snapshot} {...block} />
          case 'reviewFeed':
            return <ReviewFeedPreviewBlockComponent key={key} snapshot={snapshot} {...block} />
          case 'featureSpotlight':
            return <FeatureSpotlightBlockComponent key={key} {...block} />
          case 'statsStrip':
            return <StatsStripBlockComponent key={key} {...block} />
          default:
            return null
        }
      })}
    </PageBlockStack>
  )
}
