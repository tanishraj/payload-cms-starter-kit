import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

type PackageManifest = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const packageManifest = JSON.parse(readFileSync('package.json', 'utf8')) as PackageManifest
const directDependencies = {
  ...packageManifest.dependencies,
  ...packageManifest.devDependencies,
}

const compatibilityGroups = [
  {
    name: 'Next.js',
    packages: ['next', '@next/third-parties', 'eslint-config-next'],
    version: '16.3.6',
  },
  {
    name: 'Payload',
    packages: [
      'payload',
      '@payloadcms/db-mongodb',
      '@payloadcms/email-resend',
      '@payloadcms/live-preview-react',
      '@payloadcms/next',
      '@payloadcms/richtext-lexical',
      '@payloadcms/storage-s3',
      '@payloadcms/ui',
    ],
    version: '3.88.0',
  },
] as const

const exactDirectDependencyTargets = [
  {
    name: 'postcss',
    version: '8.5.26',
  },
  {
    name: 'sharp',
    version: '0.35.4',
  },
] as const

describe.each(compatibilityGroups)('$name compatibility group', ({ packages, version }) => {
  it(`pins every direct package to exact version ${version}`, () => {
    for (const packageName of packages) {
      expect(directDependencies[packageName], packageName).toBe(version)
    }
  })

  it('does not mix direct package versions', () => {
    const resolvedVersions = packages.map((packageName) => directDependencies[packageName])

    expect(new Set(resolvedVersions)).toEqual(new Set([version]))
  })
})

describe('independent direct dependency targets', () => {
  it.each(exactDirectDependencyTargets)(
    'pins $name to exact version $version',
    ({ name, version }) => {
      expect(directDependencies[name], name).toBe(version)
    },
  )
})
