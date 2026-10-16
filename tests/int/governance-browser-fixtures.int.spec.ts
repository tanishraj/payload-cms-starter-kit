// @vitest-environment node
import { EventEmitter } from 'node:events'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ fork: vi.fn() }))
vi.mock('node:child_process', () => ({ fork: mocks.fork }))
import {
  seedGovernanceBase,
  cleanupGovernanceFixtures,
  seedBrowserTestUser,
} from '../helpers/governanceBrowserFixtures'

const originalEnv = { ...process.env }
const uri = 'mongodb://127.0.0.1:27017/governance-bridge_test?replicaSet=rs0&directConnection=true'
let child: EventEmitter & { send: ReturnType<typeof vi.fn>; kill: ReturnType<typeof vi.fn> }
beforeEach(() => {
  process.env.TEST_MONGODB_URI = uri
  child = Object.assign(new EventEmitter(), { send: vi.fn(), kill: vi.fn() })
  mocks.fork.mockReset().mockReturnValue(child)
})
afterEach(() => {
  process.env = { ...originalEnv }
  vi.useRealTimers()
})

describe('governance browser fixture process boundary', () => {
  it('rejects unsafe databases before starting a process without echoing credentials', async () => {
    process.env.TEST_MONGODB_URI = 'mongodb+srv://user:private-password@remote.invalid/live'
    await expect(seedGovernanceBase()).rejects.toThrow('Unsafe test database URI')
    expect(mocks.fork).not.toHaveBeenCalled()
  })
  it('rejects unsafe form seeding before starting a Payload process', async () => {
    process.env.TEST_MONGODB_URI = 'mongodb://remote.invalid/live'
    await expect(seedBrowserTestUser()).rejects.toThrow('Unsafe test database URI')
    expect(mocks.fork).not.toHaveBeenCalled()
  })
  it('seeds form accounts through the same bounded process and awaits shutdown', async () => {
    const promise = seedBrowserTestUser()
    expect(child.send).toHaveBeenCalledWith({ command: 'seed-user', fixture: undefined })
    let resolved = false
    promise.then(() => {
      resolved = true
    })
    child.emit('message', { type: 'result' })
    await Promise.resolve()
    expect(resolved).toBe(false)
    child.emit('close', 0)
    await expect(promise).resolves.toBeUndefined()
  })
  it('isolates loader flags and waits for clean child shutdown before resolving cleanup', async () => {
    process.env.NODE_OPTIONS = '--inspect --import=hostile-loader'
    const fixture = { pageIDs: ['child', 'root'], queueSources: [] }
    const promise = cleanupGovernanceFixtures(fixture)
    expect(mocks.fork).toHaveBeenCalledWith(
      expect.stringContaining('governanceFixtureWorker.mjs'),
      [],
      expect.objectContaining({
        execArgv: [
          '--no-deprecation',
          '--no-experimental-strip-types',
          '--conditions=react-server',
          '--import=tsx/esm',
        ],
        env: expect.objectContaining({ MONGODB_URI: uri, TEST_MONGODB_URI: uri, NODE_OPTIONS: '' }),
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      }),
    )
    expect(child.send).toHaveBeenCalledWith({ command: 'cleanup', fixture })
    let resolved = false
    promise.then(() => {
      resolved = true
    })
    child.emit('exit', 0)
    await Promise.resolve()
    expect(resolved).toBe(false)
    child.emit('message', { type: 'result' })
    await Promise.resolve()
    expect(resolved).toBe(false)
    child.emit('close', 0)
    await expect(promise).resolves.toBeUndefined()
  })
  it('reports only the known stage on worker failure', async () => {
    const promise = cleanupGovernanceFixtures()
    child.emit('message', {
      type: 'failure',
      stage: 'database shutdown',
      error: 'private credential',
    })
    await expect(promise).rejects.toThrow(
      'Governance fixture cleanup failed during database shutdown.',
    )
    child.emit('close', 1)
  })
  it('rejects an exit without a successful result', async () => {
    const promise = seedGovernanceBase()
    child.emit('message', { type: 'stage', stage: 'fixture seed' })
    child.emit('close', 1)
    await expect(promise).rejects.toThrow('Governance fixture seed exited during fixture seed.')
  })
  it('kills a stalled worker at the bounded deadline', async () => {
    vi.useFakeTimers()
    const promise = cleanupGovernanceFixtures()
    const rejected = expect(promise).rejects.toThrow('timed out during fixture module import')
    child.emit('message', { type: 'stage', stage: 'fixture module import' })
    await vi.advanceTimersByTimeAsync(90_000)
    await rejected
    expect(child.kill).toHaveBeenCalledWith('SIGKILL')
    child.emit('close', null)
  })
})
