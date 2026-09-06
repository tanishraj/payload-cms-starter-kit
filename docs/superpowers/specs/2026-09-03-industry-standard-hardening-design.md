# Industry-Standard Repository Hardening Design

**Date:** 2026-09-03
**Status:** Approved for implementation planning
**Branch:** `feat/industry-standard-hardening`

## Purpose

Bring the current Payload CMS and Next.js repository to a defensible production
engineering baseline without changing the website's intended public or Admin
experience. The work closes concrete authorization, dependency, test-isolation,
input-validation, upload, delivery, observability, and documentation gaps found
in the 2026-09-03 repository audit.

The work is repository-only. It must not modify GitHub, Vercel, MongoDB Atlas,
Cloudflare, R2, DNS, or any deployed environment. Required external controls are
documented as operator actions.

## Goals

1. Make public Review visibility impossible to bypass accidentally.
2. Make authentication, API, environment, form, and upload boundaries explicit.
3. Remove known critical and high production dependency advisories, or document
   a narrowly scoped and time-bounded exception when no upstream fix exists.
4. Ensure automated tests cannot mutate Atlas or another non-test database.
5. Exercise authorization and moderation behavior against a real MongoDB
   replica set and in browser journeys.
6. Add reproducible CI security and production-build gates.
7. Add useful, sanitized operational signals and health checks.
8. Improve ownership boundaries only in domains touched by this work.
9. Give maintainers complete security, contribution, deployment, recovery, and
   external-platform hardening guidance.

## Non-Goals

- No live database dump, restore, migration execution, deployment, or push.
- No external account, firewall, WAF, branch-protection, backup, or bucket change.
- No new public-facing feature or visual redesign.
- No wholesale relocation of the existing block system or one universal block
  registry.
- No claim that public R2 objects can be protected by Payload access rules.
- No asynchronous notification mode enabled by default until an operator runs
  the documented worker and scheduler contract.
- No speculative database index added without a query and explain-plan record.

## Global Constraints

- Preserve the current two-role model: Admin and Site Manager.
- Preserve the 29-feature grant model and deny missing grants by default.
- Preserve explicit server and client block registries.
- Preserve public caching and do not make the frontend layout request-dynamic.
- Use Node.js 22 LTS in development documentation, CI, and Docker.
- Pin the package manager as `pnpm@11.17.0`; never install `pnpm@latest`.
- Keep the Next.js package family on one exact version.
- Keep the Payload package family on one exact version.
- Public operations acting under collection access use `overrideAccess: false`.
- Nested Payload operations in hooks pass `req` and use context guards where
  recursion is possible.
- Security failures fail closed and never expose secrets, stack traces, or
  submitted personal data.
- Schema changes require `pnpm generate:types`; custom Admin component changes
  require `pnpm generate:importmap`.
- Each implementation task must have focused tests and independent review.
- Nothing is pushed, deployed, or applied outside the worktree.

## Delivery Strategy

The branch is implemented in five deployable workstreams. Security invariants
come before structural cleanup so later refactoring is protected by runtime
tests.

### 1. Security Boundary

This workstream fixes public Review reads, authentication and Payload API
configuration, environment validation, public form parsing, upload trust, and
test database isolation.

### 2. Dependency and Runtime Baseline

This workstream upgrades vulnerable packages in compatibility groups, aligns
Node and pnpm across environments, makes Docker development deterministic, and
adds a production dependency policy.

### 3. Verification and Delivery

This workstream adds database-backed authorization tests, critical Playwright
journeys, CI security jobs, and a production container gate.

### 4. Operational Readiness

This workstream adds structured request context, safe health checks, dependency
and migration guidance, recovery procedures, and external control checklists.

### 5. Maintainability and Documentation

This workstream establishes domain boundaries for code already changed by the
hardening work. It does not reorganize unrelated blocks or presentation code.

## Public Review Authorization

### Canonical Policy

An anonymous visitor may read a Review only when both conditions hold:

1. `_status` is `published`.
2. The Review has no `sourceSubmission`, or `moderationStatus` is `approved`.

The Reviews collection remains the authority for this rule. Public Local API
queries must run anonymously with `overrideAccess: false`, `draft: false`, and
an explicit `depth` and `select` appropriate to the consumer.

### Domain Query Boundary

All public Review consumers route through server-only functions under
`src/domains/reviews/`. This boundary owns feed, rating summary, detail,
discovery, sitemap, and Open Graph lookups. Public routes and generic content
helpers must not call `payload.find({ collection: 'reviews' })` directly.

Administrative moderation and trusted maintenance operations may bypass access
only when they state `overrideAccess: true` explicitly. The code must not rely
on Payload's implicit Local API default.

### Required Regression Record

Database-backed tests create a deliberately inconsistent Review with
`_status: 'published'`, a `sourceSubmission`, and pending or rejected
moderation. It must be absent from every public Review path and available only
to an authorized administrative operation.

## Authentication and Authorization

Payload authentication configuration becomes explicit rather than inheriting
security-sensitive defaults:

- session authentication enabled;
- five failed login attempts before lockout;
- ten-minute lock duration;
- two-hour token expiration;
- secure cookies in production with `SameSite=Lax`;
- authentication tokens removed from response bodies when cookie sessions are
  sufficient;
- administrator and Site Manager roles saved to the JWT as currently required.

Feature grants remain authoritative at collection, global, field, and endpoint
boundaries. Admin navigation visibility is only a convenience. REST and Local
API access tests must prove a user cannot bypass a missing feature grant.

### Administrator Bootstrap

Production must not expose an indefinite count-based first-user path. First
administrator creation is enabled only when the Users collection is empty and
`ALLOW_FIRST_ADMIN_CREATION=true`. The default is enabled in local development
and disabled in production. The deployment runbook requires the operator to
remove the flag immediately after bootstrap. There is no anonymous Site Manager
registration path.

The last-administrator invariant remains. Concurrent demotion and deletion
tests must either prove the database transaction closes the race or document a
serialized administrative operation that does so.

## Payload API Boundary

Repository usage is checked before configuration changes. If there is no
application GraphQL consumer, GraphQL is disabled completely. If a consumer is
found, introspection and Playground remain disabled in production and query
complexity receives a tested upper bound.

Payload receives:

- an explicit maximum relationship depth no greater than `3` unless a focused
  test demonstrates that a registered route requires more;
- explicit CORS and CSRF origins derived from validated application origins;
- an explicit canonical `serverURL`;
- production-safe cookie settings;
- no permissive wildcard origin.

The request proxy must not construct server-side fetch targets from an
untrusted request Host header. Internal redirect loading uses a validated
canonical origin or a direct server-side data function. Redirect destinations
are checked for supported schemes and redirect loops.

## Environment Contract

One server-only runtime module parses and validates environment values before
providers or routes consume them. Browser-safe public values are exported from
a separate module. New direct `process.env` reads outside these modules are
prohibited by lint or focused contract tests.

Production validation includes:

- HTTPS application and public media origins;
- a non-placeholder Payload secret of at least 32 characters;
- MongoDB and R2 provider requirements already enforced by the starter
  contract;
- refusal to use `RESEND_OVERRIDE_TO_EMAIL` unless
  `ALLOW_PRODUCTION_EMAIL_OVERRIDE=true` is also set;
- validation of the administrator-bootstrap flag;
- a documented separation requirement for preview and production databases,
  buckets, tokens, and email configuration.

Secret values are never rendered in validation messages.

## Public Request Validation

Shared request helpers enforce the following contract on JSON submission
routes:

- `Content-Type` must be `application/json`;
- request body maximum is 256 KiB;
- maximum submitted field count is 100;
- email maximum is 320 characters;
- URL maximum is 2,048 characters;
- single-line text maximum is 500 characters;
- long-form text maximum is 10,000 characters unless a stricter schema limit
  already exists;
- metadata strings use the relevant single-line or URL limit;
- unknown structural shapes are rejected before a Payload write.

Responses use `400` for invalid data, `413` for body limits, `415` for media
type, and `429` for rate limits. Rate-limited responses include `Retry-After`.

The existing in-memory limiter remains only as a local and single-instance
defense. The repository provides a narrow limiter interface so a durable
implementation can be introduced without route rewrites, but no distributed
guarantee is claimed until the Vercel WAF or a durable store is configured.
The operations guide includes the exact production endpoints and keying rules
that require external rate limits.

## Media Trust Boundary

The Media collection keeps the existing byte limit and adds an explicit
allowlist for the image and document formats the website actually uses.
Extension, declared MIME type, and detected file signature must agree for
raster images and PDFs. HTML, script-capable documents, and unsanitized SVG are
rejected. A validation failure does not upload an object or create a Media
record.

The repository documents two trust classes:

- public marketing media may use the direct public R2 origin;
- private or user-submitted documents require a separate private collection
  and storage path before that product capability is introduced.

Malware scanning is an external control. The repository documents quarantine
and scanning requirements for any future document intake rather than claiming
the current public bucket provides them.

## Notification Side Effects

Form persistence and email delivery are separated behind a notification
service interface. Synchronous delivery remains the default so existing
deployments do not silently enqueue work without a worker.

An optional Payload task may be registered for retryable delivery. Queue mode
requires an explicit environment value and the documented worker/scheduler
setup. Jobs carry an idempotency key, have a bounded retry policy, retain the
last sanitized error, and never log submitted form values.

## Test Database Safety

Browser and script-driven tests use `TEST_MONGODB_URI`, never the general
application `MONGODB_URI`. Before any seed, cleanup, delete, or mutation, a
shared guard rejects:

- `mongodb+srv` URIs;
- non-loopback hosts;
- database names that do not end in `_test` or `-test`;
- a missing explicit database name.

MongoDB-memory-server integration tests may use their own generated loopback
replica-set URI and do not accept an externally supplied production URI.

Playwright does not load the general `.env` file and does not reuse an arbitrary
existing development server. Its web server receives explicit test variables
and a dedicated test database. CI and local documentation use a single-node
replica set so hooks and nested operations exercise transaction behavior.

## Test Strategy

### Unit Tests

Pure tests cover public visibility predicates, feature grants, bootstrap flags,
environment parsing, body limits, field limits, upload allowlists, and URI
safety guards.

### Payload Integration Tests

Replica-set-backed tests cover:

- public Review exclusion across feed, summary, detail, search, sitemap, and
  Open Graph consumers;
- Admin and Site Manager REST and Local API access;
- feature grant removal and session/JWT consequences;
- last-administrator demotion and deletion behavior;
- request-aware hook transactions;
- upload rejection before persistence;
- GraphQL unavailability when disabled.

### Browser Tests

Playwright covers administrator creation of multiple Admins and Site Managers,
grant and revoke behavior, sidebar visibility, direct URL denial, review
approval, and public visibility after approval. Tests must use generated
fixtures and remove only data in the guarded test database.

### Contract-Test Policy

Source-string tests remain only when they protect an import boundary,
registration list, generated artifact, or other static architectural contract.
Security and user behavior require runtime assertions. The work does not pursue
a vanity global coverage percentage; it requires explicit coverage of the
critical cases above.

## Dependency and Toolchain Policy

Dependency upgrades happen in compatibility groups:

1. Next.js, `@next/third-parties`, and `eslint-config-next` together.
2. Every `@payloadcms/*` package and `payload` together.
3. `sharp`, PostCSS, and independently controlled security patches.
4. Transitive fixes through parent upgrades before considering an override.

The initial target set is Next.js `16.3.4`, Payload `3.88.0`, Sharp `0.35.4`,
and PostCSS `8.5.26`, subject to the complete suite proving compatibility. A
temporary pnpm override must name the advisory, explain why the parent cannot
yet upgrade, identify an owner, and expire within 30 days.

`pnpm audit --prod --audit-level high` becomes a gate after the upgrade. A
known high or critical advisory may pass only through a checked-in risk
exception with affected package, reachability assessment, mitigation, owner,
and expiry date.

`package.json` declares `private: true`, uses `license: "UNLICENSED"`, pins
`pnpm@11.17.0`, and restricts Node to the supported 22.x line. Docker Compose
does not install `pnpm@latest`. CI, Docker, and developer documentation use the
same major runtime.

## CI and Supply-Chain Gates

Pull-request CI runs:

1. project-context consistency;
2. generated Payload types and import-map consistency;
3. TypeScript and ESLint;
4. unit and replica-set integration tests;
5. critical Playwright journeys;
6. production dependency audit;
7. secret scanning;
8. dependency review on pull requests when GitHub supports it;
9. a production Docker build.

GitHub Actions are pinned to full commit SHAs with the release tag preserved in
a comment. Security workflows receive read-only permissions by default and only
the minimum job-specific permission needed. They do not receive production
secrets or connect to Atlas.

The runbook separately instructs operators to enable vulnerability alerts,
Dependabot, private vulnerability reporting, required reviews, required status
checks, and branch protection or rulesets. It records that some controls may
require a different GitHub plan.

## Observability and Health

Public API requests receive or generate a correlation ID. Application logs use
structured fields for route, method, status, duration, correlation ID, and a
stable error code. They redact authorization headers, cookies, database and
storage URLs, tokens, passwords, email bodies, and submitted field values.

`/api/health/live` reports only that the application process can respond.
`/api/health/ready` performs a bounded database readiness check and returns only
an overall `ok` or `unavailable` status. Both routes are uncached. Readiness
times out rather than holding a serverless invocation indefinitely.

OpenTelemetry and external error tracking remain adapter points and documented
deployment choices because configuring a vendor would change external state.
The repository defines the event names and redaction contract they must use.

## Database, Redirect, and Release Safety

Local Docker MongoDB binds to `127.0.0.1`, runs as a single-node replica set,
and exposes a health condition before the application starts. Local development
credentials are not reusable production credentials.

Compound indexes are considered only for a named repository query with an
explain-plan record. The first candidates are public publication/moderation,
event date/classification, submission status/date, and work-queue feature/status
queries. An index change uses a Payload migration and includes rollback and
local replica-set verification.

Redirect loading avoids self-fetching through an untrusted Host-derived origin.
As redirect volume grows, Edge Config or KV is an external follow-up rather
than a repository claim.

The operations guide defines migration backup, dry-run, apply, smoke-test, and
rollback steps. Production migrations remain a separately approved release
operation; application startup does not perform destructive migration work.

## Code Organization

New or materially changed security-sensitive domain logic lives under:

```text
src/domains/
  reviews/
  forms/
  media/
  governance/
```

Each domain exposes a small server-only public interface. Payload collections
remain schema and composition roots; they import domain policy rather than
accumulating query and validation implementation. Existing block-specific UI
is moved only when a touched file clearly belongs to one block and the move has
focused import and rendering tests.

Lint boundaries prevent client components from importing Payload config,
server-only domains, secrets, or Node-only providers. Generic shared UI remains
under `src/components/ui`, site-wide composition under
`src/components/global`, and presentation code is not mixed into domain
services.

Large unrelated files are not split merely to satisfy a line-count target.

## Documentation Deliverables

The repository gains:

- `SECURITY.md` with supported versions and private reporting instructions;
- `CONTRIBUTING.md` with setup, branch, test, migration, and review rules;
- `.github/CODEOWNERS` naming `@tanishraj` as the default owner and adding
  focused ownership for security, access, migrations, and workflows;
- Architecture Decision Records for authorization boundaries, public Local API
  policy, test database isolation, and public media trust;
- deployment and rollback, incident response, backup and restore, migration,
  and external-platform hardening runbooks;
- a data-retention and PII inventory for forms, users, reviews, logs, and audit
  events;
- defined initial operational targets for availability, p95 response time,
  form success, notification failure, and moderation backlog;
- a current documentation index that distinguishes maintained guidance from
  historical `docs/superpowers` artifacts.

README and operator guidance consistently describe Cloudflare R2 rather than
IDrive e2. Stale SQLite language in Playwright documentation is removed. Because
the repository is private, package metadata is explicitly private and
unlicensed rather than claiming an absent MIT license.

## Error Handling

All new error paths use stable internal codes and sanitized public messages.
Validation errors preserve field-level usefulness without echoing rejected file
contents or secrets. Dependency, readiness, notification, and provider failures
are logged once with correlation context. Expected client errors are not logged
as server exceptions.

Optional integrations fail according to their declared mode: disabled remains
silent, synchronous notification failure follows the current submission
contract, and queued mode records a retryable job. No configuration silently
falls back from a required production provider to local disk or console email.

## Acceptance Criteria

The branch is ready for handoff when:

1. Every critical security behavior above has a runtime test.
2. All public Review consumers exclude inconsistent unapproved records.
3. Playwright and scripts refuse unsafe database targets before mutation.
4. Unsupported and malformed uploads fail before persistence.
5. The production dependency audit has no unexcepted high or critical finding.
6. TypeScript, lint, integration, E2E, production build, and Docker build pass.
7. Generated Payload types and import map are current when affected.
8. Project-context update/check passes and maintained architecture references
   describe the resulting behavior.
9. The final diff receives a broad security and architecture review.
10. No live service was changed and no branch was pushed.

## Implementation Review Model

Implementation follows the subagent-driven workflow selected by the user. Each
plan task receives a fresh implementer, a separate specification-and-quality
review, bounded correction rounds, and a final whole-branch review. Work remains
on `feat/industry-standard-hardening`; task commits are allowed locally so every
review has an exact range, but publication and deployment are prohibited.
