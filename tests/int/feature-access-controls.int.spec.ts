import { describe, expect, it } from 'vitest'

import { ADMIN_FEATURE_KEYS } from '@/access/adminFeatures'
import {
  buildFeatureUpdateActions,
  getFeatureAccessSummary,
} from '@/components/admin/featureAccessPresentation'

describe('feature access control presentation', () => {
  it('summarizes direct grants and supporting read-only access', () => {
    const summary = getFeatureAccessSummary({ articles: true, pages: true })

    expect(summary.directKeys).toEqual(['pages', 'articles'])
    expect(summary.dependencyKeys).toEqual([
      'reusableSections',
      'newsEventClassifications',
      'topics',
      'tags',
      'navigationLinks',
      'officeLocations',
      'media',
      'galleryAlbums',
      'forms',
    ])
  })

  it('does not describe directly granted destinations as dependency-only access', () => {
    const summary = getFeatureAccessSummary({ media: true, pages: true })

    expect(summary.directKeys).toContain('media')
    expect(summary.dependencyKeys).not.toContain('media')
  })

  it('builds native Payload field updates for global and grouped bulk controls', () => {
    expect(buildFeatureUpdateActions(['pages', 'articles'], true)).toEqual([
      { path: 'features.pages', type: 'UPDATE', value: true },
      { path: 'features.articles', type: 'UPDATE', value: true },
    ])
    expect(buildFeatureUpdateActions(ADMIN_FEATURE_KEYS, false)).toHaveLength(29)
  })
})
