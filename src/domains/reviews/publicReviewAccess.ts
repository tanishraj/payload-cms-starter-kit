import type { Access, Where } from 'payload'

import { canReadFeature } from '@/access/featureAccess'

export const publicReviewReadAccess: Access = ({ req }) => {
  if (req.user) return canReadFeature(req.user, 'reviews')

  return {
    and: [
      { _status: { equals: 'published' } },
      {
        or: [
          { sourceSubmission: { exists: false } },
          { sourceSubmission: { equals: null } },
          { moderationStatus: { equals: 'approved' } },
        ],
      },
    ],
  } as Where
}
