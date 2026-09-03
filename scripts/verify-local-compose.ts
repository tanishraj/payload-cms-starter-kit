import { randomBytes } from 'node:crypto'
import { spawnSync, type SpawnSyncReturns } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  acquireVerifierLock,
  assertVerifierLockOwned,
  composeCommandArgs,
  createSafeComposeEnvironmentFile,
  minimalCommandEnvironment,
  releaseVerifierLock,
  VERIFY_MONGO_VOLUME,
  VERIFY_NETWORK,
  VERIFY_NODE_MODULES_VOLUME,
  VERIFY_OWNER_LABEL,
  VERIFY_PROJECT,
  VERIFY_PROJECT_DIRECTORY,
  type VerifierLock,
} from './docker-verifier-safety'

const TEST_DATABASE_NAME = 'payload-hardening-compose_test'
const TRANSACTION_SECRET = 'compose-transaction-test-secret-32-chars'

type RunOptions = {
  cwd?: string
  env?: NodeJS.ProcessEnv
  timeout?: number
}

function run(
  command: string,
  args: readonly string[],
  options: RunOptions = {},
): SpawnSyncReturns<string> {
  return spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    env: options.env ?? minimalCommandEnvironment(),
    maxBuffer: 1024 * 1024,
    shell: false,
    stdio: 'pipe',
    timeout: options.timeout ?? 30_000,
  })
}

function requireSuccess(result: SpawnSyncReturns<string>, label: string): string {
  if (result.error || result.signal || result.status !== 0) {
    throw new Error(`${label} failed without forwarding command output.`)
  }

  return result.stdout.trim()
}

function docker(args: readonly string[], label: string, options?: RunOptions): string {
  return requireSuccess(run('docker', args, options), label)
}

function compose(
  args: readonly string[],
  label: string,
  environment: NodeJS.ProcessEnv,
  timeout?: number,
): string {
  return docker(composeCommandArgs(...args), label, { env: environment, timeout })
}

function assertAbsent(kind: 'network' | 'volume', name: string): void {
  const inspection = run('docker', [kind, 'inspect', name])
  if (inspection.status === 0) {
    throw new Error(`Refusing to use the pre-existing verification ${kind} ${name}.`)
  }
  if (inspection.error || inspection.signal) {
    throw new Error(`Exact ${kind} preflight failed without forwarding command output.`)
  }
}

function assertProjectIsUnused(): void {
  if (VERIFY_PROJECT !== 'payload_hardening_verify') {
    throw new Error('The verifier project identity is not the approved fixed value.')
  }

  docker(['version', '--format', '{{.Server.Version}}'], 'Docker availability check')

  for (const [kind, args] of [
    [
      'container',
      [
        'container',
        'ls',
        '--all',
        '--filter',
        `label=com.docker.compose.project=${VERIFY_PROJECT}`,
        '--format',
        '{{.ID}}',
      ],
    ],
    [
      'network',
      [
        'network',
        'ls',
        '--filter',
        `label=com.docker.compose.project=${VERIFY_PROJECT}`,
        '--format',
        '{{.ID}}',
      ],
    ],
    [
      'volume',
      [
        'volume',
        'ls',
        '--filter',
        `label=com.docker.compose.project=${VERIFY_PROJECT}`,
        '--format',
        '{{.Name}}',
      ],
    ],
  ] as const) {
    if (docker(args, `Existing ${kind} preflight`)) {
      throw new Error(`Refusing to use a pre-existing ${kind} for ${VERIFY_PROJECT}.`)
    }
  }

  assertAbsent('network', VERIFY_NETWORK)
  assertAbsent('volume', VERIFY_MONGO_VOLUME)
  assertAbsent('volume', VERIFY_NODE_MODULES_VOLUME)
}

function composeEnvironment(composeEnvironmentPath: string, runToken: string): NodeJS.ProcessEnv {
  return minimalCommandEnvironment({
    COMPOSE_DISABLE_ENV_FILE: '1',
    MONGO_HOST_PORT: '0',
    PAYLOAD_ENV_FILE: composeEnvironmentPath,
    PAYLOAD_VERIFY_OWNER: runToken,
  })
}

function listProjectResources(kind: 'container' | 'network' | 'volume'): string[] {
  const args =
    kind === 'container'
      ? [
          'container',
          'ls',
          '--all',
          '--filter',
          `label=com.docker.compose.project=${VERIFY_PROJECT}`,
          '--format',
          '{{.ID}}',
        ]
      : [
          kind,
          'ls',
          '--filter',
          `label=com.docker.compose.project=${VERIFY_PROJECT}`,
          '--format',
          kind === 'volume' ? '{{.Name}}' : '{{.ID}}',
        ]
  const output = docker(args, `Current-run ${kind} ownership listing`)
  return output ? output.split('\n') : []
}

function inspectOwner(kind: 'container' | 'network' | 'volume', name: string): string {
  const labelPath =
    kind === 'container'
      ? `{{ index .Config.Labels "${VERIFY_OWNER_LABEL}" }}`
      : `{{ index .Labels "${VERIFY_OWNER_LABEL}" }}`
  return docker([kind, 'inspect', '--format', labelPath, name], `${kind} ownership inspection`)
}

function existingExactResources(kind: 'network' | 'volume', names: readonly string[]): string[] {
  return names.filter((name) => run('docker', [kind, 'inspect', name]).status === 0)
}

function composeResourcesExist(): boolean {
  return (
    listProjectResources('container').length > 0 ||
    listProjectResources('network').length > 0 ||
    listProjectResources('volume').length > 0 ||
    existingExactResources('network', [VERIFY_NETWORK]).length > 0 ||
    existingExactResources('volume', [VERIFY_MONGO_VOLUME, VERIFY_NODE_MODULES_VOLUME]).length > 0
  )
}

function assertComposeResourcesOwned(runToken: string): void {
  const resources = [
    ...listProjectResources('container').map((name) => ['container', name] as const),
    ...listProjectResources('network').map((name) => ['network', name] as const),
    ...listProjectResources('volume').map((name) => ['volume', name] as const),
    ...existingExactResources('network', [VERIFY_NETWORK]).map(
      (name) => ['network', name] as const,
    ),
    ...existingExactResources('volume', [VERIFY_MONGO_VOLUME, VERIFY_NODE_MODULES_VOLUME]).map(
      (name) => ['volume', name] as const,
    ),
  ]

  for (const [kind, name] of resources) {
    if (inspectOwner(kind, name) !== runToken) {
      throw new Error(`Refusing cleanup because verification ${kind} ownership changed.`)
    }
  }
}

function getEphemeralMongoURI(environment: NodeJS.ProcessEnv): string {
  const binding = compose(
    ['port', 'mongo', '27017'],
    'Ephemeral MongoDB port discovery',
    environment,
  )
  const match = /^127\.0\.0\.1:(\d{1,5})$/.exec(binding)
  const port = match ? Number(match[1]) : 0
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('Compose did not publish MongoDB on one ephemeral 127.0.0.1 port.')
  }

  return `mongodb://127.0.0.1:${port}/${TEST_DATABASE_NAME}?replicaSet=rs0&directConnection=true`
}

function transactionEnvironment(
  testDatabaseURI: string,
  composeEnvironmentPath: string,
): NodeJS.ProcessEnv {
  return minimalCommandEnvironment({
    ALLOW_FIRST_ADMIN_CREATION: 'false',
    CI: 'true',
    DOTENV_CONFIG_PATH: composeEnvironmentPath,
    EMAIL_PROVIDER: 'none',
    MEDIA_PROVIDER: 'localDisk',
    NEXT_PUBLIC_SERVER_URL: 'http://127.0.0.1:3000',
    NODE_ENV: 'test',
    NODE_OPTIONS: '--no-deprecation',
    PAYLOAD_SECRET: TRANSACTION_SECRET,
    RUN_COMPOSE_PAYLOAD_TRANSACTION: '1',
    TEST_MONGODB_URI: testDatabaseURI,
  })
}

function sanitizedTestFailure(result: SpawnSyncReturns<string>): string {
  const output = `${result.stdout}\n${result.stderr}`
    .replaceAll(TRANSACTION_SECRET, '<redacted-secret>')
    .replace(/mongodb(?:\+srv)?:\/\/[^\s'"`]+/g, '<redacted-mongodb-uri>')
    .replace(/\u001B\[[0-9;]*m/g, '')
    .trim()
  return output.slice(0, 4_000) || 'No test diagnostics were emitted.'
}

function main(): void {
  const runToken = randomBytes(32).toString('hex')
  let lock: VerifierLock | undefined
  let temporaryDirectory: string | undefined
  let composeEnvironmentPath: string | undefined
  let projectCreatedByThisRun = false
  let verificationError: Error | undefined
  let cleanupError: Error | undefined

  try {
    lock = acquireVerifierLock(runToken)
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'payload-hardening-compose-'))
    composeEnvironmentPath = createSafeComposeEnvironmentFile(temporaryDirectory)
    const environment = composeEnvironment(composeEnvironmentPath, runToken)

    assertProjectIsUnused()
    compose(
      ['up', '-d', '--wait', '--wait-timeout', '90', 'mongo'],
      'Isolated MongoDB startup',
      environment,
      120_000,
    )
    projectCreatedByThisRun = true
    compose(['ps'], 'Compose status check', environment)
    compose(
      [
        'exec',
        '-T',
        'mongo',
        'mongosh',
        '--quiet',
        '--host',
        'mongo:27017',
        '--eval',
        'const ok = db.adminCommand({ ping: 1 }).ok === 1 && rs.status().myState === 1; quit(ok ? 0 : 1)',
      ],
      'MongoDB ping and PRIMARY check',
      environment,
    )
    const testDatabaseURI = getEphemeralMongoURI(environment)
    const transactionResult = run(
      process.execPath,
      [
        'node_modules/vitest/vitest.mjs',
        'run',
        '--config',
        './vitest.config.mts',
        'tests/int/compose-payload-transaction.int.spec.ts',
      ],
      {
        cwd: VERIFY_PROJECT_DIRECTORY,
        env: transactionEnvironment(testDatabaseURI, composeEnvironmentPath),
        timeout: 240_000,
      },
    )
    if (transactionResult.error || transactionResult.signal || transactionResult.status !== 0) {
      throw new Error(
        `Payload transaction verification failed. Sanitized diagnostics:\n${sanitizedTestFailure(transactionResult)}`,
      )
    }
  } catch (error) {
    verificationError = error instanceof Error ? error : new Error('Docker verification failed.')
  } finally {
    if (lock && composeEnvironmentPath) {
      try {
        assertVerifierLockOwned(lock)
        if (!projectCreatedByThisRun && composeResourcesExist()) {
          assertComposeResourcesOwned(runToken)
          projectCreatedByThisRun = true
        }
        if (projectCreatedByThisRun) {
          assertComposeResourcesOwned(runToken)
          compose(
            ['down', '--volumes', '--remove-orphans'],
            'Isolated Compose cleanup',
            composeEnvironment(composeEnvironmentPath, runToken),
            90_000,
          )
        }
      } catch (error) {
        cleanupError =
          error instanceof Error ? error : new Error('Isolated Compose cleanup failed.')
      }
    }

    if (temporaryDirectory) rmSync(temporaryDirectory, { force: true, recursive: true })
    if (lock) {
      try {
        releaseVerifierLock(lock)
      } catch (error) {
        cleanupError ??=
          error instanceof Error ? error : new Error('Docker verifier lock release failed.')
      }
    }
  }

  if (cleanupError) throw cleanupError
  if (verificationError) throw verificationError
  console.log('Local Compose PRIMARY and Payload transaction verification passed.')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Local Compose verification failed.')
  process.exitCode = 1
}
