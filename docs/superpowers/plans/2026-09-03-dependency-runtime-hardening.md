# Dependency and Runtime Baseline Implementation Plan

> **Execution:** Use subagent-driven development. Run tasks strictly in order because Tasks 1–4 all modify `package.json` and `pnpm-lock.yaml`. Every task requires a fresh implementation agent, an independent review, and a clean local commit. Do not push, deploy, or modify any live service.

After every implementation task, run `pnpm project-context:update`, inspect and commit the generated inventory change when present, update routed narrative context only when behavior changed, and require `pnpm project-context:check` to pass before review.

**Goal:** Remove unexcepted high/critical production dependency findings, align the repository on Node 22 and pnpm 11.17.0, and make local Docker/Mongo deterministic and transaction-capable.

**Architecture:** Compatibility-sensitive packages move in isolated groups so regressions can be attributed and reviewed. A checked-in audit policy distinguishes a clean dependency tree from a temporary, owner-and-expiry-bound exception. Docker Compose uses the same toolchain as the manifest and runs MongoDB as a loopback-published single-node replica set without touching the developer's default project during verification.

**Approved targets:** Next.js family `16.3.4`; Payload family `3.88.0`; `sharp` `0.35.4`; `postcss` `8.5.26`; Node `22.17.0` / supported engine `>=22.13.0 <23`; pnpm `11.17.0`. Registry inspection confirmed these versions and peer ranges are compatible with React `19.2.7`, GraphQL `16`, ESLint `9`, and each other.

**Baseline:** `pnpm audit --prod --json` reports 0 critical, 21 high, 26 moderate, and 4 low findings. Known high paths include Next, Sharp, PostCSS/Nanoid, Payload transitives (`fast-uri`, `image-size`, `undici`), `js-yaml`, and Browserslist. The audit-closure task must inspect the post-upgrade graph rather than assuming parent upgrades removed every lockfile resolution.

**Phase baseline:** Before Task 1, record `git rev-parse HEAD` in the execution ledger. Every phase-wide inspection uses `git diff <phase-baseline>..HEAD` plus the working tree; an ordinary unqualified `git diff` is not a complete committed-phase review.

**Tool execution:** Before every lockfile-changing command, activate the declared package manager with `corepack prepare pnpm@11.17.0 --activate` and record `node --version` plus `pnpm --version`. The checked-in contract remains Node 22 even if the controller host uses a newer Node for orchestration.

**Safe config-loading environment:** Payload generators and production builds receive a complete process-local configuration rather than inheriting the developer `.env`:

```bash
env \
  MONGODB_URI=mongodb://127.0.0.1:27017/payload-cms-starter-kit_build_test?replicaSet=rs0\&directConnection=true \
  PAYLOAD_SECRET=build-only-payload-secret-32-characters \
  NEXT_PUBLIC_SERVER_URL=https://example.test \
  EMAIL_PROVIDER=none \
  RESEND_OVERRIDE_TO_EMAIL= \
  ALLOW_FIRST_ADMIN_CREATION=false \
  FIRST_ADMIN_EMAIL= \
  ALLOW_PRODUCTION_EMAIL_OVERRIDE=false \
  MEDIA_RECONCILE_TOKEN= \
  MEDIA_PROVIDER=localDisk \
  VERCEL= \
  <command>
```

The database URI is test-only and must resolve to the isolated local replica set when a command reads data. Never put production credentials in a build argument, log, report, or image layer.

---

## Task 1: Pin repository metadata and the supported toolchain

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `.nvmrc`
- Modify: `README.md`
- Modify: `docs/operations/runtime-and-providers.md`
- Modify: `.github/workflows/quality.yml` only for Node/pnpm versions
- Modify: `tests/int/runtime-import-boundary.int.spec.ts`
- Create: `tests/int/toolchain-contract.int.spec.ts`

**Interfaces:**

- `package.json.private === true`.
- `package.json.license === "UNLICENSED"`.
- `package.json.packageManager === "pnpm@11.17.0"`.
- `engines.node === ">=22.13.0 <23"` and `engines.pnpm === "11.17.0"`.
- `.nvmrc`, Docker, current CI setup, and maintained documentation identify Node `22.17.0` and pnpm `11.17.0`.

1. Add failing contract tests for package metadata, the exact package-manager pin, the supported Node 22 range, `.nvmrc`, README/runtime documentation, and current workflow setup versions. Do not assert future action-SHA or CI-job behavior in this phase.
2. Run:

   ```bash
   pnpm exec vitest run --config ./vitest.config.mts tests/int/runtime-import-boundary.int.spec.ts tests/int/toolchain-contract.int.spec.ts
   ```

   Expected: FAIL on the missing private/packageManager fields, MIT license claim, broad pnpm engine, Node range, and absent `.nvmrc`.

3. Update the manifest and maintained setup documentation. Change only the workflow's Node/pnpm setup values; action pinning belongs to the Verification and Delivery phase.
4. Regenerate the lockfile with pnpm `11.17.0`. The controller environment may run a newer Node; do not weaken the checked-in Node 22 contract to silence a local engine warning.
5. Run a frozen install, focused tests, TypeScript, and diff checks.
6. Commit:

   ```text
   chore(toolchain): pin supported runtime
   ```

   The body explains the Node 22-only and private/unlicensed package contract.

---

## Task 2: Upgrade the Next.js compatibility group atomically

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `tests/int/dependency-version-contract.int.spec.ts`

**Interfaces:**

- `next`, `@next/third-parties`, and `eslint-config-next` are all exact `16.3.4`.
- React and unrelated packages do not move in this task.

1. Add a failing version-contract assertion requiring the three exact versions and rejecting mixed Next-family versions.
2. Capture the relevant pre-upgrade audit entry without committing generated audit output or environment data.
3. Upgrade only the Next group with pnpm `11.17.0`; inspect the lockfile and peer warnings before proceeding.
4. Run:

   ```bash
   pnpm exec vitest run --config ./vitest.config.mts tests/int/dependency-version-contract.int.spec.ts tests/int/frontend-layout-cache.int.spec.ts tests/int/hero-banner-preload.int.spec.tsx tests/int/seo-contract.int.spec.ts tests/int/docker-standalone.int.spec.ts
   pnpm exec tsc --noEmit
   pnpm lint
   # Run `pnpm build` under the complete Safe config-loading environment above.
   ```

   Do not shorten the safe environment to only `NEXT_PUBLIC_SERVER_URL`; runtime initialization also requires a test MongoDB URI and build-only Payload secret.

5. Confirm `pnpm why next @next/third-parties eslint-config-next` resolves the approved group and no second direct version exists.
6. Commit:

   ```text
   fix(deps): upgrade Next package family
   ```

---

## Task 3: Upgrade the complete Payload compatibility group atomically

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify only if generated: `src/payload-types.ts`
- Modify only if generated: `src/app/(payload)/admin/importMap.js`
- Modify: `tests/int/dependency-version-contract.int.spec.ts`

**Interfaces:**

- `payload` and every direct `@payloadcms/*` dependency are exact `3.88.0`.
- Existing server-only CLI conditions, collection registrations, access rules, hooks, providers, and generated artifacts remain valid.

1. Extend the version contract so it enumerates every direct Payload-family dependency and fails if one differs.
2. Upgrade `payload`, `@payloadcms/db-mongodb`, `@payloadcms/email-resend`, `@payloadcms/live-preview-react`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-s3`, and `@payloadcms/ui` together.
3. Inspect peer warnings and the lockfile. Do not add an override merely to silence an optional peer warning.
4. Run:

   ```bash
   # Run both generators under the complete Safe config-loading environment above.
   pnpm generate:types
   pnpm generate:importmap
   pnpm exec vitest run --config ./vitest.config.mts tests/int/dependency-version-contract.int.spec.ts tests/int/payload-security-config.int.spec.ts tests/int/public-review-access.int.spec.ts tests/int/user-feature-administration.int.spec.ts tests/int/media.int.spec.ts tests/int/provider-selection.int.spec.ts tests/int/runtime-import-boundary.int.spec.ts
   pnpm exec tsc --noEmit
   pnpm test:int
   ```

5. Review any generated diff as a Payload upgrade artifact. If neither file changes, prove that with a clean generated-drift check.
6. Commit:

   ```text
   fix(deps): upgrade Payload package family
   ```

---

## Task 4: Patch independent packages and enforce the production audit policy

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/domains/governance/dependencyAudit.ts`
- Create: `scripts/audit-production-dependencies.ts`
- Create: `security/dependency-audit-exceptions.schema.json`
- Create: `security/dependency-audit-exceptions.json`
- Create: `tests/int/dependency-audit-policy.int.spec.ts`
- Modify: `tests/int/dependency-version-contract.int.spec.ts`
- Create: `docs/operations/dependency-management.md`

**Interfaces:**

- Direct `sharp` is exact `0.35.4`; direct `postcss` is exact `8.5.26`.
- `pnpm audit:prod` uses `tsx` to run the TypeScript CLI, which invokes `pnpm audit --prod --json`; it is the sole pass/fail audit gate.
- The CLI treats raw audit exit `0` as a clean report and exit `1` as parseable advisory data. Any other exit code, signal, empty output, or malformed/unsupported JSON is an audit-execution failure.
- The exception document is `{ "schemaVersion": 1, "exceptions": [...] }`. Each entry has exactly: `advisoryId`, `packageName`, `vulnerableRange`, `installedVersions`, `reachability`, `mitigation`, `owner`, `createdAt`, and `expiresAt`.
- A high/critical advisory fails unless exactly one checked-in exception matches its advisory ID, package, vulnerable range, and every affected installed version. Entries require non-empty reachability and mitigation, an explicit owner, unique advisory/package identity, ISO calendar dates, `expiresAt >= createdAt`, and `expiresAt - createdAt <= 30 days`.
- Expired, malformed, unknown-field, duplicate, ambiguous, unused, or overly broad exceptions fail policy validation. The initial exception list is empty unless the controller approves a demonstrated unavoidable residual advisory.

1. Write failing pure-policy tests using fixtures shaped exactly like pnpm 11 audit JSON. Cover: clean exit/report, parseable exit 1, non-1 execution failure, malformed/unsupported JSON, unexcepted high/critical, moderate-only reports, exact matching exception, wrong package/range/version, duplicate/ambiguous entries, unknown fields, missing rationale/mitigation/owner, expiry beyond 30 days, expired entry, and stale unused exception.
2. Pin Sharp/PostCSS and refresh the lockfile. Run `pnpm why` for `fast-uri`, `js-yaml`, `browserslist`, `nanoid`, `undici`, `image-size`, `sharp`, and `postcss`.
3. Prefer parent upgrades and targeted lockfile refreshes. Do not add `pnpm.overrides` or a risk exception without a ledger ruling that records reachability, mitigation, owner, and expiry.
4. Implement the audit parser as pure domain logic and validate the checked-in document against the JSON schema. The `tsx` CLI may print advisory IDs, package names, severity, and the exception reason; it must not print dependency paths containing repository environment values, repository secrets, or submitted data.
5. Run:

   ```bash
   pnpm exec vitest run --config ./vitest.config.mts tests/int/dependency-version-contract.int.spec.ts tests/int/dependency-audit-policy.int.spec.ts
   pnpm audit:prod
   pnpm exec tsc --noEmit
   pnpm test:int
   ```

   First run raw `pnpm audit --prod --json` as diagnostic input and record its severity counts; its exit code is not a second gate when an approved exception exists. `pnpm audit:prod` is authoritative and must pass with zero unexcepted high/critical findings. Moderate/low findings remain visible but do not fail this gate.

6. Commit:

   ```text
   fix(deps): close production audit findings
   ```

   The body records the before/after severity counts and whether the exception manifest is empty.

---

## Task 5: Make Docker and local Mongo deterministic and transaction-capable

**Files:**

- Modify: `package.json`
- Modify: `Dockerfile`
- Modify: `docker-compose.yml`
- Modify: `.env.example`
- Modify: `test.env`
- Modify: `playwright.config.ts`
- Modify: `README.md`
- Modify: `docs/operations/runtime-and-providers.md`
- Modify: `docs/operations/developer-workflows.md`
- Modify: `docs/operations/mongodb-deployment.md`
- Modify: `docs/operations/editorial-governance.md`
- Modify: `docs/adr/0002-test-database-isolation.md`
- Modify: `tests/int/docker-standalone.int.spec.ts`
- Create: `tests/int/docker-compose-contract.int.spec.ts`
- Create: `tests/int/compose-payload-transaction.int.spec.ts`
- Modify: `tests/int/e2e-config.int.spec.ts`
- Modify: `tests/int/mongodb-uri-contract.int.spec.ts`
- Modify: `tests/int/starter-productization.int.spec.ts`
- Create: `scripts/verify-local-compose.ts`
- Create: `scripts/verify-production-image.ts`

**Interfaces:**

- Docker build stages and Compose use Node `22.17.0` and pnpm `11.17.0`; no `pnpm@latest` or alternate package-manager branch remains.
- Dependency installation is frozen.
- MongoDB is exact `8.0.29`, publishes only `127.0.0.1:27017`, starts `rs0`, and becomes healthy only as a writable primary.
- The application uses `mongodb://mongo:27017/payload-cms-starter-kit?replicaSet=rs0&directConnection=true` in Compose and waits for `service_healthy`.
- Host-run documentation uses `mongodb://127.0.0.1:27017/<db>?replicaSet=rs0&directConnection=true`.
- `test.env` and Playwright use `mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0&directConnection=true`; every static URI contract and ADR uses the same host-discovery rule.
- Docker's build stage accepts `NEXT_PUBLIC_SERVER_URL` only as a public build argument and consumes server-only build configuration from a required BuildKit secret mount. No Mongo URI, Payload secret, provider secret, or token is an `ARG`, image `ENV`, copied file, or runner-layer value.
- `pnpm verify:docker-image` owns an isolated `payload_hardening_verify` Compose project, the exact `payload_hardening_verify_default` network, an OS-temporary BuildKit secret file, the fixed image tag `payload-cms-starter-kit:hardening-verify`, inspection, and finally-style cleanup.
- The image verifier refuses to start if `payload-cms-starter-kit:hardening-verify` already exists; it never overwrites or deletes an image it did not create during the current run.

1. Add failing static contract tests for exact images/toolchain, frozen install, absence of `pnpm@latest`, loopback port binding, replica-set command, primary healthcheck, conditional dependency, all host/container/test URI contracts, BuildKit secret handling, and absence of secret build arguments/image environment.
2. Simplify the production Dockerfile to the repository's sole supported pnpm workflow. Retain the non-root standalone runner and `.dockerignore` guarantees. Add `# syntax=docker/dockerfile:1.7`, a public `NEXT_PUBLIC_SERVER_URL` build argument, and a required `payload_build_env` secret mount used only by the build `RUN`; document the non-secret, isolated build-env file format. Do not copy or persist that secret into the runner image.
3. Configure Compose Mongo as a single-node replica set. The healthcheck may idempotently initiate `rs0`, but it must distinguish an initialized non-primary node from a healthy writable primary.
4. Update maintained setup/runbook guidance, including replica-set diagnosis and the fact that `depends_on` protects initial startup order rather than later database outages.
5. Update `.env.example`, `test.env`, Playwright, ADR 0002, editorial/migration/setup guidance, and exact URI contract assertions together. The Compose member advertises `mongo:27017`; every host URI therefore requires `directConnection=true`.
6. Implement `scripts/verify-local-compose.ts` with the hard-coded project name `payload_hardening_verify`. It must run cleanup in `finally`, refuse a different project name, use a bounded timeout, and never print resolved Compose environment. Add a package script `verify:docker-local` for it. Implement `scripts/verify-production-image.ts` with the same fixed project/network and cleanup rules; before any mutation it fails if the fixed image tag already exists, and it removes the image only when this run created it. It writes the build-only environment to an OS-temporary directory with owner-only permissions, never logs it, and removes the file/directory in `finally`.
7. Run static tests and validate Compose without emitting `.env` contents:

   ```bash
   docker compose config --quiet --no-interpolate --no-env-resolution
   ```

   If the installed Compose lacks either no-resolution option, use `config --quiet` with a generated non-secret environment fixture and record the version-specific fallback; never capture rendered configuration in the report.

8. If Docker is available, verify without touching the developer's default Compose project or volume. The script executes the equivalent of:

   ```bash
   docker compose -p payload_hardening_verify up -d --wait --wait-timeout 90 mongo
   docker compose -p payload_hardening_verify ps
   docker compose -p payload_hardening_verify exec -T mongo mongosh --quiet --eval 'const ok = db.adminCommand({ ping: 1 }).ok === 1 && rs.status().myState === 1; quit(ok ? 0 : 1)'
   COMPOSE_TEST_MONGODB_URI='mongodb://127.0.0.1:27017/payload-hardening-compose_test?replicaSet=rs0&directConnection=true' pnpm exec vitest run --config ./vitest.config.mts tests/int/compose-payload-transaction.int.spec.ts
   ```

   The `finally` cleanup is exactly `docker compose -p payload_hardening_verify down --volumes --remove-orphans`. Before executing it, assert the project constant is exactly `payload_hardening_verify`. Never run cleanup against the default project.

9. The opt-in Compose test must fail when its explicit `_test` URI is missing during `verify:docker-local`, initialize Payload against that URI, exercise a nested request-aware transaction, clean up only its test records, and prove the replica remains writable. A normal `pnpm test:int` may skip this one external-stack test, but the Docker verification script must run and pass it.
   The production-image script's secret contains this container-network URI, not the host URI:

   ```text
   MONGODB_URI=mongodb://mongo:27017/payload-hardening-build_test?replicaSet=rs0&directConnection=true
   ```

   It also contains the build-only Payload secret and the remaining non-secret safe config-loading values. The script enables BuildKit and executes the equivalent of:

   ```bash
   DOCKER_BUILDKIT=1 docker build \
     --network=payload_hardening_verify_default \
     --secret id=payload_build_env,src=<owner-only-os-temp-file> \
     --build-arg NEXT_PUBLIC_SERVER_URL=https://example.test \
     --tag payload-cms-starter-kit:hardening-verify \
     .
   ```

   It fails unless image configuration and an exported runner filesystem scan exclude the build secret and all secret variable names/values, then removes only the fixed verification image and isolated Compose project.

10. Run:

    ```bash
    pnpm exec vitest run --config ./vitest.config.mts tests/int/docker-standalone.int.spec.ts tests/int/docker-compose-contract.int.spec.ts tests/int/e2e-config.int.spec.ts tests/int/mongodb-uri-contract.int.spec.ts tests/int/starter-productization.int.spec.ts
    pnpm exec tsc --noEmit
    ```

11. Commit:

```text
fix(docker): pin transaction-ready local stack
```

---

## Task 6: Verify and document the dependency/runtime phase

**Files:**

- Modify when facts change: `.agents/skills/project-context/references/project-inventory.json`
- Modify when behavior changes: `.agents/skills/project-context/references/architecture.md`
- Modify when behavior changes: `.agents/skills/project-context/references/payload-model.md`
- Modify: `docs/architecture/feature-inventory.md`
- Modify: `docs/operations/developer-workflows.md`
- Create: `docs/adr/0004-dependency-and-runtime-baseline.md`

1. Inspect `git diff <phase-baseline>..HEAD` plus the Task 6 working tree using the change-impact map. Confirm exact compatibility groups, generated artifacts, the server-only CLI condition, audit policy, Docker contracts, and maintained documentation agree.
2. Create ADR 0004 with Context, Decision, rejected alternatives, Consequences, rollback approach, and exact Verification commands. Do not rewrite historical `docs/superpowers/**` records.
3. Run:

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
   env MONGODB_URI='mongodb://127.0.0.1:27017/payload-cms-starter-kit_build_test?replicaSet=rs0&directConnection=true' PAYLOAD_SECRET='build-only-payload-secret-32-characters' NEXT_PUBLIC_SERVER_URL='https://example.test' EMAIL_PROVIDER=none RESEND_OVERRIDE_TO_EMAIL= ALLOW_FIRST_ADMIN_CREATION=false FIRST_ADMIN_EMAIL= ALLOW_PRODUCTION_EMAIL_OVERRIDE=false MEDIA_RECONCILE_TOKEN= MEDIA_PROVIDER=localDisk VERCEL= pnpm build
   pnpm verify:docker-image
   pnpm project-context:update
   pnpm project-context:check
   ```

   Run raw `pnpm audit --prod --json` separately only to record severity counts; accept exit `1` as advisory data and never treat it as an exception-aware gate.

4. Run generators and the production build under the complete Safe config-loading environment above. Do not modify `.env` or print secrets.
5. `pnpm verify:docker-image` starts the isolated `payload_hardening_verify` Mongo service, uses the container URI `mongodb://mongo:27017/payload-hardening-build_test?replicaSet=rs0&directConnection=true` inside the required BuildKit secret, and builds on `payload_hardening_verify_default` with the exact command defined in Task 5. Confirm with image inspection that none of the secret names or values exist in runner `Config.Env` or exported filesystem layers. Its `finally` removes only the temporary file, fixed verification image, and isolated verification project. The next Verification and Delivery phase turns this proven command into a required CI job.
6. Scan maintained source, active workflow, Docker, package, README, `docs/operations/**`, and `docs/architecture/**` for `pnpm@latest`, stale Node/pnpm versions, IDrive e2 operator claims, unsafe Mongo publication, non-replica local URIs, mixed Next/Payload versions, permanent overrides, and expired audit exceptions. Historical `docs/superpowers/**` and intentional provider-compatibility test fixtures are not failures.
7. Commit:

   ```text
   docs(runtime): record dependency baseline
   ```

   The body names the compatibility groups, audit result, and transaction-ready local stack.

## Phase Handoff

After Task 6 passes independent review and the whole-phase review is clean, write and execute the separate Verification and Delivery plan. That phase owns action SHA pinning, replica-set CI initialization, critical Admin/Site Manager Playwright journeys, secret/dependency-review jobs, and the production Docker image gate.
