// @vitest-environment node

import type { Payload } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createTestMongoServer } from '../helpers/mongoMemoryServer'

const ORIGINAL_ENV = { ...process.env }
const safeTestDatabaseURI =
  'mongodb://127.0.0.1:27017/governance-contract_test?replicaSet=rs0&directConnection=true'

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  vi.doUnmock('payload')
  vi.doUnmock('../../src/payload.config.js')
  vi.clearAllMocks()
  vi.resetModules()
})

describe('governance fixture queue cleanup', () => {
  it('looks up exact source identities and deletes only returned Work Queue IDs', async () => {
    process.env.TEST_MONGODB_URI = safeTestDatabaseURI

    const queueDocuments = [{ id: 'queue-new' }, { id: 'queue-reviewing' }, { id: 'queue-review' }]
    let lookupIndex = 0
    const find = vi.fn(async () => ({ docs: [queueDocuments[lookupIndex++]] }))
    const remove = vi.fn(async (_options: Record<string, unknown>) => ({}))
    const getPayload = vi.fn(async () => ({ delete: remove, find }))

    vi.doMock('payload', async (importOriginal) => {
      const actual = await importOriginal<typeof import('payload')>()
      return { ...actual, getPayload }
    })
    vi.doMock('../../src/payload.config.js', () => ({ default: {} }))
    vi.resetModules()

    const { deleteGovernanceQueueItems } = await import('../helpers/governanceFixtures')
    const queueSources = [
      {
        dedupeKeys: [
          'submission:fixture:follow_up:submission-new',
          'submission:fixture:follow_up:submission-in-review',
        ],
        sourceCollection: 'form-submissions' as const,
        sourceID: 'submission-fixture',
      },
      {
        dedupeKeys: ['reviews:fixture:moderation:review-moderation-required'],
        sourceCollection: 'reviews' as const,
        sourceID: 'review-fixture',
      },
    ] as const

    await deleteGovernanceQueueItems(queueSources)

    expect(find).toHaveBeenCalledTimes(3)
    let callIndex = 0
    for (const source of queueSources) {
      for (const dedupeKey of source.dedupeKeys) {
        expect(find).toHaveBeenNthCalledWith(++callIndex, {
          collection: 'work-queue',
          limit: 1,
          overrideAccess: true,
          where: {
            and: [
              { dedupeKey: { equals: dedupeKey } },
              { sourceCollection: { equals: source.sourceCollection } },
              { sourceID: { equals: source.sourceID } },
            ],
          },
        })
      }
    }

    expect(remove).toHaveBeenCalledTimes(queueDocuments.length)
    queueDocuments.forEach((queueDocument, index) => {
      expect(remove).toHaveBeenNthCalledWith(index + 1, {
        collection: 'work-queue',
        id: queueDocument.id,
        overrideAccess: true,
      })
    })
    expect(remove.mock.calls.some(([options]) => 'where' in options)).toBe(false)
  })

  it('removes exact fixture queue items across repeated cycles without touching an unrelated sentinel', async () => {
    vi.doUnmock('payload')
    vi.doUnmock('../../src/payload.config.js')
    vi.resetModules()

    const mongoServer = await createTestMongoServer()
    process.env.TEST_MONGODB_URI = mongoServer.uri
    process.env.MONGODB_URI = mongoServer.uri
    process.env.EMAIL_PROVIDER = 'none'
    process.env.MEDIA_PROVIDER = 'localDisk'
    process.env.PAYLOAD_SECRET = 'governance-fixture-test-secret'

    let payload: Payload | null = null
    let sentinelID: number | string | null = null
    let latestFixture:
      | Awaited<ReturnType<typeof import('../helpers/governanceFixtures').seedGovernanceBase>>
      | undefined

    try {
      const [{ getPayload }, { default: config }, governanceFixtures] = await Promise.all([
        import('payload'),
        import('../../src/payload.config.js'),
        import('../helpers/governanceFixtures'),
      ])

      payload = await getPayload({ config })
      await Promise.all([
        ...Object.values(payload.db.collections).map((model) => model.init()),
        ...Object.values(payload.db.versions).map((model) => model.init()),
      ])

      const sentinel = await payload.create({
        collection: 'work-queue',
        data: {
          dedupeKey: 'governance-sentinel:unrelated:system_issue:test',
          feature: 'maintenanceModes',
          firstOpenedAt: '2026-09-03T00:00:00.000Z',
          lastSyncedAt: '2026-09-03T00:00:00.000Z',
          priority: 'normal',
          queueType: 'system_issue',
          reasonCode: 'test',
          sourceCollection: 'governance-sentinel',
          sourceID: 'unrelated',
          sourceTitle: 'Unrelated queue sentinel',
          status: 'open',
          summary: 'Unrelated queue sentinel',
        },
        overrideAccess: true,
      })
      sentinelID = sentinel.id

      for (let cycle = 0; cycle < 2; cycle += 1) {
        latestFixture = await governanceFixtures.seedGovernanceBase()

        for (const source of latestFixture.queueSources) {
          const activeKeys = source.dedupeKeys.filter(
            (dedupeKey) => !dedupeKey.endsWith(':submission-in-review'),
          )

          for (const dedupeKey of activeKeys) {
            const result = await payload.find({
              collection: 'work-queue',
              limit: 2,
              overrideAccess: true,
              where: {
                and: [
                  { dedupeKey: { equals: dedupeKey } },
                  { sourceCollection: { equals: source.sourceCollection } },
                  { sourceID: { equals: source.sourceID } },
                ],
              },
            })
            expect(result.totalDocs, `${dedupeKey} after seed ${cycle + 1}`).toBe(1)
          }
        }

        await governanceFixtures.cleanupGovernanceFixtures(latestFixture)

        for (const source of latestFixture.queueSources) {
          for (const dedupeKey of source.dedupeKeys) {
            const result = await payload.find({
              collection: 'work-queue',
              limit: 1,
              overrideAccess: true,
              where: {
                and: [
                  { dedupeKey: { equals: dedupeKey } },
                  { sourceCollection: { equals: source.sourceCollection } },
                  { sourceID: { equals: source.sourceID } },
                ],
              },
            })
            expect(result.totalDocs, `${dedupeKey} after cleanup ${cycle + 1}`).toBe(0)
          }
        }

        await expect(
          payload.findByID({
            collection: 'work-queue',
            id: sentinelID,
            overrideAccess: true,
          }),
        ).resolves.toMatchObject({ id: sentinelID })
        latestFixture = undefined
      }
    } finally {
      if (payload && latestFixture) {
        const { cleanupGovernanceFixtures } = await import('../helpers/governanceFixtures')
        await cleanupGovernanceFixtures(latestFixture)
      }
      if (payload && sentinelID != null) {
        await payload.delete({
          collection: 'work-queue',
          id: sentinelID,
          overrideAccess: true,
        })
      }
      if (payload) await payload.destroy()
      await mongoServer.stop()
    }
  }, 180000)
})
