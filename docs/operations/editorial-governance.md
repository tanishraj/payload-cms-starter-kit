# Editorial Governance

## Roles

- `admin`: full access, including user management and system-wide overrides
- `publisher`: can review, publish, and revert Pages and System Pages
- `editor`: can create and edit content, but cannot publish or change site-wide modes
- `marketingOps`: can operate forms, SEO defaults, and system modes, but does not publish content by default

## Workflow States

- `draft`: work in progress
- `in_review`: ready for publisher review
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
