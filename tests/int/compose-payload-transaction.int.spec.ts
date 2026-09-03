// @vitest-environment node

import { randomUUID } from 'node:crypto'

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createLocalReq, getPayload, type Payload, type PayloadRequest } from 'payload'

import { assertSafeTestDatabaseURI } from '../helpers/testDatabaseSafety'

const ENABLE_FLAG = 'RUN_COMPOSE_PAYLOAD_TRANSACTION'
const enabled = process.env[ENABLE_FLAG] === '1'
const explicitURI = process.env.TEST_MONGODB_URI ?? ''

if (enabled) {
  assertSafeTestDatabaseURI(explicitURI)
}

let payload: Payload | undefined
const createdSlugs = new Set<string>()

const createTagWithinRequest = async (req: PayloadRequest, title: string, slug: string) => {
  createdSlugs.add(slug)
  return req.payload.create({
    collection: 'tags',
    data: { slug, title },
    depth: 0,
    req,
  })
}

describe.skipIf(!enabled)('Compose-backed Payload transactions', () => {
  beforeAll(async () => {
    process.env.MONGODB_URI = explicitURI
    process.env.PAYLOAD_SECRET = 'compose-transaction-test-secret-32-chars'
    process.env.EMAIL_PROVIDER = 'none'
    process.env.MEDIA_PROVIDER = 'localDisk'

    vi.resetModules()
    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config: await config })
  }, 120_000)

  afterAll(async () => {
    if (!payload) return

    for (const slug of createdSlugs) {
      await payload.delete({
        collection: 'tags',
        where: { slug: { equals: slug } },
        overrideAccess: true,
      })
    }

    await payload.destroy()
  }, 30_000)

  it('rolls back and commits nested operations through one Payload request', async () => {
    if (!payload) throw new Error('Payload did not initialize for the transaction test.')

    const suffix = randomUUID()
    const rolledBackSlug = `compose-rollback-${suffix}`
    const committedSlug = `compose-commit-${suffix}`

    const rollbackID = await payload.db.beginTransaction()
    if (rollbackID == null) throw new Error('MongoDB did not provide a transaction identifier.')
    const rollbackReq = await createLocalReq({ req: { transactionID: rollbackID } }, payload)
    await createTagWithinRequest(rollbackReq, 'Compose rollback probe', rolledBackSlug)
    await payload.db.rollbackTransaction(rollbackID)

    const afterRollback = await payload.find({
      collection: 'tags',
      where: { slug: { equals: rolledBackSlug } },
      depth: 0,
    })
    expect(afterRollback.totalDocs).toBe(0)

    const commitID = await payload.db.beginTransaction()
    if (commitID == null) throw new Error('MongoDB did not provide a transaction identifier.')
    const commitReq = await createLocalReq({ req: { transactionID: commitID } }, payload)
    await createTagWithinRequest(commitReq, 'Compose commit probe', committedSlug)
    await payload.db.commitTransaction(commitID)

    const afterCommit = await payload.find({
      collection: 'tags',
      where: { slug: { equals: committedSlug } },
      depth: 0,
    })
    expect(afterCommit.totalDocs).toBe(1)
  }, 120_000)
})
