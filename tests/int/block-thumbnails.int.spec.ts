import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import type { Block, Field } from 'payload'

import {
  blockThumbnailDefinitions,
  type BlockThumbnailSlug,
  getBlockThumbnailDefinition,
  isBlockThumbnailPreviewEnabled,
} from '@/block-thumbnails/definitions'
import { Footers } from '@/collections/Footers'
import { Headers } from '@/collections/Headers'
import { Pages } from '@/collections/Pages'
import { SystemPages } from '@/collections/SystemPages'

const collectRegisteredBlocks = (fields: Field[]): Block[] =>
  fields.flatMap((field) => {
    if (field.type === 'blocks') {
      return field.blocks
    }

    if (field.type === 'tabs') {
      return field.tabs.flatMap((tab) => collectRegisteredBlocks(tab.fields))
    }

    if ('fields' in field && Array.isArray(field.fields)) {
      return collectRegisteredBlocks(field.fields)
    }

    return []
  })

const registeredBlocks = [Pages, Headers, Footers, SystemPages].flatMap((collection) =>
  collectRegisteredBlocks(collection.fields),
)

describe('block thumbnail metadata', () => {
  it('covers every registered Payload block exactly once', () => {
    const registeredSlugs = registeredBlocks.map(({ slug }) => slug)
    const definitionSlugs = blockThumbnailDefinitions.map(({ slug }) => slug)

    expect(registeredSlugs.slice().sort()).toEqual([
      'announcement',
      'contact24',
      'contact33',
      'contentHighlights',
      'cta39',
      'featureMatrix',
      'featureSpotlight',
      'footer56',
      'galleryShowcase',
      'headerNavbar12',
      'heroBanner',
      'imageMosaic',
      'newsEventsHighlights',
      'profileCarousel',
      'qaAccordion',
      'ratingSpotlight',
      'reviewFeed',
      'reviewSubmission',
      'services21',
      'statsStrip',
      'system404',
      'systemComingSoon',
      'systemMaintenance',
      'teamShowcase',
    ])
    expect(definitionSlugs.slice().sort()).toEqual(registeredSlugs.slice().sort())
    expect(new Set(definitionSlugs).size).toBe(definitionSlugs.length)
  })

  it('uses manifest metadata in every Payload block config', () => {
    for (const block of registeredBlocks) {
      const definition = getBlockThumbnailDefinition(block.slug as BlockThumbnailSlug)

      expect(block.admin?.images?.thumbnail).toEqual({
        alt: definition.alt,
        url: definition.url,
      })
    }
  })

  it('enables the internal preview only in development', () => {
    expect(isBlockThumbnailPreviewEnabled('development')).toBe(true)
    expect(isBlockThumbnailPreviewEnabled('production')).toBe(false)
    expect(isBlockThumbnailPreviewEnabled('test')).toBe(false)
    expect(isBlockThumbnailPreviewEnabled(undefined)).toBe(false)
  })

  it('exposes one repeatable package command and unique output paths', () => {
    const packageJson = JSON.parse(
      readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'),
    ) as {
      scripts?: Record<string, string>
    }
    const definitionSlugs = blockThumbnailDefinitions.map(({ slug }) => slug)
    const filenames = blockThumbnailDefinitions.map(({ filename }) => filename)
    const urls = blockThumbnailDefinitions.map(({ url }) => url)

    expect(packageJson.scripts?.['generate:block-thumbnails']).toBe(
      'tsx scripts/generate-block-thumbnails.ts',
    )
    expect(new Set(filenames).size).toBe(filenames.length)
    expect(new Set(urls).size).toBe(urls.length)
    expect(getBlockThumbnailDefinition('featureMatrix')).toMatchObject({
      filename: 'feature-matrix.jpg',
      label: 'Feature Matrix',
      slug: 'featureMatrix',
    })
    expect(getBlockThumbnailDefinition('contentHighlights')).toMatchObject({
      filename: 'content-highlights.jpg',
      label: 'Content Highlights',
      slug: 'contentHighlights',
      stageAlignment: 'top',
    })
    expect(getBlockThumbnailDefinition('newsEventsHighlights')).toMatchObject({
      filename: 'news-events-highlights.jpg',
      label: 'News & Events Highlights',
      slug: 'newsEventsHighlights',
      stageAlignment: 'top',
    })
    expect(getBlockThumbnailDefinition('featureSpotlight')).toMatchObject({
      filename: 'feature-spotlight.jpg',
      label: 'Feature Spotlight',
      slug: 'featureSpotlight',
    })
    expect(getBlockThumbnailDefinition('profileCarousel')).toMatchObject({
      filename: 'profile-carousel.jpg',
      label: 'Profile Carousel',
      slug: 'profileCarousel',
    })
    expect(getBlockThumbnailDefinition('galleryShowcase')).toMatchObject({
      filename: 'gallery-showcase.jpg',
      label: 'Gallery Showcase',
      slug: 'galleryShowcase',
      stageAlignment: 'top',
    })
    expect(getBlockThumbnailDefinition('imageMosaic')).toMatchObject({
      filename: 'image-mosaic.jpg',
      label: 'Image Mosaic',
      slug: 'imageMosaic',
      stageAlignment: 'top',
    })
    expect(getBlockThumbnailDefinition('ratingSpotlight')).toMatchObject({
      filename: 'rating-spotlight.jpg',
      label: 'Rating Spotlight',
      slug: 'ratingSpotlight',
    })
    expect(getBlockThumbnailDefinition('reviewFeed')).toMatchObject({
      filename: 'review-feed.jpg',
      label: 'Review Feed',
      slug: 'reviewFeed',
      stageAlignment: 'top',
    })
    expect(getBlockThumbnailDefinition('contact33')).toMatchObject({
      alt: 'Contact 33 block preview',
      filename: 'contact-33.jpg',
      label: 'Contact 33',
      slug: 'contact33',
      stageAlignment: 'top',
    })
    expect(getBlockThumbnailDefinition('contact24')).toMatchObject({
      alt: 'Contact 24 block preview',
      filename: 'contact-24.jpg',
      label: 'Contact 24',
      slug: 'contact24',
      stageAlignment: 'top',
    })
    expect(getBlockThumbnailDefinition('qaAccordion')).toMatchObject({
      filename: 'qa-accordion.jpg',
      label: 'Q&A Accordion',
      slug: 'qaAccordion',
    })
    expect(getBlockThumbnailDefinition('heroBanner')).toMatchObject({
      filename: 'hero-banner.jpg',
      label: 'Hero Banner',
      slug: 'heroBanner',
    })
    expect(getBlockThumbnailDefinition('services21')).toMatchObject({
      filename: 'services-21.jpg',
      label: 'Services',
      slug: 'services21',
      stageAlignment: 'top',
    })
    expect(definitionSlugs).not.toContain('feature166')
    expect(filenames).not.toContain('feature-166.jpg')
  })

  it('has an exact 1600 by 900 JPEG for every definition', async () => {
    for (const definition of blockThumbnailDefinitions) {
      const outputPath = path.resolve(
        process.cwd(),
        'public',
        'block-thumbnails',
        definition.filename,
      )

      expect(existsSync(outputPath), `${definition.slug} thumbnail is missing`).toBe(true)

      if (!existsSync(outputPath)) {
        continue
      }

      const metadata = await sharp(outputPath).metadata()

      expect(metadata.format).toBe('jpeg')
      expect(metadata.width).toBe(1600)
      expect(metadata.height).toBe(900)
    }
  })
})
