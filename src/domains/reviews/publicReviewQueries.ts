import 'server-only'

import type { CollectionSlug, FindOptions, Payload, SelectType } from 'payload'

export { publicReviewReadAccess } from '@/domains/reviews/publicReviewAccess'

type FindArgs<TSlug extends CollectionSlug> = FindOptions<TSlug, SelectType> & {
  draft?: boolean
}

type CountArgs<TSlug extends CollectionSlug> = Parameters<Payload['count']>[0] & {
  collection: TSlug
  draft?: boolean
}

type PublicReviewFindArgs = Omit<
  FindArgs<'reviews'>,
  'collection' | 'draft' | 'overrideAccess' | 'req' | 'user'
>

type PublicReviewCountArgs = Omit<
  CountArgs<'reviews'>,
  'collection' | 'draft' | 'overrideAccess' | 'req' | 'user'
>

export const publicReviewQueryOptions = {
  draft: false,
  overrideAccess: false,
} as const

const stripAuthentication = <TArgs extends object>(args: TArgs): Omit<TArgs, 'req' | 'user'> => {
  const {
    req: _req,
    user: _user,
    ...publicArgs
  } = args as TArgs & {
    req?: unknown
    user?: unknown
  }

  return publicArgs
}

export function findPublicReviews(payload: Pick<Payload, 'find'>, args: PublicReviewFindArgs) {
  const publicArgs = stripAuthentication(args)

  return payload.find({
    ...publicArgs,
    collection: 'reviews',
    ...publicReviewQueryOptions,
  })
}

export function countPublicReviews(payload: Pick<Payload, 'count'>, args: PublicReviewCountArgs) {
  const publicArgs = stripAuthentication(args)

  return payload.count({
    ...publicArgs,
    collection: 'reviews',
    ...publicReviewQueryOptions,
  })
}
