# Editorial Governance

## Editorial Roles

- `Admin`: full system access, user management, and final recovery authority
- `Site Manager`: trusted non-admin website operator who can manage content, structure, settings, and publishing
- `Content Manager`: non-technical content publisher for pages, articles, reviews, and supporting media

## Workflow States

- `draft`: work in progress
- `in_review`: ready for site manager review
- `scheduled`: approved, waiting for a scheduled release
- `published`: live content
- `reverted`: a prior version was restored and re-published

## High-Risk Surfaces

- `System Modes`: maintenance, coming soon, and 404 routing behavior
- `Operational Audit Events`: human-readable record of workflow and settings changes
- `Pages` and `System Pages`: publish transitions, review metadata, and change summaries

## Recovery Path

1. Open the document version history in Payload.
2. Restore the required version.
3. Save it with workflow state `reverted`.
4. Confirm the matching audit record under `Operational Audit Events`.
