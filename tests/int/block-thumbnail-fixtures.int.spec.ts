import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { blockThumbnailDefinitions } from '@/block-thumbnails/definitions'
import {
  blockThumbnailAssetPaths,
  blockThumbnailFixtures,
  getBlockThumbnailFixture,
} from '@/block-thumbnails/fixtures'

describe('block thumbnail fixtures', () => {
  it('renders one production-component fixture for every definition', () => {
    expect(Object.keys(blockThumbnailFixtures)).not.toContain('programGrid')
    expect(Object.keys(blockThumbnailFixtures).sort()).toEqual(
      blockThumbnailDefinitions.map(({ slug }) => slug).sort(),
    )

    for (const definition of blockThumbnailDefinitions) {
      let html = ''

      try {
        html = renderToStaticMarkup(getBlockThumbnailFixture(definition.slug))
      } catch (error) {
        throw new Error(`Failed to render ${definition.slug} thumbnail fixture.`, {
          cause: error,
        })
      }

      expect(html.length).toBeGreaterThan(100)
      expect(html).not.toContain('Replace this file')
    }
  })

  it('uses the consolidated Academic Programmes capabilities in its fixture', () => {
    const html = renderToStaticMarkup(getBlockThumbnailFixture('academicProgrammes'))

    expect(html).toContain('data-academic-programmes-filter="true"')
    expect(html).toContain('Flagship programme')
    expect(html).toContain('4.5 Years')
    expect(html).toContain('150 Seats')
    expect(html).toContain('data-academic-programme-image="false"')
  })

  it('uses repository-local media assets only', () => {
    for (const assetPath of blockThumbnailAssetPaths) {
      expect(assetPath).toMatch(/^\/block-thumbnail-assets\//)
      expect(assetPath).not.toMatch(/^https?:\/\//)
    }
  })
})
