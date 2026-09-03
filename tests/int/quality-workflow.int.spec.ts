import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('quality workflow contract', () => {
  it('runs only the mandatory release commands in order', () => {
    const workflow = readFileSync('.github/workflows/quality.yml', 'utf8')
    const runCommands = [...workflow.matchAll(/^\s*- run:\s*(.+)$/gm)].map((match) => match[1])

    expect(runCommands).toEqual([
      'pnpm install --frozen-lockfile',
      'pnpm audit:prod',
      'pnpm generate:types',
      'git diff --exit-code -- src/payload-types.ts',
      'pnpm exec tsc --noEmit',
      'pnpm lint',
      'pnpm test:int',
      'pnpm build',
    ])
    expect(workflow).not.toContain('pnpm project-context:check')
  })

  it('keeps project-context checking available for local maintenance', () => {
    const packageJSON = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }

    expect(packageJSON.scripts?.['project-context:check']).toBe(
      'node .agents/skills/project-context/scripts/check-project-context.mjs',
    )
  })
})
