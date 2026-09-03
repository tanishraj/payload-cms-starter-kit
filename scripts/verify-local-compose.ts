import { spawnSync, type SpawnSyncReturns } from 'node:child_process'

const VERIFY_PROJECT = 'payload_hardening_verify'
const VERIFY_NETWORK = 'payload_hardening_verify_default'
const TEST_DATABASE_NAME = 'payload-hardening-compose_test'
const TRANSACTION_SECRET = 'compose-transaction-test-secret-32-chars'

type RunOptions = {
  env?: NodeJS.ProcessEnv
  timeout?: number
}

function run(
  command: string,
  args: readonly string[],
  options: RunOptions = {},
): SpawnSyncReturns<string> {
  return spawnSync(command, args, {
    encoding: 'utf8',
    env: options.env ?? process.env,
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

  const exactNetwork = run('docker', ['network', 'inspect', VERIFY_NETWORK])
  if (exactNetwork.status === 0) {
    throw new Error(`Refusing to use the pre-existing ${VERIFY_NETWORK} network.`)
  }
  if (exactNetwork.error || exactNetwork.signal) {
    throw new Error('Exact network preflight failed without forwarding command output.')
  }
}

function composeEnvironment(): NodeJS.ProcessEnv {
  return { ...process.env, COMPOSE_DISABLE_ENV_FILE: '1', MONGO_HOST_PORT: '0' }
}

function getEphemeralMongoURI(): string {
  const binding = docker(
    ['compose', '-p', VERIFY_PROJECT, 'port', 'mongo', '27017'],
    'Ephemeral MongoDB port discovery',
    { env: composeEnvironment() },
  )
  const match = /^127\.0\.0\.1:(\d{1,5})$/.exec(binding)
  const port = match ? Number(match[1]) : 0
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('Compose did not publish MongoDB on one ephemeral 127.0.0.1 port.')
  }

  return `mongodb://127.0.0.1:${port}/${TEST_DATABASE_NAME}?replicaSet=rs0&directConnection=true`
}

function transactionEnvironment(testDatabaseURI: string): NodeJS.ProcessEnv {
  return {
    ALLOW_FIRST_ADMIN_CREATION: 'false',
    CI: 'true',
    EMAIL_PROVIDER: 'none',
    MEDIA_PROVIDER: 'localDisk',
    NEXT_PUBLIC_SERVER_URL: 'http://127.0.0.1:3000',
    NODE_ENV: 'test',
    NODE_OPTIONS: '--no-deprecation',
    PATH: process.env.PATH ?? '',
    PAYLOAD_SECRET: TRANSACTION_SECRET,
    RUN_COMPOSE_PAYLOAD_TRANSACTION: '1',
    TEST_MONGODB_URI: testDatabaseURI,
  }
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
  assertProjectIsUnused()
  let projectCreatedByThisRun = false
  let verificationError: Error | undefined

  try {
    projectCreatedByThisRun = true
    docker(
      ['compose', '-p', VERIFY_PROJECT, 'up', '-d', '--wait', '--wait-timeout', '90', 'mongo'],
      'Isolated MongoDB startup',
      { env: composeEnvironment(), timeout: 120_000 },
    )
    docker(['compose', '-p', VERIFY_PROJECT, 'ps'], 'Compose status check', {
      env: composeEnvironment(),
    })
    docker(
      [
        'compose',
        '-p',
        VERIFY_PROJECT,
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
      { env: composeEnvironment() },
    )
    const testDatabaseURI = getEphemeralMongoURI()
    const transactionResult = run(
      process.execPath,
      [
        'node_modules/vitest/vitest.mjs',
        'run',
        '--config',
        './vitest.config.mts',
        'tests/int/compose-payload-transaction.int.spec.ts',
      ],
      { env: transactionEnvironment(testDatabaseURI), timeout: 240_000 },
    )
    if (transactionResult.error || transactionResult.signal || transactionResult.status !== 0) {
      throw new Error(
        `Payload transaction verification failed. Sanitized diagnostics:\n${sanitizedTestFailure(transactionResult)}`,
      )
    }
  } catch (error) {
    verificationError = error instanceof Error ? error : new Error('Docker verification failed.')
  } finally {
    if (projectCreatedByThisRun) {
      try {
        docker(
          ['compose', '-p', VERIFY_PROJECT, 'down', '--volumes', '--remove-orphans'],
          'Isolated Compose cleanup',
          { env: composeEnvironment(), timeout: 90_000 },
        )
      } catch {
        throw new Error('Verification ended with an isolated Compose cleanup failure.')
      }
    }
  }

  if (verificationError) throw verificationError
  console.log('Local Compose PRIMARY and Payload transaction verification passed.')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Local Compose verification failed.')
  process.exitCode = 1
}
