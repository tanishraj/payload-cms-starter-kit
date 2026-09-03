import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('quality workflow contract', () => {
  it('keeps one bounded read-only job with immutable setup actions and replica cleanup', () => {
    const source = readFileSync('.github/workflows/quality.yml', 'utf8')
    const jobsSource = source.slice(source.indexOf('\njobs:\n') + '\njobs:\n'.length)
    const jobNames = [...jobsSource.matchAll(/^  ([a-z][a-z0-9_-]*):$/gm)].map((match) => match[1])

    expect(jobNames).toEqual(['verify'])
    expect(source).toMatch(/^permissions:\n  contents: read$/m)
    expect(jobsSource).toMatch(/^    timeout-minutes: 45$/m)
    expect(jobsSource).not.toMatch(/^    services:$/m)

    const actionReferences = source.matchAll(
      /^\s*- uses: (actions\/checkout|pnpm\/action-setup|actions\/setup-node)@([0-9a-f]{40}) # (v4)$/gm,
    )
    expect([...actionReferences]).toHaveLength(3)
    expect(source).not.toMatch(/@(main|master|v\d+)(?:\s|$)/)
    expect(source).toContain('pnpm ci:mongodb:start')
    expect(source).toMatch(/if:\s*always\(\)[\s\S]*pnpm ci:mongodb:stop/)
    expect(source).not.toContain('services:')
  })

  it('runs only the mandatory release commands in order', () => {
    const workflow = readFileSync('.github/workflows/quality.yml', 'utf8')
    const runCommands = [...workflow.matchAll(/^\s*- run:\s*(.+)$/gm)].map((match) => match[1])

    expect(runCommands).toEqual([
      'pnpm install --frozen-lockfile',
      'pnpm audit:prod',
      'pnpm ci:mongodb:start',
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
