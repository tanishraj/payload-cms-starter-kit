# Task 1 Report: Enforce one public Review query boundary

## Status

Complete.

## RED

Command:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/public-review-access.int.spec.ts tests/int/review-feed-data.int.spec.ts tests/int/review-rating-summary.int.spec.ts
```

Result: failed as expected.

```text
Test Files  3 failed (3)
Tests       2 failed | 8 passed (10)

Failed to resolve import "@/domains/reviews/publicReviewQueries".
review-feed-data expected draft: false / overrideAccess: false but received overrideAccess: true.
review-rating-summary expected rating-only filters but received duplicated _status filters.
```

## GREEN

Focused command:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/public-review-access.int.spec.ts tests/int/review-feed-data.int.spec.ts tests/int/review-rating-summary.int.spec.ts
```

Result:

```text
Test Files  3 passed (3)
Tests       14 passed (14)
```

Required Review and discovery command:

```bash
pnpm exec vitest run --config ./vitest.config.mts \
  tests/int/public-review-access.int.spec.ts \
  tests/int/review-feed-data.int.spec.ts \
  tests/int/review-rating-summary.int.spec.ts \
  tests/int/reviews.int.spec.ts \
  tests/int/review-submission.int.spec.ts \
  tests/int/search-route.int.spec.ts \
  tests/int/search-page.int.spec.tsx \
  tests/int/sitemap.int.spec.ts \
  tests/int/open-graph-image-renderer.int.spec.tsx
```

Final result:

```text
Test Files  9 passed (9)
Tests       24 passed (24)
```

Additional verification:

```text
pnpm exec tsc --noEmit                 PASS
pnpm lint                              PASS
pnpm generate:types                    PASS
pnpm project-context:update            PASS
pnpm project-context:check             PASS (warnings noted below)
git diff --check                       PASS
```

## Implementation

- Added one server-only public Review Local API boundary with fixed `draft: false` and
  `overrideAccess: false` options for both `find` and `count`.
- Centralized the authoritative Review read policy and re-exported it from the query boundary.
- Routed feed, rating aggregation, detail/archive loaders, API search, page search, sitemap, and
  Review Open Graph reads through the boundary without changing projections, pagination, sorting,
  caching, or failure behavior.
- Added a Mongo-backed access test using valid Payload-created staff/approved records and raw model
  insertion only for intentionally invalid published pending/rejected submissions.
- Added source-boundary and consumer regression tests.

The access policy implementation lives in `publicReviewAccess.ts` because Payload's standalone CLI
loads collection config without React's `react-server` condition. Importing the required
`server-only` query module directly from `Reviews.ts` caused `pnpm generate:types` to throw. The
server-only query module re-exports the same policy, while the collection imports the config-safe
sibling directly.

## Files changed

- `.agents/skills/project-context/references/project-inventory.json`
- `src/domains/reviews/publicReviewAccess.ts`
- `src/domains/reviews/publicReviewQueries.ts`
- `src/collections/Reviews.ts`
- `src/lib/reviewFeed.ts`
- `src/lib/reviewRatingSummary.ts`
- `src/lib/contentEntries.ts`
- `src/app/api/search/route.ts`
- `src/app/(frontend)/search/page.tsx`
- `src/app/sitemap.ts`
- `src/app/(frontend)/reviews/[slug]/opengraph-image.tsx`
- `tests/int/public-review-access.int.spec.ts`
- `tests/int/review-feed-data.int.spec.ts`
- `tests/int/review-rating-summary.int.spec.ts`
- `tests/int/reviews.int.spec.ts`
- `tests/int/search-route.int.spec.ts`
- `tests/int/search-page.int.spec.tsx`
- `tests/int/sitemap.int.spec.ts`
- `tests/int/open-graph-image-renderer.int.spec.tsx`

`src/payload-types.ts` was regenerated and remained unchanged. The existing architecture and Payload
model narrative already describe the anonymous submitted-Review moderation rule and Local API
access-enforcement requirement, so no narrative update was needed.

## Commits

- `89c191d fix(reviews): enforce public visibility`
- `docs: record public Review boundary report` (report-only follow-up commit)

## Self-review

- Confirmed all seven public consumer files import the domain boundary and contain no direct
  `collection: 'reviews'` query.
- Confirmed administrative promotion, dashboard, migrations, and moderation queries were untouched.
- Confirmed the access policy keeps authenticated feature-based behavior and limits anonymous reads
  to published staff Reviews or published approved submissions.
- Confirmed wrapper argument types omit `collection`, `draft`, `overrideAccess`, and `user`, while
  fixed options are applied after caller arguments.
- Confirmed feed DTO projection, search projections, sitemap pagination, detail depth, cache wrappers,
  and error handling are preserved.
- Confirmed the database-backed feed and rating assertions exclude published pending/rejected records.

## Concerns

- `project-context:check` reports the pre-existing stale knowledge-graph warning (analyzed commit
  `18ac3f6`, repository baseline `62cff08`). The maintained project inventory itself is current.
- The in-memory Mongo suite requires permission to bind a local port in the execution sandbox. Its
  final permitted run passed.
