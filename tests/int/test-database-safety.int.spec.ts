import { describe, expect, it } from 'vitest'

import {
  assertSafeTestDatabaseURI,
  getRequiredTestDatabaseURI,
} from '../helpers/testDatabaseSafety'

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
