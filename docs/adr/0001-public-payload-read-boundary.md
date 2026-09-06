# ADR 0001: Public Payload Read Boundary

- Status: Accepted
- Date: 2026-09-03

## Context

Payload Local API operations bypass collection access by default. A public server component or
route can therefore expose documents that the collection access policy would reject even when its
query includes an `_status` filter. Reviews have an additional rule: a submitted Review is public
only after moderation approval, while a published staff-authored Review has no source submission.
Repeating those predicates at every call site made visibility dependent on each consumer staying in
sync.

## Decision

`Reviews.access.read` owns the anonymous visibility rule. Anonymous callers may read published
staff-authored Reviews and published submitted Reviews whose moderation status is `approved`.
Authenticated reads continue to require the Reviews feature.

Every anonymous Local API Review read goes through `findPublicReviews` or `countPublicReviews` in
`src/domains/reviews/publicReviewQueries.ts`. Those wrappers always set `draft: false` and
`overrideAccess: false`, do not accept a user, and leave consumer-specific selection, sorting,
pagination, and additional filters to the caller. Trusted administrative promotion, migration, and
feature-scoped dashboard operations remain outside this public boundary and must state their access
mode explicitly.

Rejected alternatives were relying on Payload's Local API defaults, copying `_status` and
moderation predicates into each public query, or trusting publication state alone. Each can bypass
or drift from the collection policy.

## Consequences

Public Review feeds, summaries, archives, detail pages, search, sitemap, and Open Graph rendering
share one access decision. New anonymous consumers must use the wrapper instead of calling
`payload.find`, `payload.findByID`, or `payload.count` directly for Reviews. Access changes belong in
the collection policy and require regression coverage across the public consumers.

## Verification

- `tests/int/public-review-access.int.spec.ts` proves the database-backed anonymous access policy,
  wrapper options, and public-consumer import boundary.
- `tests/int/review-feed-data.int.spec.ts`, `tests/int/review-rating-summary.int.spec.ts`, and
  `tests/int/reviews.int.spec.ts` enforce the boundary for feeds, aggregate counts, archives, and
  detail loading.
- `tests/int/search-route.int.spec.ts`, `tests/int/search-page.int.spec.tsx`,
  `tests/int/sitemap.int.spec.ts`, and `tests/int/open-graph-image-renderer.int.spec.tsx` enforce it
  for discovery and generated metadata.
