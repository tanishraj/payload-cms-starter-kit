# Dependency and Runtime Final Review Fix Report

## Scope

Base `448050dc034be5136701e940e2b2a7eab163a757` on
`feat/industry-standard-hardening` was confirmed before editing with a clean tracked worktree. This
wave fixes all final-review findings without changing GitHub workflows, dependency targets,
production behavior, Docker resources, or any non-test database.

## Changes

- Playwright now owns one explicit safe worker/server `NODE_OPTIONS` value:
  `--no-deprecation --no-experimental-strip-types --conditions=react-server --import=tsx/esm`.
  It is assigned after the committed fixture is loaded, so hostile parent options cannot take
  control. The Playwright web server launches Next directly instead of passing through the general
  `pnpm dev` script, which would replace the fixed options.
- A serverless/browserless Playwright probe config starts a real Playwright worker. Its E2E helper
  copies only the validated committed `_test` URI to `MONGODB_URI` and dynamically imports Payload
  configuration. It never initializes Payload, connects to MongoDB, or mutates data.
- Dependency-audit exception validation rejects a valid date-only `createdAt` later than the
  evaluator's UTC calendar date before the exception can match an advisory.
- ADR 0004 removes the unsafe host build command and names `pnpm verify:docker-image` as the
  authoritative isolated Node 22 production-build gate.
- ADR 0002 now states that committed `test.env` overrides ambient E2E URI values and replaces its
  configuration-only `--list` evidence with the real worker/helper import proof.

## TDD Evidence

### RED — future-created exception

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/dependency-audit-policy.int.spec.ts
```

Result: failed the new 2099 bypass case because the matching exception returned `ok: true`; 39
existing tests passed.

### RED — real Playwright worker/helper boundary

```bash
env NODE_OPTIONS='--trace-warnings' pnpm exec playwright test --config=playwright.runtime-import.config.ts
```

Result: the real worker ran the E2E helper and its Payload-config dynamic import rejected at the
`next/cache` module boundary. This reproduced the child-import failure after configuration replaced
the launcher options. No web server, browser fixture, database connection, or mutation was used.

### GREEN — focused contracts

```bash
pnpm exec vitest run --config ./vitest.config.mts \
  tests/int/dependency-audit-policy.int.spec.ts tests/int/e2e-config.int.spec.ts
env NODE_OPTIONS='--trace-warnings' pnpm exec playwright test \
  --config=playwright.runtime-import.config.ts
```

Result: 45 Vitest assertions passed. The real Playwright worker/helper Payload-config import passed
1/1 under the hostile parent option, while asserting the exact fixed worker `NODE_OPTIONS` value.

## Verification

- `pnpm exec tsc --noEmit`: passed.
- `pnpm lint`: passed with one pre-existing warning in
  `src/components/admin/AdminUserMenu.tsx` for relative `window.location.assign()`.
- Relevant `pnpm exec prettier --check ...`: passed.
- `git diff --check`: passed.
- `pnpm audit:prod`: passed; critical 0, high 0, moderate 14, low 4, info 0. No audit exception
  was applied.
- `pnpm test:int` before context refresh: 2,005 passed, one skipped, with only the expected
  deterministic-inventory drift failure caused by the two new probe files.
- `pnpm project-context:update`: updated the deterministic inventory.
- `pnpm project-context:check`: passed. It reported the already-stale knowledge graph at commit
  `18ac3f6b03666aeb18aae7cfd87b23377f5dc4e7`, which the project-context contract treats as a
  non-blocking warning for this non-structural change.
- Focused project-context repository test after refresh: 4/4 passed.
- Post-refresh `pnpm test:int`: 2,005 passed and one skipped; one unrelated
  `frontend-session.int.spec.tsx` toolbar-offset timing assertion failed under the full parallel
  load. Its immediate focused rerun passed 7/7.

The local verification host runs Node `v26.8.1`, so pnpm reported the expected engine warning
against the repository's supported `>=22.13.0 <23` range. The maintained isolated Docker verifier
remains the Node 22 production-build gate and was not run because this fix wave must not mutate
Docker.

## Project Context

The change-impact map was read before implementation and again against the final diff. The update
changed:

- `.agents/skills/project-context/references/project-inventory.json` to include the two new test
  files and refresh the repository hash;
- `.agents/skills/project-context/references/architecture.md` to record the fixed Playwright child
  options and real worker import boundary.

No Payload schema or Admin component changed, so Payload type and import-map generation were not
required.

## Self-review

- All three Important findings and the Minor finding are addressed.
- Worker safety is proven by actual Playwright process behavior, not source inspection or test
  discovery.
- Ambient `NODE_OPTIONS` cannot select worker or web-server behavior; the fixed value is assigned
  after fixture loading and passed explicitly to a direct Next.js child.
- The future-date comparison occurs only after strict `YYYY-MM-DD` calendar validation and compares
  normalized date-only strings, preserving UTC-independent semantics and existing schema behavior.
- GitHub workflow files are unchanged; mandatory-only CI scope is preserved.
- Neither `.env` nor `.env.atlas.local` was read, printed, or modified. Only committed `test.env`
  values and loopback `_test` database names were used.
- No Docker command was run and no live or non-test database was contacted or mutated.
