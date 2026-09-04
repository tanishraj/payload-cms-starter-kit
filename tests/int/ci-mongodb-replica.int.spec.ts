// @vitest-environment node

import type { SpawnSyncReturns } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  CI_MONGO_IMAGE,
  CI_MONGO_OWNER_LABEL,
  CI_MONGO_URI,
  getCIMongoIdentity,
  startCIMongoReplica,
  stopCIMongoReplica,
  type DockerRunner,
} from '../../scripts/ci-mongodb-replica'

const SAFE_TEST_URI =
  'mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0&directConnection=true'

const validEnvironment = (): NodeJS.ProcessEnv => ({
  CI: 'true',
  CI_MONGO_CONTAINER: 'payload-hardening-ci-123-2',
  CI_MONGO_OWNER: '123:2',
  GITHUB_ACTIONS: 'true',
  GITHUB_RUN_ATTEMPT: '2',
  GITHUB_RUN_ID: '123',
  MONGODB_URI: CI_MONGO_URI,
  NODE_ENV: 'test',
  TEST_MONGODB_URI: SAFE_TEST_URI,
})

function result(
  status: number | null,
  stdout = '',
  options: { error?: Error; signal?: NodeJS.Signals; stderr?: string } = {},
): SpawnSyncReturns<string> {
  return {
    error: options.error,
    output: [null, stdout, options.stderr ?? ''],
    pid: 1,
    signal: options.signal ?? null,
    status,
    stderr: options.stderr ?? '',
    stdout,
  }
}

function successfulStartRunner(): ReturnType<typeof vi.fn<DockerRunner>> {
  return vi.fn<DockerRunner>((args) => {
    if (args[0] === 'container' && args[1] === 'inspect') return result(1)
    if (args[0] === 'run') return result(0, 'container-id')
    if (args[0] === 'inspect') return result(0, '123:2\n')
    if (args[0] === 'exec') return result(0)
    return result(2)
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('CI MongoDB replica controller', () => {
  it('exports the exact immutable database contract', () => {
    expect(CI_MONGO_IMAGE).toBe('mongo:8.0.29')
    expect(CI_MONGO_OWNER_LABEL).toBe('com.payloadcms.hardening.ci-owner')
    expect(CI_MONGO_URI).toBe(
      'mongodb://127.0.0.1:27017/payload-hardening-ci_test?replicaSet=rs0&directConnection=true',
    )
  })

  it('exposes only the intended package commands for the controller CLI', () => {
    const packageJSON = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }

    expect(packageJSON.scripts?.['ci:mongodb:start']).toBe(
      'tsx scripts/ci-mongodb-replica.ts start',
    )
    expect(packageJSON.scripts?.['ci:mongodb:stop']).toBe('tsx scripts/ci-mongodb-replica.ts stop')
  })

  it('starts only the owned, exact one-member replica and checks readiness', () => {
    const run = successfulStartRunner()

    startCIMongoReplica({ env: validEnvironment(), run })

    expect(run).toHaveBeenCalledWith(
      [
        'run',
        '--detach',
        '--name',
        'payload-hardening-ci-123-2',
        '--label',
        'com.payloadcms.hardening.ci-owner=123:2',
        '--publish',
        '127.0.0.1:27017:27017',
        'mongo:8.0.29',
        '--replSet',
        'rs0',
        '--bind_ip_all',
      ],
      120_000,
    )

    const execCalls = run.mock.calls.filter(([args]) => args[0] === 'exec')
    expect(execCalls).toHaveLength(2)
    expect(execCalls[0]?.[0]).toEqual([
      'exec',
      'payload-hardening-ci-123-2',
      'mongosh',
      '--quiet',
      '--eval',
      expect.stringContaining("host: '127.0.0.1:27017'"),
    ])
    const readinessExpression = execCalls[1]?.[0].at(-1)
    expect(readinessExpression).toEqual(expect.stringContaining("db.version() === '8.0.29'"))
    expect(readinessExpression).toEqual(expect.stringContaining('hello.isWritablePrimary === true'))
    expect(readinessExpression).toEqual(expect.stringContaining('members.length === 1'))
    expect(readinessExpression).toEqual(
      expect.stringContaining("members[0].host === '127.0.0.1:27017'"),
    )
  })

  it('retries a transient initialization connection failure within the readiness window', () => {
    let initializationAttempts = 0
    const run = vi.fn<DockerRunner>((args) => {
      if (args[0] === 'container') return result(1)
      if (args[0] === 'run') return result(0)
      if (args[0] === 'inspect') return result(0, '123:2\n')
      if (args[0] === 'exec') {
        const expression = args.at(-1)
        if (expression?.includes('rs.initiate')) {
          initializationAttempts += 1
          return result(initializationAttempts === 1 ? 1 : 0)
        }
        return result(0)
      }
      return result(2)
    })

    startCIMongoReplica({ env: validEnvironment(), run })

    expect(initializationAttempts).toBe(2)
    expect(run.mock.calls.filter(([args]) => args[0] === 'exec')).toHaveLength(3)
  })

  it.each([
    ['initialization error', 'initialization-error'],
    ['readiness timeout', 'readiness-timeout'],
    ['wrong MongoDB version', 'wrong-version'],
    ['non-primary state', 'non-primary'],
    ['malformed replica membership', 'malformed-membership'],
  ] as const)('verifies ownership and removes the exact container after %s', (_label, mode) => {
    let created = false
    let now = 0
    vi.spyOn(Date, 'now').mockImplementation(() => now)

    const run = vi.fn<DockerRunner>((args) => {
      if (args[0] === 'container') return result(created ? 0 : 1)
      if (args[0] === 'run') {
        created = true
        return result(0)
      }
      if (args[0] === 'inspect') return result(0, '123:2\n')
      if (args[0] === 'exec') {
        const isInitialization = args.at(-1)?.includes('rs.initiate')
        if (isInitialization) {
          return mode === 'initialization-error'
            ? result(2, 'private initialization output', { stderr: 'private initialization error' })
            : result(0)
        }

        if (mode === 'readiness-timeout' || mode === 'non-primary') {
          now = 90_000
          return result(1, 'private transient readiness output', {
            stderr: 'private transient readiness error',
          })
        }

        return result(3, 'private permanent readiness output', {
          stderr: 'private permanent readiness error',
        })
      }
      if (args[0] === 'rm') return result(0)
      return result(2)
    })

    let thrown: Error | undefined
    try {
      startCIMongoReplica({ env: validEnvironment(), run })
    } catch (error) {
      thrown = error as Error
    }

    expect(thrown?.message).toBe(
      'CI MongoDB replica startup failed without forwarding command output.',
    )
    expect(thrown?.message).not.toContain('private')
    expect(run.mock.calls.slice(-2)).toEqual([
      [
        [
          'inspect',
          '--format',
          '{{ index .Config.Labels "com.payloadcms.hardening.ci-owner" }}',
          'payload-hardening-ci-123-2',
        ],
        30_000,
      ],
      [['rm', '--force', 'payload-hardening-ci-123-2'], 120_000],
    ])
  })

  it.each(['wrong version', 'wrong member'])(
    'fails closed and cleans up after a permanent %s readiness result',
    () => {
      let created = false
      const run = vi.fn<DockerRunner>((args) => {
        if (args[0] === 'container') return result(created ? 0 : 1)
        if (args[0] === 'run') {
          created = true
          return result(0)
        }
        if (args[0] === 'inspect') return result(0, '123:2\n')
        if (args[0] === 'exec') {
          return result(args.at(-1)?.includes('rs.initiate') ? 0 : 3, 'private readiness detail')
        }
        if (args[0] === 'rm') return result(0)
        return result(2)
      })

      expect(() => startCIMongoReplica({ env: validEnvironment(), run })).toThrow(
        /^CI MongoDB replica startup failed without forwarding command output\.$/,
      )
      expect(run).toHaveBeenCalledWith(['rm', '--force', 'payload-hardening-ci-123-2'], 120_000)
    },
  )

  it('fails closed and cleans up when initialization is terminated by a signal', () => {
    let created = false
    const run = vi.fn<DockerRunner>((args) => {
      if (args[0] === 'container') return result(created ? 0 : 1)
      if (args[0] === 'run') {
        created = true
        return result(0)
      }
      if (args[0] === 'inspect') return result(0, '123:2\n')
      if (args[0] === 'exec') return result(null, 'private signal detail', { signal: 'SIGTERM' })
      if (args[0] === 'rm') return result(0)
      return result(2)
    })

    expect(() => startCIMongoReplica({ env: validEnvironment(), run })).toThrow(
      /^CI MongoDB replica startup failed without forwarding command output\.$/,
    )
    expect(run).toHaveBeenCalledWith(['rm', '--force', 'payload-hardening-ci-123-2'], 120_000)
  })

  it('uses one bounded deadline for initialization and readiness before cleanup', () => {
    vi.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValue(90_000)
    let created = false
    const run = vi.fn<DockerRunner>((args) => {
      if (args[0] === 'container') return result(created ? 0 : 1)
      if (args[0] === 'run') {
        created = true
        return result(0)
      }
      if (args[0] === 'inspect') return result(0, '123:2\n')
      if (args[0] === 'rm') return result(0)
      return result(2)
    })

    expect(() => startCIMongoReplica({ env: validEnvironment(), run })).toThrow(
      /^CI MongoDB replica startup failed without forwarding command output\.$/,
    )
    expect(run.mock.calls.filter(([args]) => args[0] === 'exec')).toHaveLength(0)
    expect(run).toHaveBeenCalledWith(['rm', '--force', 'payload-hardening-ci-123-2'], 120_000)
  })

  it.each([
    ['missing CI marker', { CI: undefined }],
    ['missing GitHub marker', { GITHUB_ACTIONS: undefined }],
    ['malformed container', { CI_MONGO_CONTAINER: 'payload-hardening-ci-latest' }],
    ['malformed owner', { CI_MONGO_OWNER: '123-2' }],
    ['mismatched owner', { CI_MONGO_OWNER: '123:3' }],
    ['mismatched run ID', { GITHUB_RUN_ID: '124' }],
    ['mismatched attempt', { GITHUB_RUN_ATTEMPT: '3' }],
  ])('rejects %s before invoking Docker', (_label, override) => {
    const run = vi.fn<DockerRunner>()
    const env = { ...validEnvironment(), ...override }

    expect(() => startCIMongoReplica({ env, run })).toThrow(/CI MongoDB/)
    expect(run).not.toHaveBeenCalled()
  })

  it('rejects unsafe application database values before invoking Docker', () => {
    const run = vi.fn<DockerRunner>()
    const env = { ...validEnvironment(), MONGODB_URI: 'mongodb://mongo:27017/application_test' }

    expect(() => startCIMongoReplica({ env, run })).toThrow(/Unsafe test database URI/)
    expect(run).not.toHaveBeenCalled()
  })

  it('rejects unsafe test database values before invoking Docker', () => {
    const run = vi.fn<DockerRunner>()
    const env = {
      ...validEnvironment(),
      TEST_MONGODB_URI: 'mongodb+srv://private.invalid/application_test',
    }

    expect(() => startCIMongoReplica({ env, run })).toThrow(/Unsafe test database URI/)
    expect(run).not.toHaveBeenCalled()
  })

  it('rejects a pre-existing exact container without mutating it', () => {
    const run = vi.fn<DockerRunner>(() => result(0))

    expect(() => startCIMongoReplica({ env: validEnvironment(), run })).toThrow(/already exists/)
    expect(run).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['execution error', result(null, '', { error: new Error('private docker detail') })],
    ['signal', result(null, '', { signal: 'SIGTERM' })],
    ['unexpected status', result(2)],
  ])('fails closed on preflight %s without leaking command output', (_label, preflight) => {
    const run = vi.fn<DockerRunner>(() => preflight)

    expect(() => startCIMongoReplica({ env: validEnvironment(), run })).toThrow(/preflight failed/)
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('removes a partial start after a permanent initialization error', () => {
    let created = false
    const run = vi.fn<DockerRunner>((args) => {
      if (args[0] === 'container') return result(created ? 0 : 1)
      if (args[0] === 'run') {
        created = true
        return result(0)
      }
      if (args[0] === 'inspect') return result(0, '123:2\n')
      if (args[0] === 'exec') return result(2, 'private stdout')
      if (args[0] === 'rm') return result(0)
      return result(2)
    })

    expect(() => startCIMongoReplica({ env: validEnvironment(), run })).toThrow(
      /^CI MongoDB replica startup failed without forwarding command output\.$/,
    )
    expect(run).toHaveBeenCalledWith(['rm', '--force', 'payload-hardening-ci-123-2'], 120_000)
  })

  it('cleans an owned container left behind by a timed-out docker run', () => {
    let preflightComplete = false
    const run = vi.fn<DockerRunner>((args) => {
      if (args[0] === 'container' && !preflightComplete) {
        preflightComplete = true
        return result(1)
      }
      if (args[0] === 'run') {
        return result(null, '', { error: new Error('ETIMEDOUT') })
      }
      if (args[0] === 'container') return result(0)
      if (args[0] === 'inspect') return result(0, '123:2\n')
      if (args[0] === 'rm') return result(0)
      return result(2)
    })

    expect(() => startCIMongoReplica({ env: validEnvironment(), run })).toThrow(
      /failed without forwarding command output/,
    )
    expect(run).toHaveBeenCalledWith(['rm', '--force', 'payload-hardening-ci-123-2'], 120_000)
  })

  it('refuses partial-start cleanup when ownership changed', () => {
    let created = false
    const run = vi.fn<DockerRunner>((args) => {
      if (args[0] === 'container') return result(created ? 0 : 1)
      if (args[0] === 'run') {
        created = true
        return result(0)
      }
      if (args[0] === 'inspect') {
        return result(0, 'different:owner\n', { stderr: 'private Docker error' })
      }
      return result(2)
    })

    let thrown: Error | undefined
    try {
      startCIMongoReplica({ env: validEnvironment(), run })
    } catch (error) {
      thrown = error as Error
    }

    expect(thrown?.message).toBe(
      'CI MongoDB replica startup failed and owned cleanup could not be completed.',
    )
    expect(thrown?.message).not.toContain('different:owner')
    expect(thrown?.message).not.toContain('private Docker error')
    expect(run).not.toHaveBeenCalledWith(
      ['rm', '--force', 'payload-hardening-ci-123-2'],
      expect.any(Number),
    )
  })

  it('refuses cleanup when the existing container ownership changed', () => {
    const run = vi.fn<DockerRunner>((args) => {
      if (args[0] === 'container') return result(0)
      if (args[0] === 'inspect') return result(0, 'another:owner\n')
      return result(2)
    })

    expect(() => stopCIMongoReplica({ env: validEnvironment(), run })).toThrow(
      /^CI MongoDB replica container ownership verification failed\.$/,
    )
    expect(run).not.toHaveBeenCalledWith(
      ['rm', '--force', 'payload-hardening-ci-123-2'],
      expect.any(Number),
    )
  })

  it('stops only the exact container after exact owner-label verification', () => {
    const run = vi.fn<DockerRunner>((args) => {
      if (args[0] === 'container') return result(0)
      if (args[0] === 'inspect') return result(0, '123:2\n')
      if (args[0] === 'rm') return result(0)
      return result(2)
    })

    stopCIMongoReplica({ env: validEnvironment(), run })

    expect(run).toHaveBeenLastCalledWith(['rm', '--force', 'payload-hardening-ci-123-2'], 120_000)
  })

  it('treats an absent exact container as an idempotent stop', () => {
    const run = vi.fn<DockerRunner>(() => result(1))

    stopCIMongoReplica({ env: validEnvironment(), run })

    expect(run).toHaveBeenCalledTimes(1)
  })

  it('returns only the validated identity values', () => {
    expect(getCIMongoIdentity(validEnvironment())).toEqual({
      containerName: 'payload-hardening-ci-123-2',
      owner: '123:2',
    })
  })
})
