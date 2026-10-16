// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { constants } from 'node:fs'
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

let root: string
const base = {
  NODE_ENV: 'development',
  MONGODB_URI:
    'mongodb://127.0.0.1:27017/developer_setup_cli_test?replicaSet=rs0&directConnection=true',
  PAYLOAD_SECRET: 'cli-test-only-secret-with-more-than-thirty-two-characters',
  NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000',
  EMAIL_PROVIDER: 'none',
  MEDIA_PROVIDER: 'localDisk',
  FORM_ATTACHMENTS_PROVIDER: 'disabled',
  ALLOW_FIRST_ADMIN_CREATION: 'true',
}

function run(args: string[] = [], extraEnv: Record<string, string> = {}) {
  return spawnSync(process.execPath, ['--import', 'tsx/esm', 'scripts/check-setup.ts', ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 25_000,
    // No developer env, Node options, test loaders or remote database credentials.
    env: {
      NODE_ENV: 'development',
      PATH: process.env.PATH,
      npm_config_user_agent: 'pnpm/11.17.0',
      ...extraEnv,
    },
  })
}

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'developer-setup-cli-'))
  for (const file of [
    'scripts/check-setup.ts',
    'scripts/lib/setupChecks.ts',
    'src/config/runtime.ts',
    'src/config/applicationOrigin.ts',
    'src/config/formAttachmentStorage.ts',
    'src/config/mediaPublicURL.ts',
    'src/config/starterContract.ts',
    'package.json',
  ]) {
    await mkdir(dirname(join(root, file)), { recursive: true })
    await copyFile(resolve(file), join(root, file), constants.COPYFILE_EXCL)
  }
  await symlink(resolve('node_modules'), join(root, 'node_modules'), 'dir')
  await writeFile(
    join(root, '.env'),
    Object.entries(base)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n'),
  )
})
afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('real setup CLI in an isolated clone fixture', () => {
  it('loads Next development precedence without changing .env or creating storage', async () => {
    const original = await readFile(join(root, '.env'), 'utf8')
    await writeFile(
      join(root, '.env.development.local'),
      'PAYLOAD_SECRET=YOUR_PAYLOAD_CMS_SECRET_HERE\n',
    )
    const failed = run()
    expect(failed.status, failed.stderr).toBe(1)
    expect(failed.stdout).toContain('[FAIL] Authentication secret')
    expect(failed.stdout).not.toContain(base.PAYLOAD_SECRET)
    const passed = run([], {
      PAYLOAD_SECRET: base.PAYLOAD_SECRET,
      MONGODB_LOG_ALL: 'debug',
      MONGODB_LOG_COMMAND: 'debug',
      MONGODB_LOG_SERVER_SELECTION: 'debug',
      MONGODB_LOG_PATH: 'stdout',
    })
    expect(passed.status, passed.stderr).toBe(0)
    expect(passed.stdout).toContain('not certified')
    expect(passed.stdout + passed.stderr).not.toContain('developer_setup_cli_test')
    expect(passed.stderr).toBe('')
    expect(await readFile(join(root, '.env'), 'utf8')).toBe(original)
    expect(await readdir(root)).not.toContain('media')
    expect(await readdir(root)).not.toContain('.private')
  })

  it('applies production environment and keeps HTTPS/secret/bootstrap constraints', async () => {
    await writeFile(
      join(root, '.env.production.local'),
      ['NEXT_PUBLIC_SERVER_URL=https://example.test', 'ALLOW_FIRST_ADMIN_CREATION=false'].join(
        '\n',
      ),
    )
    // A process value beats all .env files. NODE_ENV must be production for the parser.
    const failed = run(['--production'], { NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000' })
    expect(failed.status, failed.stderr).toBe(1)
    expect(failed.stdout).toContain('NEXT_PUBLIC_SERVER_URL')
    // Valid production configuration still reports empty-account bootstrap as a failure.
    const empty = run(['--production'])
    expect(empty.status, empty.stderr).toBe(1)
    expect(empty.stdout).toContain('[PASS] Runtime configuration')
    expect(empty.stdout).toContain('[FAIL] First Admin')
  })

  it('withholds real driver parse errors and credential-bearing connection strings', () => {
    const result = run([], {
      MONGODB_URI: 'mongodb://private-user:secret-password@127.0.0.1:invalid/private-database',
      MONGODB_LOG_ALL: 'debug',
      MONGODB_LOG_COMMAND: 'debug',
      MONGODB_LOG_PATH: 'stdout',
    })
    expect(result.status, result.stderr).toBe(1)
    expect(result.stdout).toContain('Connection or Users read failed')
    for (const value of [
      'private-user',
      'secret-password',
      'private-database',
      'MongoParseError',
    ]) {
      expect(result.stdout + result.stderr).not.toContain(value)
    }
    expect(result.stderr).toBe('')
  })

  it('rejects unsupported arguments before loading potentially sensitive environment data', async () => {
    await writeFile(
      join(root, '.env'),
      'NEXT_PUBLIC_SERVER_URL=https://secret-user:secret-password@example.test',
    )
    const result = run(['--dump-env'])
    expect(result.status, result.stderr).toBe(2)
    expect(result.stdout).toBe('Usage: pnpm setup:check [--production]\n')
    expect(result.stderr).toBe('')
  })
})
