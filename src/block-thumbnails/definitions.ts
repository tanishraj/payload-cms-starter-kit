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
    alt: 'Hero Institutional block preview',
    filename: 'hero-institutional.jpg',
    label: 'Hero Institutional',
    slug: 'heroInstitutional',
  }),
  defineThumbnail({
    alt: 'Split Feature block preview',
    filename: 'split-feature.jpg',
    label: 'Split Feature',
    slug: 'splitFeature',
  }),
  defineThumbnail({
    alt: 'Stats Strip block preview',
    filename: 'stats-strip.jpg',
    label: 'Stats Strip',
    slug: 'statsStrip',
  }),
  defineThumbnail({
    alt: 'FAQ block preview',
    filename: 'faq.jpg',
    label: 'FAQ',
    slug: 'faq',
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
