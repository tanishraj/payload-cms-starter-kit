import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('repository toolchain contract', () => {
  it('marks the application package as private and unlicensed', () => {
    const packageJSON = JSON.parse(readFileSync('package.json', 'utf8')) as {
      license?: string
      private?: boolean
    }

    expect(packageJSON.private).toBe(true)
    expect(packageJSON.license).toBe('UNLICENSED')
  })

  it('pins pnpm and supports only the intended Node 22 range', () => {
    const packageJSON = JSON.parse(readFileSync('package.json', 'utf8')) as {
      engines?: { node?: string; pnpm?: string }
      packageManager?: string
    }

    expect(packageJSON.packageManager).toBe('pnpm@11.17.0')
    expect(packageJSON.engines).toEqual({
      node: '>=22.13.0 <23',
      pnpm: '11.17.0',
    })
  })

  it('pins the local and Docker Node release', () => {
    const nvmrc = readFileSync('.nvmrc', 'utf8')
    const dockerfile = readFileSync('Dockerfile', 'utf8')

    expect(nvmrc.trim()).toBe('22.17.0')
    expect(dockerfile).toContain('FROM node:22.17.0-alpine AS base')
  })

  it('uses the supported Node and pnpm releases in the current quality workflow', () => {
    const workflow = readFileSync('.github/workflows/quality.yml', 'utf8')
    const pnpmSetupStep = workflow.match(
      /- uses:\s*pnpm\/action-setup@[^\n]+\n\s+with:\s*\n\s+version:\s*([^\s#]+)/,
    )

    expect(pnpmSetupStep?.[1]).toBe('11.17.0')
    expect(workflow).toMatch(/node-version:\s*22\.17\.0/)
  })

  it('documents the exact supported setup releases', () => {
    const readme = readFileSync('README.md', 'utf8')
    const runtimeRunbook = readFileSync('docs/operations/runtime-and-providers.md', 'utf8')

    expect(readme).toContain('- `Node.js`: `22.17.0` (`>=22.13.0 <23`)')
    expect(readme).toContain('- `pnpm`: `11.17.0`')
    expect(runtimeRunbook).toContain('| Node.js  | `22.17.0`')
    expect(runtimeRunbook).toContain('| pnpm     | `11.17.0`')
  })
})
