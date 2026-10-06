# Developer Workflows

## Application Commands

| Command                                                     | Purpose                                                          |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm dev`                                                  | Start Next.js development mode                                   |
| `pnpm devsafe`                                              | Remove `.next` and start development; use for stale build output |
| `pnpm build`                                                | Create the production Next.js build                              |
| `pnpm start`                                                | Serve an existing production build                               |
| `pnpm lint`                                                 | Run ESLint across the repository                                 |
| `pnpm audit:prod`                                           | Enforce the production dependency-audit policy                   |
| `pnpm payload`                                              | Run the Payload CLI                                              |
| `pnpm generate:types`                                       | Regenerate `src/payload-types.ts` after schema changes           |
| `pnpm generate:importmap`                                   | Regenerate the Payload admin import map                          |
| `pnpm test:int`                                             | Run Vitest integration/component tests                           |
| `pnpm test:e2e`                                             | Run Playwright Admin/frontend journeys                           |
| `pnpm test:e2e:governance`                                  | Run the two critical authorization/moderation journeys           |
| `pnpm test`                                                 | Run integration tests, then E2E tests                            |
| `pnpm ci:mongodb:start`                                     | Start the current GitHub run's isolated MongoDB replica          |
| `pnpm ci:mongodb:stop`                                      | Remove the current GitHub run's owned MongoDB replica            |
| `pnpm verify:docker-local`                                  | Verify the isolated local replica and Payload transactions       |
| `pnpm verify:docker-image`                                  | Verify the production image and build-secret boundary            |
| `pnpm project-context:update`                               | Refresh generated repository context                             |
| `pnpm project-context:check`                                | Check maintained project context locally                         |
| `pnpm report:permissions-migration -- --database-uri <uri>` | Preview the two-role migration without writing data              |

Run type and import-map generation after changing collections, globals, fields, blocks, or custom
Admin components. Payload CLI, type generation, and import-map generation include the
`react-server` condition because configuration imports server-only runtime modules. Run
`pnpm project-context:update` and `pnpm project-context:check` after every implementation; these are
local maintenance commands and are intentionally absent from GitHub Actions.

The accepted dependency/runtime baseline, rollback boundary, and complete verification matrix are
recorded in [ADR 0004](../adr/0004-dependency-and-runtime-baseline.md). Use
[Dependency Management](dependency-management.md) for the audit exception workflow and narrow
lockfile refresh procedure. Raw `pnpm audit --prod --json` is advisory evidence only;
`pnpm audit:prod` is the sole exception-aware pass/fail gate.

## Test Safety

The accepted isolation policy and rejected alternatives are recorded in
[ADR 0002](../adr/0002-test-database-isolation.md).

E2E loads the committed, non-secret `test.env` with override enabled, validates its loopback `_test`
URI, and supplies an explicit safe value for every runtime-sensitive input to its development-server
child. Ambient database, Payload secret, origin, production/Vercel, bootstrap, email, token, and S3
values cannot configure that child. The default requires a local MongoDB replica set named `rs0`;
MongoDB transactions require replica-set support. E2E starts its own development server and never
reuses an arbitrary server already listening on port 3000. The child binds explicitly
to `127.0.0.1`, matching the browser origin and Next.js development-resource policy.

After loading the fixture, Playwright replaces ambient `NODE_OPTIONS` with the fixed
`react-server` condition and `tsx/esm` import hook required by real workers. The Next.js
development-server child receives normal framework-managed React contexts, without
forcing those worker import options onto client/server compilation. The focused
`playwright.runtime-import.config.ts` probe runs a real worker/helper Payload-config import without
starting the server or connecting to MongoDB.

The E2E helpers seed and delete known test users and homepage content only after copying the
validated committed `TEST_MONGODB_URI` to the application's `MONGODB_URI`. Do not add credentials to
`test.env`. Change that committed non-secret fixture deliberately when the maintained E2E database
contract changes; a parent-process export does not override it.

The opt-in Compose transaction test is skipped by ordinary `pnpm test:int`. Run it only through
`pnpm verify:docker-local`, which supplies the enable flag and a fixed loopback `_test` URI. The
verifier fails closed if that explicit URI is absent or unsafe. Both Docker verifiers reserve only
the project `payload_hardening_verify` and network `payload_hardening_verify_default`; the image
verifier additionally reserves `payload-cms-starter-kit:hardening-verify`. A collision is a hard
stop. Both scripts set `MONGO_HOST_PORT=0`, leaving the normal `127.0.0.1:27017` default and any
existing listener untouched. The local verifier accepts only the strictly parsed ephemeral
`127.0.0.1:<port>` binding for its test URI. Both pin `-f` and `--project-directory` to absolute paths
in this repository, remove ambient Compose controls through an allowlisted child environment,
disable automatic `.env` loading, point `PAYLOAD_ENV_FILE` and the transaction child's
`DOTENV_CONFIG_PATH` at an owner-only empty temporary fixture, and start only MongoDB. They preflight
the exact `payload_hardening_verify_mongo_data_8_0` and
`payload_hardening_verify_node_modules` volumes in addition to project labels. The scripts never use
the default project or developer volume and clean only resources whose random ownership token still
matches the current run. Image verification reserves and preflights the fixed
`payload_hardening_verify_builder` Buildx identity and its derived container/state volume, attaches
that current-run builder only to the verifier network, and removes it before network cleanup. Its
sole entitlement is `network.host`; in this docker-container driver that build namespace is the
isolated builder container network, not the developer host/default network. It never changes or
removes the user's default/current builders.

The two verifier commands share the atomic owner-only lock reported by an existing-lock error (on
this platform it is under the OS temporary directory as `payload-hardening-docker-verifier.lock`).
They never reclaim a stale lock automatically. If a process was interrupted, first confirm neither
verifier is running and every fixed project, image, builder, derived container, and derived volume is
absent; only then remove the exact lock path printed by the verifier. Never delete a broader
temporary directory or use generic Docker cleanup.

Install a browser before the first E2E run:

```bash
pnpm exec playwright install chromium
```

`pnpm test:e2e` remains the complete local browser suite. GitHub CI installs bundled Chromium with
its Linux dependencies and runs only `pnpm test:e2e:governance`, which contains exactly the critical
feature-grant/revocation and submitted-Review approval journeys. The shared login helper
uses the accessible Email/Password labels and Log in button of the two-factor-aware
login view, rather than legacy Payload field IDs. The feature-grant journey opens
the initially collapsed Content group before editing grants and asserts the saved
record URL independently of document load events. Persisted access and revoked
session checks remain required.

`pnpm ci:mongodb:start` and `pnpm ci:mongodb:stop` are GitHub-only controller commands, not local
database helpers. They reject non-GitHub or mismatched run identity, validate both mutation URIs as
loopback `_test` databases, and operate only on the exact current-run container after checking its
owner label. Do not forge their CI markers or redirect them at a developer database. Local
transaction checks use `pnpm verify:docker-local`; ordinary E2E requires the committed `test.env`
endpoint to already be a writable one-member `rs0` replica.

## Security Boundary Decisions

Four accepted decisions define the boundaries that contributors must preserve:

- [ADR 0001](../adr/0001-public-payload-read-boundary.md): anonymous Review Local API reads use
  the public domain wrappers with access enforcement; Payload Local API bypasses access by default.
- [ADR 0002](../adr/0002-test-database-isolation.md): E2E mutation is restricted to an explicit
  loopback test database and a fresh Playwright-managed server.
- [ADR 0003](../adr/0003-public-media-trust-boundary.md): Media and direct R2 objects are public
  marketing assets; upload signature validation is not malware scanning.
- [ADR 0004](../adr/0004-dependency-and-runtime-baseline.md): dependency compatibility groups,
  audit policy, transaction-ready local MongoDB, and the production image secret boundary move as
  one reviewed runtime baseline.

When any of these surfaces change, run their exact verification suites from the corresponding ADR,
then run the full integration suite and production build.

## Database Export

`pnpm export:db` loads `.env`, requires `MONGODB_URI`, and invokes the external `mongodump` executable. It writes a gzip archive named `backups/payload-db-<timestamp>.archive`.

```bash
pnpm export:db
```

Install MongoDB Database Tools first. Treat archives as sensitive production data, store them in
approved encrypted external storage, keep them out of source control, and verify a restore procedure
separately before relying on them.

Deleting an archive from the working tree does not remove it from Git history. If an archive was ever
tracked, inspect its contents, rotate any affected credentials, notify collaborators, and schedule a
coordinated history rewrite separately. Do not rewrite shared history as part of an ordinary export or
release task.

## Legal Pages

The checked-in Payload migration `20260831_000000_provision_legal_pages` provisions published
`/privacy-policy` and `/terms-and-conditions` Pages only when those exact slugs do not already exist.
It connects only empty relationships under **Site Identity → Legal**. Existing Pages—including
drafts—and existing published or pending relationship choices remain unchanged.

After deployment:

1. review both Pages with qualified Indian legal counsel against the institution's actual website
   and data practices
2. edit copy through **Content → Pages** and use the native draft/publication controls
3. select the public Pages under **Site Identity → Legal** if a different relationship is required
4. update the displayed last-updated date whenever legal copy changes
5. verify the configured footer and Cookie Consent Banner link to the intended Pages

The draft copy covers website activity only. It is not a clinical patient-record privacy notice,
medical consent form, or admissions contract. Migration rollback is intentionally non-destructive:
`payload migrate:down` does not unlink or delete provisioned legal content. Export the database and
confirm `MONGODB_URI` targets the intended environment before running deployment migrations.

## Two-Role Permission Migration

The `20260902_000000_two_role_feature_permissions` migration converts legacy roles and capability
overrides into the Admin/Site Manager model, removes retired workflow fields, preserves public
content only when it was both published and in the published legacy workflow state, and assigns a
source feature to Action Queue records. It stores hidden rollback data and is idempotent.

Always preview the proposed role, grant, content, and queue changes against a backup or local clone:

```bash
pnpm report:permissions-migration -- --database-uri 'mongodb://127.0.0.1:27017/payload-cms-starter-kit?replicaSet=rs0&directConnection=true'
```

The reporter is read-only and masks credentials in its output. Review all conservative grant
disagreements and unmapped queue records. Export the target database, obtain explicit production
approval, and only then run `pnpm payload migrate` with the intended `MONGODB_URI`.

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


## Backported authentication and backup verification

Run `pnpm test:e2e:two-factor` for the isolated optional-2FA browser journeys. Install the pinned browser first with `pnpm exec playwright install chromium`. The harness creates a temporary local MongoDB replica and a copied-source Next development fixture; it does not reuse the application database or ignored dotenv files. It needs local socket permissions. Generated screenshots use only disposable test credentials.

`pnpm backup:prod-db` performs a real configured backup; it is not a verification command. Test backup policy with `pnpm exec vitest run tests/int/prod-db-backup.int.spec.ts`. Configure scheduling only through the [database backup runbook](database-backups.md).

## Storybook

Run `pnpm storybook` for the interactive component/block catalogue at http://localhost:6006, or `pnpm build-storybook` for a static build. See [Storybook authoring and preview workflow](storybook.md). Every replacement block includes stories using the actual component and sample data.
