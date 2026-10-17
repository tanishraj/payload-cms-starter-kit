# Architecture

## Runtime and Layers

This is one editorial marketing application: Payload CMS 3.90.2 and Next.js 16.3.8 share a Node.js 22.17.0 App Router process within the supported `>=22.13.0 <23` range, using pnpm 11.17.0, React 19, Tailwind CSS 4, MongoDB, and TypeScript. The main entry points are [Payload configuration](../../../../src/payload.config.ts) and the [App Router](../../../../src/app).

The repository has eight practical layers:

1. Application routes and delivery under `src/app` and the request proxy.
2. Payload content model and governance under collections, globals, fields, access, hooks, and plugins.
3. CMS block schemas, renderers, previews, and thumbnails.
4. Frontend UI and the semantic design system under components and styles.
5. Domain services and runtime adapters under `src/domains`, `src/lib`, and `src/config`.
6. Vitest, Playwright, fixtures, and helpers under `tests`.
7. Maintained architecture, operator, and runbook documentation.
8. Package, Next.js, Docker, lint, and build tooling.

React Server Components load public CMS data. Focused client components own interaction such as carousels, tabs, dialogs, consent, forms, and galleries. Payload Admin, REST, and the public frontend run in the same application; GraphQL is disabled because the repository has no application consumer.

## Public and Administrative Delivery

- `/` loads the published homepage selected in Layout Defaults.
- `/[...slug]` resolves hierarchical Pages, breadcrumbs, metadata, and WebPage JSON-LD.
- `/privacy-policy` and `/terms-and-conditions` are migration-provisioned editable Pages selected through Site Identity legal relationships; existing exact-slug Pages and existing published or pending relationship choices are preserved.
- Article and Review detail and taxonomy routes load published domain records. News/Event retains its detail route while its Topics and Tags are non-interactive metadata. The News/Event route loads its record and cached shared detail-page global in parallel, renders the saved Page-compatible block order, and injects the entry only into the global-only `newsEventsContent` block. Production uses the server renderer; authenticated preview uses the matching client-safe renderer with server-provided data snapshots so its client graph never imports Payload or `server-only` modules.
- `/news-events` explicitly resolves the published CMS Page at that path so editors can compose its
  collection-backed listings from Page blocks. News & Events Highlights is Event-only and places up
  to three eligible manually featured Events before three eligible automatic Events. News & Events
  Tabs remains the complete published directory; Event classifications place current/upcoming
  entries before recent past entries. Article and Review archive landing pages are also ordinary CMS
  Pages.
- Page-compatible blocks may expose stable editor-authored fragment IDs. Production and authenticated
  live preview use the same document-order anchor wrapper, including blocks inside Reusable Sections
  and the News & Events detail template. Root scrolling accounts for the sticky Admin, announcement,
  and Header shell and becomes immediate under `prefers-reduced-motion`. The frontend route-transition
  guard suppresses Next.js scroll management while the outgoing page is visible. A remounting App
  Router template signals only after the outgoing route has been replaced, then the guard positions
  the committed destination immediately. Sticky desktop dropdown triggers suppress pointer-induced
  focus scrolling, and dropdown link dismissal does not restore trigger focus before navigation;
  same-page fragment navigation remains smooth.
- `/search`, `/api/search`, feeds, sitemap, robots, and Open Graph image routes implement discovery.
  Generated Open Graph routes keep their page-specific cards when their published record and public
  media logo are available, and return the code-owned SNMIH preview when a required record or the
  bounded remote-logo request is unavailable. Fetched AVIF logos are normalized to PNG before they
  reach Next.js `ImageResponse`, while renderer-supported image formats pass through unchanged.
- `/preview/page/[id]` and live-preview components render authenticated draft data. Draft Page,
  Article, and News/Event Local API reads pass the authenticated user with access enforcement;
  published shared settings continue through their public access branch.
- The shared public frontend layout depends only on tagged CMS data. It does not read request
  cookies or authenticate a Payload user. A post-hydration request to the private, no-store
  `/api/frontend-session` endpoint returns only email and role and mounts the editor toolbar when a
  valid session exists.
- Gallery Album-backed blocks discover explicitly selected album dependencies across Event Gallery,
  Image Mosaic, and populated Reusable Sections. Production block adapters load only selected
  published albums; authenticated routes load selected draft albums on the server and pass the same
  serializable snapshot to client-safe preview adapters. Gallery clients never query Payload.
- Form submission, review-feed, News & Events Tabs pagination, Calendar month loading, redirects, and media reconciliation
  have focused route handlers. The public redirect map is served from `/api/public-redirects`,
  leaving `/api/redirects` exclusively owned by Payload's collection REST API so Admin create,
  update, and delete requests reach Payload. Public form JSON is media-type checked and byte-bounded before parsing,
  and its schema-backed values and known metadata have explicit size limits. Schema values reject undeclared names, malformed scalar types and non-plain objects; the fixed review engine alone opts into its known extra keys and separately validates them. Form submission and
  search share bounded, periodically pruned in-memory rate-limiter behavior with `Retry-After`;
  this is single-instance defense in depth, while coordinated production enforcement belongs in
  Vercel WAF or a durable shared store. Forwarded client addresses contribute to limiter identity
  only on Vercel, where the deployment platform owns those headers.
- Authenticated submission CSV exports share the native Payload REST router. The inbox action
  reuses its current filters/search; bounded access-enforced cursor reads serialize captured
  historical answers, never current Form definitions or private file tokens. Original meaning
  survives question changes/deleted Forms; legacy rows are explicit. See the Payload model
  and historical export contract for limits, spreadsheet safety and operational consistency.
- Full-page Page creation uses an optional guided setup for Admins and Site Managers with code-owned Blank and Landing recipes. The
  authenticated `POST /api/pages/create-from-recipe` collection endpoint accepts a Page title, approved recipe ID and optional Parent (required for Managers), creates through Payload with `draft: true` and access enforcement, and
  returns the native edit destination. Existing Page editing and relationship-drawer creation keep
  Payload's native document view; `?editor=native` also allows ordinary full-page native creation.
  Managers choose an assigned root from minimal, uncached, root-only native Pages REST reads
  (at most 50; partial reads fail closed), with a single choice inferred. Draft creation remains
  access-enforced on the server, independent of the available client options. See
  [section-aware recipes](../../../../docs/operations/scoped-page-recipes.md). A non-persisted UI field before Page Layout observes native
  dirty/processing/public-version facts and reuses the sourced optional getting-started panel.
  Saved preview opens the access-enforced preview route in a separate tab; it does not transport
  unsaved form values. Dashboard/Page visibility use independent account-owned preference keys
  with one shared confirmed-write adapter and access-enforced server read helper. Drawers,
  read-only, trashed and locked documents omit the Page guide. See the
  [Page editing guide](../../../../docs/operations/page-editing-guide.md).
- Dashboard attention remains feature-driven. Pending submitted Reviews, open Form Submissions, and
  Action Queue counts query only destinations granted to the authenticated user with
  `overrideAccess: false`. Counts and quick actions for ungranted features are absent, and failed
  operational counts remain visibly unavailable instead of becoming zero.
- `/admin` and Payload REST live under the Payload route group. The generated GraphQL route files remain present, but Payload disables GraphQL and its Playground at configuration level.
- Development-only block thumbnail previews live under their own route group.
- The public frontend layout mounts one theme-aware Back to Top control outside the content shell.
  It appears after `64px` of scrolling, stays below consent and modal layers, and switches from
  smooth to immediate scrolling when the visitor prefers reduced motion. Visible non-modal consent
  surfaces publish their measured bottom obstruction only when their rendered bounds overlap the
  button column, keeping the control clear through responsive reflow. Admin and block thumbnail
  route groups do not inherit it.

Exact current route paths live in [project-inventory.json](project-inventory.json).

## Providers and Runtime Contract

[runtime.server.ts](../../../../src/config/runtime.server.ts) is the server-only, read-once owner of secret-bearing environment state. [runtime.ts](../../../../src/config/runtime.ts) retains pure parsing and types for focused validation, while [publicOrigin.ts](../../../../src/config/publicOrigin.ts) exposes only the browser-safe canonical public origin. Server and browser-safe paths share [applicationOrigin.ts](../../../../src/config/applicationOrigin.ts) validation and normalization semantics. [starterContract.ts](../../../../src/config/starterContract.ts) rejects unsupported deployment combinations, and [providers.ts](../../../../src/config/providers.ts) constructs MongoDB, optional Resend email, and local/S3 storage only from typed runtime configuration. Payload uses the canonical origin for server URL, CORS, CSRF, live preview, and redirect-map loading; the request Host is never a proxy fetch target. The proxy uses the current request URL only to reject an exact absolute self-loop, including on an alias host. S3-compatible storage can supply a validated public HTTPS origin: Payload then generates encoded direct-media URLs and Next.js allows that exact remote image host, while authenticated uploads, deletes, and reconciliation continue through the private S3 endpoint. Uploads remain server-side so Media format policy runs before Payload file generation and replacement cleanup; runtime configuration rejects S3 browser uploads and the storage plugin never enables them. Direct-origin objects bypass Payload media access checks and are restricted to public-safe content.

MongoDB is the supported database. Local Docker Compose pins MongoDB 8.0.29 and isolates its files in the version-specific
`mongo_data_8_0` volume so Atlas dump and restore workflows do not cross MongoDB server versions. It
initializes one `rs0` member advertising `mongo:27017`, reports healthy only as writable PRIMARY,
publishes the normal developer endpoint only on loopback, and makes host clients use
`directConnection=true`. The fixed Docker verifiers use only ephemeral loopback test bindings and
current-run Compose, image, and BuildKit-builder resources. They share one atomic owner-token lock,
pin Compose to absolute repository paths with an allowlisted environment, use an owner-only empty env
fixture, and require matching ownership markers before cleanup. They prove a request-threaded Payload
transaction and inspect the Node 22 standalone image for persisted build secrets. Local development
may use local-disk media. Vercel production must use durable S3-compatible storage. Email is either disabled or delivered through Resend; a production recipient override requires an explicit allow flag. Production requires a canonical HTTPS origin, a non-placeholder Payload secret of at least 32 characters, and disables GraphQL completely. Anonymous first-Admin creation also requires the Users collection to be literally empty, including trashed records, and the environment-specific bootstrap flag to be enabled; production additionally pins the request to one normalized configured email, with Payload's unique email index selecting the atomic winner under a same-address race. Non-production ignores any configured first-Admin email and remains flag-only. Payload caps global relationship depth at 10 to preserve the existing Page preview depth-8 and redirect-hook depth-10 consumers. It uses session authentication with five-attempt/ten-minute lockout, two-hour tokens, token-free auth responses, and secure SameSite=Lax cookies in production. Upload limits live in [uploadLimits.ts](../../../../src/config/uploadLimits.ts).

GitHub verification uses one read-only, bounded job with immutable setup-action revisions and fixed
non-secret environment fixtures. After the frozen install and production dependency audit, its
CI-only controller creates an owner-labeled MongoDB 8.0.29 container on loopback, configures the sole
`rs0` member as `127.0.0.1:27017`, and waits for the exact version and writable-primary state. The
controller accepts only a matching GitHub run identity and safe `_test` database URIs. The job
installs bundled Chromium, regenerates Payload types and the Admin import map and rejects either
drift, runs TypeScript, lint, the complete integration suite, seven native Admin/Site Manager
access, scoped-recipe creation, dashboard/Page/site/homepage guidance and Review-moderation browser journeys, the Generic Form/Contact6
journeys, and the Node 22 Vercel production build. The job supplies fixed non-secret values; isolated
browser configuration may load only the
tracked non-secret `test.env` fixture, never ignored developer `.env` or `.env.atlas.local`, a
production environment file, or a production secret. Its final step always verifies ownership
before removing the exact container. A pinned upload-artifact action always attempts to retain only
`playwright-report/` and `test-results/` for seven days, including failure snapshots and retry traces.
Project-context maintenance stays local; the ownership-checked
production-image verifier is a local/release portability and build-secret inspection gate rather
than a GitHub job.

The operator-only `pnpm setup:check` script uses Next's environment precedence,
the existing pure runtime/provider validation, bounded MongoDB capability/Users
reads and local filesystem access metadata. It never initializes Payload or writes
setup state. Static diagnostics withhold configured values and raw errors; manual
sign-in/preview, actual storage operations and launch remain explicitly unverified.
`--production` retains production constraints. See the
[developer quickstart](../../../../docs/operations/developer-quickstart.md).

## Caching and Delivery Safety

The production Dockerfile supports both a `payload_build_env` dotenv secret file and individual
Coolify BuildKit secrets mounted as environment variables using Dockerfile frontend 1.10. The file
takes precedence when present. Explicit mounts avoid Coolify's automatic-injection skip for RUN
instructions that already mount secrets; missing database/authentication secrets fail before build.
See the runtime/provider runbook for build/runtime flags and preview-origin requirements.

Layout globals, the News & Events detail template, Pages, fixed Calendar month projections, and redirects use tagged caching and focused invalidation hooks. The anonymous shell stays cacheable because editor-session and analytics-consent cookies are evaluated only by post-hydration client boundaries. Calendar Upcoming data uses five-minute freshness and stays independent of month, view, and classification filtering inside the selected scope. Site timezone, News/Event classification, and News/Event publication changes invalidate Calendar projections. Page, Article, Review, News/Event, and Redirect hooks invalidate both publication and takedown transitions, including published deletion. Feeds, robots, and sitemap use explicit time revalidation. Article and Review helpers also use request-level deduplication. Preserve draft/public filtering and cache invalidation together when changing queries or hooks.

CMS-backed remote images resolved through the shared media image-props helper append a validated
Payload `updatedAt` version query. Replacing an object under the same public filename therefore gives
the Next.js image optimizer a new cache key without disabling resizing or AVIF/WebP negotiation.
Absolute same-origin Payload `/api/media/file/` URLs are normalized to root-relative paths so local
image policy remains consistent when Payload expands relationships using the canonical server URL.
Root-relative media paths and canonical URLs used outside that image-props boundary remain unchanged.

Trusted CLI migrations that create Pages mark their writes to skip Next.js cache revalidation,
because the standalone Payload process has no live Next.js cache store; ordinary runtime writes
retain the complete invalidation behavior above.

Maintenance and coming-soon overrides wrap the homepage, catch-all Page routes, and the explicit Page-backed `/news-events` route regardless of CMS authentication. Editors inspect normal or draft Page content through authenticated `/preview/page/[id]`; other dedicated domain, search, feed, Admin, and API routes remain reachable.

## Themes and Analytics

Two theme presets are registered: SNMIH-Green (`snmih-green`) and SNMIH-Blue (`snmih-blue`). SNMIH-Blue is the default and runtime fallback. Legacy `default` and `snmih` values retain their former appearance through runtime normalization until the reversible Payload migration updates current settings and version history. Theme files live under [src/styles/themes](../../../../src/styles/themes). Block sections use semantic page/subtle/brand surfaces; card surfaces use Default, Primary, Secondary, Muted, and Accent. Renderers resolve foreground, supporting text, icon, divider, link, and button contrast from those semantics. Shared framed Tabs use Primary for the selected item, while Underline Tabs use Primary for their active text and rule, so both presets retain a consistent interaction hierarchy without hard-coded brand colors.
Public frontend corner geometry also follows semantic theme roles rather than fixed Tailwind sizes. `rounded-card` and `rounded-control` derive from `--radius` and cap at `0.75rem`; `rounded-compact` derives from half the theme radius and caps at `0.25rem`. Cards, media frames, controls, and compact details therefore remain subtly rounded in SNMIH-Blue and more generously rounded in SNMIH-Green, while explicit pills and circular controls continue to use `rounded-full`. Payload Admin is outside this public presentation contract.
Muted and completed-status treatments own explicit contrast-tested foreground pairs in both modes.
Supporting copy on semantic card and brand surfaces uses the complete paired foreground rather than
reducing opacity below the accessible contrast contract.
Light media overlays keep a dedicated contrast-tested foreground from each theme's light palette in
both website modes, because the overlay surface remains white even when the surrounding page is dark.

Google Tag Manager takes precedence over standalone GA4. The cached server layout passes primitive analytics settings to a client controller; GTM or standalone GA4 plus Vercel Speed Insights load only after the consent cookie is granted. Acceptance dispatches a same-page event and mounts the integrations without navigation. Admin routes are excluded from public analytics.

The Cookie Consent Modal uses a focus-trapped dialog. It initially focuses rejection, treats Escape
as rejection, ignores backdrop dismissal, and restores the visitor's previous focus after a decision.
The Bottom Bar, Floating Card, and Corner Badge remain non-modal.
The banner's configured Privacy Policy destination resolves the complete selected Page hierarchy,
so moving that Page beneath a parent does not leave consent UI pointing at its leaf slug.

## Verification

- Run focused Vitest files while iterating, then `pnpm test:int`.
- Run `pnpm audit:prod` as the sole exception-aware production dependency audit gate; raw pnpm
  audit output is diagnostic and must not be used as an independent pass/fail result. The exception
  schema, approval workflow, and narrow lock refresh procedure live in
  [dependency-management.md](../../../../docs/operations/dependency-management.md).
- Run `pnpm test:e2e` for affected Admin or browser journeys. Playwright loads its committed
  isolated `test.env` with override enabled, accepts only an explicit loopback MongoDB database name
  ending in `_test` or `-test`, replaces every runtime-sensitive child value and ambient Node
  option with the fixed Payload/TypeScript import flags, and starts a fresh development server.
  The focused runtime-import config proves that boundary in a real worker without a server or
  database connection.
- Run `pnpm test:e2e:governance` for feature-grant/revocation, dashboard onboarding, first-draft
  editing/preview, site setup, homepage/navigation and submitted-Review moderation. The Page journey awaits native
  server field state before expanding a newly added block; its placeholder is not edit-ready.
  GitHub CI also runs `pnpm test:e2e:forms`; the full E2E suite remains local.
- Run `pnpm generate:types` after schema changes.
- Run `pnpm generate:importmap` after custom Admin component changes.
- Run `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` in proportion to risk.
- Finish every implementation with `pnpm project-context:update` and `pnpm project-context:check`.
- Project-context update/check remains a local repository-maintenance loop and does not run in
  GitHub Actions. CI uses the exact one-job contract described above on pull requests and pushes to
  `develop` or `main`. Memory-backed tests pin MongoDB 8.0.29 as a one-member replica so transaction
  behavior matches the supported adapter.

Use the maintained [feature inventory](../../../../docs/architecture/feature-inventory.md), [content model map](../../../../docs/architecture/content-model-map.md), [runtime/provider runbook](../../../../docs/operations/runtime-and-providers.md), and [developer workflows](../../../../docs/operations/developer-workflows.md) for deeper operational context.


## September 2026 delivery backport

Public search and its API share `lib/search.ts`, retaining the starter public-review access helper and bounded API rate limiter. At most 2,000 matching candidates per content type are scanned in 20 batches and ranked within each content type by exact title, prefix, substring, all query words, then metadata-only match, with deterministic ties before UI limits.

`GET /api/media-download/[id]` reads only published publicly accessible Media and streams attachments from the canonical site's Payload file path or configured public S3 origin. Caller URLs and upstream redirects are rejected; requests time out and responses use no-store. Shared file actions and Download List use this endpoint for remote downloads while View actions remain direct. Runtime origin/storage values come from the server-only configuration owner.

CMS tag invalidation now uses immediate expiration (`expire: 0`). Forms, Gallery Albums, Media, Navigation Links, System Pages, Search Settings and Site Modes invalidate their dependent public caches on publication changes. Existing CLI revalidation skip guards remain. Shared shell relationships select routing metadata instead of full Page layouts; nested top-level Pages without parent fields are recognized when stripping internal content. Scroll commit signals track pathname/query changes and position final redirected destinations, retaining same-page fragment behavior.

The optional production database backup workflow is disabled unless the repository enable variable is set. A separate explicitly configured database/private R2 bucket and scoped prefix receive compressed archives and SHA-256 sidecars, with upload length/metadata verification before bounded retention cleanup. This is a logical database backup, not a media or point-in-time backup; see docs/operations/database-backups.md. No production backup is run by implementation or verification.

## Storybook preview workspace

Storybook 10.6 uses the Next.js Vite framework with an isolated `.storybook/next.config.mjs`. The revamp starts with fresh upstream Radix Luma components in `src/components/revamp`; `components.json` routes installs there and targets `.storybook/preview.css`. The catalogue includes `src/stories/revamp/**/*.stories.tsx` and existing production block stories in `src/stories/blocks/**/*.stories.tsx`. Each of the 68 current blocks has one canonical Blocks entry; Generic Form and Contact6 retain their interactive entries. The preview uses isolated Tailwind CSS and official shadcn Neutral tokens; revamp stories import no legacy website CSS, and no stories import Payload configuration. Existing block stories conditionally mount their production CSS and SNMIH Blue preset through a reference-counted decorator, restoring Neutral when they unmount. Storybook-only API interception rejects CMS fetches; fixtures supply presentation data without server loaders. Font variables use the production system fallbacks. Every new component/block requires Docs, Default and supported configuration controls with sample data and provenance. Complete Storybook presentation before adding matching Payload fields/adapters. `pnpm storybook` serves localhost:6006; `pnpm build-storybook` emits ignored static output. See `docs/operations/storybook.md`.

The generic form workshop adapts authenticated Shadcnblocks `form-form-patterns-4`
and `checkbox-checkbox-standard-1` with the eight current Payload control types,
arbitrary field definitions and the shared browser-safe form validator.
`GenericForm` owns accessible local interaction and accepts an asynchronous
submission callback; CMS loading and API transport remain caller-owned. Stories
use only synthetic data/local callbacks. The native `genericForm` and `contact6` blocks use that shared form engine through a published-only
server adapter, an explicit client transport and a client-safe disabled preview.
Production inherits existing shared website tokens; the public import guard permits
only its reviewed adapter, and official Luma radius mappings serve its dependencies.
There is no form-specific palette or global website-theme replacement.
Published generic definitions include a server-only-computed history fingerprint.
Generic transports send it as `formRevision`; stale requests receive a sanitized
409 before storage/notifications, and the shared form recovers only compatible
stable-ID answers for review and deliberate resubmission. The loader uses the v2
cache namespace; legacy revisionless clients retain their existing protocol.
See `docs/planning/form-revision-recovery.md` for precise boundaries.


The native dynamic-form browser journey runs through `pnpm test:e2e:forms` on the
required loopback test database and is a Quality gate. The fixture worker retains
`react-server`/tsx for its existing form helpers. Governance browser fixtures use a
short-lived Node subprocess with explicit loader flags, a bounded deadline and
structured IPC; Payload configuration stays outside Playwright's worker transform
graph. Both parent and subprocess validate the loopback test database before work,
and the subprocess boots the canonical Payload config before importing fixture
helpers, then closes Payload before reporting success. Access, optional
onboarding and Review moderation are independent native journeys with the existing
per-test budget. Governance cleanup deletes only recorded Page IDs through the
Local API, children before roots, independently of browser cookies. The Next web
server keeps its normal framework-managed React contexts. Forcing `react-server`
globally on Next breaks its public frontend compilation/SSR.

## October 7 security patch baseline

The aligned Payload family is 3.90.2 and Sharp is 0.35.5. The existing scoped Undici override targets Payload 3.90.2 only (7.29.1); other consumers retain their own graph. See the October 7 dependency remediation for upstream compatibility review, scheduled-job operator action and verification. Braces exception policy/expiry remains unchanged.

## Generic submission retries

Generic Form and Contact6 share durable receipt lookup and optional unique sparse Mongo key hashes via `formSubmissionIdempotency.server.ts`. Public intake verifies the installed constraint, persists before notification, returns stored confirmations on matching retries and refuses key reuse with changed answers. Client keys survive unconfirmed responses in memory; explicit new responses mint new keys. See [retry contract](../../../../docs/planning/form-submission-retries.md); notification delivery recovery remains separate work.

Quality runs native governance/form browser journeys before the production build. That build step removes only CI’s generated `.next` output after Playwright server teardown, then runs the unchanged `pnpm build` gate. This prevents stale/malformed dev-only route types from entering production TypeScript checking; authored source and fresh production types still pass the full compiler. Local developer caches and build scripts are unchanged.

## Private form file delivery

`formAttachmentStorage.ts` independently parses private provider configuration through runtime.server: development owner-only `.private/form-attachments`, production disabled or separate HTTPS S3 bucket/credentials. Public Media plugins, URLs and ACLs are never used. Private metadata is a hidden non-upload collection. A bounded octet-stream endpoint stages verified files under random keys; submission transactions claim them with the durable receipt, and transactional reads avoid parallel pagination counts. Downloads authenticate full inbox permission, enforce exact submission access and verify receipt linkage and bytes, forcing no-store binary attachments. Cleanup is a bounded trusted CLI with transaction/reference protection, 24-hour pending expiry, trash retention and retried permanent deletion; production schedules it hourly. The fifteen-control form renderer stays client-safe; provider, crypto/content inspection and Payload operations remain server-only. See [operations](../../../../docs/operations/private-form-attachments.md). Existing runtime layers/ownership are unchanged; the broader graph's historical freshness warning remains distinct from current deterministic inventory.

Private local uploads are excluded from Next.js output tracing and Docker build context. Every `pnpm build` runs `verify-private-attachment-artifact.mjs` after compilation and fails if server traces or standalone output contain `.private`. A real synthetic-file build first reproduced traced/bundled private data; the exclusion and read-only artifact gate prevent shipping it. This is part of the private-file boundary, not an environment-only guarantee.


### Native form API ownership

`formEndpoints.ts` registers reusable Form submit/upload handlers and the private
submission download on their owning Payload collections. These public URLs remain
`/api/forms/:slug/submit`, `/api/forms/:slug/attachments` and
`/api/form-submissions/:id/attachments/:token`; there is one REST dispatch owner
and one implementation per URL, rather than overlapping Next handlers and
Payload's API catch-all. Lazy adapters pass the existing `req.payload` instance
and the original unread Request stream to handlers under `src/endpoints/forms`.
The 256KiB JSON limit, 3MiB upload stream limit, published-revision checks,
idempotency/transaction claims, generic history/notifications, and current
authorized no-store binary download checks remain mandatory. No eager Payload
body/file parsing, public Media fallback, route prewarming or weaker test assertion
is introduced. CI's previous upload requests reached Payload REST and returned
route-not-found; native registration makes this URL resolvable by that router.
The underlying platform routing discrepancy is not claimed to be diagnosed.


Supported Form appearance is one browser-safe typed allowlist and native reusable
Form group; both public/disabled-preview adapters pass the same settings. Canonical
non-default appearance contributes to the published/intake revision and original
snapshot, with explicit review/recovery and preserved compatible answers. Default
groups remain absent from legacy output/hashes. Fixed clients reject active settings,
including revisionless intake; no new endpoint, provider, dependency or palette.
See [appearance contract](../../../../docs/planning/form-appearance-controls.md).

Form questions can reference earlier stable-ID questions with declarative visibility
rules. Payload's custom `FormVisibilityRules` field authors the rules; `formConditions.ts`
evaluates them consistently. All rules must match, and a question may be conditionally
required. Hidden answers and private upload tokens are cleared client-side, excluded
from normalized intake, and rejected when nonempty in a forged request. Conditions enter
published revisions, and stale recovery explains answers that are newly hidden. See
the [conditional question contract](../../../../docs/planning/form-conditional-rules.md).


Section access uses Payload-native field, collection and version policies with
request-local current ownership queries. Site Managers use the default Page editor
with an assigned Parent, optionally chosen through section-aware Blank/Landing recipes. Protected email links do
not grant access themselves: private downloads require the submission's inbox
feature and section (or Admin). The first rollout covers Pages, Forms, Reusable
Sections, Media, submissions and related operational rows; other feature grants are
site-wide. No provider/environment/schema migration or separate editor is added.
See [scope boundary and limits](../../../../docs/operations/section-scoped-access.md).


The native Dashboard adds one optional sourced getting-started panel. Its
server-only loader uses current scoped root/draft reads with access enforcement;
account-owned native Payload preferences persist guide visibility. No onboarding
flag grants permission or certifies readiness. Missing assignments, query errors
and optional preference errors remain distinct. The client verifies saved values
and restores focus on hide/reopen. Scoped Tailwind/preflight affects only this
widget and inherits native Payload colors; no public theme or provider changes.
See [contract](../../../../docs/operations/admin-getting-started.md).


Governance fixture commands and the dynamic-form test account seed run in the same
short-lived, database-guarded Node child process. Playwright never initializes
Payload for those operations. IPC reports import/database phases, enforces a
90-second process deadline and requires clean shutdown before success. This bounds
config-import stalls. Before Payload imports, a test-only resolver adapted from
[Payload's upstream CLI fix](https://github.com/payloadcms/payload/pull/18398)
selects Lexical 0.50's matching static development/production exports to avoid its
asynchronous Node wrappers. Explicit conditions and every unrelated package remain
unchanged; neither application resolution nor dependencies are modified. Public form navigation and authenticated preview each have a 120-second cold
compilation allowance within the unchanged seven-minute form journey budget.


Native Site Identity and Appearance include the same sourced optional guide used
for Dashboard/Page help. Explicit non-persisted UI fields observe current native
form and lock state; forward links are unavailable while dirty or processing.
The server reads only account-owned preferences and capability flags, not another
copy of global settings. Admin quick actions open Site Identity; Manager links
respect existing feature grants. Public global reads and native draft/publication
authority are unchanged. See [site setup](../../../../docs/operations/site-setup-guide.md).


Native Page guidance links a clean public Page to Layout Defaults only for its
actual management grant. Admin Dashboard adds the same shortcut. A non-persisted
Site Structure UI field reuses the sourced panel; only homepage-presence is
selected from form state. Native dirty/processing facts disable onward links, and
capability props restrict Header/Footer destinations. No readiness claim or
settings write is performed by guidance. See
[homepage/navigation contract](../../../../docs/operations/homepage-navigation-guide.md).

Published Page deletion honors the existing explicit server-only
`skipCacheRevalidation` context, matching Page change hooks. Guarded fixture
cleanup can therefore delete its recorded published Pages outside Next's request
context. Ordinary published deletion still immediately invalidates Page/sitemap
tags; no client-provided data or feature grant can set that server context.


Native Users adds an Admin-only optional team-selection preview through an
explicit UI field. Stable form selectors observe role, feature bits and unique
root count without subscribing to credentials or copying account data. Selected
access stays unconfirmed until native Save succeeds; the preview is not an
authorization audit. `sectionScope.ts` is the browser-safe owner of existing
scope keys/normalization, reexported by server `sectionAccess.ts`. The shared grant
summary lives in `adminFeatures.ts` with its prior presentation export preserved.
Server enforcement, session revocation and last-Admin/bootstrap policy are
unchanged. See [team setup](../../../../docs/operations/team-setup-guide.md).


## Page history recovery

Pages override only the native POST `/versions/:id` collection endpoint; generated
Next routes and comparison/confirmation UI stay intact. The supported helper uses
Payload's public native `restoreVersionOperation` with `draft: true` and access
enforcement because the pinned Local API wrapper drops that option. An isolated
request frame protects restoration-specific context/query settings and shares the
native transaction. Raw unsafe Page restore operations fail closed. Page hooks
normalize status before publication checks, preserve live navigation/reference
semantics and record a single source-version audit atomically. Other collection/
global restoration remains outside this increment. See the
[history contract](../../../../docs/operations/page-history-restoration.md).

The pinned Payload Next package has a pnpm-managed native password-reset feedback
patch. Native Form owns HTTP errors, JSON parsing and processing reset; the page
uses onSuccess only to update confirmation and resend cooldown after a parsed
acknowledgement. The dedicated captured-request browser fixture preserves the
guarded local test database and never sends reset requests to the server.
Runtime patch files and their workspace registration enter the deterministic
source digest. See [contract](../../../../docs/operations/native-password-reset-feedback.md).

Client password recovery derives availability from existing email configuration.
A Users beforeOperation guard blocks forgotPassword before account lookup/token
creation when Resend is unavailable or recipient-overridden. Disabled deployments
route /admin/forgot to the existing login view with actionable Admin-help copy;
enabled deployments retain Payload native ForgotPassword. Only a boolean crosses
to the existing client auth form; no secrets or new presentation dependency.
See [handoff](../../../../docs/operations/client-account-handoff.md).

The isolated two-factor browser harness now registers the same fixture-only
static Lexical resolver used by governance workers before importing Payload config.
This avoids the reproduced pre-server config-import stall without application
package, timeout or retry changes.

Media reuses section resource access and native upload/relationship controls. Private
shared metadata is field-protected; detailed usage is Admin-only. Public file delivery
is distinguished from scoped metadata access so editor cookies cannot break published
images. File/ownership preflight precedes Payload upload side effects, and Media writes
invalidate request-local ownership lookups used by subsequent native permissions.
See [Media rollout](../../../../docs/operations/scoped-media-access.md).
