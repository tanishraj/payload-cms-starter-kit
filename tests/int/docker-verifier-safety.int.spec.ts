// @vitest-environment node

import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { isAbsolute, join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  acquireVerifierLock,
  composeCommandArgs,
  createSafeComposeEnvironmentFile,
  minimalCommandEnvironment,
  releaseVerifierLock,
} from '../../scripts/docker-verifier-safety'

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

describe('Docker verifier safety primitives', () => {
  it('acquires one owner-only atomic lock and refuses a concurrent or stale lock', () => {
    const directory = mkdtempSync(join(tmpdir(), 'payload-verifier-lock-test-'))
    temporaryDirectories.push(directory)
    const lockPath = join(directory, 'verifier.lock')
    const lock = acquireVerifierLock('first-owner', lockPath)

    expect(statSync(lockPath).mode & 0o777).toBe(0o600)
    expect(readFileSync(lockPath, 'utf8')).toBe('first-owner')
    expect(() => acquireVerifierLock('second-owner', lockPath)).toThrow(/already exists/)

    releaseVerifierLock(lock)
    expect(existsSync(lockPath)).toBe(false)
  })

  it('refuses to remove a lock whose ownership token changed', () => {
    const directory = mkdtempSync(join(tmpdir(), 'payload-verifier-lock-test-'))
    temporaryDirectories.push(directory)
    const lockPath = join(directory, 'verifier.lock')
    const lock = acquireVerifierLock('first-owner', lockPath)
    writeFileSync(lockPath, 'replacement-owner', { mode: 0o600 })

    expect(() => releaseVerifierLock(lock)).toThrow(/Refusing to replace or remove/)
    expect(existsSync(lockPath)).toBe(true)
  })

  it('creates an owner-only non-secret Compose environment fixture', () => {
    const directory = mkdtempSync(join(tmpdir(), 'payload-verifier-env-test-'))
    temporaryDirectories.push(directory)

    const environmentPath = createSafeComposeEnvironmentFile(directory)

    expect(statSync(environmentPath).mode & 0o777).toBe(0o600)
    expect(readFileSync(environmentPath, 'utf8')).toBe(
      '# Intentionally empty verifier-owned Compose environment.\n',
    )
  })

  it('uses an absolute Compose file/project and omits hostile inherited controls', () => {
    const originalEnvironment = process.env
    process.env = {
      ...originalEnvironment,
      COMPOSE_FILE: '/tmp/hostile.yml',
      COMPOSE_PATH_SEPARATOR: ';',
      COMPOSE_PROFILES: 'hostile',
      COMPOSE_PROJECT_NAME: 'hostile',
      MONGODB_URI: 'mongodb+srv://hostile.example.invalid/production',
    }

    try {
      const environment = minimalCommandEnvironment({ COMPOSE_DISABLE_ENV_FILE: '1' })
      expect(environment).not.toHaveProperty('COMPOSE_FILE')
      expect(environment).not.toHaveProperty('COMPOSE_PATH_SEPARATOR')
      expect(environment).not.toHaveProperty('COMPOSE_PROFILES')
      expect(environment).not.toHaveProperty('COMPOSE_PROJECT_NAME')
      expect(environment).not.toHaveProperty('MONGODB_URI')
      expect(environment.COMPOSE_DISABLE_ENV_FILE).toBe('1')

      const args = composeCommandArgs('ps')
      expect(args[0]).toBe('compose')
      expect(args).toContain('-f')
      expect(args).toContain('--project-directory')
      expect(args).toContain('-p')
      const composeFile = args.find((value) => value.endsWith('docker-compose.yml'))
      expect(composeFile).toBeDefined()
      expect(isAbsolute(composeFile as string)).toBe(true)
      const projectDirectory = args[args.indexOf('--project-directory') + 1]
      expect(isAbsolute(projectDirectory)).toBe(true)
      expect(args.every((value) => !value.includes('hostile'))).toBe(true)
    } finally {
      process.env = originalEnvironment
    }
  })
})
