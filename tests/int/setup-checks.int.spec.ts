// @vitest-environment node
import { constants } from 'node:fs'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import {
  checkSetup,
  formatSetupChecks,
  inspectDatabase,
  inspectDirectory,
  supportsNode,
} from '../../scripts/lib/setupChecks'

const env = (): NodeJS.ProcessEnv => ({
  NODE_ENV: 'development',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/quickstart_test?replicaSet=rs0&directConnection=true',
  PAYLOAD_SECRET: 'unique-test-secret-for-local-diagnostics',
  EMAIL_PROVIDER: 'none',
  MEDIA_PROVIDER: 'localDisk',
  ALLOW_FIRST_ADMIN_CREATION: 'true',
  FORM_ATTACHMENTS_PROVIDER: 'localDisk',
  NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000',
})
const options = () => ({
  env: env(),
  root: '/project',
  nodeVersion: '22.17.0',
  userAgent: 'pnpm/11.17.0 npm/? node/v22.17.0',
  engines: { node: '>=22.13.0 <23', pnpm: '11.17.0' },
})
const dependencies = () => ({
  database: vi.fn().mockResolvedValue({ replicaReady: true, hasUsers: false }),
  directory: vi.fn().mockResolvedValue(undefined),
})

describe('developer setup diagnostics', () => {
  it('allows local authoring without email, analytics or a production domain; never certifies preview or launch', async () => {
    const input = options()
    const before = { ...input.env }
    const checks = await checkSetup(input, dependencies())
    expect(checks.some((check) => check.status === 'fail')).toBe(false)
    expect(checks.find((check) => check.name === 'Authenticated preview')?.status).toBe('manual')
    expect(formatSetupChecks(checks)).toContain('not certified')
    expect(input.env).toEqual(before)
  })

  it('stops before connecting when a credential-bearing origin is invalid and does not reveal values', async () => {
    const input = options()
    input.env.NEXT_PUBLIC_SERVER_URL = 'https://private-user:do-not-print@example.test'
    input.env.PAYLOAD_SECRET = 'do-not-print-secret'
    input.env.MONGODB_URI = 'mongodb://private-user:do-not-print@db.example/secret_database'
    const deps = dependencies()
    const output = formatSetupChecks(await checkSetup(input, deps))
    expect(output).toContain('NEXT_PUBLIC_SERVER_URL')
    for (const secret of ['private-user', 'do-not-print', 'secret_database', 'db.example'])
      expect(output).not.toContain(secret)
    expect(deps.database).not.toHaveBeenCalled()
    expect(deps.directory).not.toHaveBeenCalled()
  })

  it('sanitizes unknown validation, database and filesystem failures, preserving concrete fixes', async () => {
    const deps = dependencies()
    deps.database.mockRejectedValue(new Error('mongodb://secret:password@host/private'))
    deps.directory.mockRejectedValue(new Error('/private/credential-file secret'))
    const output = formatSetupChecks(await checkSetup(options(), deps))
    expect(output).toContain('Connection or Users read failed')
    expect(output).toContain('ownership and permissions')
    expect(output).not.toContain('password')
    expect(output).not.toContain('credential-file')
    const input = options()
    input.env.FORM_ATTACHMENTS_PROVIDER = 's3'
    Object.assign(input.env, {
      FORM_ATTACHMENTS_S3_BUCKET: 'private',
      FORM_ATTACHMENTS_S3_ENDPOINT: 'secret-invalid-url',
      FORM_ATTACHMENTS_S3_REGION: 'auto',
      FORM_ATTACHMENTS_S3_ACCESS_KEY_ID: 'secret-key',
      FORM_ATTACHMENTS_S3_SECRET_ACCESS_KEY: 'secret-password',
    })
    const invalid = formatSetupChecks(await checkSetup(input, dependencies()))
    expect(invalid).toContain('Runtime configuration')
    expect(invalid).not.toContain('secret-invalid-url')
    expect(invalid).not.toContain('secret-password')
  })

  it('detects a standalone database and an empty Users collection with bootstrap disabled', async () => {
    const input = options()
    input.env.ALLOW_FIRST_ADMIN_CREATION = 'false'
    const deps = dependencies()
    deps.database.mockResolvedValue({ replicaReady: false, hasUsers: false })
    const checks = await checkSetup(input, deps)
    expect(checks.filter((check) => check.status === 'fail').map((check) => check.name)).toEqual([
      'MongoDB',
      'First Admin',
    ])
  })

  it('reports existing accounts honestly instead of claiming login readiness', async () => {
    const deps = dependencies()
    deps.database.mockResolvedValue({ replicaReady: true, hasUsers: true })
    const checks = await checkSetup(options(), deps)
    expect(checks.find((check) => check.name === 'Accounts')).toMatchObject({
      status: 'manual',
      next: expect.stringContaining('Disable bootstrap'),
    })
  })

  it('rejects template secrets before onboarding even though the development parser accepts them', async () => {
    const input = options()
    input.env.PAYLOAD_SECRET = 'YOUR_PAYLOAD_CMS_SECRET_HERE'
    expect(
      (await checkSetup(input, dependencies())).find(
        (check) => check.name === 'Authentication secret',
      )?.status,
    ).toBe('fail')
  })

  it('keeps the production HTTPS, secret, storage and bootstrap contracts enforced', async () => {
    for (const overrides of [
      { NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000' },
      { PAYLOAD_SECRET: 'short' },
      { VERCEL: '1' },
      { ALLOW_FIRST_ADMIN_CREATION: 'true' },
      { FORM_ATTACHMENTS_PROVIDER: 'localDisk' },
    ]) {
      const input = options()
      Object.assign(input.env, {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SERVER_URL: 'https://example.test',
        ALLOW_FIRST_ADMIN_CREATION: 'false',
        FORM_ATTACHMENTS_PROVIDER: 'disabled',
        ...overrides,
      })
      const deps = dependencies()
      expect(
        (await checkSetup(input, deps)).find((check) => check.name === 'Runtime configuration')
          ?.status,
      ).toBe('fail')
      expect(deps.database).not.toHaveBeenCalled()
    }
  })

  it('uses package.json engine boundaries and rejects a different package manager', async () => {
    expect(
      ['22.13.0', '22.17.0', '22.99.0'].every((version) => supportsNode(version, '>=22.13.0 <23')),
    ).toBe(true)
    expect(
      ['22.12.9', '23.0.0', '26.0.0', '22.17.0-rc.1'].some((version) =>
        supportsNode(version, '>=22.13.0 <23'),
      ),
    ).toBe(false)
    const input = options()
    input.nodeVersion = '26.0.0'
    input.userAgent = 'npm/11.17.0'
    expect(
      (await checkSetup(input, dependencies()))
        .filter((check) => check.status === 'fail')
        .map((check) => check.name),
    ).toEqual(['Node.js', 'pnpm'])
  })

  it('inspects missing local directories without creating them or modifying an existing environment file', async () => {
    const root = await mkdtemp(join(tmpdir(), 'setup-readonly-'))
    try {
      await writeFile(join(root, '.env'), 'secret=preserve-exactly\n', { flag: 'wx' })
      await inspectDirectory(join(root, '.private', 'form-attachments'))
      await expect(readFile(join(root, '.private'))).rejects.toMatchObject({ code: 'ENOENT' })
      expect(await readFile(join(root, '.env'), 'utf8')).toBe('secret=preserve-exactly\n')
      await writeFile(join(root, 'not-a-directory'), 'file')
      await expect(inspectDirectory(join(root, 'not-a-directory'))).rejects.toThrow()
      // The documented exclusive copy must refuse to replace an existing file.
      const { copyFile } = await import('node:fs/promises')
      await writeFile(join(root, '.env.example'), 'replace-me')
      await expect(
        copyFile(join(root, '.env.example'), join(root, '.env'), constants.COPYFILE_EXCL),
      ).rejects.toMatchObject({ code: 'EEXIST' })
      await symlink(join(root, 'missing-target'), join(root, 'broken-link'))
      await expect(inspectDirectory(join(root, 'broken-link', 'uploads'))).rejects.toMatchObject({
        code: 'ENOENT',
      })
      await mkdir(join(root, 'media'))
      await inspectDirectory(join(root, 'media'))
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('reads actual local MongoDB capability without creating collections or changing Users', async () => {
    const { MongoClient } = await import('mongodb')
    const uri =
      'mongodb://127.0.0.1:27017/developer_setup_readonly_test?replicaSet=rs0&directConnection=true'
    const client = new MongoClient(uri)
    try {
      await client.connect()
      const before = await client.db().listCollections().toArray()
      expect(await inspectDatabase(uri)).toEqual({ replicaReady: true, hasUsers: false })
      expect(await client.db().listCollections().toArray()).toEqual(before)
    } finally {
      await client.close()
    }
  })
})
