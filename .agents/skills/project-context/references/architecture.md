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
- `/preview/page/[id]` and live-preview components render authenticated draft data.
- Gallery Album-backed blocks discover explicitly selected album dependencies across Event Gallery,
  Image Mosaic, and populated Reusable Sections. Production block adapters load only selected
  published albums; authenticated routes load selected draft albums on the server and pass the same
  serializable snapshot to client-safe preview adapters. Gallery clients never query Payload.
- Form submission, review-feed, News & Events Tabs pagination, redirects, and media reconciliation
  have focused route handlers.
- `/admin`, Payload REST, GraphQL, and GraphQL Playground live under the Payload route group.
- Development-only block thumbnail previews live under their own route group.

Exact current route paths live in [project-inventory.json](project-inventory.json).

## Providers and Runtime Contract

[runtime.ts](../../../../src/config/runtime.ts) reads environment behavior, [starterContract.ts](../../../../src/config/starterContract.ts) rejects unsupported deployment combinations, and [providers.ts](../../../../src/config/providers.ts) constructs MongoDB, optional Resend email, and local/S3 storage.

MongoDB is the supported database. Local development may use local-disk media. Vercel production must use durable S3-compatible storage. Email is either disabled or delivered through Resend. Upload limits live in [uploadLimits.ts](../../../../src/config/uploadLimits.ts).

## Caching and Delivery Safety

Layout globals, the News & Events detail template, Pages, and redirects use tagged caching and focused invalidation hooks. Feeds, robots, and sitemap use explicit time revalidation. Article and Review helpers also use request-level deduplication. Preserve draft/public filtering and cache invalidation together when changing queries or hooks.

Maintenance and coming-soon overrides currently wrap the homepage, catch-all Page routes, and the explicit Page-backed `/news-events` route; other dedicated domain, search, feed, Admin, and API routes remain reachable.

## Themes and Analytics

Five theme presets are registered: Default, Sunset, Blue, Kodama, and SNMIH. Theme files live under [src/styles/themes](../../../../src/styles/themes). Block sections use semantic page/subtle/brand surfaces; card surfaces use Default, Primary, Secondary, Muted, and Accent. Renderers resolve foreground, supporting text, icon, divider, link, and button contrast from those semantics.

Google Tag Manager takes precedence over standalone GA4. Analytics and Vercel Speed Insights load only after the consent cookie is granted. Admin routes are excluded from public analytics.

## Verification

- Run focused Vitest files while iterating, then `pnpm test:int`.
- Run `pnpm test:e2e` for affected Admin or browser journeys.
- Run `pnpm generate:types` after schema changes.
- Run `pnpm generate:importmap` after custom Admin component changes.
- Run `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` in proportion to risk.
- Finish every implementation with `pnpm project-context:update` and `pnpm project-context:check`.

Use the maintained [feature inventory](../../../../docs/architecture/feature-inventory.md), [content model map](../../../../docs/architecture/content-model-map.md), [runtime/provider runbook](../../../../docs/operations/runtime-and-providers.md), and [developer workflows](../../../../docs/operations/developer-workflows.md) for deeper operational context.
