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
      'faq',
      'featureMatrix',
      'footer56',
      'headerNavbar12',
      'heroInstitutional',
      'reviewSubmission',
      'splitFeature',
      'statsStrip',
      'system404',
      'systemComingSoon',
      'systemMaintenance',
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
