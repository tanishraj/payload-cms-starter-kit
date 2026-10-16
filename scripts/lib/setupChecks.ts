import { constants } from 'node:fs'
import { access, lstat, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { MongoClient } from 'mongodb'

import { getRuntimeConfig } from '../../src/config/runtime'
import {
  assertSupportedStarterContract,
  getStarterContract,
} from '../../src/config/starterContract'

export type SetupCheck = {
  name: string
  status: 'pass' | 'fail' | 'manual'
  detail: string
  next?: string
}

type DatabaseFacts = { replicaReady: boolean; hasUsers: boolean }
type Dependencies = {
  database: (uri: string) => Promise<DatabaseFacts>
  directory: (directory: string) => Promise<void>
}

/** No Payload initialization: no migrations, indexes, users or content writes. */
export async function inspectDatabase(uri: string): Promise<DatabaseFacts> {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 5_000,
    socketTimeoutMS: 5_000,
    timeoutMS: 8_000,
    maxPoolSize: 1,
    retryReads: false,
    // Ambient driver debug flags must never turn operator checks into data logs.
    mongodbLogComponentSeverities: {
      default: 'off',
      command: 'off',
      topology: 'off',
      serverSelection: 'off',
      connection: 'off',
      client: 'off',
    },
    mongodbLogPath: { write: () => {} },
  })
  try {
    await client.connect()
    const db = client.db()
    const hello = await db.command({ hello: 1 })
    const replicaReady = Boolean(
      hello.setName &&
      hello.isWritablePrimary &&
      hello.logicalSessionTimeoutMinutes != null &&
      hello.maxWireVersion >= 7,
    )
    const user = await db.collection('users').findOne({}, { projection: { _id: 1 } })
    return { replicaReady, hasUsers: Boolean(user) }
  } finally {
    await client.close()
  }
}

/** Inspect only; a missing directory is assessed through its nearest existing parent. */
export async function inspectDirectory(directory: string): Promise<void> {
  let candidate = directory
  for (;;) {
    let info
    try {
      info = await lstat(candidate)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      const parent = dirname(candidate)
      if (parent === candidate) throw error
      candidate = parent
      continue
    }
    // Existing dangling links must fail instead of falling back to a writable parent.
    if (info.isSymbolicLink()) info = await stat(candidate)
    if (!info.isDirectory()) throw new Error('Not a directory')
    await access(candidate, constants.R_OK | constants.W_OK | constants.X_OK)
    return
  }
}

// Only return code-owned text. Never forward validator, filesystem or driver errors.
function configurationFix(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const fixes = [
    [
      'NEXT_PUBLIC_SERVER_URL',
      'Set NEXT_PUBLIC_SERVER_URL to loopback HTTP locally or canonical HTTPS in production.',
    ],
    [
      'PAYLOAD_SECRET',
      'Set PAYLOAD_SECRET to a unique random secret; production requires at least 32 characters.',
    ],
    ['MONGODB_URI', 'Set MONGODB_URI to the intended MongoDB replica-set database.'],
    [
      'FIRST_ADMIN_EMAIL',
      'Set FIRST_ADMIN_EMAIL to the permitted production bootstrap address, or disable bootstrap.',
    ],
    ['ALLOW_FIRST_ADMIN_CREATION', 'Set ALLOW_FIRST_ADMIN_CREATION to true or false.'],
    [
      'ALLOW_PRODUCTION_EMAIL_OVERRIDE',
      'Review ALLOW_PRODUCTION_EMAIL_OVERRIDE in the runtime runbook.',
    ],
    [
      'recipient override',
      'Remove RESEND_OVERRIDE_TO_EMAIL or explicitly acknowledge the production override.',
    ],
    ['Resend', 'Complete RESEND_API_KEY and RESEND_FROM_EMAIL, or select EMAIL_PROVIDER=none.'],
    ['attachment', 'Review FORM_ATTACHMENTS_PROVIDER and its separate private bucket settings.'],
    [
      'FORM_ATTACHMENTS',
      'Review FORM_ATTACHMENTS_PROVIDER and its separate private bucket settings.',
    ],
    [
      'S3',
      'Review MEDIA_PROVIDER and S3 settings in the runtime runbook; server-side uploads are required.',
    ],
    ['MEDIA_PROVIDER', 'Use MEDIA_PROVIDER=localDisk locally or configure s3 for hosted media.'],
    ['Vercel', 'Configure durable S3 media before running a Vercel production profile.'],
  ]
  return (
    fixes.find(([token]) => message.includes(token))?.[1] ??
    'Review provider configuration in docs/operations/runtime-and-providers.md, then rerun this check.'
  )
}

/** This repository declares a numeric lower-inclusive, upper-exclusive Node range. */
export function supportsNode(version: string, range: string): boolean {
  const bounds = /^>=(\d+)\.(\d+)\.(\d+) <(\d+)$/.exec(range)
  const actual = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!bounds || !actual) return false
  const [major, minor, patch] = actual.slice(1).map(Number)
  const [minMajor, minMinor, minPatch, maxMajor] = bounds.slice(1).map(Number)
  return (
    major < maxMajor &&
    (major > minMajor ||
      (major === minMajor && (minor > minMinor || (minor === minMinor && patch >= minPatch))))
  )
}

export async function checkSetup(
  options: {
    env: NodeJS.ProcessEnv
    root: string
    nodeVersion: string
    userAgent: string
    engines: { node: string; pnpm: string }
  },
  dependencies: Dependencies = { database: inspectDatabase, directory: inspectDirectory },
): Promise<SetupCheck[]> {
  const checks: SetupCheck[] = []
  const add = (check: SetupCheck) => checks.push(check)
  const nodeOK = supportsNode(options.nodeVersion, options.engines.node)
  add({
    name: 'Node.js',
    status: nodeOK ? 'pass' : 'fail',
    detail: nodeOK ? 'Supported runtime.' : 'Unsupported runtime; install and startup may fail.',
    ...(!nodeOK && { next: 'Run nvm install && nvm use (see .nvmrc).' }),
  })
  const pnpmOK = options.userAgent.split(' ')[0] === `pnpm/${options.engines.pnpm}`
  add({
    name: 'pnpm',
    status: pnpmOK ? 'pass' : 'fail',
    detail: pnpmOK ? 'Pinned package manager.' : 'Package manager does not match package.json.',
    ...(!pnpmOK && {
      next: 'Use the packageManager pin in package.json, then run pnpm setup:check.',
    }),
  })

  let config
  try {
    config = getRuntimeConfig(options.env)
    assertSupportedStarterContract(getStarterContract(config))
    add({
      name: 'Runtime configuration',
      status: 'pass',
      detail: 'Existing application validators passed for this environment.',
    })
  } catch (error) {
    add({
      name: 'Runtime configuration',
      status: 'fail',
      detail: 'The application cannot start with this configuration.',
      next: configurationFix(error),
    })
    add({
      name: 'Database, storage and preview',
      status: 'manual',
      detail: 'Not checked because configuration is invalid.',
      next: 'Correct configuration and rerun pnpm setup:check.',
    })
    return checks
  }
  const placeholder = ['YOUR_PAYLOAD_CMS_SECRET_HERE', 'change-me', 'changeme'].includes(
    config.payload.secret,
  )
  if (placeholder)
    add({
      name: 'Authentication secret',
      status: 'fail',
      detail: 'The template secret must be replaced before creating an account.',
      next: 'Generate a unique secret using the quickstart; edit the local environment file without printing its value.',
    })

  try {
    const facts = await dependencies.database(config.database.url)
    add({
      name: 'MongoDB',
      status: facts.replicaReady ? 'pass' : 'fail',
      detail: facts.replicaReady
        ? 'Reachable writable replica-set primary with session support; Users read succeeded.'
        : 'MongoDB lacks the replica-set/session capability needed by Payload transactions.',
      ...(!facts.replicaReady && {
        next: 'For local Docker run docker compose up -d --wait mongo; keep replicaSet=rs0&directConnection=true in the host URI.',
      }),
    })
    if (!facts.hasUsers && !config.auth.allowFirstAdminCreation) {
      add({
        name: 'First Admin',
        status: 'fail',
        detail: 'Users is empty and first-account creation is disabled.',
        next: 'Temporarily enable ALLOW_FIRST_ADMIN_CREATION, restart, create the first Admin at /admin, then disable it and restart.',
      })
    } else {
      add({
        name: 'Accounts',
        status: 'manual',
        detail: facts.hasUsers
          ? 'An account exists; sign-in and its access have not been tested.'
          : 'Users is empty; first-Admin creation is enabled.',
        next: facts.hasUsers
          ? 'Sign in at /admin. Disable bootstrap if it is still enabled.'
          : 'Create the first Admin at /admin, then disable bootstrap and restart.',
      })
    }
  } catch {
    add({
      name: 'MongoDB',
      status: 'fail',
      detail: 'Connection or Users read failed; account and transaction capability are unknown.',
      next: 'Check Docker health, MONGODB_URI and database credentials/permissions. No driver details are printed.',
    })
  }

  const localDirectories = [
    ...(config.media.provider === 'localDisk' ? [['Media', 'media']] : []),
    ...(config.formAttachments?.provider === 'localDisk'
      ? [['Private attachments', '.private/form-attachments']]
      : []),
  ]
  for (const [name, directory] of localDirectories) {
    try {
      await dependencies.directory(resolve(options.root, directory))
      add({
        name,
        status: 'pass',
        detail: 'Local directory or nearest existing parent permits access; no file was written.',
      })
    } catch {
      add({
        name,
        status: 'fail',
        detail:
          'Local storage access failed; uploads may fail while text editing remains independent.',
        next: 'Check directory ownership and permissions in the quickstart. No paths or filesystem errors are printed.',
      })
    }
  }
  if (config.media.provider === 's3' || config.formAttachments?.provider === 's3')
    add({
      name: 'Remote storage',
      status: 'manual',
      detail:
        'Configuration validated only; bucket permissions, durability and private access are not verified.',
      next: 'Complete the provider-specific upload/download and privacy checks before relying on uploads.',
    })
  add({
    name: 'Authenticated preview',
    status: 'manual',
    detail: 'Canonical origin validated; no web request or authenticated browser check was made.',
    next: 'Run pnpm dev, sign in at the configured origin and save/preview a draft using the quickstart.',
  })
  add({
    name: 'Launch readiness',
    status: 'manual',
    detail:
      'Email, analytics and a production domain are optional for local drafts. This is not launch certification.',
    next: 'Use the separate production checklist before deploying; configured provider failures still block startup.',
  })
  return checks
}

export function formatSetupChecks(checks: SetupCheck[]): string {
  const failed = checks.filter(({ status }) => status === 'fail').length
  return [
    'Developer setup checks (read-only)',
    ...checks.flatMap(({ name, status, detail, next }) => [
      `[${status.toUpperCase()}] ${name}: ${detail}`,
      ...(next ? [`  Next: ${next}`] : []),
    ]),
    failed
      ? `${failed} prerequisite check(s) failed. Fix them and rerun.`
      : 'No checked prerequisite failed. Complete the manual checks; application, preview and launch are not certified.',
  ].join('\n')
}
