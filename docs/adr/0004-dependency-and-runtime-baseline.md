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
container, E2E/transaction test, and Docker build-verifier URIs use explicit
replica-set/direct-connection semantics; the current CI exception is described below. The Docker
verifiers use only isolated `_test` databases, a fixed isolated project/network/image/builder
namespace, one atomic owner-only lock, owner-marked resources, absolute Compose paths, an allowlisted
child environment, and bounded ownership-checked cleanup.

The production image uses Node `22.17.0`, pnpm `11.17.0`, a frozen install, and a non-root Next.js
standalone runner. Only `NEXT_PUBLIC_SERVER_URL` is a build argument. Required server-only build
configuration is mounted as the BuildKit secret `payload_build_env`; the verifier checks both
runner `Config.Env` and exported filesystem layers for secret names and values.

GitHub Actions retains only the current mandatory release gates. Local project-context checks stay
out of CI. Action SHA pinning, replica-set CI initialization, critical Admin/Site Manager browser
journeys, secret/dependency-review jobs, and the already-proven production image verifier are
explicit handoff items for the separate Verification and Delivery phase.

Rejected alternatives were upgrading Next or Payload packages independently; leaving direct
framework versions as floating ranges; accepting two Sharp/libvips bindings; dropping the
`react-server` CLI condition; treating raw pnpm audit exit status as the repository policy; using a
standalone local MongoDB; passing server secrets as Docker build arguments; loading developer env
files during verification; reusing the default Compose project; and adding optional external
controls to the mandatory-only workflow during this phase.

## Consequences

Framework family changes, Sharp/PostCSS changes, and lockfile remediation require focused contract
tests plus the full verification matrix. Contributors must use Node 22 and the exact pnpm release.
Local transaction behavior now matches Payload's replica-set requirement, but Compose dependency
health guarantees startup ordering only, not recovery after a later database outage.

The exception-aware gate permits visible moderate and low residuals while failing closed on invalid
audit data or unapproved high/critical findings. Docker image verification requires a working Docker
daemon with Compose and Buildx and deliberately stops on any fixed-identity or lock collision. The
current CI Mongo service remains a non-replica service until the separate delivery phase implements
replica-set initialization without expanding this phase's workflow.

## Rollback

Rollback the dependency/runtime phase as one reviewed unit to the pre-phase baseline rather than
downgrading one member of a compatibility group. Restore `package.json` and `pnpm-lock.yaml`
together, restore the matching generated Payload types/import map, toolchain declarations,
Docker/Compose definitions, audit policy, tests, and maintained documentation, then run the complete
verification matrix below on the restored state. Do not retain partial Payload/Next versions,
temporary package overrides, audit exceptions, standalone MongoDB data files, or build-secret
arguments. Preserve or explicitly migrate any local MongoDB data before changing the pinned server
version or its version-specific volume.

## Verification

Use only the explicit safe `_test` configuration below. Do not load a developer environment file.
`pnpm verify:docker-image` is the production-build gate: it performs the build in the isolated Node
22 Docker verifier and inspects the resulting image secret boundary. A host `pnpm build` is not an
authoritative hardening check because Next.js can auto-detect repository environment files.

```bash
pnpm install --frozen-lockfile
env MONGODB_URI='mongodb://127.0.0.1:27017/payload-cms-starter-kit_build_test?replicaSet=rs0&directConnection=true' PAYLOAD_SECRET='build-only-payload-secret-32-characters' NEXT_PUBLIC_SERVER_URL='https://example.test' EMAIL_PROVIDER=none RESEND_OVERRIDE_TO_EMAIL= ALLOW_FIRST_ADMIN_CREATION=false FIRST_ADMIN_EMAIL= ALLOW_PRODUCTION_EMAIL_OVERRIDE=false MEDIA_RECONCILE_TOKEN= MEDIA_PROVIDER=localDisk VERCEL= pnpm generate:types
env MONGODB_URI='mongodb://127.0.0.1:27017/payload-cms-starter-kit_build_test?replicaSet=rs0&directConnection=true' PAYLOAD_SECRET='build-only-payload-secret-32-characters' NEXT_PUBLIC_SERVER_URL='https://example.test' EMAIL_PROVIDER=none RESEND_OVERRIDE_TO_EMAIL= ALLOW_FIRST_ADMIN_CREATION=false FIRST_ADMIN_EMAIL= ALLOW_PRODUCTION_EMAIL_OVERRIDE=false MEDIA_RECONCILE_TOKEN= MEDIA_PROVIDER=localDisk VERCEL= pnpm generate:importmap
git diff --exit-code -- src/payload-types.ts 'src/app/(payload)/admin/importMap.js'
pnpm exec tsc --noEmit
pnpm lint
pnpm test:int
pnpm audit:prod
docker compose config --quiet --no-interpolate --no-env-resolution
pnpm verify:docker-image
pnpm project-context:update
pnpm project-context:check
```

Record raw severity counts separately; exit `1` is expected while low or moderate advisories remain
and is not the repository gate result:

```bash
pnpm audit --prod --json
```
