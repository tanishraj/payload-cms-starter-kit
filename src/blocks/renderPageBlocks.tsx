import React from 'react'
import type { Page } from '@/payload-types'

import { AnnouncementBlockComponent } from './Announcement/Component'
import { ContentHighlightsBlockComponent } from './ContentHighlights/Component'
import { QaAccordionBlockComponent } from './QaAccordion/Component'
import { FeatureMatrixBlockComponent } from './FeatureMatrix/Component'
import { GalleryShowcaseBlockComponent } from './GalleryShowcase/Component'
import { EventGalleryBlockComponent } from './EventGallery/Component'
import { HeroBannerBlockComponent } from './HeroBanner/Component'
import { HeroCarouselBlockComponent } from './HeroCarousel/Component'
import { GalleryCoverflowBlockComponent } from './GalleryCoverflow/Component'
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
import { RichTextBlockComponent } from './RichTextBlock/Component'
import { VideoEmbedBlockComponent } from './VideoEmbed/Component'
import { MediaCarouselBlockComponent } from './MediaCarousel/Component'
import { ProgramGridBlockComponent } from './ProgramGrid/Component'
import { LogoStripBlockComponent } from './LogoStrip/Component'
import { PageHeaderBlockComponent } from './PageHeader/Component'
import { TimelineBlockComponent } from './Timeline/Component'
import { IconGridBlockComponent } from './IconGrid/Component'
import { QuoteBlockBlockComponent } from './QuoteBlock/Component'
import { TabsContentBlockComponent } from './TabsContent/Component'
import { DownloadListBlockComponent } from './DownloadList/Component'
import { NumberedStepsBlockComponent } from './NumberedSteps/Component'
import { BentoGridBlockComponent } from './BentoGrid/Component'
import { TestimonialGridBlockComponent } from './TestimonialGrid/Component'
import { AwardsListBlockComponent } from './AwardsList/Component'
import { AboutSectionBlockComponent } from './AboutSection/Component'
import { BlockErrorBoundary } from './shared/BlockErrorBoundary'

export type PageBlock = NonNullable<Page['layout']>[number]

type PopulatedReusableSection = {
  id: string | number
  title?: string | null
  layout?: PageBlock[] | null
}

function renderSingleBlock(block: PageBlock, index: number, depth = 0): React.ReactNode {
  if (depth > 10) return null

  const key = block.id ?? `${block.blockType}-${index}`
  const wrap = (element: React.ReactNode) => (
    <BlockErrorBoundary key={key} blockType={block.blockType}>
      {element}
    </BlockErrorBoundary>
  )

  switch (block.blockType) {
    case 'announcement':
      return wrap(<AnnouncementBlockComponent {...block} />)
    case 'heroBanner':
      return wrap(<HeroBannerBlockComponent {...block} />)
    case 'heroCarousel':
      return wrap(<HeroCarouselBlockComponent {...block} />)
    case 'galleryCoverflow':
      return wrap(<GalleryCoverflowBlockComponent {...block} />)
    case 'qaAccordion':
      return wrap(<QaAccordionBlockComponent {...block} />)
    case 'featureMatrix':
      return wrap(<FeatureMatrixBlockComponent {...block} />)
    case 'contentHighlights':
      return wrap(<ContentHighlightsBlockComponent {...block} />)
    case 'newsEventsHighlights':
      return wrap(<NewsEventsHighlightsBlockComponent {...block} />)
    case 'profileCarousel':
      return wrap(<ProfileCarouselBlockComponent {...block} />)
    case 'galleryShowcase':
      return wrap(<GalleryShowcaseBlockComponent {...block} />)
    case 'eventGallery':
      return wrap(<EventGalleryBlockComponent {...block} />)
    case 'imageMosaic':
      return wrap(<ImageMosaicBlockComponent {...block} />)
    case 'reviewSubmission':
      return wrap(<ReviewSubmissionBlockComponent {...block} />)
    case 'contact33':
      return wrap(<Contact33BlockComponent {...block} />)
    case 'contact24':
      return wrap(<Contact24BlockComponent {...block} />)
    case 'ratingSpotlight':
      return wrap(<RatingSpotlightBlockComponent {...block} />)
    case 'reviewFeed':
      return wrap(<ReviewFeedBlockComponent {...block} />)
    case 'featureSpotlight':
      return wrap(<FeatureSpotlightBlockComponent {...block} />)
    case 'statsStrip':
      return wrap(<StatsStripBlockComponent {...block} />)
    case 'teamShowcase':
      return wrap(<TeamShowcaseBlockComponent {...block} />)
    case 'services21':
      return wrap(<Services21BlockComponent {...block} />)
    case 'cta39':
      return wrap(<Cta39BlockComponent {...block} />)
    case 'richText':
      return wrap(<RichTextBlockComponent {...block} />)
    case 'videoEmbed':
      return wrap(<VideoEmbedBlockComponent {...block} />)
    case 'mediaCarousel':
      return wrap(<MediaCarouselBlockComponent {...block} />)
    case 'programGrid':
      return wrap(<ProgramGridBlockComponent {...block} />)
    case 'logoStrip':
      return wrap(<LogoStripBlockComponent {...block} />)
    case 'pageHeader':
      return wrap(<PageHeaderBlockComponent {...block} />)
    case 'timeline':
      return wrap(<TimelineBlockComponent {...block} />)
    case 'iconGrid':
      return wrap(<IconGridBlockComponent {...block} />)
    case 'quoteBlock':
      return wrap(<QuoteBlockBlockComponent {...block} />)
    case 'tabsContent':
      return wrap(<TabsContentBlockComponent {...block} />)
    case 'downloadList':
      return wrap(<DownloadListBlockComponent {...block} />)
    case 'numberedSteps':
      return wrap(<NumberedStepsBlockComponent {...block} />)
    case 'bentoGrid':
      return wrap(<BentoGridBlockComponent {...block} />)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    case 'testimonialGrid':
      return wrap(<TestimonialGridBlockComponent {...(block as any)} />)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    case 'awardsList':
      return wrap(<AwardsListBlockComponent {...(block as any)} />)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    case 'aboutSection':
      return wrap(<AboutSectionBlockComponent {...(block as any)} />)
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
