import { spawn } from 'node:child_process'
import { cp, mkdir, mkdtemp, rm, symlink } from 'node:fs/promises'
import path from 'node:path'

import { encryptTwoFactorSecret } from '../../src/lib/twoFactorCrypto'
import { createTestMongoServer } from './mongoMemoryServer'

// This harness never reads application .env files or reuses an application database,
// server, or Next build directory. Only temporary fixture data is created.
const root = process.cwd()
await mkdir(path.join(root, '.next'), { recursive: true })
const directory = await mkdtemp(path.join(root, '.next/two-factor-browser-'))
const mongo = await createTestMongoServer()
const nodeOptions =
  '--no-deprecation --no-experimental-strip-types --conditions=react-server --import=tsx/esm'
const isolatedEnvironment: NodeJS.ProcessEnv = {
  ALLOW_FIRST_ADMIN_CREATION: 'false',
  ALLOW_PRODUCTION_EMAIL_OVERRIDE: 'false',
  MONGODB_URI: mongo.uri,
  TEST_MONGODB_URI: mongo.uri,
  PAYLOAD_SECRET: 'isolated-browser-test-secret-32-characters',
  EMAIL_PROVIDER: 'none',
  MEDIA_PROVIDER: 'localDisk',
  NEXT_PUBLIC_SERVER_URL: 'http://localhost:3011',
  NODE_ENV: 'development',
  NODE_OPTIONS: nodeOptions,
  FIRST_ADMIN_EMAIL: '',
  MEDIA_RECONCILE_TOKEN: '',
  RESEND_API_KEY: '',
  RESEND_FROM_EMAIL: '',
  RESEND_FROM_NAME: '',
  RESEND_OVERRIDE_TO_EMAIL: '',
  S3_ACCESS_KEY_ID: '',
  S3_ACL: '',
  S3_BUCKET: '',
  S3_CLIENT_UPLOADS: '',
  S3_ENDPOINT: '',
  S3_FORCE_PATH_STYLE: '',
  S3_PUBLIC_URL: '',
  S3_REGION: '',
  S3_SECRET_ACCESS_KEY: '',
  VERCEL: '',
  PATH: process.env.PATH,
  TMPDIR: process.env.TMPDIR,
}
Object.assign(process.env, isolatedEnvironment)

const { getPayload } = await import('payload')
const { default: config } = await import('../../src/payload.config')
const payload = await getPayload({ config })
await Promise.all(Object.values(payload.db.collections).map((model) => model.init()))
await payload.create({
  collection: 'users',
  data: { email: 'security@example.test', password: 'Test-browser-password-123!', role: 'admin' },
})
const resetUser = await payload.create({
  collection: 'users',
  data: {
    email: 'reset-security@example.test',
    password: 'Test-browser-password-123!',
    role: 'admin',
  },
})
await payload.db.create({
  collection: 'two-factor-credentials',
  data: {
    revision: 0,
    state: {
      enabled: true,
      recoveryHashes: [],
      secret: encryptTwoFactorSecret('JBSWY3DPEHPK3PXP', payload.secret, String(resetUser.id)),
    },
    userID: String(resetUser.id),
  },
})
await payload.db.updateOne({
  collection: 'users',
  id: resetUser.id,
  data: {
    resetPasswordExpiration: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    resetPasswordToken: 'two-factor-browser-reset-token',
  },
})
await payload.destroy()

for (const file of [
  'src',
  'public',
  'next.config.ts',
  'next-env.d.ts',
  'tsconfig.json',
  'postcss.config.mjs',
  'package.json',
]) {
  await cp(path.join(root, file), path.join(directory, file), { recursive: true })
}
await symlink(path.join(root, 'node_modules'), path.join(directory, 'node_modules'), 'dir')
const child = spawn(
  process.execPath,
  [
    path.join(root, 'node_modules/next/dist/bin/next'),
    'dev',
    '--webpack',
    '-H',
    'localhost',
    '-p',
    '3011',
  ],
  {
    cwd: directory,
    env: isolatedEnvironment,
    stdio: 'inherit',
  },
)
let stopping: Promise<void> | undefined
const stop = () => {
  if (stopping) return stopping
  stopping = (async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise<void>((resolve) => child.once('exit', () => resolve()))
      child.kill('SIGTERM')
      await exited
    }
    try {
      try {
        await mongo.stop()
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250))
        await mongo.stop()
      }
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })()
  return stopping
}
process.on('SIGTERM', () => {
  void stop()
})
process.on('SIGINT', () => {
  void stop()
})
child.on('exit', (code) => {
  void stop().then(() => process.exit(code ?? 0))
})
