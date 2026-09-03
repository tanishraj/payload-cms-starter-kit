import { readFileSync } from 'node:fs'

import { describe, expect, it, vi } from 'vitest'

const serverRuntimeConsumers = [
  'src/app/api/operations/media/reconcile-storage/route.ts',
  'src/collections/Articles.ts',
  'src/collections/NewsEvents.ts',
  'src/collections/Pages.ts',
  'src/collections/Reviews.ts',
  'src/collections/Users.ts',
  'src/lib/mediaStorage.ts',
  'src/payload.config.ts',
  'src/proxy.ts',
] as const

describe('runtime import boundary', () => {
  it('keeps the eager secret-bearing singleton behind server-only', () => {
    const pureRuntime = readFileSync('src/config/runtime.ts', 'utf8')
    const serverRuntime = readFileSync('src/config/runtime.server.ts', 'utf8')

    expect(pureRuntime).not.toContain("import 'server-only'")
    expect(pureRuntime).not.toMatch(/export const runtimeConfig\s*=/)
    expect(serverRuntime).toContain("import 'server-only'")
    expect(serverRuntime).toContain('getRuntimeConfig()')

    for (const filePath of serverRuntimeConsumers) {
      const source = readFileSync(filePath, 'utf8')

      expect(source, filePath).toMatch(
        /from ['"](?:@\/|\.\/|\.\.\/)config\/runtime\.server['"]|from ['"]@\/config\/runtime\.server['"]/,
      )
      expect(source, filePath).not.toMatch(
        /runtimeConfig.*from ['"].*config\/runtime['"]|from ['"].*config\/runtime['"].*runtimeConfig/,
      )
    }

    const packageJSON = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }

    for (const scriptName of [
      'generate:importmap',
      'generate:types',
      'migrate:offices',
      'payload',
      'report:permissions-migration',
      'test:e2e',
    ]) {
      expect(packageJSON.scripts?.[scriptName], scriptName).toContain('--conditions=react-server')
    }
  })

  it('keeps canonical public-origin ownership browser-safe', () => {
    const originParser = readFileSync('src/config/applicationOrigin.ts', 'utf8')
    const publicOrigin = readFileSync('src/config/publicOrigin.ts', 'utf8')
    const siteURL = readFileSync('src/lib/siteUrl.ts', 'utf8')

    expect(originParser).not.toContain('process.env')
    expect(publicOrigin).toContain('process.env.NEXT_PUBLIC_SERVER_URL')
    expect(publicOrigin).not.toMatch(
      /MONGODB_URI|PAYLOAD_SECRET|RESEND_|S3_SECRET|S3_ACCESS|MEDIA_RECONCILE_TOKEN|FIRST_ADMIN_EMAIL/,
    )
    expect(siteURL).toContain("from '@/config/publicOrigin'")
    expect(siteURL).not.toContain('process.env')
    expect(siteURL).not.toContain("'http://localhost:3000'")
    expect(siteURL).not.toContain("from '@/config/runtime.server'")
  })

  it('fails closed when the browser-safe production origin is invalid', async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'http://localhost:3000')

    await expect(import('@/config/publicOrigin')).rejects.toThrow(
      'Invalid production NEXT_PUBLIC_SERVER_URL. Use an HTTPS origin.',
    )

    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('documents the package Node requirement consistently', () => {
    const packageJSON = JSON.parse(readFileSync('package.json', 'utf8')) as {
      engines?: { node?: string }
    }
    const readme = readFileSync('README.md', 'utf8')

    expect(packageJSON.engines?.node).toBe('>=22.13.0 <23')
    expect(readme).toContain('- `Node.js`: `22.17.0` (`>=22.13.0 <23`)')
    expect(readme).not.toContain('^18.20.2 || >=20.9.0')
  })
})
