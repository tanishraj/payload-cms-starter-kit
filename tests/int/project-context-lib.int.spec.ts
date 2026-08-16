import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  extractArrayPropertyIdentifiers,
  extractBlockDefinition,
  extractExportedObjectKeys,
  extractImports,
  extractSwitchCases,
  extractThumbnailDefinitions,
  buildProjectInventory,
  stableStringify,
  writeProjectInventory,
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

  it('builds the current registered Payload and block inventory', async () => {
    const inventory = await buildProjectInventory(process.cwd())

    expect(inventory.schemaVersion).toBe(1)
    expect(inventory.payload.collections).toHaveLength(20)
    expect(inventory.payload.globals).toHaveLength(9)
    expect(inventory.blocks.page).toHaveLength(49)
    expect(inventory.blocks.reusableSection).toEqual(
      inventory.blocks.page.filter((slug: string) => slug !== 'reusableSection'),
    )
    expect(inventory.blocks.header).toEqual(['headerNavbar12'])
    expect(inventory.blocks.footer).toEqual(['footer56', 'footerMinimal'])
    expect(inventory.blocks.systemPage).toEqual([
      'system404',
      'systemMaintenance',
      'systemComingSoon',
    ])
  })

  it('writes stable inventory and leaves no temporary sibling', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'project-context-'))
    const target = path.join(directory, 'inventory.json')

    await writeFile(target, '{"old":true}\n')
    await writeProjectInventory(
      directory,
      { schemaVersion: 1, value: 'stable' },
      target,
    )

    expect(await readFile(target, 'utf8')).toBe(
      '{\n  "schemaVersion": 1,\n  "value": "stable"\n}\n',
    )
    await expect(readFile(`${target}.tmp`, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  })
})
