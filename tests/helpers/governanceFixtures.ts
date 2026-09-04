import type { Payload } from 'payload'

import type { AdminFeatureGrants } from '@/access/adminFeatures'
import { TRUSTED_REVIEW_PROMOTION_CONTEXT } from '@/hooks/enforceReviewModeration'
import { buildWorkQueueDedupeKey } from '@/lib/workQueue'

import { getRequiredTestDatabaseURI } from './testDatabaseSafety'

export type GovernanceAccount = {
  email: string
  password: string
  role: 'admin' | 'siteManager'
  features?: AdminFeatureGrants
}

export type GovernanceQueueSource = {
  sourceCollection: 'form-submissions' | 'reviews'
  sourceID: string
  dedupeKeys: readonly string[]
}

export type GovernanceFixture = {
  admin: GovernanceAccount
  pendingReview: {
    id: string
    slug: string
    title: string
  }
  reviewManager: GovernanceAccount
  queueSources: readonly GovernanceQueueSource[]
}

export const governanceAdmin: GovernanceAccount = {
  email: 'governance-admin@example.test',
  password: 'governance-admin-password',
  role: 'admin',
}

export const governanceSecondAdmin: GovernanceAccount = {
  email: 'governance-second-admin@example.test',
  password: 'governance-second-admin-password',
  role: 'admin',
}

export const accessManager: GovernanceAccount = {
  email: 'governance-access-manager@example.test',
  password: 'governance-access-manager-password',
  role: 'siteManager',
}

export const reviewManager: GovernanceAccount = {
  email: 'governance-review-manager@example.test',
  password: 'governance-review-manager-password',
  role: 'siteManager',
  features: { reviews: true },
}

export const governanceReview = {
  slug: 'governance-submitted-review',
  title: 'Governance submitted review',
}

const governanceCategory = {
  slug: 'governance-reviews',
  title: 'Governance Reviews',
}

const governanceForm = {
  slug: 'governance-review-form',
  title: 'Governance Review Form',
}

const governanceReviewBody = 'A deterministic submitted Review awaiting moderation.'
const governanceSubmittedAt = '2026-09-03T00:00:00.000Z'

type FixtureDocument = {
  id: number | string
}

type FixtureReviewDocument = FixtureDocument & {
  sourceSubmission?: number | string | { id?: number | string | null } | null
}

type GovernanceRecords = {
  category?: FixtureDocument
  form?: FixtureDocument
  review?: FixtureReviewDocument
  submission?: FixtureDocument
  users: {
    accessManager?: FixtureDocument
    governanceAdmin?: FixtureDocument
    governanceSecondAdmin?: FixtureDocument
    reviewManager?: FixtureDocument
  }
}

const relationshipID = (value: FixtureReviewDocument['sourceSubmission']): string | null => {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  if (value && typeof value === 'object' && value.id != null) return String(value.id)
  return null
}

const firstDocument = <T extends FixtureDocument>(result: { docs: unknown[] }): T | undefined =>
  result.docs[0] as T | undefined

const buildGovernanceQueueSources = ({
  reviewID,
  submissionID,
}: {
  reviewID?: string | null
  submissionID?: string | null
}): readonly GovernanceQueueSource[] => {
  const queueSources: GovernanceQueueSource[] = []

  if (submissionID) {
    queueSources.push({
      sourceCollection: 'form-submissions',
      sourceID: submissionID,
      dedupeKeys: [
        buildWorkQueueDedupeKey({
          queueType: 'follow_up',
          reasonCode: 'submission-new',
          sourceCollection: 'form-submissions',
          sourceID: submissionID,
        }),
        buildWorkQueueDedupeKey({
          queueType: 'follow_up',
          reasonCode: 'submission-in-review',
          sourceCollection: 'form-submissions',
          sourceID: submissionID,
        }),
      ],
    })
  }

  if (reviewID) {
    queueSources.push({
      sourceCollection: 'reviews',
      sourceID: reviewID,
      dedupeKeys: [
        buildWorkQueueDedupeKey({
          queueType: 'moderation',
          reasonCode: 'review-moderation-required',
          sourceCollection: 'reviews',
          sourceID: reviewID,
        }),
      ],
    })
  }

  return queueSources
}

const queueSourceID = (
  queueSources: readonly GovernanceQueueSource[] | undefined,
  sourceCollection: GovernanceQueueSource['sourceCollection'],
): string | null =>
  queueSources?.find((source) => source.sourceCollection === sourceCollection)?.sourceID ?? null

async function findGovernanceRecords(
  payload: Payload,
  queueSources?: readonly GovernanceQueueSource[],
): Promise<GovernanceRecords> {
  const suppliedReviewID = queueSourceID(queueSources, 'reviews')
  const suppliedSubmissionID = queueSourceID(queueSources, 'form-submissions')
  const review = firstDocument<FixtureReviewDocument>(
    await payload.find({
      collection: 'reviews',
      depth: 0,
      draft: true,
      limit: 1,
      overrideAccess: true,
      trash: true,
      where: suppliedReviewID
        ? {
            and: [
              { id: { equals: suppliedReviewID } },
              { slug: { equals: governanceReview.slug } },
            ],
          }
        : { slug: { equals: governanceReview.slug } },
    }),
  )

  const form = firstDocument<FixtureDocument>(
    await payload.find({
      collection: 'forms',
      depth: 0,
      draft: true,
      limit: 1,
      overrideAccess: true,
      trash: true,
      where: { slug: { equals: governanceForm.slug } },
    }),
  )

  const retainedSubmissionID = suppliedSubmissionID ?? relationshipID(review?.sourceSubmission)
  const submission = form
    ? firstDocument<FixtureDocument>(
        await payload.find({
          collection: 'form-submissions',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          trash: true,
          where: {
            and: [
              ...(retainedSubmissionID ? [{ id: { equals: retainedSubmissionID } }] : []),
              { form: { equals: form.id } },
              { submittedAt: { equals: governanceSubmittedAt } },
            ],
          },
        }),
      )
    : undefined

  const category = firstDocument<FixtureDocument>(
    await payload.find({
      collection: 'categories',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      trash: true,
      where: { slug: { equals: governanceCategory.slug } },
    }),
  )

  const [
    governanceAdminResult,
    governanceSecondAdminResult,
    accessManagerResult,
    reviewManagerResult,
  ] = await Promise.all(
    [governanceAdmin, governanceSecondAdmin, accessManager, reviewManager].map((account) =>
      payload.find({
        collection: 'users',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        trash: true,
        where: { email: { equals: account.email } },
      }),
    ),
  )

  return {
    category,
    form,
    review,
    submission,
    users: {
      accessManager: firstDocument(accessManagerResult),
      governanceAdmin: firstDocument(governanceAdminResult),
      governanceSecondAdmin: firstDocument(governanceSecondAdminResult),
      reviewManager: firstDocument(reviewManagerResult),
    },
  }
}

async function deleteGovernanceQueueItemsWithPayload(
  payload: Payload,
  queueSources: readonly GovernanceQueueSource[],
): Promise<void> {
  for (const source of queueSources) {
    for (const dedupeKey of source.dedupeKeys) {
      const result = await payload.find({
        collection: 'work-queue',
        limit: 1,
        overrideAccess: true,
        where: {
          and: [
            { dedupeKey: { equals: dedupeKey } },
            { sourceCollection: { equals: source.sourceCollection } },
            { sourceID: { equals: String(source.sourceID) } },
          ],
        },
      })
      const queueDocument = firstDocument(result)

      if (queueDocument) {
        await payload.delete({
          collection: 'work-queue',
          id: queueDocument.id,
          overrideAccess: true,
        })
      }
    }
  }
}

async function deleteExactDocument(
  payload: Payload,
  collection: 'categories' | 'forms' | 'form-submissions' | 'reviews' | 'users',
  document: FixtureDocument | undefined,
): Promise<void> {
  if (!document) return

  await payload.delete({
    collection,
    id: document.id,
    overrideAccess: true,
    trash: true,
  })
}

async function cleanupGovernanceFixturesWithPayload(
  payload: Payload,
  fixture?: Pick<GovernanceFixture, 'queueSources'>,
): Promise<void> {
  const records = await findGovernanceRecords(payload, fixture?.queueSources)
  const recoveredQueueSources =
    fixture?.queueSources ??
    buildGovernanceQueueSources({
      reviewID: records.review ? String(records.review.id) : null,
      submissionID:
        (records.submission ? String(records.submission.id) : null) ??
        relationshipID(records.review?.sourceSubmission),
    })

  await deleteGovernanceQueueItemsWithPayload(payload, recoveredQueueSources)

  await deleteExactDocument(payload, 'reviews', records.review)
  await deleteExactDocument(payload, 'form-submissions', records.submission)
  await deleteExactDocument(payload, 'forms', records.form)
  await deleteExactDocument(payload, 'categories', records.category)

  await deleteExactDocument(payload, 'users', records.users.governanceSecondAdmin)
  await deleteExactDocument(payload, 'users', records.users.accessManager)
  await deleteExactDocument(payload, 'users', records.users.reviewManager)

  const bootstrapAdmin = records.users.governanceAdmin
  if (!bootstrapAdmin) return

  const otherActiveAdmins = await payload.count({
    collection: 'users',
    overrideAccess: true,
    trash: true,
    where: {
      and: [
        { id: { not_equals: bootstrapAdmin.id } },
        { role: { equals: 'admin' } },
        { or: [{ deletedAt: { exists: false } }, { deletedAt: { equals: null } }] },
      ],
    },
  })

  if (otherActiveAdmins.totalDocs > 0) {
    await deleteExactDocument(payload, 'users', bootstrapAdmin)
  }
}

async function requireSingleActiveQueueItem(
  payload: Payload,
  source: GovernanceQueueSource,
  dedupeKey: string,
): Promise<void> {
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

  if (result.totalDocs !== 1) {
    throw new Error(`Expected one active governance Work Queue item for ${dedupeKey}.`)
  }
}

export async function seedGovernanceBase(): Promise<GovernanceFixture> {
  const testDatabaseURI = getRequiredTestDatabaseURI()
  process.env.MONGODB_URI = testDatabaseURI
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../../src/payload.config.js'),
  ])
  const payload = await getPayload({ config })

  await cleanupGovernanceFixturesWithPayload(payload)

  const existingAdmin = firstDocument(
    await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      trash: true,
      where: { email: { equals: governanceAdmin.email } },
    }),
  )
  const governanceAdminDocument = existingAdmin
    ? await payload.update({
        collection: 'users',
        id: existingAdmin.id,
        data: { ...governanceAdmin, deletedAt: null },
        overrideAccess: true,
        trash: true,
      })
    : await payload.create({
        collection: 'users',
        data: governanceAdmin,
        overrideAccess: true,
      })

  await payload.create({
    collection: 'users',
    data: reviewManager,
    overrideAccess: false,
    user: governanceAdminDocument,
  })

  const category = await payload.create({
    collection: 'categories',
    data: governanceCategory,
    overrideAccess: false,
    user: governanceAdminDocument,
  })
  const form = await payload.create({
    collection: 'forms',
    data: {
      fields: [{ label: 'Review', name: 'reviewBody', required: true, type: 'textarea' }],
      slug: governanceForm.slug,
      submissionIntent: 'review',
      submitButtonLabel: 'Submit review',
      successMessage: 'Review submitted.',
      title: governanceForm.title,
    },
    overrideAccess: false,
    user: governanceAdminDocument,
  })
  const submission = await payload.create({
    collection: 'form-submissions',
    data: {
      data: { reviewBody: governanceReviewBody },
      form: form.id,
      submissionIntent: 'review',
      submittedAt: governanceSubmittedAt,
    },
    overrideAccess: true,
  })
  const review = await payload.create({
    collection: 'reviews',
    context: { trustedReviewPromotion: TRUSTED_REVIEW_PROMOTION_CONTEXT },
    data: {
      _status: 'draft',
      categories: [category.id],
      isGenuineExperience: true,
      moderationStatus: 'pending',
      primaryCategory: category.id,
      rating: '5',
      reviewBody: governanceReviewBody,
      reviewerName: 'Governance Reviewer',
      reviewTitle: governanceReview.title,
      slug: governanceReview.slug,
      sourceSubmission: submission.id,
      title: governanceReview.title,
    },
    draft: true,
    overrideAccess: true,
  })

  const queueSources = buildGovernanceQueueSources({
    reviewID: String(review.id),
    submissionID: String(submission.id),
  })
  const submissionSource = queueSources.find(
    (source) => source.sourceCollection === 'form-submissions',
  )
  const reviewSource = queueSources.find((source) => source.sourceCollection === 'reviews')

  if (!submissionSource || !reviewSource) {
    throw new Error('Governance Work Queue source contracts were not created.')
  }

  await requireSingleActiveQueueItem(payload, submissionSource, submissionSource.dedupeKeys[0])
  await requireSingleActiveQueueItem(payload, reviewSource, reviewSource.dedupeKeys[0])

  return {
    admin: { ...governanceAdmin },
    pendingReview: {
      id: String(review.id),
      slug: governanceReview.slug,
      title: governanceReview.title,
    },
    reviewManager: {
      ...reviewManager,
      features: { ...reviewManager.features },
    },
    queueSources,
  }
}

export async function cleanupGovernanceFixtures(
  fixture?: Pick<GovernanceFixture, 'queueSources'>,
): Promise<void> {
  const testDatabaseURI = getRequiredTestDatabaseURI()
  process.env.MONGODB_URI = testDatabaseURI
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../../src/payload.config.js'),
  ])
  const payload = await getPayload({ config })

  await cleanupGovernanceFixturesWithPayload(payload, fixture)
}

export async function deleteGovernanceQueueItems(
  queueSources: readonly GovernanceQueueSource[],
): Promise<void> {
  const testDatabaseURI = getRequiredTestDatabaseURI()
  process.env.MONGODB_URI = testDatabaseURI
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../../src/payload.config.js'),
  ])
  const payload = await getPayload({ config })

  await deleteGovernanceQueueItemsWithPayload(payload, queueSources)
}
