import type { Block } from 'payload'

type BlockThumbnailDefinitionInput = {
  alt: string
  filename: string
  label: string
  slug: string
  stageAlignment?: 'center' | 'top'
}

const defineThumbnail = <const Definition extends BlockThumbnailDefinitionInput>({
  stageAlignment = 'center',
  ...definition
}: Definition) => ({
  ...definition,
  stageAlignment,
  url: `/block-thumbnails/${definition.filename}` as const,
})

export const blockThumbnailDefinitions = [
  defineThumbnail({
    alt: 'Announcement block preview',
    filename: 'announcement.jpg',
    label: 'Announcement',
    slug: 'announcement',
  }),
  defineThumbnail({
    alt: 'Hero Banner block preview',
    filename: 'hero-banner.jpg',
    label: 'Hero Banner',
    slug: 'heroBanner',
  }),
  defineThumbnail({
    alt: 'Feature Spotlight block preview',
    filename: 'feature-spotlight.jpg',
    label: 'Feature Spotlight',
    slug: 'featureSpotlight',
  }),
  defineThumbnail({
    alt: 'Feature Matrix block preview',
    filename: 'feature-matrix.jpg',
    label: 'Feature Matrix',
    slug: 'featureMatrix',
    stageAlignment: 'top',
  }),
  defineThumbnail({
    alt: 'Content Highlights block preview',
    filename: 'content-highlights.jpg',
    label: 'Content Highlights',
    slug: 'contentHighlights',
    stageAlignment: 'top',
  }),
  defineThumbnail({
    alt: 'News & Events Highlights block preview',
    filename: 'news-events-highlights.jpg',
    label: 'News & Events Highlights',
    slug: 'newsEventsHighlights',
    stageAlignment: 'top',
  }),
  defineThumbnail({
    alt: 'Profile Carousel block preview',
    filename: 'profile-carousel.jpg',
    label: 'Profile Carousel',
    slug: 'profileCarousel',
    stageAlignment: 'top',
  }),
  defineThumbnail({
    alt: 'Gallery Showcase block preview',
    filename: 'gallery-showcase.jpg',
    label: 'Gallery Showcase',
    slug: 'galleryShowcase',
    stageAlignment: 'top',
  }),
  defineThumbnail({
    alt: 'Image Mosaic block preview',
    filename: 'image-mosaic.jpg',
    label: 'Image Mosaic',
    slug: 'imageMosaic',
    stageAlignment: 'top',
  }),
  defineThumbnail({
    alt: 'Stats Strip block preview',
    filename: 'stats-strip.jpg',
    label: 'Stats Strip',
    slug: 'statsStrip',
  }),
  defineThumbnail({
    alt: 'Team Showcase block preview',
    filename: 'team-showcase.jpg',
    label: 'Team Showcase',
    slug: 'teamShowcase',
    stageAlignment: 'top',
  }),
  defineThumbnail({
    alt: 'Q&A Accordion block preview',
    filename: 'qa-accordion.jpg',
    label: 'Q&A Accordion',
    slug: 'qaAccordion',
    stageAlignment: 'top',
  }),
  defineThumbnail({
    alt: 'Review Feed block preview',
    filename: 'review-feed.jpg',
    label: 'Review Feed',
    slug: 'reviewFeed',
    stageAlignment: 'top',
  }),
  defineThumbnail({
    alt: 'Review Submission block preview',
    filename: 'review-submission.jpg',
    label: 'Review Submission',
    slug: 'reviewSubmission',
    stageAlignment: 'top',
  }),
  defineThumbnail({
    alt: 'Rating Spotlight block preview',
    filename: 'rating-spotlight.jpg',
    label: 'Rating Spotlight',
    slug: 'ratingSpotlight',
  }),
  defineThumbnail({
    alt: 'Header Navbar 12 block preview',
    filename: 'header-navbar-12.jpg',
    label: 'Header Navbar 12',
    slug: 'headerNavbar12',
  }),
  defineThumbnail({
    alt: 'Footer 56 block preview',
    filename: 'footer-56.jpg',
    label: 'Footer 56',
    slug: 'footer56',
    stageAlignment: 'top',
  }),
  defineThumbnail({
    alt: 'System 404 preview',
    filename: 'system-404.jpg',
    label: 'System 404',
    slug: 'system404',
  }),
  defineThumbnail({
    alt: 'System Maintenance preview',
    filename: 'system-maintenance.jpg',
    label: 'System Maintenance',
    slug: 'systemMaintenance',
  }),
  defineThumbnail({
    alt: 'System Coming Soon preview',
    filename: 'system-coming-soon.jpg',
    label: 'System Coming Soon',
    slug: 'systemComingSoon',
  }),
] as const

export type BlockThumbnailSlug = (typeof blockThumbnailDefinitions)[number]['slug']

export const isBlockThumbnailSlug = (value: string): value is BlockThumbnailSlug =>
  blockThumbnailDefinitions.some(({ slug }) => slug === value)

export function getBlockThumbnailDefinition(slug: BlockThumbnailSlug) {
  const definition = blockThumbnailDefinitions.find((item) => item.slug === slug)

  if (!definition) {
    throw new Error(`Unknown block thumbnail slug: ${slug}`)
  }

  return definition
}

export function getBlockThumbnailAdmin(slug: BlockThumbnailSlug): NonNullable<Block['admin']> {
  const { alt, url } = getBlockThumbnailDefinition(slug)

  return {
    images: {
      thumbnail: {
        alt,
        url,
      },
    },
  }
}

export const isBlockThumbnailPreviewEnabled = (nodeEnv: string | undefined) =>
  nodeEnv === 'development'
