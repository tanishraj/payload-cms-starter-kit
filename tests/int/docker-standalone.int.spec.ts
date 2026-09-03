import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const nextConfigSource = readFileSync('next.config.ts', 'utf8')
const dockerfileSource = readFileSync('Dockerfile', 'utf8')
const readmeSource = readFileSync('README.md', 'utf8')
const runtimeDocsSource = readFileSync('docs/operations/runtime-and-providers.md', 'utf8')
const featureInventorySource = readFileSync('docs/architecture/feature-inventory.md', 'utf8')
const dockerIgnoreSource = existsSync('.dockerignore') ? readFileSync('.dockerignore', 'utf8') : ''
const packageSource = readFileSync('package.json', 'utf8')
const packageJSON = JSON.parse(packageSource) as {
  packageManager: string
}
const pnpmWorkspaceSource = readFileSync('pnpm-workspace.yaml', 'utf8')

describe('Docker standalone deployment contract', () => {
  it('pins the supported Node and pnpm toolchain with one frozen install workflow', () => {
    expect(dockerfileSource).toMatch(/^# syntax=docker\/dockerfile:1\.7$/m)
    expect(dockerfileSource.match(/FROM node:22\.17\.0-alpine/g)).toHaveLength(1)
    expect(dockerfileSource).toContain('corepack prepare pnpm@11.17.0 --activate')
    expect(dockerfileSource).toContain('pnpm install --frozen-lockfile')
    expect(dockerfileSource).not.toContain('pnpm@latest')
    expect(dockerfileSource).not.toMatch(/yarn|npm ci|package-lock/)
    expect(packageJSON.packageManager).toBe('pnpm@11.17.0')
    expect(dockerfileSource).toContain('COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./')
    expect(pnpmWorkspaceSource).toContain('allowBuilds:')
    expect(pnpmWorkspaceSource).toContain('esbuild: true')
    expect(pnpmWorkspaceSource).toContain('unrs-resolver: true')
  })

  it('uses a required build secret and exposes only the public origin as a build argument', () => {
    expect(dockerfileSource).toContain('ARG NEXT_PUBLIC_SERVER_URL')
    expect(dockerfileSource).toContain('RUN --mount=type=secret,id=payload_build_env,required=true')
    expect(dockerfileSource).toContain('. /run/secrets/payload_build_env')
    expect(dockerfileSource).not.toMatch(/ARG\s+(MONGODB_URI|PAYLOAD_SECRET|RESEND_API_KEY|S3_)/)
    expect(dockerfileSource).not.toMatch(/ENV\s+(MONGODB_URI|PAYLOAD_SECRET|RESEND_API_KEY|S3_)/)
    expect(dockerfileSource).not.toMatch(/COPY\s+[^\n]*(\.env|payload_build_env)/)
  })

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

  it('excludes sensitive and development-only Docker context files', () => {
    for (const entry of [
      '.git',
      '.env*',
      'backups',
      'node_modules',
      '.next',
      'playwright-report',
      'test-results',
    ]) {
      expect(dockerIgnoreSource, entry).toContain(entry)
    }

    expect(dockerIgnoreSource).not.toMatch(/^public\/?$/m)
    expect(dockerIgnoreSource).not.toMatch(/^src\/?$/m)
  })
})

describe('Docker deployment documentation', () => {
  it('documents the production image and durable provider requirements', () => {
    expect(readmeSource).toContain('Production Docker Image')
    expect(readmeSource).toContain('MEDIA_PROVIDER=s3')
    expect(runtimeDocsSource).toContain('docker build')
    expect(runtimeDocsSource).toContain('durable MongoDB')
    expect(runtimeDocsSource).toContain('`docker-compose.yml` remains a local-development workflow')
    expect(runtimeDocsSource).toContain('--secret id=payload_build_env,src=')
    expect(runtimeDocsSource).toContain('pnpm verify:docker-image')
  })

  it('no longer reports standalone Docker support as unfinished', () => {
    expect(featureInventorySource).not.toContain('does not currently enable it')
    expect(featureInventorySource).toContain(
      'Dockerfile builds a non-root Next.js standalone production',
    )
  })
})
