import React from 'react'
import type { Page } from '@/payload-types'

import { AnnouncementBlockComponent } from './Announcement/Component'
import { ContentHighlightsBlockComponent } from './ContentHighlights/Component'
import { QaAccordionBlockComponent } from './QaAccordion/Component'
import { FeatureMatrixBlockComponent } from './FeatureMatrix/Component'
import { GalleryShowcaseBlockComponent } from './GalleryShowcase/Component'
import { EventGalleryBlockComponent } from './EventGallery/Component'
import { HeroBannerBlockComponent } from './HeroBanner/Component'
import { ImageMosaicBlockComponent } from './ImageMosaic/Component'
import { NewsEventsHighlightsBlockComponent } from './NewsEventsHighlights/Component'
import { ProfileCarouselBlockComponent } from './ProfileCarousel/Component'
import { RatingSpotlightBlockComponent } from './RatingSpotlight/Component'
import { ReviewFeedBlockComponent } from './ReviewFeed/Component'
import { ReviewSubmissionBlockComponent } from './ReviewSubmission/Component'
import { Contact24BlockComponent } from './Contact24/Component'
import { Contact33BlockComponent } from './Contact33/Component'
import { FeatureSpotlightBlockComponent } from './FeatureSpotlight/Component'
import { Cta39BlockComponent } from './Cta39/Component'
import { TeamShowcaseBlockComponent } from './TeamShowcase/Component'
import { PageBlockStack } from './PageBlockStack'
import { StatsStripBlockComponent } from './StatsStrip/Component'
import { Services21BlockComponent } from './Services21/Component'

export type PageBlock = NonNullable<Page['layout']>[number]

// Populated shape of a reusable section document (after depth resolution).
// Full types are generated after `pnpm generate:types`.
type PopulatedReusableSection = {
  id: string | number
  title: string
  layout?: PageBlock[] | null
}

function renderSingleBlock(block: PageBlock, index: number, depth = 0): React.ReactNode {
  // Guard against unexpected circular nesting at the data level.
  if (depth > 10) return null

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
      return <NewsEventsHighlightsBlockComponent key={key} {...block} />
    case 'profileCarousel':
      return <ProfileCarouselBlockComponent key={key} {...block} />
    case 'galleryShowcase':
      return <GalleryShowcaseBlockComponent key={key} {...block} />
    case 'eventGallery':
      return <EventGalleryBlockComponent key={key} {...block} />
    case 'imageMosaic':
      return <ImageMosaicBlockComponent key={key} {...block} />
    case 'reviewSubmission':
      return <ReviewSubmissionBlockComponent key={key} {...block} />
    case 'contact33':
      return <Contact33BlockComponent key={key} {...block} />
    case 'contact24':
      return <Contact24BlockComponent key={key} {...block} />
    case 'ratingSpotlight':
      return <RatingSpotlightBlockComponent key={key} {...block} />
    case 'reviewFeed':
      return <ReviewFeedBlockComponent key={key} {...block} />
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
    case 'reusableSection': {
      const populated = block.section as PopulatedReusableSection | string | null | undefined
      if (!populated || typeof populated === 'string') return null
      const innerBlocks = populated.layout ?? []
      if (!innerBlocks.length) return null
      return (
        <React.Fragment key={key}>
          {innerBlocks.map((inner, i) => renderSingleBlock(inner, i, depth + 1))}
        </React.Fragment>
      )
    }
    default:
      return null
  }
}

export function renderPageBlocks(blocks?: PageBlock[] | null) {
  if (!blocks?.length) {
    return null
  }

  return (
    <PageBlockStack>
      {blocks.map((block, index) => renderSingleBlock(block, index))}
    </PageBlockStack>
  )
}
