import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('repository hygiene', () => {
  it('does not ship the starter example endpoint', () => {
    expect(existsSync('src/app/my-route/route.ts')).toBe(false)
  })

  it('excludes checked-in agent and preview tooling from product lint', () => {
    const source = readFileSync('eslint.config.mjs', 'utf8')

    expect(source).toContain("'.claude/**'")
    expect(source).toContain("'.superpowers/**'")
  })
})
