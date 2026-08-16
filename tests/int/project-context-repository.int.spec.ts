import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

import {
  buildProjectInventory,
  stableStringify,
  validateProjectContracts,
} from '../../.agents/skills/project-context/scripts/project-context-lib.mjs'

describe('project context repository contract', () => {
  it('routes directly to every canonical reference and completion command', () => {
    const skill = readFileSync('.agents/skills/project-context/SKILL.md', 'utf8')

    for (const reference of [
      'references/architecture.md',
      'references/payload-model.md',
      'references/block-system.md',
      'references/change-impact-map.md',
      'references/project-inventory.json',
    ]) {
      expect(skill).toContain(reference)
      expect(existsSync(`.agents/skills/project-context/${reference}`)).toBe(true)
    }

    expect(skill).toContain('pnpm project-context:update')
    expect(skill).toContain('pnpm project-context:check')
  })

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
