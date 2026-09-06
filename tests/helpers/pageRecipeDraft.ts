import { getRequiredTestDatabaseURI } from './testDatabaseSafety'

async function getTestPayload() {
  process.env.MONGODB_URI = getRequiredTestDatabaseURI()

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../../src/payload.config.js'),
  ])

  return getPayload({ config })
}

export const recipeE2ETitle = 'E2E Landing Recipe'

export async function cleanupPageRecipeDraft(): Promise<void> {
  const payload = await getTestPayload()

  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: {
      title: {
        equals: recipeE2ETitle,
      },
    },
  })
}
