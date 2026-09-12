# Payload CMS Marketing Starter

This repository is an editorial-first marketing CMS starter built to be copied for one client website at a time. It includes governed pages, articles, news and events, reviews, forms, media, navigation, system pages, SEO, analytics consent, operational queues, and feature-based admin access.

## Supported Starter Contract

- local development: `MongoDB` plus local-disk uploads
- email: `none` or `resend`
- hosted database target: `MongoDB`
- Vercel media target: durable `S3-compatible` object storage

The repo fails fast if you try to boot a Vercel production profile with the default local-disk `media` behavior. Use `MEDIA_PROVIDER=s3` with a durable bucket before allowing editor-managed uploads in hosted environments.

## First Boot

1. Copy `.env.example` to `.env`.
2. Start the transaction-capable local MongoDB with `docker compose up -d --wait mongo`, or point
   `MONGODB_URI` at an existing replica set.
3. Set `PAYLOAD_SECRET`.
4. Run `pnpm install`.
5. Run `pnpm dev`.
6. Open `http://localhost:3000` and create the first admin user.

## Production Docker Image

The supplied `Dockerfile` builds the Next.js standalone production server with Node `22.17.0` and
pnpm `11.17.0`. Its dependency install is frozen. The only public build argument is
`NEXT_PUBLIC_SERVER_URL`; all server-only build configuration must be supplied through the required
BuildKit secret `payload_build_env`. See [Runtime and Providers](docs/operations/runtime-and-providers.md)
for the fixture format and exact build command.

Production containers require a durable external MongoDB database and `MEDIA_PROVIDER=s3` with a durable S3-compatible bucket. The image intentionally does not provide persistent local-disk uploads. `docker-compose.yml` remains the local-development workflow and is not a production stack.

## What This Starter Already Covers

**Content and structure**

- hierarchical pages with live preview, native drafts and publishing guardrails, and managed homepage selection
- reusable section templates — shared block groups that sync across all pages that reference them
- navigation links, headers, footers, and CMS-managed system pages (404, maintenance, coming soon)
- articles with lexical rich text, taxonomies (categories + tags), SEO fields, and live preview
- moderated reviews promoted from form submissions into public editorial content
- news and events with type-specific layouts, gallery albums, and live preview
- 59 selectable Page blocks covering editorial, events, Calendar and Annual Calendar, media, forms, reviews, galleries, offices, and reusable sections
- production Page block error boundaries that prevent one broken layout block from crashing the remaining Page

**SEO and discoverability**

- sitemap with full pagination — no artificial 100-document cap, includes lastmod dates
- dynamic `robots.txt` controlled by CMS global setting
- server-generated Open Graph images for the site default, articles, reviews, and news/events; generic CMS pages inherit configured metadata and default media
- structured data: Organization, WebSite + SearchAction, Article, Event, BreadcrumbList, WebPage JSON-LD schemas
- title templates, default Open Graph image, per-route robots override, and Google site verification

**Analytics and privacy**

- Analytics & Tracking global for Google Tag Manager and GA4 with format validation
- configurable cookie banner with consent-gated analytics — no analytics load before visitor acceptance; legal compliance still requires jurisdiction-specific review
- analytics scripts injected server-side only after consent, re-applied instantly via router refresh

**Search**

- site-wide full-text search at `/search` (SSR) and a `Cmd+K` / `Ctrl+K` overlay dialog
- debounced instant results, keyboard navigation, and accessible combobox ARIA pattern
- rate-limited API endpoint (`/api/search`) — 20 requests per IP per 10 seconds
- WebSite JSON-LD describes the onsite search action (Google retired the Sitelinks Search Box visual result in 2024)

**Redirects**

- CMS-managed redirect collection with page relationship or custom URL destinations
- edge middleware — redirects go live within 60 seconds of publishing, no rebuild needed
- in-process TTL cache on middleware; `unstable_cache` + tag invalidation on the API side

**Feeds and syndication**

- RSS 2.0 feeds with Atom self-links at `/articles/feed.xml` and `/news-events/feed.xml`
- `<link rel="alternate">` autodiscovery in layout `<head>`

**Performance and caching**

- persistent tagged caching for layout globals, Pages, and redirects; request-level deduplication for article/review data; time-based revalidation for sitemap, robots, and feeds
- full sitemap pagination via `fetchAllDocs()` helper — no silent content truncation

**Forms and lead capture**

- forms with field definitions, submission intent routing, spam protection, and assignment
- team notification emails and optional submitter confirmation email (CMS-configured subject + message)
- form submissions with follow-up state, assignment, and optional review promotion

**Security and accessibility**

- security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `HSTS`
- skip navigation link, `<main id="main-content">` landmark, `role="search"` on search forms
- `aria-live` regions on dynamic content, accessible cookie consent dialog, focus rings on interactive elements

**Editorial tooling**

- editorial governance, publish guardrails, and operational audit history
- custom admin dashboard with content counts, recent submissions, and quick-action links
- live preview for articles and news-events via `useLivePreview` + `RefreshRouteOnSave`
- two-role access model: Admin and Site Manager, with 29 individually grantable Admin features

## Role Model

- `Admin`: full access to every feature, user and grant management, and recovery controls
- `Site Manager`: access only to the features explicitly granted by an Admin; multiple Site Managers may have different grant sets

The first account is always an Admin. Admins may create additional Admins or Site Managers. The last active Admin cannot be demoted or deleted. See [Editorial governance](docs/operations/editorial-governance.md) for the complete feature catalog and dependency rules.

## Content Ownership

The CMS separates content, taxonomy, structure, media, intake, administration, and site-wide defaults:

- `pages`, `reusable-sections`, `articles`, `news-events`, and `reviews` own public content
- `categories` (shown as Topics) and `tags` own taxonomy
- `navigation-links`, `redirects`, `headers`, `footers`, `office-locations`, and `system-pages` own navigation and structure
- `media` and `gallery-albums` own governed assets and albums
- `forms` and `form-submissions` own intake and lead operations
- `work-queue`, `operational-audit-events`, and `users` own administration
- 9 globals own identity, appearance, SEO, analytics, consent, layout defaults, the News & Events detail template, search suggestions, and maintenance modes

## Admin Information Architecture

The operator-facing admin is organized into ten groups:

- `Content`
- `News & Events`
- `Taxonomy`
- `Navigation`
- `Site Structure`
- `Media`
- `Forms`
- `Settings`
- `Configuration`
- `Administration`

See [docs/architecture/content-model-map.md](docs/architecture/content-model-map.md) for the full ownership map.

## Handoff Docs

- [CMS operator guide](docs/guides/README.md)
- [Starter clone checklist](docs/operations/starter-clone-checklist.md)
- [Content model map](docs/architecture/content-model-map.md)
- [Complete feature inventory](docs/architecture/feature-inventory.md)
- [Editorial governance](docs/operations/editorial-governance.md)
- [MongoDB deployment](docs/operations/mongodb-deployment.md)
- [Dependency management](docs/operations/dependency-management.md)
- [Runtime and providers](docs/operations/runtime-and-providers.md)
- [Developer workflows](docs/operations/developer-workflows.md)

### Feature guides

- [Analytics & Tracking](docs/guides/analytics.md) — GTM, GA4, and consent gating
- [Site Search](docs/guides/search.md) — Cmd+K dialog and /search page
- [Reusable Sections](docs/guides/reusable-sections.md) — shared block templates
- [Redirects](docs/guides/redirects.md) — CMS-managed URL redirects
- [Forms](docs/guides/forms.md) — form definitions and submitter confirmation email
- [News & Events](docs/guides/news-events.md) — entry authoring, Page-backed listings, live preview, and feed
- [Page Blocks](docs/guides/blocks.md) — all 59 Page layout choices and their data dependencies
- [Cookie Consent Banner](docs/guides/cookie-consent.md) — consent variants, copy, and analytics behavior

## Environment

Local development defaults:

- `MONGODB_URI=mongodb://127.0.0.1:27017/payload-cms-starter-kit?replicaSet=rs0&directConnection=true`
- `PAYLOAD_SECRET`
- `EMAIL_PROVIDER=none`
- `MEDIA_PROVIDER=localDisk`

Optional email variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `RESEND_OVERRIDE_TO_EMAIL`

Preview and production URL support:

- `NEXT_PUBLIC_SERVER_URL`

S3-compatible media storage for hosted uploads:

- `MEDIA_PROVIDER=s3`
- `S3_BUCKET`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_PUBLIC_URL` for direct public/CDN delivery
- `S3_ACL=none | public-read | private`
- `S3_FORCE_PATH_STYLE=true | false`
- `MEDIA_RECONCILE_TOKEN` for the protected media health endpoint

Optional tooling:

- `SHADCNBLOCKS_API_KEY`

## Tooling

- `Node.js`: `22.17.0` (`>=22.13.0 <23`)
- `pnpm`: `11.17.0`

## Testing

- `pnpm test:int`
- `pnpm test:e2e`
- `pnpm test`
- `pnpm verify:docker-local` for the isolated local replica and real Payload transaction contract
- `pnpm verify:docker-image` for the Node 22 production image and BuildKit-secret boundary

Use an isolated MongoDB database for tests. E2E uses the committed `test.env` values instead of
ambient application configuration. Docker verifiers serialize through one fixed OS-temporary lock,
pin Compose to this repository, and use their own empty environment file. See
[Developer Workflows](docs/operations/developer-workflows.md) for safe lock recovery, browser
installation, generation, backup, migration, and reconciliation commands.

## Backported capabilities

Optional account two-factor authentication is documented in [Users](docs/guides/users.md).
[Forms](docs/guides/forms.md) includes phone capture and branded confirmation emails.
[Page Blocks](docs/guides/blocks.md) includes Partner Directory, Logo Marquee, and unified fee-document actions.
Remote file download actions stream attachments through a public-media endpoint. Search ranks title matches before weaker matches within each content type, scanning at most 2,000 candidates per type to bound request work.
[Database backups](docs/operations/database-backups.md) are configurable and disabled until explicitly enabled.

## Starter Conventions

- Treat this repo as one deployment and one dataset per client site.
- Replace branding and operational defaults through globals before changing collection structure.
- Extend behavior through `src/lib` or `src/config` seams instead of editing core collection logic ad hoc.
- Treat provider configuration as runtime configuration, not content-model logic.
- Keep the starter contract explicit. If a deployment path is not safe, document it and reject it early.
- Add new blocks only after the CMS foundation, guardrails, and operational seams are stable.
