import { chmodSync, closeSync, openSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const VERIFY_PROJECT = 'payload_hardening_verify'
export const VERIFY_NETWORK = 'payload_hardening_verify_default'
export const VERIFY_MONGO_VOLUME = 'payload_hardening_verify_mongo_data_8_0'
export const VERIFY_NODE_MODULES_VOLUME = 'payload_hardening_verify_node_modules'
export const VERIFY_OWNER_LABEL = 'com.payloadcms.hardening.owner'
export const VERIFY_PROJECT_DIRECTORY = resolve(
  dirname(fileURLToPath(new URL('../package.json', import.meta.url))),
)
export const VERIFY_COMPOSE_FILE = fileURLToPath(new URL('../docker-compose.yml', import.meta.url))
export const VERIFY_LOCK_PATH = resolve(tmpdir(), 'payload-hardening-docker-verifier.lock')

const INHERITED_COMMAND_ENVIRONMENT = [
  'PATH',
  'HOME',
  'TMPDIR',
  'TMP',
  'TEMP',
  'DOCKER_CONFIG',
  'DOCKER_CONTEXT',
  'DOCKER_HOST',
  'DOCKER_CERT_PATH',
  'DOCKER_TLS_VERIFY',
  'XDG_CONFIG_HOME',
] as const

const FORBIDDEN_COMPOSE_CONTROLS = [
  'COMPOSE_FILE',
  'COMPOSE_PATH_SEPARATOR',
  'COMPOSE_PROJECT_NAME',
  'COMPOSE_PROFILES',
  'COMPOSE_ENV_FILES',
  'COMPOSE_MENU',
  'COMPOSE_PARALLEL_LIMIT',
] as const

const ALLOWED_COMPOSE_CONTROLS = new Set(['COMPOSE_DISABLE_ENV_FILE'])

export type VerifierLock = {
  descriptor: number
  path: string
  token: string
}

export function minimalCommandEnvironment(
  additions: Readonly<Partial<NodeJS.ProcessEnv>> = {},
): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = { NODE_ENV: 'test' }

  for (const name of INHERITED_COMMAND_ENVIRONMENT) {
    const value = process.env[name]
    if (value !== undefined) environment[name] = value
  }

  for (const [name, value] of Object.entries(additions)) {
    if (name.startsWith('COMPOSE_') && !ALLOWED_COMPOSE_CONTROLS.has(name)) {
      throw new Error(`Refusing unsupported Compose control ${name}.`)
    }
    if (value !== undefined) environment[name] = value
  }

  for (const name of FORBIDDEN_COMPOSE_CONTROLS) {
    if (environment[name] !== undefined) {
      throw new Error(`Refusing inherited Compose control ${name}.`)
    }
  }

  return environment
}

export function composeCommandArgs(...args: readonly string[]): string[] {
  return [
    'compose',
    '-f',
    VERIFY_COMPOSE_FILE,
    '--project-directory',
    VERIFY_PROJECT_DIRECTORY,
    '-p',
    VERIFY_PROJECT,
    ...args,
  ]
}

export function createSafeComposeEnvironmentFile(directory: string): string {
  const path = resolve(directory, 'compose-verifier.env')
  writeFileSync(path, '# Intentionally empty verifier-owned Compose environment.\n', {
    flag: 'wx',
    mode: 0o600,
  })
  chmodSync(path, 0o600)
  return path
}

export function acquireVerifierLock(token: string, lockPath = VERIFY_LOCK_PATH): VerifierLock {
  let descriptor: number
  try {
    descriptor = openSync(lockPath, 'wx', 0o600)
  } catch (error) {
    const code = error instanceof Error && 'code' in error ? error.code : undefined
    if (code === 'EEXIST') {
      throw new Error(
        `Docker verifier lock already exists at ${lockPath}; refuse concurrent or stale-lock recovery automatically.`,
      )
    }
    throw new Error('Docker verifier lock acquisition failed.')
  }

  try {
    writeFileSync(descriptor, token, { encoding: 'utf8' })
    chmodSync(lockPath, 0o600)
    return { descriptor, path: lockPath, token }
  } catch {
    closeSync(descriptor)
    try {
      unlinkSync(lockPath)
    } catch {
      // The acquisition failure remains authoritative.
    }
    throw new Error('Docker verifier lock initialization failed.')
  }
}

export function assertVerifierLockOwned(lock: VerifierLock): void {
  let currentToken: string
  try {
    currentToken = readFileSync(lock.path, 'utf8')
  } catch {
    throw new Error('Refusing cleanup because the Docker verifier lock is no longer present.')
  }

  if (currentToken !== lock.token) {
    throw new Error(
      'Refusing to replace or remove a Docker verifier lock owned by another process.',
    )
  }
}

export function releaseVerifierLock(lock: VerifierLock): void {
  try {
    assertVerifierLockOwned(lock)
    unlinkSync(lock.path)
  } finally {
    closeSync(lock.descriptor)
  }
}
