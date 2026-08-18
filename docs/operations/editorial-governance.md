# Editorial Governance

## Roles

| Role | Default operating model |
| --- | --- |
| Admin | All capabilities, user/recovery control, and no required editorial workflow |
| Site Manager | Content, structure, forms, settings, publishing, queue, and audit capabilities; workflow not required by default |
| Content Manager | Pages, Articles, News & Events, Reviews, and Media; publishing capabilities are present but governed workflow is required |

Capabilities are stored independently from the role preset, allowing deliberate per-user overrides. Changing a non-Admin user's role reapplies that role's default capability map; the first user is promoted to Admin. Legacy role values normalize to the current three-role model.

## Governed Collections

Pages, Articles, News & Events, Reviews, and System Pages support:

- `draft`
- `in_review`
- `scheduled`
- `published`
- `reverted`

Payload `_status` and the editorial state work together. Public News & Events additionally requires both to be published. Publication stamps the responsible user and time; review movement stamps reviewer data.

`scheduled` requires a scheduled time and creates high-priority oversight work, but the repository does not include an automatic timed publisher. An operator must complete publication.

## Action Queue Semantics

Hooks generate and synchronize queue work from editorial review/schedules, review moderation, Form Submission follow-up, draft shell/navigation changes, redirect work, and Media issues. Conditions use a stable dedupe key, reopen resolved work when a condition returns, and auto-resolve when the source condition closes.

Publishing checks queue work for the same source record:

- `open` or `blocked` items of type `approval` or `publish_issue` prevent publication
- `in_progress`, `resolved`, and `canceled` items do not prevent publication
- queue records cannot be manually created or deleted

Resolve the source condition first, then allow synchronization to update the queue.

## Audit Coverage

The Audit Log records selected high-value actions for governed editorial collections, Reusable Sections, Layout Defaults, Maintenance & Modes, Action Queue operator changes, and Media deletion/storage transitions. It is not an immutable record of every field change, user change, or delete across the database.

## High-Risk Surfaces

- Layout Defaults: homepage/Header/Footer and global announcement
- Maintenance & Modes: 404 and temporary route overrides
- Headers/Footers/Navigation/Redirects: site-wide access and route behavior
- SEO & Metadata: site-wide indexability
- Analytics & Tracking and Cookie Consent: visitor data collection
- Media critical assets and storage health
- Users, roles, and capability overrides
- permanent deletion from Trash

## Recovery Path

1. Stop making unrelated changes.
2. Inspect the source record, Action Queue, and Audit Log.
3. Restore a prior Payload version or Trash record where appropriate.
4. Verify relationships, publication state, route, redirects, caches, and storage health.
5. Record the resolution on the queue item when operational context is useful.
6. Take a database export before bulk repair or migration work.
