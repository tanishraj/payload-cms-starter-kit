import { randomBytes } from 'node:crypto'
import { spawnSync, type SpawnSyncReturns } from 'node:child_process'
import { createReadStream, chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const VERIFY_PROJECT = 'payload_hardening_verify'
const VERIFY_NETWORK = 'payload_hardening_verify_default'
const VERIFY_IMAGE = 'payload-cms-starter-kit:hardening-verify'
const VERIFY_BUILDER = 'payload_hardening_verify_builder'
const VERIFY_BUILDER_CONTAINER = 'buildx_buildkit_payload_hardening_verify_builder0'
const VERIFY_BUILDER_VOLUME = 'buildx_buildkit_payload_hardening_verify_builder0_state'
const BUILD_DATABASE_URI =
  'mongodb://mongo:27017/payload-hardening-build_test?replicaSet=rs0&directConnection=true'
const PUBLIC_ORIGIN = 'https://hardening-verify.invalid'

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

function assertImageTagIsUnused(): void {
  if (VERIFY_IMAGE !== 'payload-cms-starter-kit:hardening-verify') {
    throw new Error('The verifier image identity is not the approved fixed value.')
  }

  const inspection = run('docker', ['image', 'inspect', VERIFY_IMAGE])
  if (inspection.status === 0) {
    throw new Error(`Refusing to overwrite the pre-existing ${VERIFY_IMAGE} image.`)
  }
  if (inspection.error || inspection.signal) {
    throw new Error('Fixed image preflight failed without forwarding command output.')
  }
}

function assertBuilderIsUnused(): void {
  const builderInspection = run('docker', ['buildx', 'inspect', VERIFY_BUILDER])
  if (builderInspection.status === 0) {
    throw new Error(`Refusing to use the pre-existing ${VERIFY_BUILDER} builder.`)
  }
  if (builderInspection.error || builderInspection.signal) {
    throw new Error('Fixed builder preflight failed without forwarding command output.')
  }

  for (const [kind, args] of [
    ['container', ['container', 'inspect', VERIFY_BUILDER_CONTAINER]],
    ['volume', ['volume', 'inspect', VERIFY_BUILDER_VOLUME]],
  ] as const) {
    const inspection = run('docker', args)
    if (inspection.status === 0) {
      throw new Error(`Refusing to use the pre-existing verification builder ${kind}.`)
    }
    if (inspection.error || inspection.signal) {
      throw new Error(
        `Verification builder ${kind} preflight failed without forwarding command output.`,
      )
    }
  }
}

async function fileContainsAny(path: string, needles: Buffer[]): Promise<boolean> {
  const longestNeedle = Math.max(...needles.map((needle) => needle.length))
  let trailing = Buffer.alloc(0)

  for await (const chunk of createReadStream(path)) {
    const combined = Buffer.concat([trailing, chunk as Buffer])
    if (needles.some((needle) => combined.includes(needle))) return true
    trailing = combined.subarray(Math.max(0, combined.length - longestNeedle + 1))
  }

  return false
}

function inspectImageEnvironment(secretValues: string[]): void {
  const raw = docker(
    ['image', 'inspect', '--format', '{{json .Config.Env}}', VERIFY_IMAGE],
    'Image environment inspection',
  )
  let entries: string[]
  try {
    entries = JSON.parse(raw) as string[]
  } catch {
    throw new Error('Image environment inspection returned an unsupported shape.')
  }

  const forbiddenName =
    /^(MONGODB_URI|PAYLOAD_SECRET|RESEND_API_KEY|S3_ACCESS_KEY_ID|S3_SECRET_ACCESS_KEY|MEDIA_RECONCILE_TOKEN)$/
  if (
    entries.some((entry) => forbiddenName.test(entry.slice(0, Math.max(0, entry.indexOf('='))))) ||
    secretValues.some((secret) => entries.some((entry) => entry.includes(secret)))
  ) {
    throw new Error('The production image environment contains server-only build configuration.')
  }
}

function sanitizedBuildFailure(result: SpawnSyncReturns<string>, secretValues: string[]): string {
  let output = `${result.stdout}\n${result.stderr}`
  for (const secret of secretValues) output = output.replaceAll(secret, '<redacted>')
  output = output
    .replace(/mongodb(?:\+srv)?:\/\/[^\s'"`]+/g, '<redacted-mongodb-uri>')
    .replace(/\u001B\[[0-9;]*m/g, '')
    .trim()
  if (!output) return 'No build diagnostics were emitted.'
  const meaningfulLines = output
    .split('\n')
    .filter((line) => line.startsWith('#') || /error|failed|ERR_|ELIFECYCLE/i.test(line))
    .slice(-160)
    .join('\n')
  return (meaningfulLines || output).slice(-10_000)
}

async function main(): Promise<void> {
  assertProjectIsUnused()
  assertImageTagIsUnused()
  assertBuilderIsUnused()

  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'payload-hardening-image-'))
  const buildEnvironmentPath = join(temporaryDirectory, 'payload-build.env')
  const exportedFilesystemPath = join(temporaryDirectory, 'runner.tar')
  const payloadSecret = `hardening-${randomBytes(32).toString('hex')}`
  const buildEnvironment = [
    `MONGODB_URI='${BUILD_DATABASE_URI}'`,
    `PAYLOAD_SECRET='${payloadSecret}'`,
    'ALLOW_FIRST_ADMIN_CREATION=false',
    'EMAIL_PROVIDER=none',
    'MEDIA_PROVIDER=localDisk',
    '',
  ].join('\n')
  writeFileSync(buildEnvironmentPath, buildEnvironment, { flag: 'wx', mode: 0o600 })
  chmodSync(buildEnvironmentPath, 0o600)

  let projectCreatedByThisRun = false
  let imageCreatedByThisRun = false
  let builderCreatedByThisRun = false
  let temporaryContainerID: string | undefined
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

    builderCreatedByThisRun = true
    docker(
      [
        'buildx',
        'create',
        '--name',
        VERIFY_BUILDER,
        '--driver',
        'docker-container',
        '--driver-opt',
        `network=${VERIFY_NETWORK}`,
        '--buildkitd-flags',
        '--allow-insecure-entitlement network.host',
        '--bootstrap',
      ],
      'Isolated BuildKit builder creation',
      { timeout: 120_000 },
    )

    imageCreatedByThisRun = true
    const buildResult = run(
      'docker',
      [
        'buildx',
        'build',
        '--builder',
        VERIFY_BUILDER,
        '--load',
        '--allow',
        'network.host',
        '--network',
        'host',
        '--secret',
        `id=payload_build_env,src=${buildEnvironmentPath}`,
        '--build-arg',
        `NEXT_PUBLIC_SERVER_URL=${PUBLIC_ORIGIN}`,
        '--tag',
        VERIFY_IMAGE,
        '.',
      ],
      { env: { ...process.env, DOCKER_BUILDKIT: '1' }, timeout: 900_000 },
    )
    if (buildResult.error || buildResult.signal || buildResult.status !== 0) {
      throw new Error(
        `Node 22 production image build failed. Sanitized diagnostics:\n${sanitizedBuildFailure(
          buildResult,
          [BUILD_DATABASE_URI, payloadSecret, buildEnvironment, buildEnvironmentPath],
        )}`,
      )
    }

    inspectImageEnvironment([BUILD_DATABASE_URI, payloadSecret, buildEnvironment])
    temporaryContainerID = docker(['create', VERIFY_IMAGE], 'Temporary runner container creation')
    docker(
      ['export', '--output', exportedFilesystemPath, temporaryContainerID],
      'Runner filesystem export',
      { timeout: 120_000 },
    )

    if (
      await fileContainsAny(exportedFilesystemPath, [
        Buffer.from(BUILD_DATABASE_URI),
        Buffer.from(payloadSecret),
        Buffer.from(buildEnvironment),
      ])
    ) {
      throw new Error('The exported runner filesystem contains server-only build configuration.')
    }
  } catch (error) {
    verificationError = error instanceof Error ? error : new Error('Image verification failed.')
  } finally {
    const cleanupFailures: string[] = []

    if (temporaryContainerID) {
      try {
        docker(['container', 'rm', '--force', temporaryContainerID], 'Temporary container cleanup')
      } catch {
        cleanupFailures.push('temporary container')
      }
    }

    if (imageCreatedByThisRun && run('docker', ['image', 'inspect', VERIFY_IMAGE]).status === 0) {
      try {
        docker(['image', 'rm', VERIFY_IMAGE], 'Verification image cleanup', { timeout: 120_000 })
      } catch {
        cleanupFailures.push('verification image')
      }
    }

    if (
      builderCreatedByThisRun &&
      run('docker', ['buildx', 'inspect', VERIFY_BUILDER]).status === 0
    ) {
      try {
        docker(['buildx', 'rm', VERIFY_BUILDER], 'Verification BuildKit builder cleanup', {
          timeout: 120_000,
        })
      } catch {
        cleanupFailures.push('verification BuildKit builder')
      }
    }

    if (projectCreatedByThisRun) {
      try {
        docker(
          ['compose', '-p', VERIFY_PROJECT, 'down', '--volumes', '--remove-orphans'],
          'Isolated Compose cleanup',
          { env: composeEnvironment(), timeout: 90_000 },
        )
      } catch {
        cleanupFailures.push('isolated Compose project')
      }
    }

    rmSync(temporaryDirectory, { force: true, recursive: true })
    if (cleanupFailures.length > 0) {
      throw new Error(`Verification cleanup failed for: ${cleanupFailures.join(', ')}.`)
    }
  }

  if (verificationError) throw verificationError
  console.log('Node 22 production image and build-secret verification passed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Production image verification failed.')
  process.exitCode = 1
})
