# Verification and Delivery Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-09-03-industry-standard-hardening-design.md`

**Goal:** Make one least-privilege GitHub `verify` job prove the supported Node 22 application, exact MongoDB 8.0.29 transaction semantics, generated artifacts, critical Admin/Site Manager governance journeys, the exception-aware dependency policy, and the Vercel production build without reading developer environment files or touching live services.

**Architecture:** A CI-only TypeScript controller owns one exact, labeled, ephemeral MongoDB container and makes it writable as a one-node `rs0` before database-dependent gates. Playwright keeps its committed loopback `_test` database boundary and gains two deterministic governance journeys backed by real worker fixture helpers. The single GitHub job consumes those contracts; the existing production-image verifier remains a local/release portability gate because production delivery is Vercel-based.

**Tech Stack:** GitHub Actions, Node.js 22.17.0, pnpm 11.17.0, MongoDB 8.0.29, Payload CMS 3.88.0, Next.js 16.3.4, TypeScript 5.7.3, Vitest 4.0.18, Playwright 1.58.2, Docker.

## Global Constraints

- Work only on `feat/industry-standard-hardening`; do not push, deploy, or modify GitHub, Vercel, Atlas, R2, DNS, or another live service.
- Planning baseline is commit `9e59e0143a778cdd6f505fb3a4a131ecdf533bd0`. Record the implementation starting commit from `git rev-parse HEAD` in the SDD ledger before Task 1, and use that immutable value for the final cumulative review.
- Preserve exactly two roles—Admin and Site Manager—and the 29 default-deny feature grants in `ADMIN_FEATURE_KEYS`.
- Every test mutation must use a `mongodb:` URI whose host is loopback and whose explicit database name ends in `_test` or `-test`. Never connect a test to Atlas or a `mongodb+srv` URI.
- Do not read, source, copy, print, or pass `.env` or `.env.atlas.local`. Do not use production credentials or GitHub environment secrets. CI values are fixed non-production fixtures.
- Keep one mandatory GitHub job named `verify`, top-level `permissions: contents: read`, and a bounded job timeout. Do not add optional, duplicate, secret-scan, dependency-review, or Docker-image jobs.
- `pnpm audit:prod` is the only dependency pass/fail gate. Do not add raw `pnpm audit`, a second audit action, or dependency-review enforcement.
- `pnpm project-context:update` and `pnpm project-context:check` remain local maintenance commands and must not appear in `.github/workflows/quality.yml`.
- CI action references are immutable lowercase 40-hex commit SHAs with an adjacent official release-tag comment; resolve the current official `v4` refs during implementation rather than guessing hashes.
- The mandatory chain is: immutable checkout/setup, frozen install, `audit:prod`, MongoDB replica startup, Payload type generation, Admin import-map generation, combined generated drift check, TypeScript, lint, the complete integration suite, only the two critical governance Playwright journeys, and the Node 22 production build. Replica cleanup runs with `if: always()` after every success or failure.
- MongoDB in GitHub CI is exactly `8.0.29`, has no persistent volume, binds only `127.0.0.1:27017`, advertises that loopback endpoint as the sole `rs0` member, and must report both `isWritablePrimary: true` and version `8.0.29` before any database-dependent gate.
- Keep `pnpm verify:docker-image` out of GitHub Actions. Retain it as a documented local/release portability and build-secret inspection gate.
- Use TDD: add a focused failing assertion, record the expected RED reason, implement the minimum contract, then record the expected GREEN result.
- A source-string contract may protect workflow structure, immutable action references, generated files, and environment-file exclusions. Authorization, grant removal, direct denial, and moderation/publication must be exercised at runtime.
- Each task receives a fresh implementer and then a separate specification review followed by a separate code-quality review. Corrections are committed and re-reviewed before the next task.

## Safe CI Environment Contract

The workflow supplies these non-secret values at job scope. The E2E server continues to replace them with the committed values in `test.env`, which point at the same loopback replica and satisfy the same `_test` guard.

```yaml
env:
  ALLOW_FIRST_ADMIN_CREATION: 'false'
  ALLOW_PRODUCTION_EMAIL_OVERRIDE: 'false'
  CI_MONGO_CONTAINER: payload-hardening-ci-${{ github.run_id }}-${{ github.run_attempt }}
  CI_MONGO_OWNER: ${{ github.run_id }}:${{ github.run_attempt }}
  EMAIL_PROVIDER: none
  FIRST_ADMIN_EMAIL: ''
  MEDIA_PROVIDER: localDisk
  MEDIA_RECONCILE_TOKEN: ''
  MONGODB_URI: mongodb://127.0.0.1:27017/payload-hardening-ci_test?replicaSet=rs0&directConnection=true
  MONGOMS_VERSION: 8.0.29
  NEXT_PUBLIC_SERVER_URL: https://ci.example.invalid
  PAYLOAD_SECRET: ci-only-payload-secret-32-characters
  RESEND_API_KEY: ''
  RESEND_FROM_EMAIL: ''
  RESEND_FROM_NAME: ''
  RESEND_OVERRIDE_TO_EMAIL: ''
  S3_ACCESS_KEY_ID: ''
  S3_ACL: ''
  S3_BUCKET: ''
  S3_CLIENT_UPLOADS: ''
  S3_ENDPOINT: ''
  S3_FORCE_PATH_STYLE: ''
  S3_PUBLIC_URL: ''
  S3_REGION: ''
  S3_SECRET_ACCESS_KEY: ''
  TEST_MONGODB_URI: mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0&directConnection=true
  VERCEL: ''
```

The workflow never emits this environment as a diagnostic. `MONGOMS_VERSION=8.0.29` makes every `MongoMemoryReplSet` test use the same exact server line; generators, Playwright, and the Vercel production build use the controller-owned loopback replica.

## SDD Ledger and Review Contract

Before Task 1, create the ignored execution ledger at `.superpowers/sdd/2026-09-03-verification-delivery-hardening/progress.md`. Record the branch, clean-worktree result, `git rev-parse HEAD` implementation baseline, action-ref evidence, each task base/commit, focused RED/GREEN commands, review findings, corrections, and cleanup evidence. Never copy credentials, complete MongoDB URIs with credentials, raw audit output, browser storage state, or submitted personal data into the ledger.

For every task:

1. Write `.superpowers/sdd/2026-09-03-verification-delivery-hardening/task-N-brief.md` from that task section.
2. Implement on the reviewed prior-task commit and write `task-N-report.md` with exact commands and sanitized outcomes.
3. Commit with the task's conventional commit message.
4. Generate a bounded review diff from the recorded task base through the task commit.
5. Run a specification review. Resolve every Critical or Important finding in a new local correction commit.
6. Run a separate code-quality review over the corrected range. Resolve and re-review before beginning the next task.
7. Update `progress.md` with the accepted commit range. Do not publish the branch.

After Task 4, run a fresh whole-phase specification/security/architecture review over the recorded implementation baseline through `HEAD`, plus any working-tree changes. The phase is complete only when no Critical or Important finding remains and every fixed CI/Docker identity is absent after verification.

---

### Task 1: Establish the immutable workflow and CI replica lifecycle

**Files:**

- Create: `scripts/ci-mongodb-replica.ts`
- Create: `tests/int/ci-mongodb-replica.int.spec.ts`
- Modify: `tests/helpers/mongoMemoryServer.ts`
- Modify: `package.json`
- Modify: `.github/workflows/quality.yml`
- Modify: `tests/int/quality-workflow.int.spec.ts`
- Modify: `tests/int/test-database-safety.int.spec.ts`

**Interfaces:**

- Produces `CI_MONGO_IMAGE = 'mongo:8.0.29'`, `CI_MONGO_OWNER_LABEL = 'com.payloadcms.hardening.ci-owner'`, and `CI_MONGO_URI = 'mongodb://127.0.0.1:27017/payload-hardening-ci_test?replicaSet=rs0&directConnection=true'`.
- Produces `getCIMongoIdentity(env: NodeJS.ProcessEnv): { containerName: string; owner: string }`; it accepts only `CI=true`, `GITHUB_ACTIONS=true`, a container name matching `^payload-hardening-ci-[0-9]+-[0-9]+$`, and an owner matching `^[0-9]+:[0-9]+$`, with the same run ID and attempt in both values.
- Produces `startCIMongoReplica(options?: { env?: NodeJS.ProcessEnv; run?: DockerRunner }): void` and `stopCIMongoReplica(options?: { env?: NodeJS.ProcessEnv; run?: DockerRunner }): void`.
- Produces CLI commands `pnpm ci:mongodb:start` and `pnpm ci:mongodb:stop`.
- `DockerRunner` is `(args: readonly string[], timeoutMs: number) => SpawnSyncReturns<string>` and always calls `docker` with `shell: false`, bounded output, and a bounded timeout.
- The GitHub job calls start only after the frozen install and audit, then calls stop in the final step with `if: always()`.

- [ ] **Step 1: Add failing workflow and lifecycle contract tests**

Extend `tests/int/quality-workflow.int.spec.ts` using `readFileSync` and bounded line/section matching; do not add a YAML parser merely for this contract. Slice from the top-level `jobs:` line, collect only two-space job keys, and assert:

```ts
const jobsSource = source.slice(source.indexOf('\njobs:\n') + '\njobs:\n'.length)
const jobNames = [...jobsSource.matchAll(/^  ([a-z][a-z0-9_-]*):$/gm)].map((match) => match[1])
expect(jobNames).toEqual(['verify'])
expect(source).toMatch(/^permissions:\n  contents: read$/m)
expect(jobsSource).toMatch(/^    timeout-minutes: 45$/m)
expect(jobsSource).not.toMatch(/^    services:$/m)

const actionReferences = source.matchAll(
  /^\s*- uses: (actions\/checkout|pnpm\/action-setup|actions\/setup-node)@([0-9a-f]{40}) # (v4)$/gm,
)
expect([...actionReferences]).toHaveLength(3)
expect(source).not.toMatch(/@(main|master|v\d+)(?:\s|$)/)
expect(source).toContain('pnpm ci:mongodb:start')
expect(source).toMatch(/if:\s*always\(\)[\s\S]*pnpm ci:mongodb:stop/)
expect(source).not.toContain('services:')
```

Create `tests/int/ci-mongodb-replica.int.spec.ts` with an injected fake `DockerRunner`. Assert start constructs only this mutation:

```ts
expect(run).toHaveBeenCalledWith(
  [
    'run',
    '--detach',
    '--name',
    'payload-hardening-ci-123-2',
    '--label',
    'com.payloadcms.hardening.ci-owner=123:2',
    '--publish',
    '127.0.0.1:27017:27017',
    'mongo:8.0.29',
    '--replSet',
    'rs0',
    '--bind_ip_all',
  ],
  120_000,
)
```

The fake then returns successful `docker inspect`, `docker exec ... rs.initiate(...)`, and `docker exec ... db.hello()` results. Assert the readiness expression requires `db.version() === '8.0.29'`, `hello.isWritablePrimary === true`, and the sole member host `127.0.0.1:27017`. Add rejection cases for missing GitHub markers, malformed/mismatched identities, a pre-existing container, changed ownership, timeout/signal, and cleanup after a partially failed start. Assert stop performs only `docker rm --force payload-hardening-ci-123-2` after exact owner-label verification.

Extend `tests/int/test-database-safety.int.spec.ts` to assert `createTestMongoServer` fixes `MEMORY_TEST_DATABASE_NAME` to `payload-memory_test`, requests MongoDB binary `8.0.29`, calls `server.getUri(MEMORY_TEST_DATABASE_NAME)`, and validates the resulting loopback URI before returning it. This closes the remaining generated-memory URI exception: every database mutated by `pnpm test:int` now has an explicit `_test` name.

- [ ] **Step 2: Run the focused tests and capture the RED state**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/ci-mongodb-replica.int.spec.ts tests/int/quality-workflow.int.spec.ts tests/int/test-database-safety.int.spec.ts
```

Expected: FAIL because the controller and package scripts do not exist, the workflow still uses mutable `@v4` action references, and `services.mongo` is a standalone `mongo:8.0` service without `rs0`.

- [ ] **Step 3: Implement the fail-closed CI-only replica controller**

Implement `scripts/ci-mongodb-replica.ts` with these rules:

```ts
export const CI_MONGO_IMAGE = 'mongo:8.0.29'
export const CI_MONGO_OWNER_LABEL = 'com.payloadcms.hardening.ci-owner'
export const CI_MONGO_URI =
  'mongodb://127.0.0.1:27017/payload-hardening-ci_test?replicaSet=rs0&directConnection=true'

export type DockerRunner = (args: readonly string[], timeoutMs: number) => SpawnSyncReturns<string>

export type CIMongoIdentity = {
  containerName: string
  owner: string
}
```

`getCIMongoIdentity` must reject before invoking Docker unless the four CI identity values match the interface above and `TEST_MONGODB_URI` plus `MONGODB_URI` both pass `assertSafeTestDatabaseURI`. Preflight the exact container name with `docker container inspect`; status `0` is a collision, status `1` is absent, and an execution error/signal/other status is a hard failure.

After `docker run`, inspect `{{ index .Config.Labels "com.payloadcms.hardening.ci-owner" }}` and require the current owner. Initiate exactly one member:

```js
try {
  rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '127.0.0.1:27017' }] })
} catch (error) {
  if (error.codeName !== 'AlreadyInitialized') quit(2)
}
```

Poll for at most 90 seconds in short controller-side intervals. The in-container readiness command exits `0` only when the ping succeeds, `db.version()` is `8.0.29`, `db.hello().isWritablePrimary` is true, and `rs.conf().members` contains exactly the advertised member. Never print Docker stdout/stderr, environment values, or the URI. If start fails after creating the current-run container, verify the owner label and remove only that container before rethrowing a sanitized error. Stop is idempotent only when the exact container is absent; it refuses an existing container whose owner label differs.

Add package scripts:

```json
"ci:mongodb:start": "tsx scripts/ci-mongodb-replica.ts start",
"ci:mongodb:stop": "tsx scripts/ci-mongodb-replica.ts stop"
```

In `tests/helpers/mongoMemoryServer.ts`, export `MEMORY_TEST_DATABASE_NAME = 'payload-memory_test'`, set `binary.version` to `8.0.29`, obtain the URI with `server.getUri(MEMORY_TEST_DATABASE_NAME)`, pass it through `assertSafeTestDatabaseURI`, and only then return it. Preserve the existing per-suite temporary download directory, one-member `wiredTiger` replica, and finally cleanup.

- [ ] **Step 4: Resolve official action refs and pin all setup actions**

Run exactly these read-only commands against the official repositories:

```bash
git ls-remote https://github.com/actions/checkout.git refs/tags/v4
git ls-remote https://github.com/pnpm/action-setup.git refs/tags/v4
git ls-remote https://github.com/actions/setup-node.git refs/tags/v4
```

For each command, require exactly one line whose first field matches `^[0-9a-f]{40}$` and whose second field is the requested `refs/tags/v4`. A missing, duplicate, symbolic, short, uppercase, or non-hex result stops implementation. Record the command, repository, tag, and resolved 40-hex value in the SDD report, then replace each mutable reference using this exact annotation shape:

Each resulting workflow line must match, respectively, `^- uses: actions/checkout@[0-9a-f]{40} # v4$`, `^- uses: pnpm/action-setup@[0-9a-f]{40} # v4$`, and `^- uses: actions/setup-node@[0-9a-f]{40} # v4$` after indentation is ignored. Insert only the first field returned by that repository's validated command; no hash is inferred or copied from this plan.

- [ ] **Step 5: Establish the one-job workflow lifecycle without adding later gates**

Remove `services.mongo`. Preserve the triggers, `permissions: contents: read`, job name `verify`, Node `22.17.0`, pnpm `11.17.0`, frozen install, audit, existing type drift, TypeScript, lint, integration, and build steps. Set `timeout-minutes: 45`, add the complete Safe CI Environment Contract at job scope, add `pnpm ci:mongodb:start` immediately after `pnpm audit:prod`, and add this final step:

```yaml
- name: Stop isolated MongoDB replica
  if: always()
  run: pnpm ci:mongodb:stop
```

Do not add import-map generation or Playwright yet; Task 3 owns their mandatory wiring after Task 2 produces the focused journey.

- [ ] **Step 6: Run the focused tests and capture the GREEN state**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/ci-mongodb-replica.int.spec.ts tests/int/quality-workflow.int.spec.ts tests/int/test-database-safety.int.spec.ts tests/int/e2e-config.int.spec.ts
pnpm exec tsc --noEmit
```

Expected: PASS. The test double proves exact image/identity/readiness/cleanup arguments, the workflow has one bounded read-only job and three immutable annotated action refs, and all CI/E2E database values remain loopback `_test` URIs.

- [ ] **Step 7: Commit Task 1**

```bash
git add .github/workflows/quality.yml package.json scripts/ci-mongodb-replica.ts tests/helpers/mongoMemoryServer.ts tests/int/ci-mongodb-replica.int.spec.ts tests/int/quality-workflow.int.spec.ts tests/int/test-database-safety.int.spec.ts
git commit -m "ci: isolate MongoDB replica lifecycle"
```

---

### Task 2: Add critical feature-grant and Review-moderation browser journeys

**Files:**

- Create: `tests/helpers/governanceFixtures.ts`
- Create: `tests/e2e/governance.e2e.spec.ts`
- Create: `tests/int/governance-fixtures.int.spec.ts`
- Modify: `tests/int/e2e-config.int.spec.ts`

**Interfaces:**

- Produces `type GovernanceAccount = { email: string; password: string; role: 'admin' | 'siteManager'; features?: AdminFeatureGrants }`.
- Produces `type GovernanceQueueSource = { sourceCollection: 'form-submissions' | 'reviews'; sourceID: string; dedupeKeys: readonly string[] }` and `type GovernanceFixture = { admin: GovernanceAccount; pendingReview: { id: string; slug: string; title: string }; reviewManager: GovernanceAccount; queueSources: readonly GovernanceQueueSource[] }`.
- Produces fixed non-personal accounts `governanceAdmin`, `governanceSecondAdmin`, `accessManager`, and `reviewManager`, all under `@example.test`.
- Produces `seedGovernanceBase(): Promise<GovernanceFixture>`.
- Produces `cleanupGovernanceFixtures(fixture?: Pick<GovernanceFixture, 'queueSources'>): Promise<void>`, which validates `TEST_MONGODB_URI` before importing Payload, recovers source IDs from exact fixture records when no snapshot is supplied, deletes exact matching Work Queue document IDs before their Review/Form Submission sources, removes only records with the fixed governance emails/slugs, and never drops a collection or database.
- Produces guarded `deleteGovernanceQueueItems(queueSources): Promise<void>` as a separately testable mutator backed by a private `deleteGovernanceQueueItemsWithPayload(payload, queueSources)`: every lookup combines an exact `dedupeKey`, `sourceCollection`, and string `sourceID`, and every delete supplies the returned Work Queue `id` plus `overrideAccess: true` because public Work Queue delete access is intentionally false.
- The Playwright file contains exactly two tests: `Admin grants and revokes a Site Manager feature` and `Reviews Site Manager approves a submitted Review`.

- [ ] **Step 1: Add fail-closed helper contract tests**

Extend `tests/int/e2e-config.int.spec.ts` to import the new helper under an unsafe `TEST_MONGODB_URI` and assert `seedGovernanceBase`, `cleanupGovernanceFixtures`, and `deleteGovernanceQueueItems` reject before `payload.config` loads or `getPayload` runs. Add a source contract asserting every exported mutator calls `getRequiredTestDatabaseURI()` before the dynamic imports and that the helper contains no `dropDatabase`, `deleteMany({})`, `.env`, `.env.atlas.local`, `mongodb+srv`, or non-loopback URI.

Create `tests/int/governance-fixtures.int.spec.ts` with two RED contracts. First, set a safe loopback `_test` URI, mock the dynamically imported Payload boundary so `getPayload` returns `find`/`delete` spies, call `deleteGovernanceQueueItems`, and require each lookup to use `limit: 1`, `overrideAccess: true`, and an `and` predicate containing exact equality for `dedupeKey`, `sourceCollection`, and `sourceID`; require every Work Queue delete to be `{ collection: 'work-queue', id: queueDocument.id, overrideAccess: true }` for the concrete document returned by the corresponding mocked find, with no `where` delete. Use `vi.resetModules()` and restore the real modules before the runtime case so mock state cannot mask database behavior. Second, boot the existing Mongo memory replica through `createTestMongoServer`, set its loopback `_test` URI before dynamically importing Payload/config, run `seedGovernanceBase()` then `cleanupGovernanceFixtures(first)` twice, and query the exact dedupe keys from each returned snapshot with `overrideAccess: true`: the active form-submission and Review queue items must exist immediately after each seed and zero fixture queue documents may remain after each cleanup. Seed one unrelated sentinel Work Queue record through `overrideAccess: true` with exact data `{ dedupeKey: 'governance-sentinel:unrelated:system_issue:test', feature: 'maintenanceModes', firstOpenedAt: '2026-09-03T00:00:00.000Z', lastSyncedAt: '2026-09-03T00:00:00.000Z', priority: 'normal', queueType: 'system_issue', reasonCode: 'test', sourceCollection: 'governance-sentinel', sourceID: 'unrelated', sourceTitle: 'Unrelated queue sentinel', status: 'open', summary: 'Unrelated queue sentinel' }` through `overrideAccess: true` and require that exact ID still exists after both cycles, proving cleanup never broad-deletes; delete only that sentinel ID in the test's final teardown with `overrideAccess: true`.

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/e2e-config.int.spec.ts tests/int/governance-fixtures.int.spec.ts
```

Expected RED: the governance helper and runtime fixture test do not exist; after the file compiles, the exact lookup/delete assertions and repeated seed/cleanup sentinel assertion remain failing until the lifecycle below is implemented.

- [ ] **Step 2: Implement deterministic real-worker fixtures**

At the start of each public mutator (`seedGovernanceBase`, `cleanupGovernanceFixtures`, and `deleteGovernanceQueueItems`), execute:

```ts
const testDatabaseURI = getRequiredTestDatabaseURI()
process.env.MONGODB_URI = testDatabaseURI
const [{ getPayload }, { default: config }] = await Promise.all([
  import('payload'),
  import('../../src/payload.config.js'),
])
const payload = await getPayload({ config })
```

Use fixed values so a failed prior run is recoverable:

```ts
export const governanceAdmin = {
  email: 'governance-admin@example.test',
  password: 'governance-admin-password',
  role: 'admin' as const,
}
export const governanceSecondAdmin = {
  email: 'governance-second-admin@example.test',
  password: 'governance-second-admin-password',
  role: 'admin' as const,
}
export const accessManager = {
  email: 'governance-access-manager@example.test',
  password: 'governance-access-manager-password',
  role: 'siteManager' as const,
}
export const reviewManager = {
  email: 'governance-review-manager@example.test',
  password: 'governance-review-manager-password',
  role: 'siteManager' as const,
  features: { reviews: true },
}
export const governanceReview = {
  slug: 'governance-submitted-review',
  title: 'Governance submitted review',
}
```

`cleanupGovernanceFixtures` must preserve identifiers before deleting sources. With a supplied fixture snapshot, use its `queueSources`. Without one (startup/crash recovery), first find the Review by exact slug, retain its ID and `sourceSubmission` ID, then find the exact Form by slug and its submission by both Form ID and fixed `submittedAt`; do not delete anything yet. Build these exact source contracts with `buildWorkQueueDedupeKey`:

```ts
const queueSources: readonly GovernanceQueueSource[] = [
  {
    sourceCollection: 'form-submissions',
    sourceID: String(submission.id),
    dedupeKeys: [
      buildWorkQueueDedupeKey({
        queueType: 'follow_up',
        reasonCode: 'submission-new',
        sourceCollection: 'form-submissions',
        sourceID: String(submission.id),
      }),
      buildWorkQueueDedupeKey({
        queueType: 'follow_up',
        reasonCode: 'submission-in-review',
        sourceCollection: 'form-submissions',
        sourceID: String(submission.id),
      }),
    ],
  },
  {
    sourceCollection: 'reviews',
    sourceID: String(review.id),
    dedupeKeys: [
      buildWorkQueueDedupeKey({
        queueType: 'moderation',
        reasonCode: 'review-moderation-required',
        sourceCollection: 'reviews',
        sourceID: String(review.id),
      }),
    ],
  },
]
```

The public `deleteGovernanceQueueItems` runs the same database guard and dynamic Payload/config imports shown above, then delegates to the private with-Payload helper; `cleanupGovernanceFixtures` delegates to that same private helper after discovery so it does not weaken or duplicate the boundary. `seedGovernanceBase` completes its own guard/import first, invokes a private cleanup-with-Payload routine rather than recursively invoking a public mutator, and then seeds through that already-validated Payload instance. For each source/key pair, the private queue helper performs an exact `payload.find` using `limit: 1`, `overrideAccess: true`, and equality on all three fields. It deletes only each returned document ID with `overrideAccess: true`; it never calls collection delete with a `where`, and it ignores a missing exact match so partial cleanup remains idempotent. Complete all queue lookups/deletes successfully **before** deleting the exact Review or Form Submission, so a failure leaves the source IDs recoverable for retry. Then delete the exact Review, exact Form Submission and Form, exact Category, and finally the three non-bootstrap users. Delete the bootstrap Admin only if another active Admin exists, preserving the collection invariant; otherwise leave that exact fixture Admin for the next idempotent seed. Every call states `overrideAccess: true`; deletes use IDs returned by exact queries, never a broad unqualified delete.

After its private cleanup completes, `seedGovernanceBase` finds the exact `governanceAdmin` email and either updates that fixture account or creates it with `overrideAccess: true`; this makes recovery idempotent even when cleanup correctly retained the last Admin. It creates `reviewManager` through that Admin with `overrideAccess: false`, then creates one Category, one review-intent Form, one Form Submission, and one pending draft Review. Create the submitted Review through Payload with:

```ts
const category = await payload.create({
  collection: 'categories',
  data: { slug: 'governance-reviews', title: 'Governance Reviews' },
  overrideAccess: false,
  user: governanceAdminDocument,
})
const form = await payload.create({
  collection: 'forms',
  data: {
    fields: [{ label: 'Review', name: 'reviewBody', required: true, type: 'textarea' }],
    slug: 'governance-review-form',
    submissionIntent: 'review',
    submitButtonLabel: 'Submit review',
    successMessage: 'Review submitted.',
    title: 'Governance Review Form',
  },
  overrideAccess: false,
  user: governanceAdminDocument,
})
const submission = await payload.create({
  collection: 'form-submissions',
  data: {
    data: { reviewBody: 'A deterministic submitted Review awaiting moderation.' },
    form: form.id,
    submissionIntent: 'review',
    submittedAt: '2026-09-03T00:00:00.000Z',
  },
  overrideAccess: true,
})
```

Then create the Review with:

```ts
context: { trustedReviewPromotion: TRUSTED_REVIEW_PROMOTION_CONTEXT },
data: {
  _status: 'draft',
  categories: [category.id],
  isGenuineExperience: true,
  moderationStatus: 'pending',
  primaryCategory: category.id,
  rating: '5',
  reviewBody: 'A deterministic submitted Review awaiting moderation.',
  reviewerName: 'Governance Reviewer',
  reviewTitle: governanceReview.title,
  slug: governanceReview.slug,
  sourceSubmission: submission.id,
  title: governanceReview.title,
},
draft: true,
overrideAccess: false,
user: governanceAdminDocument,
```

Return string IDs and public-safe values only, including `queueSources` built from the created submission and Review IDs. After creation, verify the active `submission-new` and `review-moderation-required` keys each resolve to exactly one Work Queue item so a hook failure is surfaced at seed time; the dormant `submission-in-review` key remains in the cleanup contract for retry safety. Do not return raw Payload configuration, cookies, session tokens, or submission data.

- [ ] **Step 3: Write the failing access-governance journey**

In the first Playwright test, retain the `GovernanceFixture` returned by `seedGovernanceBase()` in `beforeEach` and pass it to `cleanupGovernanceFixtures(fixture)` in `afterEach`, so queue source IDs survive browser operations and assertion failures. Log in as `governanceAdmin` and open `/admin/collections/users/create`. Current `Users.ts` defines role as a Payload `select` with `Admin`/`Site Manager` options and default `siteManager`. In this installed Payload UI version, `SelectInput` renders the stable schema-path wrapper `id="field-role"`, but its `FieldLabel` `htmlFor` does not connect to the nested ReactSelect input; therefore the combobox has no accessible name and `getByRole('combobox', { name: 'Role' })` is invalid for this field.

Keep the general locator preference of role/name first, but use the verified field-wrapper boundary for this known Payload accessibility limitation. Make the following assertions at the start of the real journey as a focused rendered-UI preflight, then choose Admin:

```ts
const roleField = page.locator('#field-role')
await expect(roleField).toHaveCount(1)
const roleCombobox = roleField.getByRole('combobox')
await expect(roleCombobox).toHaveCount(1)
await roleCombobox.focus()
await roleCombobox.click()
const adminOption = page.getByRole('option', { name: 'Admin', exact: true })
await expect(adminOption).toHaveCount(1)
await expect(adminOption).toBeVisible()
await adminOption.click()
await expect(roleField.getByText('Admin', { exact: true })).toHaveCount(1)
await expect(roleField.getByText('Admin', { exact: true })).toBeVisible()
```

The wrapper-scoped visible `Admin` assertion is the control-value assertion; do not assert the searchable ReactSelect text input's transient value because it can be empty after option selection. `#field-role` is the stable Payload field-path wrapper verified for this schema, not a generated ReactSelect instance ID. Do not use ReactSelect IDs such as `react-select-*`, `.rs-*`, `.field-type`, CSS hashes, or `nth()`. If this preflight fails, inspect the rendered accessibility tree and installed Payload SelectInput implementation, update this explicit wrapper contract and its plan evidence, and keep the test failing until the real control is operable; do not fall back to arbitrary DOM traversal.

Fill the exact second-admin email/password and save with the accessible `Save` button while waiting for the successful `POST /api/users` response. Match the response by `new URL(response.url()).pathname === '/api/users'` plus request method `POST`, not by a substring. Require an OK response and use this exact persisted-record check:

```ts
const createdAdmin = (await createResponse.json()).doc
expect(createdAdmin.email).toBe(governanceSecondAdmin.email)
expect(createdAdmin.role).toBe('admin')
await page.waitForURL((url) =>
  url.pathname === `/admin/collections/users/${String(createdAdmin.id)}`,
)
const readBack = await page.request.get(`/api/users/${String(createdAdmin.id)}?depth=0`)
expect(readBack.status()).toBe(200)
expect(await readBack.json()).toMatchObject({
  email: governanceSecondAdmin.email,
  role: 'admin',
})
```

The visible wrapper-scoped control value, successful response, redirect, and authenticated read-back are the save confirmation; do not proceed to create the Site Manager or rely on this account for last-admin-safe cleanup until all four pass. Repeat the user creation screen for `accessManager`, explicitly select `Site Manager` through the same `#field-role` wrapper plus role-option contract, assert the wrapper-scoped visible value, check `input[name="features.pages"]`, and save.

Open a fresh browser context, log in as `accessManager`, and assert:

```ts
await expect(managerPage.getByRole('link', { name: 'Pages', exact: true })).toBeVisible()
await expect(managerPage.getByRole('link', { name: 'Articles', exact: true })).toHaveCount(0)
await managerPage.goto('/admin/collections/articles')
await expect(managerPage.getByRole('heading', { name: 'Articles' })).toHaveCount(0)
expect((await managerPage.request.get('/api/articles?limit=1')).status()).toBe(403)
```

As the Admin, edit the exact Site Manager, clear `features.pages`, set `features.reviews`, and save. The prior manager session must become unusable because `normalizeUserAccessFields` clears sessions. Assert its next `/admin` navigation reaches `/admin/login`, then log in again and prove Reviews is visible, Pages is absent, `/admin/collections/pages` does not render the Pages list, `/api/pages?limit=1` returns `403`, and `/api/reviews?limit=1` does not return `403`.

Run only this test:

```bash
pnpm exec playwright test --config=playwright.config.ts tests/e2e/governance.e2e.spec.ts --grep "Admin grants and revokes"
```

Expected RED: the journey file and governance helper are new; after they compile, any selector or session invalidation mismatch remains a real runtime failure to correct rather than bypass with a source assertion.

- [ ] **Step 4: Write the failing submitted-Review moderation journey**

In the second test, first request `/reviews/governance-submitted-review` without authentication and require `404`. Log in as `reviewManager`, assert the Reviews navigation is visible and Users is absent, open the exact Review edit URL returned by `seedGovernanceBase`, choose `Approved` for `moderationStatus`, and use the Admin form's `Save` action. Wait for the save confirmation and assert the `_status` control reports `Published`.

Open a fresh anonymous context, navigate to `/reviews/governance-submitted-review`, and assert status `200` plus the heading `Governance submitted review` and body `A deterministic submitted Review awaiting moderation.`. This proves the public collection policy changed only after the authorized browser moderation operation.

Run only this test:

```bash
pnpm exec playwright test --config=playwright.config.ts tests/e2e/governance.e2e.spec.ts --grep "approves a submitted Review"
```

Expected RED until the Admin selectors and deterministic fixture lifecycle exercise the real application successfully. Do not substitute direct helper approval for the browser save.

- [ ] **Step 5: Make both journeys GREEN and protect the worker boundary**

Use Playwright locators in this order: accessible role/name, associated label, then stable Payload field `name`. Do not use generated CSS hashes, `nth()` for governance controls, fixed sleeps, stored cookies, or a reused development server. Preserve `workers: 1` and `reuseExistingServer: false` in `playwright.config.ts`.

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/e2e-config.int.spec.ts tests/int/governance-fixtures.int.spec.ts tests/int/user-feature-administration.int.spec.ts tests/int/feature-access-matrix.int.spec.ts tests/int/review-moderation.int.spec.ts tests/int/public-review-access.int.spec.ts
pnpm exec playwright test --config=playwright.config.ts tests/e2e/governance.e2e.spec.ts
```

Expected GREEN: all focused Vitest assertions pass, including two complete fixture cycles with both exact queue side effects removed and the unrelated sentinel retained; Playwright reports exactly two passed Chromium tests; both `afterEach` cleanups complete even if an assertion fails.

- [ ] **Step 6: Commit Task 2**

```bash
git add tests/helpers/governanceFixtures.ts tests/e2e/governance.e2e.spec.ts tests/int/e2e-config.int.spec.ts tests/int/governance-fixtures.int.spec.ts
git commit -m "test(governance): cover critical admin flows"
```

---

### Task 3: Wire the complete single-job gate and prove fail-closed cleanup

**Files:**

- Modify: `package.json`
- Modify: `.github/workflows/quality.yml`
- Modify: `tests/int/quality-workflow.int.spec.ts`
- Modify: `tests/int/ci-mongodb-replica.int.spec.ts`

**Interfaces:**

- Produces `test:e2e:governance`, exactly `cross-env NODE_OPTIONS="--no-deprecation --conditions=react-server --import=tsx/esm" playwright test --config=playwright.config.ts tests/e2e/governance.e2e.spec.ts`.
- Produces one ordered `verify` run chain with no other jobs: frozen install; `audit:prod`; replica start; `generate:types`; `generate:importmap`; combined drift check; TypeScript; lint; `test:int`; `test:e2e:governance`; `build`; unconditional replica stop.
- Consumes the Task 1 controller and Safe CI Environment Contract and the Task 2 two-test file.

- [ ] **Step 1: Tighten the workflow test to the final mandatory command list**

Replace the prior run-command expectation with this exact sequence:

```ts
expect(runCommands).toEqual([
  'pnpm install --frozen-lockfile',
  'pnpm audit:prod',
  'pnpm ci:mongodb:start',
  'pnpm generate:types',
  'pnpm generate:importmap',
  "git diff --exit-code -- src/payload-types.ts 'src/app/(payload)/admin/importMap.js'",
  'pnpm exec tsc --noEmit',
  'pnpm lint',
  'pnpm test:int',
  'pnpm test:e2e:governance',
  'pnpm build',
  'pnpm ci:mongodb:stop',
])
```

Also assert the step names map one-to-one to these commands, the stop step has `if: always()`, no earlier step uses `continue-on-error`, and the source excludes:

```ts
for (const forbidden of [
  'project-context:check',
  'project-context:update',
  'dependency-review-action',
  'gitleaks',
  'trufflehog',
  'verify:docker-image',
  'pnpm audit --prod',
  '.env.atlas.local',
  'cat .env',
  'source .env',
  'secrets.',
]) {
  expect(source).not.toContain(forbidden)
}
```

Assert `generate:importmap` precedes the single combined drift command and that `test:e2e:governance` is the only Playwright command. Assert `package.json` maps that script to only `tests/e2e/governance.e2e.spec.ts`.

- [ ] **Step 2: Run the workflow test and capture RED**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/quality-workflow.int.spec.ts
```

Expected: FAIL because import-map generation/drift and the focused Playwright command are not yet in the workflow or package scripts.

- [ ] **Step 3: Add the focused package command and final ordered gates**

Add `test:e2e:governance` exactly as defined in Interfaces. In `.github/workflows/quality.yml`, use named steps and add:

```yaml
- name: Generate Payload types
  run: pnpm generate:types
- name: Generate Payload Admin import map
  run: pnpm generate:importmap
- name: Reject generated artifact drift
  run: git diff --exit-code -- src/payload-types.ts 'src/app/(payload)/admin/importMap.js'
```

After the complete integration suite, add:

```yaml
- name: Run critical governance journeys
  run: pnpm test:e2e:governance
- name: Build the Vercel production application
  run: pnpm build
```

Do not run `tests/e2e/admin.e2e.spec.ts`, `frontend.e2e.spec.ts`, or `calendar.e2e.spec.ts` in GitHub CI. They remain available through the full local `pnpm test:e2e` command.

- [ ] **Step 4: Prove environment and cleanup failure paths**

Extend `tests/int/ci-mongodb-replica.int.spec.ts` so every start failure after `docker run`—init error, readiness timeout, wrong MongoDB version, non-primary state, or malformed replica membership—expects owner inspection followed by exact-container removal. Add a changed-owner case that expects cleanup refusal and a sanitized error without fake Docker stdout/stderr.

Extend the workflow test to prove the cleanup step is last and unconditional, the job contains no GitHub `environment`, `secrets`, `services`, or write permission, and the complete Safe CI Environment Contract has exactly the fixed keys/values from this plan. Parse both Mongo URIs with `assertSafeTestDatabaseURI`. Assert no workflow step reads a repository environment file.

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/quality-workflow.int.spec.ts tests/int/ci-mongodb-replica.int.spec.ts tests/int/e2e-config.int.spec.ts tests/int/test-database-safety.int.spec.ts
```

Expected GREEN: all workflow, unsafe-environment, partial-start cleanup, changed-owner refusal, and test-URI assertions pass.

- [ ] **Step 5: Exercise the final chain locally against the existing safe replica contract**

First confirm the ordinary E2E prerequisite is already available without starting or changing a developer/default project: MongoDB 8.0.29 at the committed loopback `test.env` URI must report writable `rs0` primary. If it is absent, record an environment blocker and provision that local prerequisite through the repository's documented operator workflow outside this task; do not forge GitHub markers or redirect the CI controller.

Run config-loading commands only from a temporary tracked-files workspace. This copies the current tracked working files, never copies ignored/untracked environment files, and links the already-frozen installed dependencies:

```bash
repository_root=$(pwd -P)
verification_root=$(mktemp -d "${TMPDIR:-/tmp}/payload-delivery-verify.XXXXXX")
case "$verification_root" in
  "${TMPDIR:-/tmp}"/payload-delivery-verify.*) ;;
  *) exit 1 ;;
esac
cleanup_verification_root() { rm -rf -- "$verification_root"; }
trap cleanup_verification_root EXIT INT TERM
git ls-files -z | tar --null --files-from=- -cf - | tar -xf - -C "$verification_root"
ln -s "$repository_root/node_modules" "$verification_root/node_modules"
```

Then run:

```bash
pnpm verify:docker-local
pnpm --dir "$verification_root" generate:types
pnpm --dir "$verification_root" generate:importmap
cmp --silent src/payload-types.ts "$verification_root/src/payload-types.ts"
cmp --silent 'src/app/(payload)/admin/importMap.js' "$verification_root/src/app/(payload)/admin/importMap.js"
pnpm --dir "$verification_root" exec tsc --noEmit
pnpm --dir "$verification_root" lint
pnpm --dir "$verification_root" test:int
pnpm --dir "$verification_root" test:e2e:governance
pnpm --dir "$verification_root" audit:prod
```

Expected: the pre-existing documented E2E replica serves only the committed loopback `_test` database; the isolated local transaction verifier separately passes and cleans its owned Docker resources; both generated artifacts are unchanged; static checks, all integration tests, the two critical browser journeys, and the authoritative audit gate pass. Do not run `ci:mongodb:start` locally by forging GitHub environment variables.

The Node 22 production-build proof and exact final chain run in the GitHub `verify` job after this commit. Task 4 also runs the host Vercel build from the clean tracked-files workspace on Node 22 and uses the isolated Docker image verifier as separate local portability evidence; neither operation converts the Docker verifier into a GitHub gate.

- [ ] **Step 6: Commit Task 3**

```bash
git add .github/workflows/quality.yml package.json tests/int/quality-workflow.int.spec.ts tests/int/ci-mongodb-replica.int.spec.ts
git commit -m "ci: require critical delivery gates"
```

---

### Task 4: Verify the phase and synchronize delivery documentation

**Files:**

- Modify: `docs/adr/0004-dependency-and-runtime-baseline.md`
- Modify: `docs/architecture/feature-inventory.md`
- Modify: `docs/operations/developer-workflows.md`
- Modify: `docs/operations/runtime-and-providers.md`
- Modify when behavior changes: `.agents/skills/project-context/references/architecture.md`
- Modify when generated facts change: `.agents/skills/project-context/references/project-inventory.json`
- Review without rewriting: `docs/superpowers/specs/2026-09-03-industry-standard-hardening-design.md`

**Interfaces:**

- Maintained docs describe the one mandatory job, exact MongoDB 8.0.29 CI replica, two critical governance journeys, both generated drift checks, Node 22 Vercel build, unconditional current-run cleanup, local-only project-context maintenance, and local/release-only Docker image portability gate.
- ADR 0004 replaces its completed Verification and Delivery handoff language with the accepted final boundary and records the latest rulings as deliberate supersessions of its earlier optional-job handoff.
- Project-context update may change only generated facts implied by Tasks 1–3; no historical plan/spec is rewritten.

- [ ] **Step 1: Audit the cumulative phase against source and the change-impact map**

Record the implementation baseline from `progress.md`, then run:

```bash
git diff --stat 9e59e0143a778cdd6f505fb3a4a131ecdf533bd0..HEAD
git diff 9e59e0143a778cdd6f505fb3a4a131ecdf533bd0..HEAD -- .github/workflows/quality.yml package.json scripts tests/e2e tests/helpers tests/int
git diff --check
```

Inspect the workflow, package scripts, controller, Playwright config, `test.env`, governance helpers/journeys, Users/feature/Review policy, Docker verifier, ADR 0002, ADR 0004, and all maintained delivery docs together. Confirm the final workflow contains no project-context, dependency-review, secret-scan, Docker-image, live-service, Atlas, or production-secret operation.

- [ ] **Step 2: Update maintained architecture and operator guidance**

In `docs/operations/developer-workflows.md`, document `pnpm test:e2e:governance`, `pnpm ci:mongodb:start`, and `pnpm ci:mongodb:stop`; mark the last two as GitHub-only controller commands that reject forged/non-GitHub use. State that full local E2E still runs all browser files while CI runs exactly the critical governance file.

In `docs/operations/runtime-and-providers.md` and `docs/architecture/feature-inventory.md`, replace the standalone-CI exception with the exact 8.0.29 writable one-member replica, loopback `_test` database, generated type/import-map drift, full integration suite, two governance journeys, Node 22 Vercel build, and unconditional labeled-container cleanup. State that no production secret or environment file is used.

Preserve the existing Docker verifier safety instructions. Add one clear sentence: `pnpm verify:docker-image` is a documented local/release portability and build-secret inspection gate, not a GitHub Actions job, because the supported production delivery path is Vercel.

In ADR 0004, replace the deferred Verification and Delivery paragraph and current CI exception with the accepted one-job contract. Under rejected alternatives, add separate dependency-review/secret-scan jobs, a Docker-image CI job, a mutable action tag, standalone MongoDB, reusing the developer/default Compose project, and loading repository environment files. Under consequences, state that GitHub-hosted Docker is required for the ephemeral CI replica, the browser gate is intentionally critical-path rather than the full E2E suite, and external platform controls remain operator responsibilities.

- [ ] **Step 3: Run the complete phase verification**

Confirm the same read-only E2E replica prerequisite described in Task 3. Select Node 22 and fail before verification unless `node -p "process.versions.node"` satisfies `>=22.13.0 <23`. Recreate the exact temporary tracked-files workspace from Task 3 so ignored/untracked `.env` and `.env.atlas.local` cannot enter the command working directory. Then run in this order:

```bash
repository_root=$(pwd -P)
verification_root=$(mktemp -d "${TMPDIR:-/tmp}/payload-delivery-final.XXXXXX")
case "$verification_root" in
  "${TMPDIR:-/tmp}"/payload-delivery-final.*) ;;
  *) exit 1 ;;
esac
cleanup_verification_root() { rm -rf -- "$verification_root"; }
trap cleanup_verification_root EXIT INT TERM
git ls-files -z | tar --null --files-from=- -cf - | tar -xf - -C "$verification_root"
ln -s "$repository_root/node_modules" "$verification_root/node_modules"
```

Run:

```bash
pnpm install --frozen-lockfile
pnpm --dir "$verification_root" audit:prod
pnpm --dir "$verification_root" generate:types
pnpm --dir "$verification_root" generate:importmap
cmp --silent src/payload-types.ts "$verification_root/src/payload-types.ts"
cmp --silent 'src/app/(payload)/admin/importMap.js' "$verification_root/src/app/(payload)/admin/importMap.js"
pnpm --dir "$verification_root" exec tsc --noEmit
pnpm --dir "$verification_root" lint
pnpm --dir "$verification_root" test:int
pnpm --dir "$verification_root" test:e2e:governance
pnpm --dir "$verification_root" build
docker compose config --quiet --no-interpolate --no-env-resolution
pnpm verify:docker-local
pnpm verify:docker-image
```

Expected: frozen install and audit pass; generated files match the committed artifacts byte-for-byte; TypeScript, lint, all integration tests, exactly two governance browser tests, and the Node 22 Vercel production build pass from a working directory that contains neither repository environment file; Compose validates without environment resolution; both ownership-checked local Docker verifiers pass and remove their fixed project/network/image/builder/container/volume/lock resources. The image verifier separately proves production-container portability and no persisted build secrets, but remains outside GitHub CI.

Also inspect `.github/workflows/quality.yml` and record that the next pull request or protected-branch run must show exactly one successful required check named `verify`, including its Node 22 `pnpm build` step and final Mongo cleanup. Do not trigger, approve, rerun, or configure GitHub from this repository-only phase.

- [ ] **Step 4: Synchronize project context locally**

Run:

```bash
pnpm project-context:update
pnpm project-context:check
```

Expected: update refreshes the package-script/test inventory and architecture facts if needed; check prints `Project context is current.`. Review `.agents/skills/project-context/references/change-impact-map.md` again against the final diff. Commit generated inventory only when the update changed it; update `architecture.md` only when the final runtime/verification ownership contract is not already accurate.

- [ ] **Step 5: Scan final scope and rollback readiness**

Run:

```bash
rg -n "project-context:(check|update)|dependency-review-action|gitleaks|trufflehog|verify:docker-image|pnpm audit --prod|\.env\.atlas\.local|source \.env|cat \.env|secrets\." .github/workflows
rg -n "uses: .*@(main|master|v[0-9]+)([[:space:]]|$)" .github/workflows
git diff --check
git status --short
```

Expected: both workflow scans return no matches; diff check passes; status contains only the reviewed Task 4 documentation/context files. Re-run the action-reference regex test rather than manually accepting an abbreviated SHA.

Rollback is repository-only: revert Tasks 3, 2, and 1 in reverse order, then revert Task 4 documentation/context changes; never run generic Docker pruning or delete a default/developer Compose project. If an interrupted GitHub run leaves the exact CI container, verify its `com.payloadcms.hardening.ci-owner` label matches that run before removing only that named container. Keep the prior mandatory workflow until the complete rollback passes `tests/int/quality-workflow.int.spec.ts`, `tests/int/e2e-config.int.spec.ts`, TypeScript, lint, and `pnpm test:int`. No data migration or external rollback is required because all phase data is ephemeral loopback `_test` data.

- [ ] **Step 6: Commit Task 4**

```bash
git add docs/adr/0004-dependency-and-runtime-baseline.md docs/architecture/feature-inventory.md docs/operations/developer-workflows.md docs/operations/runtime-and-providers.md .agents/skills/project-context/references/architecture.md .agents/skills/project-context/references/project-inventory.json
git commit -m "docs(ci): record delivery gate contract"
```

Before committing, omit any listed project-context file that is unchanged. After the commit, run the required whole-phase review from the recorded implementation baseline through `HEAD`; corrections use focused conventional commits and receive both review stages again.

## Final Acceptance

- One and only one GitHub job, `verify`, is mandatory on pull requests and pushes to `develop`/`main`.
- All three setup actions use validated official 40-hex `v4` refs with `# v4` comments; no mutable action ref remains.
- Top-level permissions remain `contents: read`; the job has no environment, production secret, optional scan, duplicate audit, or live-service access.
- The exact ordered chain includes frozen install, `audit:prod`, both Payload generators and combined drift, TypeScript, lint, all integration tests, only the two governance journeys, and a supported Node 22 Vercel production build.
- Exact MongoDB 8.0.29 is a writable one-node `rs0` for CI database gates; memory replica tests are pinned to 8.0.29; all mutation URIs are loopback `_test` targets.
- Every controller start failure cleans only its current labeled container, and the workflow cleanup step runs last with `if: always()`.
- Browser runtime proves Admin account creation, Site Manager grant/revoke with session invalidation, sidebar visibility, direct UI/REST denial, submitted-Review approval, and public visibility only after approval.
- `project-context:check` remains available locally and absent from CI.
- `pnpm verify:docker-image` remains documented and passing as a local/release portability gate, never as a GitHub job.
- Maintained docs and ADR 0004 match source; the final cumulative review has no unresolved Critical or Important finding; nothing was pushed or deployed.
