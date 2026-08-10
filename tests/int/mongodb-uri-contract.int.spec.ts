import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const activeContractPaths = [
  '.env.example',
  'README.md',
  'docker-compose.yml',
  'scripts/export-db.mjs',
  'src/config/runtime.ts',
  'docs/operations/developer-workflows.md',
  'docs/operations/mongodb-deployment.md',
  'docs/operations/runtime-and-providers.md',
  'docs/operations/starter-clone-checklist.md',
] as const

describe('MongoDB environment contract', () => {
  it('uses MONGODB_URI throughout every active contract surface', () => {
    for (const filePath of activeContractPaths) {
      const source = readFileSync(filePath, 'utf8')

      expect(source, filePath).toContain('MONGODB_URI')
      expect(source, filePath).not.toContain('DATABASE_URL')
    }
  })

  it('documents the local MongoDB URI in the environment example', () => {
    const envExample = readFileSync('.env.example', 'utf8')

    expect(envExample).toContain(
      'MONGODB_URI=mongodb://127.0.0.1:27017/payload-cms-starter-kit',
    )
  })
})
