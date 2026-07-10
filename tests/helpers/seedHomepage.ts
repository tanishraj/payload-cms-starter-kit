import { getPayload } from 'payload'

import config from '../../src/payload.config.js'
import { getTestUserDocument } from './seedUser'

const homepageSlug = 'e2e-homepage'

const homepagePageData = {
  _status: 'published' as const,
  layout: [
    {
      blockType: 'hero36',
      cards: [
        {
          description: 'Seeded homepage card used by the Playwright frontend suite.',
          icon: 'rocket',
          title: 'Reliable homepage seed',
          visualType: 'icon',
        },
      ],
      description: 'Seeded homepage description for deterministic e2e coverage.',
      heading: 'E2E Homepage Heading',
    },
  ],
  metaDescription: 'Seeded homepage description',
  metaTitle: 'E2E Homepage',
  slug: homepageSlug,
  title: 'E2E Homepage',
  workflowState: 'published' as const,
}

export async function seedHomepage(): Promise<void> {
  const payload = await getPayload({ config })
  const user = await getTestUserDocument()

  await payload.delete({
    collection: 'pages',
    overrideAccess: false,
    user,
    where: {
      slug: {
        equals: homepageSlug,
      },
    },
  })

  const page = await payload.create({
    collection: 'pages',
    data: homepagePageData,
    overrideAccess: false,
    user,
  })

  await payload.updateGlobal({
    data: {
      homepage: page.id,
    },
    overrideAccess: false,
    slug: 'page-settings',
    user,
  })
}

export async function cleanupHomepage(): Promise<void> {
  const payload = await getPayload({ config })
  const user = await getTestUserDocument()

  await payload.updateGlobal({
    data: {
      homepage: null,
    },
    overrideAccess: false,
    slug: 'page-settings',
    user,
  })

  await payload.delete({
    collection: 'pages',
    overrideAccess: false,
    user,
    where: {
      slug: {
        equals: homepageSlug,
      },
    },
  })
}
