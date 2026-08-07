import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const nextConfigSource = readFileSync('next.config.ts', 'utf8')
const dockerfileSource = readFileSync('Dockerfile', 'utf8')
const readmeSource = readFileSync('README.md', 'utf8')
const runtimeDocsSource = readFileSync('docs/operations/runtime-and-providers.md', 'utf8')
const featureInventorySource = readFileSync('docs/architecture/feature-inventory.md', 'utf8')

describe('Docker standalone deployment contract', () => {
  it('enables Next.js standalone output', () => {
    expect(nextConfigSource).toMatch(/output:\s*['"]standalone['"]/)
  })

  it('copies the standalone server and static assets into a non-root runner', () => {
    expect(dockerfileSource).toContain('/app/.next/standalone ./')
    expect(dockerfileSource).toContain('/app/.next/static ./.next/static')
    expect(dockerfileSource).toContain('USER nextjs')
    expect(dockerfileSource).toContain('CMD HOSTNAME="0.0.0.0" node server.js')
  })

  it('does not retain the obsolete standalone setup warning', () => {
    expect(dockerfileSource).not.toContain("you have to set `output: 'standalone'`")
  })
})

describe('Docker deployment documentation', () => {
  it('documents the production image and durable provider requirements', () => {
    expect(readmeSource).toContain('Production Docker Image')
    expect(readmeSource).toContain('MEDIA_PROVIDER=s3')
    expect(runtimeDocsSource).toContain('docker build')
    expect(runtimeDocsSource).toContain('durable MongoDB')
    expect(runtimeDocsSource).toContain('`docker-compose.yml` remains a local-development workflow')
  })

  it('no longer reports standalone Docker support as unfinished', () => {
    expect(featureInventorySource).not.toContain('does not currently enable it')
    expect(featureInventorySource).toContain('Next.js standalone production image')
  })
})
