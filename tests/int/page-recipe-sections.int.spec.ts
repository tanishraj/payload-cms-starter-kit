import { describe, expect, it } from 'vitest'
import { parseRecipeSectionOptions } from '@/page-recipes/sectionOptions'

describe('native recipe section response boundary', () => {
  it('labels roots with their draft path and disambiguates missing slugs by ID', () => {
    expect(
      parseRecipeSectionOptions({
        hasNextPage: false,
        docs: [
          { id: 'a', title: 'Admissions', slug: 'admissions', parent: null },
          { id: 'b', title: 'Admissions' },
        ],
      }),
    ).toEqual([
      { id: 'a', label: 'Admissions (/admissions)' },
      { id: 'b', label: 'Admissions (b)' },
    ])
  })
  it('accepts a real empty response', () => {
    expect(parseRecipeSectionOptions({ hasNextPage: false, docs: [] })).toEqual([])
  })
  it.each([
    null,
    {},
    { docs: [] },
    { docs: [], hasNextPage: true },
    { docs: [{ id: 'a', title: 'Child', parent: 'parent' }], hasNextPage: false },
    { docs: [{ id: 'a', title: '  ' }], hasNextPage: false },
    {
      docs: [
        { id: 'a', title: 'One' },
        { id: 'a', title: 'Duplicate' },
      ],
      hasNextPage: false,
    },
    {
      docs: Array.from({ length: 51 }, (_, i) => ({ id: String(i), title: 'Too many' })),
      hasNextPage: false,
    },
  ])('rejects malformed, partial, non-root or ambiguous results: %j', (value) => {
    expect(() => parseRecipeSectionOptions(value)).toThrow()
  })
})
