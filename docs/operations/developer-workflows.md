# Developer Workflows

## Application Commands

| Command                   | Purpose                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| `pnpm dev`                | Start Next.js development mode                                   |
| `pnpm devsafe`            | Remove `.next` and start development; use for stale build output |
| `pnpm build`              | Create the production Next.js build                              |
| `pnpm start`              | Serve an existing production build                               |
| `pnpm lint`               | Run ESLint across the repository                                 |
| `pnpm payload`            | Run the Payload CLI                                              |
| `pnpm generate:types`     | Regenerate `src/payload-types.ts` after schema changes           |
| `pnpm generate:importmap` | Regenerate the Payload admin import map                          |
| `pnpm test:int`           | Run Vitest integration/component tests                           |
| `pnpm test:e2e`           | Run Playwright Admin/frontend journeys                           |
| `pnpm test`               | Run integration tests, then E2E tests                            |

Run type and import-map generation after changing collections, globals, fields, blocks, or custom Admin components.

## Test Safety

Tests load environment configuration. Use an isolated MongoDB database: E2E helpers seed and delete known test users and homepage content. Never point the test commands at a production or irreplaceable staging database.

Install a browser before the first E2E run:

```bash
pnpm exec playwright install chromium
```

## Database Export

`pnpm export:db` loads `.env`, requires `MONGODB_URI`, and invokes the external `mongodump` executable. It writes a gzip archive named `backups/payload-db-<timestamp>.archive`.

```bash
pnpm export:db
```

Install MongoDB Database Tools first. Treat archives as sensitive production data, keep them out of source control, and verify a restore procedure separately before relying on them.

## Office Migration

`pnpm migrate:offices` moves legacy site-office data into the `office-locations` collection. Before running it:

1. export the database
2. confirm `MONGODB_URI` targets the intended environment
3. run the migration once
4. inspect and publish migrated Office Locations
5. verify every Regional Offices block

## Block Thumbnails

`pnpm generate:block-thumbnails` uses Playwright to capture the development-only preview route and writes JPEGs to `public/block-thumbnails`.

Optional variables:

| Variable                   | Purpose                                                                          |
| -------------------------- | -------------------------------------------------------------------------------- |
| `BLOCK_THUMBNAIL_SLUG`     | Generate one known block slug instead of all previews                            |
| `BLOCK_THUMBNAIL_BASE_URL` | Reuse an already running development server; defaults to `http://localhost:3000` |
| `BLOCK_THUMBNAIL_PORT`     | Port for the script-managed server; defaults to `3199`                           |

Examples:

```bash
pnpm generate:block-thumbnails
BLOCK_THUMBNAIL_SLUG=heroBanner pnpm generate:block-thumbnails
BLOCK_THUMBNAIL_BASE_URL=http://localhost:3000 pnpm generate:block-thumbnails
```

The preview route returns 404 outside development.

## Media Storage Reconciliation

Configure `MEDIA_RECONCILE_TOKEN`, then call:

```bash
curl -X POST \
  -H "Authorization: Bearer $MEDIA_RECONCILE_TOKEN" \
  https://example.com/api/operations/media/reconcile-storage
```

The endpoint also accepts `x-media-reconcile-token`. It returns counts for `scanned`, `updated`, `healthy`, `missing`, `checkFailed`, and `localOnly`. One call scans at most 1,000 records. A missing token configuration returns 503; a wrong token returns 401.

For local disk, reconciliation marks records `local_only`. For S3, it checks each object, updates read-only storage fields, and records missing/restored operational events. Run it through a trusted scheduler or operator process; never embed the token in browser code.
