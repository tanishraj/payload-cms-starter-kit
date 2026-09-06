import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { MongoMemoryReplSet } from 'mongodb-memory-server'

import { assertSafeTestDatabaseURI } from './testDatabaseSafety'

export const MEMORY_TEST_DATABASE_NAME = 'payload-memory_test'

export async function createTestMongoServer(): Promise<{
  stop: () => Promise<void>
  uri: string
}> {
  const downloadDir = mkdtempSync(join(tmpdir(), 'payload-mongodb-binary-'))
  let server: MongoMemoryReplSet

  try {
    server = await MongoMemoryReplSet.create({
      binary: {
        downloadDir,
        version: '8.0.29',
      },
      replSet: {
        count: 1,
        storageEngine: 'wiredTiger',
      },
    })
  } catch (error) {
    rmSync(downloadDir, {
      force: true,
      recursive: true,
    })
    throw error
  }

  const stop = async (): Promise<void> => {
    try {
      await server.stop()
    } finally {
      rmSync(downloadDir, {
        force: true,
        recursive: true,
      })
    }
  }

  try {
    const uri = server.getUri(MEMORY_TEST_DATABASE_NAME)
    assertSafeTestDatabaseURI(uri)

    return { stop, uri }
  } catch (error) {
    await stop()
    throw error
  }
}
