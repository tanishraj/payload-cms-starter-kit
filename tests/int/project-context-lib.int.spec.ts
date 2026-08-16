import { describe, expect, it } from 'vitest'

import {
  extractArrayPropertyIdentifiers,
  extractBlockDefinition,
  extractExportedObjectKeys,
  extractImports,
  extractSwitchCases,
  extractThumbnailDefinitions,
  stableStringify,
} from '../../.agents/skills/project-context/scripts/project-context-lib.mjs'

const importFixture = `
  import { Pages } from './collections/Pages'
  import { Articles } from './collections/Articles'
`

const configFixture = `${importFixture}
  export default buildConfig({ collections: [Pages, Articles] })
`

const blockFixture = `
  export const ExampleBlock: Block = {
    slug: 'example',
    interfaceName: 'ExampleBlock',
    fields: [],
  }
`

const systemFactoryFixture = `
  export const System404Block = createSystemPageBlock({
    fields: [],
    slug: 'system404',
  })
`

const thumbnailFixture = `
  export const definitions = [
    defineThumbnail({ slug: 'alpha', filename: 'alpha.jpg' }),
  ]
`

const fixtureObject = `
  export const blockThumbnailFixtures = {
    alpha: null,
    beta: null,
  }
`

describe('project context parser', () => {
  it('extracts imports and registered identifiers', () => {
    expect(extractImports(importFixture, 'src/payload.config.ts')).toEqual({
      Articles: './collections/Articles',
      Pages: './collections/Pages',
    })
    expect(
      extractArrayPropertyIdentifiers(configFixture, 'src/payload.config.ts', 'collections'),
    ).toEqual(['Pages', 'Articles'])
  })

  it('extracts object and factory-created block identities', () => {
    expect(extractBlockDefinition(blockFixture, 'src/blocks/Example/config.ts')).toEqual({
      configPath: 'src/blocks/Example/config.ts',
      interfaceName: 'ExampleBlock',
      slug: 'example',
      symbol: 'ExampleBlock',
    })
    expect(extractBlockDefinition(systemFactoryFixture, 'src/blocks/System404/config.ts')).toEqual({
      configPath: 'src/blocks/System404/config.ts',
      interfaceName: 'System404Block',
      slug: 'system404',
      symbol: 'System404Block',
    })
  })

  it('extracts renderer, thumbnail, and fixture coverage', () => {
    expect(extractSwitchCases("case 'alpha': break; case 'beta': break")).toEqual([
      'alpha',
      'beta',
    ])
    expect(extractThumbnailDefinitions(thumbnailFixture, 'definitions.ts')).toEqual([
      { filename: 'alpha.jpg', slug: 'alpha' },
    ])
    expect(
      extractExportedObjectKeys(fixtureObject, 'fixtures.tsx', 'blockThumbnailFixtures'),
    ).toEqual(['alpha', 'beta'])
  })

  it('serializes object keys deterministically without reordering arrays', () => {
    expect(stableStringify({ z: 1, a: { d: 2, b: 1 }, rows: ['b', 'a'] })).toBe(
      '{\n  "a": {\n    "b": 1,\n    "d": 2\n  },\n  "rows": [\n    "b",\n    "a"\n  ],\n  "z": 1\n}\n',
    )
  })
})
