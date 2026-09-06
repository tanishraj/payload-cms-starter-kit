# Security Boundary Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-09-03-industry-standard-hardening-design.md`

**Goal:** Close the repository's concrete public Review, test-database, Payload authentication/API, request-validation, proxy-origin, and media-upload security gaps while preserving current product behavior.

**Architecture:** Public Review reads move behind an access-enforced server-only domain boundary. Test mutations require a dedicated loopback `_test` database. Runtime security settings, bounded JSON parsing, rate limiting, and upload validation become explicit reusable policies rather than route-local assumptions.

**Tech Stack:** Payload CMS 3, Next.js App Router, TypeScript, MongoDB replica sets, Vitest, Playwright, Zod-compatible runtime validation, and `file-type` for binary signature detection.

## Global Constraints

- Work only on `feat/industry-standard-hardening`.
- Preserve Admin and Site Manager roles and the 29-feature grant model.
- Preserve public page caching and explicit client/server block registries.
- Do not mutate live or Atlas databases, deploy, push, or change external services.
- Public Local API reads acting through collection access use `overrideAccess: false`.
- Trusted bypasses state `overrideAccess: true` explicitly.
- Pass `req` through nested Payload operations.
- Security failures fail closed and never expose secrets or submitted personal data.
- Use TDD: prove each focused test fails before implementation and passes after it.
- Run `pnpm generate:types` after schema/config changes that affect generated types.
- Finish the plan with project-context update/check and maintained-document review.

---

### Task 1: Enforce one public Review query boundary

**Files:**
- Create: `src/domains/reviews/publicReviewQueries.ts`
- Modify: `src/collections/Reviews.ts`
- Modify: `src/lib/reviewFeed.ts`
- Modify: `src/lib/reviewRatingSummary.ts`
- Modify: `src/lib/contentEntries.ts`
- Modify: `src/app/api/search/route.ts`
- Modify: `src/app/(frontend)/search/page.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/(frontend)/reviews/[slug]/opengraph-image.tsx`
- Create: `tests/int/public-review-access.int.spec.ts`
- Test: `tests/int/review-feed-data.int.spec.ts`
- Test: `tests/int/review-rating-summary.int.spec.ts`
- Create: `tests/int/search-route.int.spec.ts`
- Create: `tests/int/search-page.int.spec.tsx`
- Test: `tests/int/sitemap.int.spec.ts`
- Test: `tests/int/open-graph-image-renderer.int.spec.tsx`

**Interfaces:**
- Produces: `publicReviewReadAccess: Access` for `Reviews.access.read`.
- Produces: `publicReviewQueryOptions`, the immutable `{ draft: false, overrideAccess: false }` options applied to every anonymous Review read.
- Produces: `findPublicReviews(payload, args)` and `countPublicReviews(payload, args)` wrappers that accept only Review-specific `find`/`count` arguments and always enforce anonymous collection access.
- Consumes: Payload `find` and `count`; the existing Review collection access policy.

- [ ] **Step 1: Add failing collection and domain-boundary tests**

Create `tests/int/public-review-access.int.spec.ts`. Use `createTestMongoServer()` and a fresh `getPayload()` instance following `tests/int/api.int.spec.ts`. Seed valid staff and approved-submission records through Payload. Then insert the deliberately inconsistent pending/rejected published documents through the test Mongo model directly, because the production moderation hooks correctly refuse to create that invalid state. Use a valid persisted Form Submission ID for `sourceSubmission`:

```ts
const cases = [
  { slug: 'staff-published', _status: 'published', moderationStatus: null, sourceSubmission: null },
  { slug: 'approved-submission', _status: 'published', moderationStatus: 'approved', sourceSubmission },
  { slug: 'pending-submission', _status: 'published', moderationStatus: 'pending', sourceSubmission },
  { slug: 'rejected-submission', _status: 'published', moderationStatus: 'rejected', sourceSubmission },
  { slug: 'approved-draft', _status: 'draft', moderationStatus: 'approved', sourceSubmission },
] as const
```

Assert an anonymous `payload.find({ collection: 'reviews', overrideAccess: false })` returns only `staff-published` and `approved-submission`. Mock the domain wrapper's Payload dependency and assert every call includes:

```ts
expect.objectContaining({
  collection: 'reviews',
  draft: false,
  overrideAccess: false,
})
```

Also scan the public consumer files listed above and fail if they contain a direct `collection: 'reviews'` query instead of importing the domain boundary. The static assertion protects the import boundary; visibility behavior remains database-backed.

- [ ] **Step 2: Run the focused tests and verify the new boundary test fails**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/public-review-access.int.spec.ts tests/int/review-feed-data.int.spec.ts tests/int/review-rating-summary.int.spec.ts
```

Expected: FAIL because `publicReviewQueries.ts` does not exist and current loaders bypass access.

- [ ] **Step 3: Implement the server-only Review access/query module**

Create `src/domains/reviews/publicReviewQueries.ts` with `import 'server-only'`. Export the collection policy and wrappers. The access policy must be:

```ts
export const publicReviewReadAccess: Access = ({ req }) => {
  if (req.user) return canReadFeature(req.user, 'reviews')

  return {
    and: [
      { _status: { equals: 'published' } },
      {
        or: [
          { sourceSubmission: { exists: false } },
          { sourceSubmission: { equals: null } },
          { moderationStatus: { equals: 'approved' } },
        ],
      },
    ],
  }
}

export const publicReviewQueryOptions = {
  draft: false,
  overrideAccess: false,
} as const
```

The wrappers accept `Omit<FindArgs<'reviews'>, 'collection' | 'draft' | 'overrideAccess' | 'user'>` and the corresponding count type, add the fixed properties above, and never accept a user.

- [ ] **Step 4: Route every public Review read through the boundary**

Use `publicReviewReadAccess` in `Reviews.access.read`. Replace direct public queries in feed, rating, archives/details, both search implementations, sitemap, and Review OG with the wrappers. Preserve each consumer's existing `where`, pagination, sort, depth, select, caching, and failure behavior; remove duplicated `_status` conditions only when the access policy now supplies them.

Administrative `reviewPromotion.ts`, dashboard, migrations, and moderation code are not public consumers and keep their explicit trusted or user-scoped mode.

- [ ] **Step 5: Expand consumer regression assertions**

For each existing consumer spec, assert the mocked call uses `draft: false` and `overrideAccess: false`. For the database-backed spec, invoke the feed and rating functions against the real Payload instance and prove pending/rejected published submissions neither render nor affect totals.

- [ ] **Step 6: Run all Review and discovery tests**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts \
  tests/int/public-review-access.int.spec.ts \
  tests/int/review-feed-data.int.spec.ts \
  tests/int/review-rating-summary.int.spec.ts \
  tests/int/reviews.int.spec.ts \
  tests/int/review-submission.int.spec.ts \
  tests/int/search-route.int.spec.ts \
  tests/int/search-page.int.spec.tsx \
  tests/int/sitemap.int.spec.ts \
  tests/int/open-graph-image-renderer.int.spec.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/domains/reviews/publicReviewQueries.ts src/collections/Reviews.ts src/lib/reviewFeed.ts src/lib/reviewRatingSummary.ts src/lib/contentEntries.ts src/app/api/search/route.ts 'src/app/(frontend)/search/page.tsx' src/app/sitemap.ts 'src/app/(frontend)/reviews/[slug]/opengraph-image.tsx' tests/int
git commit -m "fix(reviews): enforce public visibility"
```

Commit body must explain that Payload Local API bypasses access by default and that all anonymous Review reads now enforce collection access.

---

### Task 2: Make browser and script database mutations test-only

**Files:**
- Create: `tests/helpers/testDatabaseSafety.ts`
- Create: `tests/int/test-database-safety.int.spec.ts`
- Create: `tests/int/e2e-config.int.spec.ts`
- Modify: `test.env`
- Modify: `playwright.config.ts`
- Modify: `tests/helpers/seedUser.ts`
- Modify: `tests/helpers/seedHomepage.ts`
- Modify: `tests/helpers/pageRecipeDraft.ts`
- Modify: `tests/helpers/login.ts`
- Modify: `tests/e2e/admin.e2e.spec.ts`
- Modify: `tests/e2e/frontend.e2e.spec.ts`
- Modify: `.env.example`
- Modify: `docs/operations/developer-workflows.md`

**Interfaces:**
- Produces: `assertSafeTestDatabaseURI(uri: string): URL`.
- Produces: `getRequiredTestDatabaseURI(env?: NodeJS.ProcessEnv): string`.
- Produces: Playwright `webServer.env` containing `MONGODB_URI` copied only from a validated `TEST_MONGODB_URI`.
- Consumes: all E2E seed and cleanup helpers before their first Payload initialization.

- [ ] **Step 1: Write URI safety tests**

Create table-driven tests proving acceptance only for explicit loopback test databases:

```ts
const accepted = [
  'mongodb://127.0.0.1:27017/payload_cms_test',
  'mongodb://localhost:27017/payload-cms-test?replicaSet=rs0',
  'mongodb://[::1]:27017/snmih_test',
]

const rejected = [
  '',
  'mongodb+srv://user:secret@cluster.example.net/snmih_test',
  'mongodb://mongo:27017/snmih_test',
  'mongodb://127.0.0.1:27017/',
  'mongodb://127.0.0.1:27017/snmih',
  'mongodb://127.0.0.1:27017/admin',
]
```

Assert rejection messages contain no username, password, query string, or full URI.

- [ ] **Step 2: Run the safety test and verify it fails**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/test-database-safety.int.spec.ts
```

Expected: FAIL because the helper is missing.

- [ ] **Step 3: Implement the safety guard**

Parse with `new URL(uri)`. Permit protocol `mongodb:` only. Require every hostname to be `localhost`, `127.0.0.1`, `::1`, or the URL-normalized `[::1]`. Decode the pathname, remove the leading slash, require exactly one non-empty database segment, reject `admin`, `local`, and `config`, and require `/_test$/` or `/-test$/`.

`getRequiredTestDatabaseURI` reads only `TEST_MONGODB_URI`, validates it, and returns it. Error messages name the failed rule but never echo the URI.

- [ ] **Step 4: Isolate Playwright configuration**

Remove `import 'dotenv/config'`. Load `test.env` explicitly only when the file exists, without overriding process variables. Validate `TEST_MONGODB_URI` during config evaluation. Configure:

```ts
use: { baseURL: 'http://127.0.0.1:3000', trace: 'on-first-retry' },
webServer: {
  command: 'pnpm dev',
  env: {
    ...process.env,
    MONGODB_URI: testDatabaseURI,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? 'e2e-only-payload-secret-32-characters',
    EMAIL_PROVIDER: 'none',
    MEDIA_PROVIDER: 'localDisk',
  },
  reuseExistingServer: false,
  url: 'http://127.0.0.1:3000/admin',
},
```

Replace hard-coded origins in E2E specs with relative paths supported by `baseURL`. Correct the stale SQLite comment to MongoDB replica-set language.

- [ ] **Step 5: Guard every E2E mutator**

Before importing or initializing Payload in each seed/cleanup helper, call `getRequiredTestDatabaseURI()`, assign the validated value to `process.env.MONGODB_URI`, and only then dynamically import Payload configuration. A helper must fail before `getPayload()` when the URI is unsafe.

Do not guard read-only export or migration-report scripts with the test-only rule; instead add a visible confirmation/dry-run contract to their later operational plan.

- [ ] **Step 6: Add test environment documentation**

Extend the already tracked, non-secret `test.env` with:

```dotenv
TEST_MONGODB_URI=mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0
PAYLOAD_SECRET=e2e-only-payload-secret-32-characters
```

Keep the existing test-only `NODE_OPTIONS` entry. Do not place credentials in this file. Document that E2E refuses Atlas and non-test databases, requires a local replica set, and starts its own server.

- [ ] **Step 7: Run safety and E2E configuration tests**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/test-database-safety.int.spec.ts tests/int/e2e-config.int.spec.ts
TEST_MONGODB_URI=mongodb://127.0.0.1:27017/payload-cms-starter-kit_test?replicaSet=rs0 pnpm exec playwright test --list
```

Expected: both commands PASS without connecting to Atlas or mutating data.

- [ ] **Step 8: Commit**

```bash
git add tests/helpers tests/e2e tests/int/test-database-safety.int.spec.ts tests/int/e2e-config.int.spec.ts playwright.config.ts test.env .env.example docs/operations/developer-workflows.md
git commit -m "test(e2e): isolate database mutations"
```

Commit body must state that E2E no longer inherits the application's general MongoDB URI.

---

### Task 3: Make runtime, authentication, API, and redirect origin policy explicit

**Files:**
- Modify: `src/config/runtime.ts`
- Modify: `src/config/providers.ts`
- Modify: `src/config/starterContract.ts`
- Modify: `src/lib/siteUrl.ts`
- Modify: `src/access/featureAccess.ts`
- Modify: `src/collections/Users.ts`
- Modify: `src/collections/Pages.ts`
- Modify: `src/collections/Articles.ts`
- Modify: `src/collections/NewsEvents.ts`
- Modify: `src/collections/Reviews.ts`
- Modify: `src/payload.config.ts`
- Modify: `src/proxy.ts`
- Modify: `.env.example`
- Test: `tests/int/runtime-config.int.spec.ts`
- Test: `tests/int/starter-contract.int.spec.ts`
- Test: `tests/int/user-feature-administration.int.spec.ts`
- Create: `tests/int/payload-security-config.int.spec.ts`
- Test: `tests/int/proxy.int.spec.ts`

**Interfaces:**
- Extends `RuntimeConfig` with `application.origin`, `auth.allowFirstAdminCreation`, `email.overrideRecipientAddress`, and `operations.mediaReconcileToken`.
- Produces: `getApplicationOrigin(config)` and `buildLivePreviewURL(pathname, config)` without direct collection-level environment reads.
- Changes: `adminOrFirstUserAccess` permits anonymous create only when the collection is empty and runtime bootstrap policy is enabled.
- Changes: proxy redirect loading never accepts request Host as a fetch target.

- [ ] **Step 1: Add failing runtime and security-config tests**

Add test cases for:

- rejecting non-HTTPS production `NEXT_PUBLIC_SERVER_URL`;
- accepting `http://localhost` only outside production;
- stripping a trailing slash from the canonical origin;
- refusing production `RESEND_OVERRIDE_TO_EMAIL` unless `ALLOW_PRODUCTION_EMAIL_OVERRIDE=true`;
- defaulting `ALLOW_FIRST_ADMIN_CREATION` to false in production and true outside production;
- parsing `MEDIA_RECONCILE_TOKEN` through runtime config without leaking it;
- GraphQL disabled when repository usage remains absent;
- `maxDepth` equals `3`;
- auth sessions, lockout, expiration, production cookie, and token-response settings are explicit;
- CORS/CSRF contain only the canonical application origin;
- proxy redirect lookup does not fetch an incoming hostile Host.

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/runtime-config.int.spec.ts tests/int/payload-security-config.int.spec.ts tests/int/proxy.int.spec.ts tests/int/user-feature-administration.int.spec.ts
```

Expected: FAIL on the new runtime/auth/API contracts.

- [ ] **Step 3: Extend typed runtime configuration**

Parse the canonical origin once using `URL`. Production accepts only HTTPS. Development additionally accepts loopback HTTP. Return `.origin` without a trailing slash. Parse all booleans through the existing strict parser.

Move `RESEND_OVERRIDE_TO_EMAIL` and `MEDIA_RECONCILE_TOKEN` into `RuntimeConfig`. If a production email override is present without its explicit allow flag, throw a sanitized configuration error. Update providers and the reconciliation route to consume typed config rather than `process.env` directly.

- [ ] **Step 4: Remove collection-level server URL reads**

Use one live-preview URL helper in Pages, Articles, NewsEvents, and Reviews. Preserve the current localhost development fallback through runtime parsing; no collection accesses `process.env.NEXT_PUBLIC_SERVER_URL` directly.

- [ ] **Step 5: Make first-administrator policy explicit**

Change the access helper to a factory or inject the parsed boolean so anonymous creation requires both `totalDocs === 0` and `allowFirstAdminCreation === true`. The first record is still normalized to Admin. Existing authenticated Admin creation of additional Admins and Site Managers remains unchanged.

- [ ] **Step 6: Configure Payload security explicitly**

Set Users auth equivalent to:

```ts
auth: {
  lockTime: 10 * 60 * 1000,
  maxLoginAttempts: 5,
  removeTokenFromResponses: true,
  tokenExpiration: 2 * 60 * 60,
  useSessions: true,
  cookies: {
    sameSite: 'Lax',
    secure: runtimeConfig.deployment.isProduction,
  },
}
```

Use the exact Payload property types installed in the repository. Disable GraphQL after the repository scan confirms there is no consumer. Add `maxDepth: 3`, `serverURL`, `cors`, and `csrf` using the validated origin. Keep Admin REST routes working.

- [ ] **Step 7: Remove Host-derived redirect self-fetching**

Prefer importing a server-safe redirect loader directly if the Next proxy runtime supports the dependency graph. Otherwise fetch only `${runtimeConfig.application.origin}/api/redirects`. Relative redirect destinations resolve against the validated canonical origin; external destinations accept only `http:` and `https:`. Reject self-loops and preserve the existing safe no-redirect fallback on loader failure.

- [ ] **Step 8: Document the new environment contract**

Add the bootstrap and production email-override variables to `.env.example` with secure defaults. Update the runtime/provider runbook with the one-time first Admin sequence and immediate flag removal.

- [ ] **Step 9: Generate types and run focused verification**

Run:

```bash
pnpm generate:types
pnpm exec vitest run --config ./vitest.config.mts tests/int/runtime-config.int.spec.ts tests/int/starter-contract.int.spec.ts tests/int/user-feature-administration.int.spec.ts tests/int/payload-security-config.int.spec.ts tests/int/proxy.int.spec.ts
pnpm exec tsc --noEmit
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/config src/lib/siteUrl.ts src/access/featureAccess.ts src/collections/Users.ts src/collections/Pages.ts src/collections/Articles.ts src/collections/NewsEvents.ts src/collections/Reviews.ts src/payload.config.ts src/proxy.ts src/payload-types.ts .env.example tests/int docs/operations/runtime-and-providers.md
git commit -m "fix(security): harden runtime boundaries"
```

Commit body must mention explicit bootstrap, cookie/API limits, and trusted redirect origin.

---

### Task 4: Bound public JSON submissions and centralize limiter behavior

**Files:**
- Create: `src/domains/forms/requestLimits.ts`
- Create: `src/domains/forms/rateLimiter.ts`
- Modify: `src/lib/forms.ts`
- Modify: `src/lib/formSpamProtection.ts`
- Modify: `src/app/api/forms/[slug]/submit/route.ts`
- Modify: `src/app/api/search/route.ts`
- Create: `tests/int/request-limits.int.spec.ts`
- Test: `tests/int/forms-submission.int.spec.ts`
- Test: `tests/int/search-route.int.spec.ts`
- Modify: `docs/guides/forms.md`
- Modify: `docs/architecture/feature-inventory.md`

**Interfaces:**
- Produces: `readBoundedJSON<T>(request, { maxBytes }): Promise<T>`.
- Produces: `RequestBodyError` with codes `unsupported_media_type`, `body_too_large`, and `invalid_json`.
- Produces: `RateLimiter` interface with `check(key): RateLimitDecision` and `record(key): void`.
- Produces: `InMemoryRateLimiter` preserving existing form and search limits while returning `retryAfterSeconds`.
- Extends form validation with the exact approved field-count and string limits.

- [ ] **Step 1: Write failing bounded-request tests**

Cover:

- missing or non-JSON Content-Type returns `unsupported_media_type`;
- malformed JSON returns `invalid_json`;
- a UTF-8 body above 256 KiB returns `body_too_large` before JSON parsing;
- 100 fields are accepted and 101 rejected;
- email length 320 accepted and 321 rejected;
- text length 500 accepted and 501 rejected;
- textarea length 10,000 accepted and 10,001 rejected;
- URL/landing-page length 2,048 accepted and 2,049 rejected;
- rate-limit decisions include a positive rounded-up retry interval.

- [ ] **Step 2: Verify the tests fail**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/request-limits.int.spec.ts tests/int/forms-submission.int.spec.ts tests/int/search-route.int.spec.ts
```

Expected: FAIL because current routes call `request.json()` and current validators do not enforce the limits.

- [ ] **Step 3: Implement byte-bounded JSON parsing**

Require a normalized media type of `application/json`; permit parameters such as `charset=utf-8`. Read the body as an `ArrayBuffer`, reject when `byteLength > 262_144`, decode as UTF-8, parse JSON, and throw only the stable `RequestBodyError` variants. Do not include raw input in the error.

- [ ] **Step 4: Enforce form structure and value limits**

Reject arrays as `values`. Count own keys. Apply the limit by field type in `validateFormSubmission`; use the existing field label in public validation messages. Apply URL limits to `landingPage`, single-line limits to `campaign` and `source`, and silently discard unknown metadata keys as today.

- [ ] **Step 5: Centralize local limiter behavior**

Implement `InMemoryRateLimiter` with injected clock support for deterministic tests, periodic pruning, and a bounded key count. Preserve five form submissions per IP/form over ten minutes and twenty search requests per IP over ten seconds. Replace route-global maps with instances of the shared interface. Treat forwarded headers as trusted only in the documented Vercel deployment; normalize the first address and cap key length.

- [ ] **Step 6: Return consistent responses**

Map bounded JSON errors to:

```ts
unsupported_media_type -> 415
body_too_large -> 413
invalid_json -> 400
```

Every 429 response includes `Retry-After`. Preserve form success, honeypot, validation, persistence, Review promotion, event emission, and notification behavior.

- [ ] **Step 7: Document distributed enforcement honestly**

Document the local limiter as defense in depth. List `/api/search`, `/api/forms/*/submit`, `/api/review-feed`, `/api/news-events-tabs`, `/api/calendar-events`, Payload login, and password endpoints as Vercel WAF/durable-store candidates. Do not claim the repository implementation coordinates across instances.

- [ ] **Step 8: Run focused tests and typecheck**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/request-limits.int.spec.ts tests/int/forms-submission.int.spec.ts tests/int/search-route.int.spec.ts
pnpm exec tsc --noEmit
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/domains/forms src/lib/forms.ts src/lib/formSpamProtection.ts src/app/api tests/int docs/guides/forms.md docs/architecture/feature-inventory.md
git commit -m "fix(forms): bound public submissions"
```

Commit body must explain the 256 KiB and field-size limits and the single-instance limiter boundary.

---

### Task 5: Validate uploaded media content before persistence

**Files:**
- Create: `src/domains/media/uploadPolicy.ts`
- Modify: `src/collections/Media.ts`
- Modify: `src/config/uploadLimits.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `tests/int/media-upload-policy.int.spec.ts`
- Create: `tests/int/media.int.spec.ts`
- Modify: `.env.example`
- Modify: `docs/operations/runtime-and-providers.md`
- Modify: `docs/architecture/content-model-map.md`

**Interfaces:**
- Produces: `ALLOWED_MEDIA_MIME_TYPES` for Payload collection upload configuration.
- Produces: `validateUploadedMedia(file: Pick<NonNullable<PayloadRequest['file']>, 'data' | 'mimetype' | 'name' | 'size'>): Promise<void>`.
- Consumes: `req.file` in a collection `beforeValidate` hook without logging file contents.

- [ ] **Step 1: Confirm the actual repository media formats**

Use `rg` over block/config fields and tracked media references. The initial allowlist is:

```ts
[
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]
```

Do not include SVG, HTML, XML, JavaScript, Office macros, or generic octet-stream.

- [ ] **Step 2: Write failing policy tests using tiny fixtures**

Create in-memory fixtures for PNG, JPEG, WebP, AVIF, GIF, PDF, HTML renamed `.png`, mismatched extension/MIME, empty files, and an unsupported SVG. Assert allowed fixtures pass only when extension, declared MIME, and detected signature agree. Error messages identify the policy violation but never contain file bytes.

- [ ] **Step 3: Run the policy tests and verify failure**

Run:

```bash
pnpm exec vitest run --config ./vitest.config.mts tests/int/media-upload-policy.int.spec.ts tests/int/media.int.spec.ts
```

Expected: FAIL because the policy module and MIME allowlist do not exist.

- [ ] **Step 4: Add `file-type` as a direct runtime dependency**

Run:

```bash
pnpm add file-type@21.3.4
```

Do not rely on a transitive package being hoisted.

- [ ] **Step 5: Implement signature and extension validation**

Use `fileTypeFromBuffer` for raster formats. Validate PDF using the `%PDF-` signature and require `.pdf`. Normalize filenames with `path.extname().toLowerCase()`. Map `.jpg` and `.jpeg` to `image/jpeg`; all other allowed extensions have one MIME. Reject missing buffers on creates, empty files, mismatches, and unsupported signatures with a Payload `APIError` using status 400.

On metadata-only updates without `req.file`, preserve the existing document and skip binary revalidation.

- [ ] **Step 6: Apply the policy before persistence**

Set `Media.upload.mimeTypes` to the allowlist while retaining the global 10 MiB aborting limit. In the existing collection `beforeValidate`, invoke binary policy only when a new file is present, then preserve asset-type and alt validation. A failed hook must occur before storage and database persistence.

- [ ] **Step 7: Document the public-media trust class**

State that direct R2 media are public marketing assets. Private submissions require a separate collection/bucket path. Document malware scanning/quarantine as an external prerequisite before accepting arbitrary documents; do not describe signature validation as antivirus scanning.

- [ ] **Step 8: Run focused and generated verification**

Run:

```bash
pnpm generate:types
pnpm exec vitest run --config ./vitest.config.mts tests/int/media-upload-policy.int.spec.ts tests/int/media.int.spec.ts tests/int/media-storage.int.spec.ts
pnpm exec tsc --noEmit
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/domains/media/uploadPolicy.ts src/collections/Media.ts src/config/uploadLimits.ts package.json pnpm-lock.yaml src/payload-types.ts tests/int/media-upload-policy.int.spec.ts tests/int/media.int.spec.ts .env.example docs/operations/runtime-and-providers.md docs/architecture/content-model-map.md
git commit -m "fix(media): validate upload signatures"
```

Commit body must distinguish format validation from malware scanning and note the public-storage trust boundary.

---

### Task 6: Verify the security-boundary phase and synchronize project context

**Files:**
- Modify when facts changed: `.agents/skills/project-context/references/project-inventory.json`
- Modify when behavior changed: `.agents/skills/project-context/references/architecture.md`
- Modify when model changed: `.agents/skills/project-context/references/payload-model.md`
- Modify: `docs/architecture/feature-inventory.md`
- Modify: `docs/operations/developer-workflows.md`
- Create: `docs/adr/0001-public-payload-read-boundary.md`
- Create: `docs/adr/0002-test-database-isolation.md`
- Create: `docs/adr/0003-public-media-trust-boundary.md`

**Interfaces:**
- Produces: maintained architecture documentation matching the implemented security boundaries.
- Produces: three accepted ADRs with Context, Decision, Consequences, and Verification sections.
- Consumes: the final implementation of Tasks 1–5.

- [ ] **Step 1: Inspect the complete phase diff using the change-impact map**

Run:

```bash
git diff 9e7d58b..HEAD --stat
git diff 9e7d58b..HEAD -- src/collections src/access src/config src/domains src/app src/lib tests package.json playwright.config.ts
```

Check producers, consumers, access modes, generated types, tests, and maintained operator guidance together. Correct any stale direct public Review query or unguarded E2E mutator found by the inspection.

- [ ] **Step 2: Write the ADRs**

Each ADR records the approved rule, alternatives rejected, operational consequence, and exact tests enforcing it. ADR 0001 records Local API bypass behavior; ADR 0002 records the dedicated loopback test database; ADR 0003 records public R2 objects and upload-format validation limits.

- [ ] **Step 3: Update project context**

Run:

```bash
pnpm project-context:update
```

Review generated changes. Update `architecture.md` and `payload-model.md` only where the runtime or ownership contract changed. Do not rewrite historical files under `docs/superpowers`.

- [ ] **Step 4: Run the complete phase verification**

Run:

```bash
pnpm generate:types
pnpm generate:importmap
git diff --exit-code -- src/payload-types.ts 'src/app/(payload)/admin/importMap.js'
pnpm exec tsc --noEmit
pnpm lint
pnpm test:int
pnpm build
pnpm project-context:check
```

Expected: every command PASS. If generated outputs change, stage them and rerun the diff check after staging only the expected generated files.

- [ ] **Step 5: Run a secret and unsafe-query scan**

Run:

```bash
rg -n "mongodb\+srv://|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|AKIA[0-9A-Z]{16}" --glob '!pnpm-lock.yaml' --glob '!docs/superpowers/**' .
rg -n "collection: ['\"]reviews['\"]" src
rg -n "process\.env\.MONGODB_URI" tests/e2e tests/helpers
```

Expected: no credential material; Review hits are confined to the collection, domain boundary, and trusted administrative code; E2E helpers reference only validated test configuration.

- [ ] **Step 6: Commit**

```bash
git add .agents/skills/project-context/references docs/architecture docs/operations docs/adr
git commit -m "docs(security): record hardened boundaries"
```

Commit body must name the public Review, test database, and media trust decisions.

## Phase Handoff

After Task 6 passes independent review, continue with separate implementation plans derived from the same approved specification:

1. dependency, Node/pnpm, Docker, and audit baseline;
2. CI, E2E role journeys, dependency review, secret scanning, and container gates;
3. observability, readiness, notification adapter, and release safety;
4. domain-boundary linting, documentation governance, and final whole-branch acceptance.

Do not begin those plans until this security boundary phase is green, because they consume the policies and test infrastructure established here.
