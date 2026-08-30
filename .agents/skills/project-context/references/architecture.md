# Architecture

## Runtime and Layers

This is one editorial marketing application: Payload CMS 3.85.2 and Next.js 16 share the App Router process, with React 19, Tailwind CSS 4, MongoDB, and TypeScript. The main entry points are [Payload configuration](../../../../src/payload.config.ts) and the [App Router](../../../../src/app).

The repository has eight practical layers:

1. Application routes and delivery under `src/app` and middleware.
2. Payload content model and governance under collections, globals, fields, access, hooks, and plugins.
3. CMS block schemas, renderers, previews, and thumbnails.
4. Frontend UI and the semantic design system under components and styles.
5. Domain services and runtime adapters under `src/lib` and `src/config`.
6. Vitest, Playwright, fixtures, and helpers under `tests`.
7. Maintained architecture, operator, and runbook documentation.
8. Package, Next.js, Docker, lint, and build tooling.

React Server Components load public CMS data. Focused client components own interaction such as carousels, tabs, dialogs, consent, forms, and galleries. Payload Admin, REST, GraphQL, and the public frontend run in the same application.

## Public and Administrative Delivery

- `/` loads the published homepage selected in Layout Defaults.
- `/[...slug]` resolves hierarchical Pages, breadcrumbs, metadata, and WebPage JSON-LD.
- Article and Review detail and taxonomy routes load published domain records. News/Event retains its detail route while its Topics and Tags are non-interactive metadata. The News/Event route loads its record and cached shared detail-page global in parallel, renders the saved Page-compatible block order, and injects the entry only into the global-only `newsEventsContent` block. Production uses the server renderer; authenticated preview uses the matching client-safe renderer with server-provided data snapshots so its client graph never imports Payload or `server-only` modules.
- `/news-events` explicitly resolves the published CMS Page at that path so editors can compose its collection-backed listings from Page blocks. Article and Review archive landing pages are also ordinary CMS Pages.
- `/search`, `/api/search`, feeds, sitemap, robots, and Open Graph image routes implement discovery.
- `/preview/page/[id]` and live-preview components render authenticated draft data. Draft Page,
  Article, and News/Event Local API reads pass the authenticated user with access enforcement;
  published shared settings continue through their public access branch.
- Gallery Album-backed blocks discover explicitly selected album dependencies across Event Gallery,
  Image Mosaic, and populated Reusable Sections. Production block adapters load only selected
  published albums; authenticated routes load selected draft albums on the server and pass the same
  serializable snapshot to client-safe preview adapters. Gallery clients never query Payload.
- Form submission, review-feed, News & Events Tabs pagination, Calendar month loading, redirects, and media reconciliation
  have focused route handlers.
- Full-page Page creation uses a guided Admin setup with code-owned Blank and Landing recipes. The
  authenticated `POST /api/pages/create-from-recipe` collection endpoint accepts only a Page title
  and approved recipe ID, creates through Payload with `draft: true` and access enforcement, and
  returns the native edit destination. Existing Page editing and relationship-drawer creation keep
  Payload's native document view.
- Dashboard workflow attention remains source-collection driven. `In Review` and future
  `Scheduled` counts aggregate only capability-authorized Local API queries using the authenticated
  user with `overrideAccess: false`. The aggregate containers are non-interactive; non-zero
  collection rows link to exact matching Payload list filters, and failed counts remain visibly
  unavailable instead of becoming zero.
- `/admin`, Payload REST, GraphQL, and GraphQL Playground live under the Payload route group.
- Development-only block thumbnail previews live under their own route group.

Exact current route paths live in [project-inventory.json](project-inventory.json).

## Providers and Runtime Contract

[runtime.ts](../../../../src/config/runtime.ts) reads environment behavior, [starterContract.ts](../../../../src/config/starterContract.ts) rejects unsupported deployment combinations, and [providers.ts](../../../../src/config/providers.ts) constructs MongoDB, optional Resend email, and local/S3 storage.

MongoDB is the supported database. Local Docker Compose pins MongoDB 8.0.29 and isolates its files in the version-specific
`mongo_data_8_0` volume so Atlas dump and restore workflows do not cross MongoDB server versions. Local development may use local-disk media. Vercel production must use durable S3-compatible storage. Email is either disabled or delivered through Resend. Production requires a non-placeholder Payload secret of at least 32 characters and disables GraphQL introspection and Playground. Upload limits live in [uploadLimits.ts](../../../../src/config/uploadLimits.ts).

## Caching and Delivery Safety

Layout globals, the News & Events detail template, Pages, fixed Calendar month projections, and redirects use tagged caching and focused invalidation hooks. Calendar Upcoming data uses five-minute freshness and stays independent of month, view, and classification filtering inside the selected scope. Site timezone, News/Event classification, and News/Event publication changes invalidate Calendar projections. Page, Article, Review, News/Event, and Redirect hooks invalidate both publication and takedown transitions, including published deletion. Feeds, robots, and sitemap use explicit time revalidation. Article and Review helpers also use request-level deduplication. Preserve draft/public filtering and cache invalidation together when changing queries or hooks.

Maintenance and coming-soon overrides currently wrap the homepage, catch-all Page routes, and the explicit Page-backed `/news-events` route; other dedicated domain, search, feed, Admin, and API routes remain reachable.

## Themes and Analytics

Two theme presets are registered: SNMIH-Green (`snmih-green`) and SNMIH-Blue (`snmih-blue`). SNMIH-Blue is the default and runtime fallback. Legacy `default` and `snmih` values retain their former appearance through runtime normalization until the reversible Payload migration updates current settings and version history. Theme files live under [src/styles/themes](../../../../src/styles/themes). Block sections use semantic page/subtle/brand surfaces; card surfaces use Default, Primary, Secondary, Muted, and Accent. Renderers resolve foreground, supporting text, icon, divider, link, and button contrast from those semantics. Shared framed Tabs use Primary for the selected item, while Underline Tabs use Primary for their active text and rule, so both presets retain a consistent interaction hierarchy without hard-coded brand colors.
Public frontend corner geometry also follows semantic theme roles rather than fixed Tailwind sizes. `rounded-card` and `rounded-control` derive from `--radius` and cap at `0.75rem`; `rounded-compact` derives from half the theme radius and caps at `0.25rem`. Cards, media frames, controls, and compact details therefore remain square in SNMIH-Blue and consistently rounded in SNMIH-Green, while explicit pills and circular controls continue to use `rounded-full`. Payload Admin is outside this public presentation contract.
Muted and completed-status treatments own explicit contrast-tested foreground pairs in both modes.
Supporting copy on semantic card and brand surfaces uses the complete paired foreground rather than
reducing opacity below the accessible contrast contract.
Light media overlays keep a dedicated contrast-tested foreground from each theme's light palette in
both website modes, because the overlay surface remains white even when the surrounding page is dark.

Google Tag Manager takes precedence over standalone GA4. Analytics and Vercel Speed Insights load only after the consent cookie is granted. Admin routes are excluded from public analytics.

The Cookie Consent Modal uses a focus-trapped dialog. It initially focuses rejection, treats Escape
as rejection, ignores backdrop dismissal, and restores the visitor's previous focus after a decision.
The Bottom Bar, Floating Card, and Corner Badge remain non-modal.

## Verification

- Run focused Vitest files while iterating, then `pnpm test:int`.
- Run `pnpm test:e2e` for affected Admin or browser journeys.
- Run `pnpm generate:types` after schema changes.
- Run `pnpm generate:importmap` after custom Admin component changes.
- Run `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` in proportion to risk.
- Finish every implementation with `pnpm project-context:update` and `pnpm project-context:check`.
- GitHub Actions runs project-context consistency, generated types, TypeScript, lint, integration
  tests, and the production build on pull requests and protected branch pushes. Mongo-backed tests
  use a single-node in-memory replica set so transaction behavior matches the supported adapter.

Use the maintained [feature inventory](../../../../docs/architecture/feature-inventory.md), [content model map](../../../../docs/architecture/content-model-map.md), [runtime/provider runbook](../../../../docs/operations/runtime-and-providers.md), and [developer workflows](../../../../docs/operations/developer-workflows.md) for deeper operational context.
