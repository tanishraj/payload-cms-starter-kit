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
    expect(Object.keys(blockThumbnailFixtures).sort()).toEqual(
      blockThumbnailDefinitions.map(({ slug }) => slug).sort(),
    )

    for (const definition of blockThumbnailDefinitions) {
      const html = renderToStaticMarkup(getBlockThumbnailFixture(definition.slug))

      expect(html.length).toBeGreaterThan(100)
      expect(html).not.toContain('Replace this file')
    }
  })

  it('uses repository-local media assets only', () => {
    for (const assetPath of blockThumbnailAssetPaths) {
      expect(assetPath).toMatch(/^\/block-thumbnail-assets\//)
      expect(assetPath).not.toMatch(/^https?:\/\//)
    }
  })
})
