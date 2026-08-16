import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

import {
  buildProjectInventory,
  stableStringify,
  validateProjectContracts,
} from '../../.agents/skills/project-context/scripts/project-context-lib.mjs'

describe('project context repository contract', () => {
  it('passes all source-derived contracts', async () => {
    const inventory = await buildProjectInventory(process.cwd())
    const result = await validateProjectContracts(process.cwd(), inventory)

    expect(result.errors).toEqual([])
  })

  it('matches the checked-in deterministic inventory', async () => {
    const inventory = await buildProjectInventory(process.cwd())
    const checkedIn = JSON.parse(
      await readFile(
        '.agents/skills/project-context/references/project-inventory.json',
        'utf8',
      ),
    )

    expect(stableStringify(checkedIn)).toBe(stableStringify(inventory))
  })
})
