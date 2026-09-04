# ADR 0004: Dependency and Runtime Baseline

- Status: Accepted
- Date: 2026-09-03

## Context

The application loads Next.js, Payload, React, native Sharp/libvips code, MongoDB transaction
support, and build-time Payload configuration in one runtime. Partial framework upgrades, mixed
Payload package versions, a second Sharp binding, or a non-replica local database can therefore
compile successfully while failing at runtime. Payload generators also import server-only
configuration, and a production Docker build needs server configuration without persisting secrets
in image metadata or layers.

The former production graph reported `0 critical / 21 high / 26 moderate / 4 low` advisories. Raw
package-manager audit exit status cannot represent the repository's reviewed exception policy, and
unbounded Docker cleanup or implicit environment loading would put unrelated developer resources
and data at risk.

## Decision

The supported toolchain is Node.js `22.17.0` within engine range `>=22.13.0 <23` and pnpm
`11.17.0`. The exact direct compatibility groups are:

- Next.js `16.3.4`: `next`, `@next/third-parties`, and `eslint-config-next`.
- Payload `3.88.0`: `payload`, `@payloadcms/db-mongodb`, `@payloadcms/email-resend`,
  `@payloadcms/live-preview-react`, `@payloadcms/next`, `@payloadcms/richtext-lexical`,
  `@payloadcms/storage-s3`, and `@payloadcms/ui`.
- Independently pinned runtime packages: Sharp `0.35.4` and PostCSS `8.5.26`.

Payload CLI, type generation, and import-map generation retain
`NODE_OPTIONS=--conditions=react-server`. The generated `src/payload-types.ts` and
`src/app/(payload)/admin/importMap.js` are committed artifacts and must remain drift-free. The
local-disk generated import map retains the environment-independent S3 Admin handler dependency
while browser uploads remain disabled.

`pnpm audit:prod` is the sole pass/fail production audit gate. It validates the schema-backed
exception ledger and rejects unexcepted high or critical findings; raw
`pnpm audit --prod --json` remains diagnostic only. At acceptance the ledger is empty and the graph
reports `0 critical / 0 high / 14 moderate / 4 low`, all residual findings following the upstream
Monaco Editor to DOMPurify path.

Local Compose pins MongoDB `8.0.29`, initializes one writable `rs0` member advertising
`mongo:27017`, and publishes the normal developer endpoint only on `127.0.0.1`. Local host, Compose
container, E2E/transaction test, CI, and Docker build-verifier URIs use explicit
replica-set/direct-connection semantics. GitHub CI creates an ephemeral MongoDB `8.0.29` container,
advertises `127.0.0.1:27017` as its sole `rs0` member, and requires the exact version and writable
PRIMARY state before database-backed gates run. The Docker verifiers use only isolated `_test`
databases, a fixed isolated project/network/image/builder namespace, one atomic owner-only lock,
owner-marked resources, absolute Compose paths, an allowlisted child environment, and bounded
ownership-checked cleanup.

The production image uses Node `22.17.0`, pnpm `11.17.0`, a frozen install, and a non-root Next.js
standalone runner. Only `NEXT_PUBLIC_SERVER_URL` is a build argument. Required server-only build
configuration is mounted as the BuildKit secret `payload_build_env`; the verifier checks both
runner `Config.Env` and exported filesystem layers for secret names and values.

GitHub Actions has one bounded mandatory job named `verify` for pull requests and pushes to
`develop` or `main`. It uses read-only repository permissions, immutable official action revisions,
and checkout with persisted credentials disabled. After a frozen install and `pnpm audit:prod`, CI
installs bundled Chromium, starts its isolated replica, regenerates both Payload artifacts and
rejects drift, then runs TypeScript, lint, the complete integration suite, exactly two critical
Admin/Site Manager governance journeys, and the Node 22 Vercel production build. Its final
`if: always()` step verifies the current run's owner label before removing only that exact MongoDB
container. The job uses fixed non-secret values and explicit loopback `_test` databases; it never
loads a repository environment file or receives a production secret. Project-context maintenance
stays local.

`pnpm verify:docker-image` remains a documented local/release portability and build-secret
inspection gate, not a GitHub Actions job, because the supported production delivery path is
Vercel.

Rejected alternatives were upgrading Next or Payload packages independently; leaving direct
framework versions as floating ranges; accepting two Sharp/libvips bindings; dropping the
`react-server` CLI condition; treating raw pnpm audit exit status as the repository policy; using a
standalone local or CI MongoDB; passing server secrets as Docker build arguments; loading repository
environment files during verification; reusing the developer/default Compose project; mutable
action tags; separate dependency-review or secret-scan jobs; a Docker-image CI job; and adding
optional external controls to the mandatory-only workflow.

## Consequences

Framework family changes, Sharp/PostCSS changes, and lockfile remediation require focused contract
tests plus the full verification matrix. Contributors must use Node 22 and the exact pnpm release.
Local transaction behavior now matches Payload's replica-set requirement, but Compose dependency
health guarantees startup ordering only, not recovery after a later database outage.

The exception-aware gate permits visible moderate and low residuals while failing closed on invalid
audit data or unapproved high/critical findings. Docker image verification requires a working Docker
daemon with Compose and Buildx and deliberately stops on any fixed-identity or lock collision. The
ephemeral CI replica requires Docker on the GitHub-hosted runner. The mandatory browser gate is
intentionally limited to the two critical authorization and Review-moderation journeys; the full
Playwright suite remains a local command. Vulnerability alerts, Dependabot, private reporting,
rulesets, protected-branch configuration, backups, deployment, and other external platform controls
remain operator responsibilities.

## Rollback

Rollback the dependency/runtime phase as one reviewed unit to the pre-phase baseline rather than
downgrading one member of a compatibility group. Restore `package.json` and `pnpm-lock.yaml`
together, restore the matching generated Payload types/import map, toolchain declarations,
Docker/Compose definitions, audit policy, tests, and maintained documentation, then run the complete
verification matrix below on the restored state. Do not retain partial Payload/Next versions,
temporary package overrides, audit exceptions, standalone MongoDB data files, or build-secret
arguments. Preserve or explicitly migrate any local MongoDB data before changing the pinned server
version or its version-specific volume.

Rollback the delivery changes in reverse implementation order while retaining the prior mandatory
workflow until its replacement passes the workflow/E2E contracts, TypeScript, lint, and the complete
integration suite. Do not prune Docker or remove a developer/default Compose project. If an
interrupted GitHub run leaves its exact CI container, verify that
`com.payloadcms.hardening.ci-owner` matches that run before removing only the named container. No
data migration or external rollback is required because the delivery fixtures use ephemeral
loopback `_test` data.

## Verification

Use only explicit safe `_test` configuration. Do not load a repository environment file. The
mandatory GitHub job is the authoritative Vercel-path check: it runs `pnpm build` on Node 22 after
the complete repository gate. Locally, run config-loading commands from a tracked-files workspace
that contains neither ignored environment file. `pnpm verify:docker-image` separately performs the
build in the isolated Node 22 Docker verifier and inspects the image secret boundary; it is the
local/release portability check, not a second CI delivery path. A host build on an unsupported Node
release is not authoritative.

```bash
pnpm install --frozen-lockfile
env MONGODB_URI='mongodb://127.0.0.1:27017/payload-cms-starter-kit_build_test?replicaSet=rs0&directConnection=true' PAYLOAD_SECRET='build-only-payload-secret-32-characters' NEXT_PUBLIC_SERVER_URL='https://example.test' EMAIL_PROVIDER=none RESEND_OVERRIDE_TO_EMAIL= ALLOW_FIRST_ADMIN_CREATION=false FIRST_ADMIN_EMAIL= ALLOW_PRODUCTION_EMAIL_OVERRIDE=false MEDIA_RECONCILE_TOKEN= MEDIA_PROVIDER=localDisk VERCEL= pnpm generate:types
env MONGODB_URI='mongodb://127.0.0.1:27017/payload-cms-starter-kit_build_test?replicaSet=rs0&directConnection=true' PAYLOAD_SECRET='build-only-payload-secret-32-characters' NEXT_PUBLIC_SERVER_URL='https://example.test' EMAIL_PROVIDER=none RESEND_OVERRIDE_TO_EMAIL= ALLOW_FIRST_ADMIN_CREATION=false FIRST_ADMIN_EMAIL= ALLOW_PRODUCTION_EMAIL_OVERRIDE=false MEDIA_RECONCILE_TOKEN= MEDIA_PROVIDER=localDisk VERCEL= pnpm generate:importmap
git diff --exit-code -- src/payload-types.ts 'src/app/(payload)/admin/importMap.js'
pnpm exec tsc --noEmit
pnpm lint
pnpm test:int
pnpm test:e2e:governance
pnpm audit:prod
docker compose config --quiet --no-interpolate --no-env-resolution
pnpm verify:docker-local
pnpm verify:docker-image
pnpm project-context:update
pnpm project-context:check
```

Record raw severity counts separately; exit `1` is expected while low or moderate advisories remain
and is not the repository gate result:

```bash
pnpm audit --prod --json
```
