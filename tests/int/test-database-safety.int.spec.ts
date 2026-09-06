import { afterEach, describe, expect, it, vi } from 'vitest'

const mongoMemoryMocks = vi.hoisted(() => ({
  create: vi.fn(),
  getUri: vi.fn(),
  stop: vi.fn(),
}))

vi.mock('mongodb-memory-server', () => ({
  MongoMemoryReplSet: {
    create: mongoMemoryMocks.create,
  },
}))

import {
  assertSafeTestDatabaseURI,
  getRequiredTestDatabaseURI,
} from '../helpers/testDatabaseSafety'
import { createTestMongoServer, MEMORY_TEST_DATABASE_NAME } from '../helpers/mongoMemoryServer'

afterEach(() => {
  vi.clearAllMocks()
})

const accepted = [
  'mongodb://127.0.0.1:27017/payload_cms_test',
  'mongodb://localhost:27017/payload-cms-test?replicaSet=rs0',
  'mongodb://[::1]:27017/snmih_test',
]

const rejected = [
  '',
  'mongodb+srv://user:secret@cluster.example.net/snmih_test',
  'mongodb://mongo:27017/snmih_test',
  'mongodb://127.0.0.1:27017/',
  'mongodb://127.0.0.1:27017/snmih',
  'mongodb://127.0.0.1:27017/admin',
]

describe('test database safety', () => {
  it('creates an exact-version one-member replica with an explicit safe database name', async () => {
    mongoMemoryMocks.getUri.mockReturnValue(
      'mongodb://127.0.0.1:27017/payload-memory_test?replicaSet=testset',
    )
    mongoMemoryMocks.create.mockResolvedValue({
      getUri: mongoMemoryMocks.getUri,
      stop: mongoMemoryMocks.stop,
    })

    const server = await createTestMongoServer()

    expect(MEMORY_TEST_DATABASE_NAME).toBe('payload-memory_test')
    expect(mongoMemoryMocks.create).toHaveBeenCalledWith({
      binary: {
        downloadDir: expect.stringContaining('payload-mongodb-binary-'),
        version: '8.0.29',
      },
      replSet: {
        count: 1,
        storageEngine: 'wiredTiger',
      },
    })
    expect(mongoMemoryMocks.getUri).toHaveBeenCalledWith(MEMORY_TEST_DATABASE_NAME)
    expect(server.uri).toBe('mongodb://127.0.0.1:27017/payload-memory_test?replicaSet=testset')

    await server.stop()
    expect(mongoMemoryMocks.stop).toHaveBeenCalledOnce()
  })

  it('rejects an unsafe generated memory URI before returning it', async () => {
    mongoMemoryMocks.getUri.mockReturnValue('mongodb://mongo:27017/payload-memory_test')
    mongoMemoryMocks.create.mockResolvedValue({
      getUri: mongoMemoryMocks.getUri,
      stop: mongoMemoryMocks.stop,
    })

    await expect(createTestMongoServer()).rejects.toThrow(/loopback/)
  })

  it.each(accepted)('accepts an explicit loopback test database: %s', (uri) => {
    expect(assertSafeTestDatabaseURI(uri).href).toBe(new URL(uri).href)
  })

  it.each(rejected)('rejects an unsafe database URI without echoing it: %s', (uri) => {
    let error: unknown

    try {
      assertSafeTestDatabaseURI(uri)
    } catch (caught) {
      error = caught
    }

    expect(error).toBeInstanceOf(Error)

    const message = (error as Error).message
    if (uri) expect(message).not.toContain(uri)

    try {
      const parsed = new URL(uri)
      if (parsed.username) expect(message).not.toContain(parsed.username)
      if (parsed.password) expect(message).not.toContain(parsed.password)
      if (parsed.search) expect(message).not.toContain(parsed.search)
    } catch {
      // Invalid URIs have no safely parsed components to inspect.
    }
  })

  it('rejects credentials and query details without leaking them', () => {
    const uri =
      'mongodb://unsafe-user:unsafe-password@mongo:27017/snmih_test?replicaSet=private-set'

    expect(() => assertSafeTestDatabaseURI(uri)).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining('unsafe-user'),
      }),
    )

    try {
      assertSafeTestDatabaseURI(uri)
    } catch (error) {
      const message = (error as Error).message
      expect(message).not.toContain('unsafe-password')
      expect(message).not.toContain('replicaSet=private-set')
      expect(message).not.toContain(uri)
    }
  })

  it('reads only TEST_MONGODB_URI after validating it', () => {
    const testURI = accepted[0]

    expect(
      getRequiredTestDatabaseURI({
        MONGODB_URI: 'mongodb://127.0.0.1:27017/application_test',
        NODE_ENV: 'test',
        TEST_MONGODB_URI: testURI,
      }),
    ).toBe(testURI)

    expect(() =>
      getRequiredTestDatabaseURI({
        MONGODB_URI: testURI,
        NODE_ENV: 'test',
      }),
    ).toThrow(/TEST_MONGODB_URI/)
  })
})
