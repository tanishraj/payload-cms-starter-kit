import 'server-only'
import type { Payload, PayloadRequest } from 'payload'
import type { User } from '@/payload-types'

/** Read only this account's optional display preference through native access enforcement. */
export async function loadAccountGuidePreference(
  payload: Payload,
  user: User,
  key: string,
  req?: PayloadRequest,
): Promise<{ collapsed: boolean; unavailable: boolean }> {
  try {
    const result = await payload.find({
      collection: 'payload-preferences',
      user,
      overrideAccess: false,
      ...(req ? { req } : {}),
      depth: 0,
      limit: 1,
      sort: '-updatedAt',
      where: {
        and: [
          { key: { equals: key } },
          { 'user.value': { equals: user.id } },
          { 'user.relationTo': { equals: 'users' } },
        ],
      },
    })
    const value = result.docs[0]?.value
    return {
      collapsed: Boolean(
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        'dismissed' in value &&
        value.dismissed === true,
      ),
      unavailable: false,
    }
  } catch {
    return { collapsed: false, unavailable: true }
  }
}
