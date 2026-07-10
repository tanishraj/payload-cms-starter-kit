import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { MongoMemoryServer } from 'mongodb-memory-server'

export async function createTestMongoServer(): Promise<{
  stop: () => Promise<void>
  uri: string
}> {
  const downloadDir = mkdtempSync(join(tmpdir(), 'payload-mongodb-binary-'))
  const server = await MongoMemoryServer.create({
    binary: {
      downloadDir,
    },
  })

  return {
    stop: async () => {
      await server.stop()
      rmSync(downloadDir, {
        force: true,
        recursive: true,
      })
    },
    uri: server.getUri(),
  }
}
