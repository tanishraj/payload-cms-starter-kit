import { randomBytes } from 'node:crypto'
import { spawnSync, type SpawnSyncReturns } from 'node:child_process'
import { createReadStream, chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
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

const VERIFY_IMAGE = 'payload-cms-starter-kit:hardening-verify'
const VERIFY_BUILDER = 'payload_hardening_verify_builder'
const VERIFY_BUILDER_CONTAINER = 'buildx_buildkit_payload_hardening_verify_builder0'
const VERIFY_BUILDER_VOLUME = 'buildx_buildkit_payload_hardening_verify_builder0_state'
const BUILDER_OWNER_ENVIRONMENT = 'PAYLOAD_HARDENING_OWNER'
const BUILD_DATABASE_URI =
  'mongodb://mongo:27017/payload-hardening-build_test?replicaSet=rs0&directConnection=true'
const PUBLIC_ORIGIN = 'https://hardening-verify.invalid'

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

function assertImageOwned(runToken: string): void {
  const owner = docker(
    [
      'image',
      'inspect',
      '--format',
      `{{ index .Config.Labels "${VERIFY_OWNER_LABEL}" }}`,
      VERIFY_IMAGE,
    ],
    'Verification image ownership inspection',
  )
  if (owner !== runToken) {
    throw new Error('Refusing cleanup because verification image ownership changed.')
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

function assertBuilderOwned(runToken: string, bootstrapped: boolean): void {
  const builderInspection = run('docker', ['buildx', 'inspect', VERIFY_BUILDER])
  if (builderInspection.error || builderInspection.signal || builderInspection.status !== 0) {
    throw new Error('Refusing cleanup because the verification builder identity changed.')
  }
  const containerInspection = run('docker', ['container', 'inspect', VERIFY_BUILDER_CONTAINER])
  if (containerInspection.error || containerInspection.signal) {
    throw new Error('Verification builder container ownership inspection failed.')
  }

  if (containerInspection.status === 0) {
    const rawEnvironment = docker(
      ['container', 'inspect', '--format', '{{json .Config.Env}}', VERIFY_BUILDER_CONTAINER],
      'Verification builder ownership inspection',
    )
    let environment: string[]
    try {
      environment = JSON.parse(rawEnvironment) as string[]
    } catch {
      throw new Error('Refusing cleanup because builder ownership inspection was invalid.')
    }
    if (!environment.includes(`${BUILDER_OWNER_ENVIRONMENT}=${runToken}`)) {
      throw new Error('Refusing cleanup because verification builder ownership changed.')
    }
  } else if (bootstrapped) {
    throw new Error('Refusing cleanup because the verification builder container changed.')
  }

  const stateInspection = run('docker', ['volume', 'inspect', VERIFY_BUILDER_VOLUME])
  if (stateInspection.error || stateInspection.signal) {
    throw new Error('Verification builder state ownership inspection failed.')
  }
  if (bootstrapped && stateInspection.status !== 0) {
    throw new Error('Refusing cleanup because the verification builder state changed.')
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
    entries.some((entry) => {
      const separator = entry.indexOf('=')
      return forbiddenName.test(separator === -1 ? entry : entry.slice(0, separator))
    }) ||
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
  const runToken = randomBytes(32).toString('hex')
  let lock: VerifierLock | undefined
  let temporaryDirectory: string | undefined
  let composeEnvironmentPath: string | undefined
  let buildEnvironmentPath: string | undefined
  let exportedFilesystemPath: string | undefined
  let buildEnvironment = ''
  let payloadSecret = ''
  let projectCreatedByThisRun = false
  let imageCreatedByThisRun = false
  let builderCreatedByThisRun = false
  let builderBootstrappedByThisRun = false
  let temporaryContainerID: string | undefined
  let verificationError: Error | undefined
  let cleanupError: Error | undefined

  try {
    lock = acquireVerifierLock(runToken)
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'payload-hardening-image-'))
    composeEnvironmentPath = createSafeComposeEnvironmentFile(temporaryDirectory)
    buildEnvironmentPath = join(temporaryDirectory, 'payload-build.env')
    exportedFilesystemPath = join(temporaryDirectory, 'runner.tar')
    payloadSecret = `hardening-${randomBytes(32).toString('hex')}`
    buildEnvironment = [
      `MONGODB_URI='${BUILD_DATABASE_URI}'`,
      `PAYLOAD_SECRET='${payloadSecret}'`,
      'ALLOW_FIRST_ADMIN_CREATION=false',
      'EMAIL_PROVIDER=none',
      'MEDIA_PROVIDER=localDisk',
      '',
    ].join('\n')
    writeFileSync(buildEnvironmentPath, buildEnvironment, { flag: 'wx', mode: 0o600 })
    chmodSync(buildEnvironmentPath, 0o600)
    const environment = composeEnvironment(composeEnvironmentPath, runToken)

    assertProjectIsUnused()
    assertImageTagIsUnused()
    assertBuilderIsUnused()

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
        '--driver-opt',
        `env.${BUILDER_OWNER_ENVIRONMENT}=${runToken}`,
        '--buildkitd-flags',
        '--allow-insecure-entitlement network.host',
      ],
      'Isolated BuildKit builder creation',
      { timeout: 120_000 },
    )
    builderCreatedByThisRun = true
    docker(
      ['buildx', 'inspect', '--bootstrap', VERIFY_BUILDER],
      'Isolated BuildKit builder bootstrap',
      { timeout: 120_000 },
    )
    builderBootstrappedByThisRun = true

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
        '--label',
        `${VERIFY_OWNER_LABEL}=${runToken}`,
        '--tag',
        VERIFY_IMAGE,
        VERIFY_PROJECT_DIRECTORY,
      ],
      {
        env: minimalCommandEnvironment({ DOCKER_BUILDKIT: '1' }),
        timeout: 900_000,
      },
    )
    if (buildResult.error || buildResult.signal || buildResult.status !== 0) {
      throw new Error(
        `Node 22 production image build failed. Sanitized diagnostics:\n${sanitizedBuildFailure(
          buildResult,
          [BUILD_DATABASE_URI, payloadSecret, buildEnvironment, buildEnvironmentPath, runToken],
        )}`,
      )
    }
    imageCreatedByThisRun = true

    assertImageOwned(runToken)
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

    if (lock) {
      const ownedLock = lock
      const attemptCleanup = (label: string, cleanup: () => void): void => {
        try {
          assertVerifierLockOwned(ownedLock)
          cleanup()
        } catch {
          cleanupFailures.push(label)
        }
      }

      if (temporaryContainerID) {
        const ownedContainerID = temporaryContainerID
        attemptCleanup('temporary container', () => {
          const owner = inspectOwner('container', ownedContainerID)
          if (owner !== runToken) {
            throw new Error('Refusing cleanup because temporary container ownership changed.')
          }
          docker(['container', 'rm', '--force', ownedContainerID], 'Temporary container cleanup')
        })
      }

      if (imageCreatedByThisRun && run('docker', ['image', 'inspect', VERIFY_IMAGE]).status === 0) {
        attemptCleanup('verification image', () => {
          assertImageOwned(runToken)
          docker(['image', 'rm', VERIFY_IMAGE], 'Verification image cleanup', { timeout: 120_000 })
        })
      }

      if (
        builderCreatedByThisRun &&
        run('docker', ['buildx', 'inspect', VERIFY_BUILDER]).status === 0
      ) {
        attemptCleanup('verification BuildKit builder', () => {
          assertBuilderOwned(runToken, builderBootstrappedByThisRun)
          docker(['buildx', 'rm', VERIFY_BUILDER], 'Verification BuildKit builder cleanup', {
            timeout: 120_000,
          })
        })
      }

      attemptCleanup('isolated Compose project', () => {
        if (!projectCreatedByThisRun && composeResourcesExist()) {
          assertComposeResourcesOwned(runToken)
          projectCreatedByThisRun = true
        }
        if (projectCreatedByThisRun && composeEnvironmentPath) {
          assertComposeResourcesOwned(runToken)
          compose(
            ['down', '--volumes', '--remove-orphans'],
            'Isolated Compose cleanup',
            composeEnvironment(composeEnvironmentPath, runToken),
            90_000,
          )
        }
      })
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
    if (cleanupFailures.length > 0) {
      cleanupError ??= new Error(`Verification cleanup failed for: ${cleanupFailures.join(', ')}.`)
    }
  }

  if (cleanupError) throw cleanupError
  if (verificationError) throw verificationError
  console.log('Node 22 production image and build-secret verification passed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Production image verification failed.')
  process.exitCode = 1
})
