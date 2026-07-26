import type { Page } from '@/payload-types'
import type { ReviewPreviewSnapshot } from '@/lib/reviewPreviewShared'
import type { NewsEventsPreviewSnapshot } from '@/lib/newsEventsPreviewShared'
import type { SiteOfficeLocation } from '@/lib/siteOfficesShared'

import { AnnouncementBlockComponent } from './Announcement/Component'
import { ContentHighlightsBlockComponent } from './ContentHighlights/Component'
import { FeatureMatrixBlockComponent } from './FeatureMatrix/Component'
import { FeatureSpotlightBlockComponent } from './FeatureSpotlight/Component'
import { Cta39BlockComponent } from './Cta39/Component'
import { GalleryShowcaseBlockComponent } from './GalleryShowcase/Component'
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

export type LivePreviewPageBlock = NonNullable<Page['layout']>[number]

export function renderLivePreviewPageBlocks(
  blocks: Page['layout'] | null | undefined,
  snapshot: ReviewPreviewSnapshot,
  newsEventsSnapshot: NewsEventsPreviewSnapshot,
  officeLocations: SiteOfficeLocation[],
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
          case 'imageMosaic':
            return <ImageMosaicBlockComponent key={key} {...block} />
          case 'reviewSubmission':
            return <ReviewSubmissionBlockComponent key={key} {...block} />
          case 'contact33':
            return <Contact33BlockComponent key={key} {...block} />
          case 'contact24':
            return (
              <Contact24PreviewBlockComponent
                key={key}
                officeLocations={officeLocations}
                {...block}
              />
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
          default:
            return null
        }
      })}
    </PageBlockStack>
  )
}
