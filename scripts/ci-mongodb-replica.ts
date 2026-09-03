import { spawnSync, type SpawnSyncReturns } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { assertSafeTestDatabaseURI } from '../tests/helpers/testDatabaseSafety'

export const CI_MONGO_IMAGE = 'mongo:8.0.29'
export const CI_MONGO_OWNER_LABEL = 'com.payloadcms.hardening.ci-owner'
export const CI_MONGO_URI =
  'mongodb://127.0.0.1:27017/payload-hardening-ci_test?replicaSet=rs0&directConnection=true'

const COMMAND_TIMEOUT_MS = 120_000
const INSPECT_TIMEOUT_MS = 30_000
const READINESS_TIMEOUT_MS = 90_000
const READINESS_INTERVAL_MS = 1_000
const MAX_DOCKER_OUTPUT_BYTES = 1024 * 1024

export type DockerRunner = (args: readonly string[], timeoutMs: number) => SpawnSyncReturns<string>

export type CIMongoIdentity = {
  containerName: string
  owner: string
}

const defaultDockerRunner: DockerRunner = (args, timeoutMs) =>
  spawnSync('docker', [...args], {
    encoding: 'utf8',
    maxBuffer: MAX_DOCKER_OUTPUT_BYTES,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: timeoutMs,
  })

function controllerError(rule: string): Error {
  return new Error(`CI MongoDB replica ${rule}.`)
}

function isExecutionFailure(result: SpawnSyncReturns<string>): boolean {
  return Boolean(result.error || result.signal)
}

function requireSuccess(result: SpawnSyncReturns<string>, operation: string): void {
  if (isExecutionFailure(result) || result.status !== 0) {
    throw controllerError(`${operation} failed without forwarding command output`)
  }
}

function inspectContainer(run: DockerRunner, containerName: string): 'absent' | 'present' {
  const inspection = run(['container', 'inspect', containerName], INSPECT_TIMEOUT_MS)

  if (isExecutionFailure(inspection)) {
    throw controllerError('container preflight failed without forwarding command output')
  }
  if (inspection.status === 0) return 'present'
  if (inspection.status === 1) return 'absent'

  throw controllerError('container preflight failed without forwarding command output')
}

function assertOwnedContainer(run: DockerRunner, identity: CIMongoIdentity): void {
  const ownership = run(
    [
      'inspect',
      '--format',
      `{{ index .Config.Labels "${CI_MONGO_OWNER_LABEL}" }}`,
      identity.containerName,
    ],
    INSPECT_TIMEOUT_MS,
  )

  requireSuccess(ownership, 'ownership inspection')
  if (ownership.stdout.trim() !== identity.owner) {
    throw controllerError('container ownership verification failed')
  }
}

function removeOwnedContainer(run: DockerRunner, identity: CIMongoIdentity): void {
  assertOwnedContainer(run, identity)
  requireSuccess(
    run(['rm', '--force', identity.containerName], COMMAND_TIMEOUT_MS),
    'owned container cleanup',
  )
}

function waitForReadiness(run: DockerRunner, containerName: string): void {
  const readinessExpression = `
try {
  const ping = db.runCommand({ ping: 1 })
  const hello = db.hello()
  const members = rs.conf().members
  if (
    ping.ok === 1 &&
    db.version() === '8.0.29' &&
    hello.isWritablePrimary === true &&
    members.length === 1 &&
    members[0].host === '127.0.0.1:27017'
  ) quit(0)
} catch (_) {}
quit(2)
`.trim()
  const deadline = Date.now() + READINESS_TIMEOUT_MS
  const waitBuffer = new Int32Array(new SharedArrayBuffer(4))

  while (Date.now() < deadline) {
    const commandTimeoutMs = Math.max(1, Math.min(INSPECT_TIMEOUT_MS, deadline - Date.now()))
    const readiness = run(
      ['exec', containerName, 'mongosh', '--quiet', '--eval', readinessExpression],
      commandTimeoutMs,
    )

    if (isExecutionFailure(readiness)) {
      throw controllerError('readiness check failed without forwarding command output')
    }
    if (readiness.status === 0) return
    if (readiness.status !== 1 && readiness.status !== 2) {
      throw controllerError('readiness check failed without forwarding command output')
    }

    const remainingMs = deadline - Date.now()
    if (remainingMs > 0) {
      Atomics.wait(waitBuffer, 0, 0, Math.min(READINESS_INTERVAL_MS, remainingMs))
    }
  }

  throw controllerError('readiness timed out')
}

export function getCIMongoIdentity(env: NodeJS.ProcessEnv): CIMongoIdentity {
  if (env.CI !== 'true' || env.GITHUB_ACTIONS !== 'true') {
    throw controllerError('requires the GitHub Actions CI markers')
  }

  const containerName = env.CI_MONGO_CONTAINER ?? ''
  const owner = env.CI_MONGO_OWNER ?? ''
  const runID = env.GITHUB_RUN_ID ?? ''
  const runAttempt = env.GITHUB_RUN_ATTEMPT ?? ''
  const containerMatch = /^payload-hardening-ci-([0-9]+)-([0-9]+)$/.exec(containerName)
  const ownerMatch = /^([0-9]+):([0-9]+)$/.exec(owner)

  if (
    !containerMatch ||
    !ownerMatch ||
    !/^[0-9]+$/.test(runID) ||
    !/^[0-9]+$/.test(runAttempt) ||
    containerMatch[1] !== runID ||
    containerMatch[2] !== runAttempt ||
    ownerMatch[1] !== runID ||
    ownerMatch[2] !== runAttempt
  ) {
    throw controllerError('identity contract is invalid')
  }

  assertSafeTestDatabaseURI(env.TEST_MONGODB_URI ?? '')
  assertSafeTestDatabaseURI(env.MONGODB_URI ?? '')

  return { containerName, owner }
}

export function startCIMongoReplica(
  options: { env?: NodeJS.ProcessEnv; run?: DockerRunner } = {},
): void {
  const env = options.env ?? process.env
  const run = options.run ?? defaultDockerRunner
  const identity = getCIMongoIdentity(env)

  if (inspectContainer(run, identity.containerName) === 'present') {
    throw controllerError('container already exists')
  }

  let creationAttempted = false

  try {
    creationAttempted = true
    requireSuccess(
      run(
        [
          'run',
          '--detach',
          '--name',
          identity.containerName,
          '--label',
          `${CI_MONGO_OWNER_LABEL}=${identity.owner}`,
          '--publish',
          '127.0.0.1:27017:27017',
          CI_MONGO_IMAGE,
          '--replSet',
          'rs0',
          '--bind_ip_all',
        ],
        COMMAND_TIMEOUT_MS,
      ),
      'container start',
    )
    assertOwnedContainer(run, identity)

    const initiateExpression = `
try {
  rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '127.0.0.1:27017' }] })
} catch (error) {
  if (error.codeName !== 'AlreadyInitialized') quit(2)
}
`.trim()
    requireSuccess(
      run(
        ['exec', identity.containerName, 'mongosh', '--quiet', '--eval', initiateExpression],
        INSPECT_TIMEOUT_MS,
      ),
      'replica initialization',
    )

    waitForReadiness(run, identity.containerName)
  } catch {
    if (creationAttempted) {
      try {
        if (inspectContainer(run, identity.containerName) === 'present') {
          removeOwnedContainer(run, identity)
        }
      } catch {
        throw controllerError('startup failed and owned cleanup could not be completed')
      }
    }

    throw controllerError('startup failed without forwarding command output')
  }
}

export function stopCIMongoReplica(
  options: { env?: NodeJS.ProcessEnv; run?: DockerRunner } = {},
): void {
  const env = options.env ?? process.env
  const run = options.run ?? defaultDockerRunner
  const identity = getCIMongoIdentity(env)

  if (inspectContainer(run, identity.containerName) === 'absent') return
  removeOwnedContainer(run, identity)
}

function runCLI(): void {
  const command = process.argv[2]

  try {
    if (command === 'start') startCIMongoReplica()
    else if (command === 'stop') stopCIMongoReplica()
    else throw controllerError('command must be start or stop')
  } catch {
    console.error('CI MongoDB replica command failed.')
    process.exitCode = 1
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  runCLI()
}
