import { readFileSync } from 'node:fs'

import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest'

vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>()

  return {
    ...actual,
    revalidateTag: vi.fn(),
  }
})

import {
  countPublicReviews,
  findPublicReviews,
  publicReviewQueryOptions,
} from '@/domains/reviews/publicReviewQueries'
import { fetchPublishedReviewFeedPage } from '@/lib/reviewFeed'
import { fetchPublishedReviewRatingSummary } from '@/lib/reviewRatingSummary'
import { createTestMongoServer } from '../helpers/mongoMemoryServer'

let payload: Payload
let adminUser: Awaited<ReturnType<Payload['create']>>
let stopMongoServer: (() => Promise<void>) | null = null

const publicReviewConsumers = [
  'src/lib/reviewFeed.ts',
  'src/lib/reviewRatingSummary.ts',
  'src/lib/contentEntries.ts',
  'src/app/api/search/route.ts',
  'src/app/(frontend)/search/page.tsx',
  'src/app/sitemap.ts',
  'src/app/(frontend)/reviews/[slug]/opengraph-image.tsx',
] as const

describe('public Review access boundary', () => {
  beforeAll(async () => {
    const mongoServer = await createTestMongoServer()

    process.env.MONGODB_URI = mongoServer.uri
    process.env.EMAIL_PROVIDER = 'none'
    process.env.MEDIA_PROVIDER = 'localDisk'
    process.env.PAYLOAD_SECRET = 'test-secret'
    stopMongoServer = mongoServer.stop

    vi.resetModules()
    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config: await config })
    for (const model of Object.values(payload.db.collections)) {
      await model.init()
    }
    for (const model of Object.values(payload.db.versions)) {
      await model.init()
    }

    const admin = await payload.create({
      collection: 'users',
      data: {
        email: 'public-review-boundary@example.test',
        password: 'test-password',
        role: 'admin',
      },
      draft: false,
    })
    adminUser = admin
    const category = await payload.create({
      collection: 'categories',
      data: { slug: 'public-review-boundary', title: 'Public Review Boundary' },
      draft: false,
      overrideAccess: false,
      user: admin,
    })
    const form = await payload.create({
      collection: 'forms',
      data: {
        fields: [{ label: 'Name', name: 'name', required: true, type: 'text' }],
        slug: 'public-review-boundary',
        submissionIntent: 'review',
        submitButtonLabel: 'Submit',
        successMessage: 'Thanks.',
        title: 'Public Review Boundary',
      },
      draft: false,
      overrideAccess: false,
      user: admin,
    })
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        data: { reviewerName: 'Submitted Reviewer' },
        form: form.id,
        submissionIntent: 'review',
        submittedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })
    const sourceSubmission = submission.id
    const cases = [
      {
        slug: 'staff-published',
        _status: 'published',
        moderationStatus: null,
        sourceSubmission: null,
      },
      {
        slug: 'approved-submission',
        _status: 'published',
        moderationStatus: 'approved',
        sourceSubmission,
      },
      {
        slug: 'pending-submission',
        _status: 'published',
        moderationStatus: 'pending',
        sourceSubmission,
      },
      {
        slug: 'rejected-submission',
        _status: 'published',
        moderationStatus: 'rejected',
        sourceSubmission,
      },
      {
        slug: 'approved-draft',
        _status: 'draft',
        moderationStatus: 'approved',
        sourceSubmission,
      },
    ] as const
    const reviewData = (entry: (typeof cases)[number]) => ({
      ...entry,
      categories: [category.id],
      generateSlug: false,
      isGenuineExperience: true,
      primaryCategory: category.id,
      rating: '5' as const,
      reviewBody: `Body for ${entry.slug}`,
      reviewerName: 'Boundary Reviewer',
      reviewTitle: entry.slug,
      title: entry.slug,
    })

    await payload.create({
      collection: 'reviews',
      data: reviewData(cases[0]),
      draft: false,
      overrideAccess: false,
      user: admin,
    })
    await payload.create({
      collection: 'reviews',
      context: { permissionsMigration: 'two-role-feature-permissions-migration' },
      data: reviewData(cases[1]),
      draft: false,
      overrideAccess: false,
      user: admin,
    })
    await payload.create({
      collection: 'reviews',
      context: { permissionsMigration: 'two-role-feature-permissions-migration' },
      data: reviewData(cases[4]),
      draft: true,
      overrideAccess: false,
      user: admin,
    })

    const reviewModel = payload.db.collections.reviews as unknown as {
      create: (documents: Array<Record<string, unknown>>) => Promise<unknown>
    }
    const now = new Date()
    await reviewModel.create(
      cases.slice(2, 4).map((entry) => ({
        ...reviewData(entry),
        createdAt: now,
        updatedAt: now,
      })),
    )
  }, 120000)

  afterAll(async () => {
    if (payload) await payload.destroy()
    if (stopMongoServer) await stopMongoServer()
  }, 30000)

  it('returns only public staff Reviews and approved public submissions', async () => {
    const result = await payload.find({
      collection: 'reviews',
      overrideAccess: false,
      sort: 'slug',
    })

    expect(result.docs.map(({ slug }) => slug)).toEqual(['approved-submission', 'staff-published'])
  })

  it('keeps inconsistent submitted Reviews out of feeds and rating totals', async () => {
    const feed = await fetchPublishedReviewFeedPage(payload, { limit: 20, page: 1 })
    const summary = await fetchPublishedReviewRatingSummary(payload)

    expect(feed.docs.map(({ title }) => title).sort()).toEqual([
      'approved-submission',
      'staff-published',
    ])
    expect(summary).toEqual({ average: 5, count: 2 })
  })

  it('fixes anonymous access options for every domain query', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] })
    const count = vi.fn().mockResolvedValue({ totalDocs: 0 })

    await findPublicReviews({ find } as never, { depth: 0, limit: 3 })
    await countPublicReviews({ count } as never, { where: { rating: { equals: '5' } } })

    expect(publicReviewQueryOptions).toEqual({ draft: false, overrideAccess: false })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reviews',
        draft: false,
        overrideAccess: false,
      }),
    )
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reviews',
        draft: false,
        overrideAccess: false,
      }),
    )

    type FindPublicReviewArgs = Parameters<typeof findPublicReviews>[1]
    type CountPublicReviewArgs = Parameters<typeof countPublicReviews>[1]

    expectTypeOf<FindPublicReviewArgs>().not.toHaveProperty('req')
    expectTypeOf<FindPublicReviewArgs>().not.toHaveProperty('user')
    expectTypeOf<CountPublicReviewArgs>().not.toHaveProperty('req')
    expectTypeOf<CountPublicReviewArgs>().not.toHaveProperty('user')
  })

  it.each([
    ['req', () => ({ req: { user: adminUser } })],
    ['user', () => ({ user: adminUser })],
  ] as const)(
    'strips a hostile authenticated %s from public find and count calls',
    async (_source, buildHostileAuth) => {
      const hostileAuth = buildHostileAuth()
      const result = await findPublicReviews(payload, {
        ...hostileAuth,
        depth: 0,
        limit: 20,
        sort: 'slug',
      } as never)
      const count = await countPublicReviews(payload, hostileAuth as never)

      expect(result.docs.map(({ slug }) => slug)).toEqual([
        'approved-submission',
        'staff-published',
      ])
      expect(count.totalDocs).toBe(2)
    },
  )

  it('routes every public Review consumer through the domain boundary', () => {
    for (const file of publicReviewConsumers) {
      const source = readFileSync(file, 'utf8')

      expect(source, file).toContain('@/domains/reviews/publicReviewQueries')
      expect(source, file).not.toMatch(/collection:\s*['"]reviews['"]/)
    }
  })
})
