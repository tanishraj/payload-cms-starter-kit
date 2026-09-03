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
  'collection' | 'draft' | 'overrideAccess' | 'user'
>

type PublicReviewCountArgs = Omit<
  CountArgs<'reviews'>,
  'collection' | 'draft' | 'overrideAccess' | 'user'
>

export const publicReviewQueryOptions = {
  draft: false,
  overrideAccess: false,
} as const

export function findPublicReviews(payload: Pick<Payload, 'find'>, args: PublicReviewFindArgs) {
  return payload.find({
    ...args,
    collection: 'reviews',
    ...publicReviewQueryOptions,
  })
}

export function countPublicReviews(payload: Pick<Payload, 'count'>, args: PublicReviewCountArgs) {
  return payload.count({
    ...args,
    collection: 'reviews',
    ...publicReviewQueryOptions,
  })
}
