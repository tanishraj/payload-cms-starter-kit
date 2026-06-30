import { cache } from 'react'

import type { Page } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export const getPageBySlug = cache(async (slug: string): Promise<Page | null> => {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 1,
    draft: false,
    limit: 1,
    overrideAccess: false,
  })

  return docs[0] ?? null
})
