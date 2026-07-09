import { getPayload } from 'payload'
import config from '../../src/payload.config.js'
import { runWithSQLiteBusyRetry } from './sqliteRetry'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
  role: 'admin' as const,
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await runWithSQLiteBusyRetry(() =>
    payload.delete({
      collection: 'users',
      where: {
        email: {
          equals: testUser.email,
        },
      },
    }),
  )

  // Create fresh test user
  await runWithSQLiteBusyRetry(() =>
    payload.create({
      collection: 'users',
      data: testUser,
    }),
  )
}

export async function getTestUserDocument(): Promise<{
  capabilities?: unknown
  email: string
  id: number | string
  role: string
}> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  const user = result.docs[0]

  if (!user) {
    throw new Error(`Expected test user ${testUser.email} to exist before seeding homepage.`)
  }

  return {
    capabilities: user.capabilities,
    email: user.email,
    id: user.id,
    role: user.role,
  }
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await runWithSQLiteBusyRetry(() =>
    payload.delete({
      collection: 'users',
      where: {
        email: {
          equals: testUser.email,
        },
      },
    }),
  )
}
