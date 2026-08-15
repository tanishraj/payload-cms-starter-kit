# Feature Inventory

This is the maintained technical map of the starter. It records what is registered and reachable in the current source tree; historical plans in `docs/superpowers` explain how features were built but are not product documentation.

## Runtime Architecture

- Payload CMS 3.85.2 and Next.js 16 share one App Router application.
- React Server Components load public CMS data; focused client components provide carousels, dialogs, tabs, consent, forms, and gallery interaction.
- MongoDB is the only supported database adapter.
- Uploads use local disk or an S3-compatible provider. Production on Vercel rejects local-disk media at startup.
- Email is disabled or delivered through Resend.
- Payload REST, GraphQL, admin, generated types, and generated import-map support are enabled.
- The local plugin `withTrash()` enables Payload Trash on every collection.

## Payload Collections

| Group          | Collection                             | Responsibilities                                                                                                          |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Content        | Pages                                  | Hierarchical routes, 43-block layouts, drafts, workflow, SEO, live preview, page-owned links, path-change redirects       |
| Content        | Articles                               | Long-form Lexical content, topics/tags, related content, SEO, workflow, live preview                                      |
| Content        | News & Events                          | News/event records, event validation and registration actions, taxonomy, archive/detail/feed data, workflow, live preview |
| Content        | Reviews                                | Moderated ratings and testimonials, source-submission linkage, taxonomy, SEO, workflow, live preview                      |
| Content        | Reusable Sections                      | Shared versioned block stacks with recursion and high-complexity block restrictions                                       |
| Taxonomy       | Topics (`categories`)                  | Hierarchical editorial topics with SEO data                                                                               |
| Taxonomy       | Tags                                   | Flat editorial keywords with SEO data                                                                                     |
| Navigation     | Navigation Links                       | Page/custom destinations, including records synchronized from Pages                                                       |
| Navigation     | Redirects                              | Normalized unique incoming paths, page/custom targets, 301/302 choice, enable state                                       |
| Site Structure | Headers                                | Versioned Header Navbar presets                                                                                           |
| Site Structure | Footers                                | Versioned Footer 56 presets                                                                                               |
| Site Structure | Office Locations                       | Versioned map/contact records used by Regional Offices                                                                    |
| Site Structure | System Pages                           | Governed 404, maintenance, and coming-soon presets with matching block validation                                         |
| Media          | Media                                  | Uploads, classification, alt validation, usage detection, deletion guards, storage health, operational sync               |
| Media          | Gallery Albums                         | Versioned ordered image albums used by Event Gallery                                                                      |
| Forms          | Forms                                  | Versioned general, lead, and review-intent field schemas plus email configuration                                         |
| Forms          | Form Submissions                       | Stored immutable payload/metadata, operational status/assignment/activity, optional review promotion                      |
| Administration | Action Queue (`work-queue`)            | Deduplicated CMS-generated approval, moderation, follow-up, publishing, media, and system work                            |
| Administration | Audit Log (`operational-audit-events`) | Immutable selected operational events and actor metadata                                                                  |
| Administration | Users                                  | Payload authentication, roles, capability presets and overrides                                                           |

All collections use timestamps and Trash. Draft/version support is enabled where the individual config declares it; operational records and users are not public content.

## Payload Globals

| Group         | Global                 | Responsibilities                                                                |
| ------------- | ---------------------- | ------------------------------------------------------------------------------- |
| Settings      | Site Identity          | Brand, contact, address, legal Page relationships, and social destinations      |
| Settings      | Appearance             | Default/Sunset/Blue/Kodama/SNMIH theme and system/light/dark color scheme       |
| Settings      | SEO & Metadata         | Fallback title, template, description, image, robots, and Google verification   |
| Settings      | Analytics & Tracking   | GTM or standalone GA4 identifiers and enablement                                |
| Settings      | Cookie Consent Banner  | Enablement, four presentation variants, corner position, and copy               |
| Configuration | Layout Defaults        | Homepage, active header/footer, page appearance, and global announcement bar    |
| Configuration | News & Events Settings | Archive copy, labels, 3–24 item page size, appearance, empty state, and SEO     |
| Configuration | Maintenance & Modes    | Published type-safe system-page references and off/maintenance/coming-soon mode |

Globals with versions retain history. Relevant changes invalidate cached frontend data; selected higher-risk changes are written to the Audit Log.

## Roles, Capabilities, And Editorial Governance

- Roles are Admin, Site Manager, and Content Manager. Legacy role values normalize to a current role.
- The first user is promoted to Admin. Admin has all capabilities; other roles receive defaults that can be overridden.
- Capabilities separately control collection visibility/management, publishing for each governed editorial collection, settings, queue/audit access, and whether editorial workflow is required.
- Pages, Articles, News & Events, Reviews, and System Pages use `draft`, `in_review`, `scheduled`, `published`, and `reverted` workflow states.
- `scheduled` validates and records a target time but does not run an automatic publisher.
- Publishing stamps user/time metadata. Open or blocked approval/publish-issue Action Queue items prevent publishing; `in_progress` items do not.
- Queue hooks create, reopen, deduplicate, and auto-resolve work from editorial, form, header/footer, link, redirect, review, and media conditions.
- Audit coverage is selective rather than a complete database history: governed editorial transitions, Reusable Sections, selected configuration globals, queue operator changes, and media deletion/storage events are covered.

## Page And Shell Block Systems

Normal Pages register 47 choices: Announcement, Banner CTA, News Grid, Call to Action, Hero Banner, Hero Carousel, Gallery Coverflow, Feature Spotlight, Feature Matrix, Content Highlights, Editorial Reasons, Academic Programmes, News & Events Highlights, Profile Carousel, Gallery Showcase, Event Gallery, Image Mosaic, Student Experience, Stats Strip, Q&A Accordion, Rating Spotlight, Review Feed, Review Submission, Contact Form, Regional Offices, Team Showcase, Services, Rich Text, Video Embed, Media Carousel, Program Grid, Program Matrix, Logo Strip, Page Header, Breadcrumb, Timeline, Icon Grid, Quote Block, Tabs Content, Download List, Numbered Steps, Bento Grid, Testimonial Grid, Awards List, About Section, Accreditation Cards, and Reusable Section.

Headers register only Header Navbar 12; Footers register only Footer 56; System Pages register one matching System 404, System Maintenance, or System Coming Soon block. The admin picker uses generated JPEG thumbnails. `/block-thumbnail-previews/[slug]` is development-only. See [Page Blocks](../guides/blocks.md) for the operator catalog.

Production Page blocks are wrapped in a block-level error boundary. Live Page preview covers the same block types and production components, including blocks reached through Reusable Sections. Reusable Section rendering has a maximum nesting depth of 10, while the schema prevents direct recursive selection.

Configurable visual blocks standardize their Payload editor structure as top-level `Content` and `Theme Settings` tabs. Genuine repeating card rows use the same nested tab structure and a shared semantic surface vocabulary: Default Card, Primary, Secondary, Muted, and Accent. The renderer resolves foreground, supporting text, icon, divider, link, and matching button contrast from the active theme. Variant-dependent controls only render a surface for existing card presentations; utility rows, connected timelines, lists, tables, galleries, logos, and navigation structures remain unboxed.

The SNMIH preset uses `#031d44` as its light-mode Primary brand color. Its dark palette uses a deep navy canvas with a lighter accessible Primary surface so the same semantic block and card settings remain readable across color schemes.

## Public Routes

| Route                                                   | Behavior                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `/`                                                     | Renders the published homepage selected in Layout Defaults                            |
| `/[...slug]`                                            | Renders hierarchical Pages, canonical metadata, breadcrumbs, and WebPage JSON-LD      |
| `/articles/[slug]`                                      | Article detail, related content, metadata, and Article JSON-LD                        |
| `/articles/category/[slug]`                             | Topic-filtered article archive                                                        |
| `/articles/tag/[slug]`                                  | Tag-filtered article archive                                                          |
| `/reviews/[slug]`                                       | Review detail, related reviews, metadata                                              |
| `/reviews/category/[slug]`                              | Topic-filtered review archive                                                         |
| `/news-events`                                          | Filtered and paginated all/news/event archive with separate upcoming/past event pages |
| `/news-events/category/[slug]`                          | Canonical topic-filtered News & Events archive                                        |
| `/news-events/tag/[slug]`                               | Canonical tag-filtered News & Events archive                                          |
| `/news-events/[slug]`                                   | NewsArticle or Event detail and structured data                                       |
| `/search`                                               | SSR search, capped at eight results per content type                                  |
| `/preview/page/[id]`                                    | Authenticated Page preview                                                            |
| `/articles/feed.xml`                                    | RSS 2.0 feed with Atom self-link; newest 50; one-hour cache                           |
| `/news-events/feed.xml`                                 | RSS 2.0 feed with Atom self-link; newest 50; one-hour cache                           |
| `/robots.txt`                                           | CMS-controlled robots response; one-hour revalidation                                 |
| `/sitemap.xml`                                          | Paginated published content map; five-minute revalidation                             |
| root/article/review/news-event `opengraph-image` routes | Server-generated fallback/detail social images                                        |

There is no built-in `/articles` or `/reviews` index route; create CMS Pages at those paths when the site needs archive landing pages. Generic Pages inherit configured metadata/default media rather than having their own dynamic Open Graph image route.

Maintenance and coming-soon overrides are currently applied by the homepage and catch-all CMS Page routes. Dedicated article, review, news-event, search, feed, and API routes remain reachable.

## APIs And Middleware

| Surface                                        | Contract                                                                                                                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `/admin`                                       | Payload admin UI with dashboard and session bar integration                                                                  |
| `/api/[...slug]`                               | Payload REST API                                                                                                             |
| `/api/graphql` and `/api/graphql-playground`   | Payload GraphQL API and playground                                                                                           |
| `POST /api/forms/[slug]/submit`                | Published-form validation, honeypot, best-effort in-memory throttling, storage, email, events, and optional review promotion |
| `GET /api/search`                              | Debounced dialog search; six results/type; 20 requests/IP/10 seconds in memory                                               |
| `GET /api/review-feed`                         | Validated paginated published Review data for load-more behavior                                                             |
| `GET /api/redirects`                           | Cached enabled redirect map consumed by middleware                                                                           |
| `POST /api/operations/media/reconcile-storage` | Token-protected local/S3 media health reconciliation                                                                         |
| `/my-route`                                    | Public example custom route returning a static JSON message; replace or remove before client handoff                         |

Redirect middleware excludes Next.js internals, APIs, Admin, and common static/metadata routes. It keeps an in-process map per origin for 60 seconds and safely falls back to its previous map on API failure.

## Forms, Notifications, And Review Promotion

- Public submission only loads published Forms.
- The hidden honeypot key is `website`; suspected bots receive a neutral success response.
- The built-in limiter allows five attempts per IP and form slug per ten minutes. It is per process, in memory, and is not a durable distributed rate limiter.
- Required, email, select-option, and checkbox-acceptance validation derive from the Form schema.
- Source, campaign, and landing-page metadata are captured when supplied.
- General/lead Forms can notify internal recipients and optionally send a submitter confirmation. Contact email lookup prefers `submitterEmail`, then `reviewerEmail`, then `email`.
- Review-intent Forms can create or update a draft Review in `in_review` and record its relationship or promotion error.
- Notification, confirmation, downstream-event, and promotion failures are logged without changing the visitor's successful submission response after storage succeeds.

## SEO, Search, Feeds, And Caching

- SEO fields support route title/description/image, canonical, robots, and sitemap decisions with publish-time validation.
- Layout emits Organization and WebSite/SearchAction structured data. SearchAction describes onsite search; Google retired its Sitelinks Search Box result in November 2024.
- Sitemap fetches all result pages in batches of 500 and includes published Pages, Articles, Reviews, News & Events, the News & Events index, used article/review topic routes, used article tag routes, and eligible topic/tag routes used by indexable published News & Events entries. It does not generate filter-combination or pagination URLs.
- `robots.txt` disallows Admin, API, and preview paths, or disallows the whole site when global robots is noindex.
- Layout globals and Page data use persistent Next cache tags; article/review helper `cache()` calls mainly deduplicate within a render. Sitemap/robots/feeds also use explicit time revalidation.

## Media Governance

- Images require alt text. Logo, Hero, and SEO asset types require image MIME types.
- Media detail views calculate references from governed collections and globals. Referenced assets cannot be deleted.
- Storage status is `unchecked`, `healthy`, `missing`, `check_failed`, or `local_only`.
- Reconciliation scans at most 1,000 Media records per call, verifies S3 objects with `HeadObject`, updates health fields, creates/clears queue conditions, and audits missing/restored transitions.
- Internal storage and usage fields are stripped before frontend data is passed to client components.

## Analytics And Consent

- GTM takes precedence over standalone GA4 when both are enabled.
- GTM, standalone GA4, and Vercel Speed Insights are not loaded until `analytics_consent=granted`.
- Vercel Speed Insights collects public-route Web Vitals only after analytics consent. Payload Admin is excluded.
- The configurable banner writes `granted` or `denied` for one year using `SameSite=Lax` and `Secure` on HTTPS.
- This implements analytics consent gating, not a complete legal-compliance or consent-management platform. Obtain jurisdiction-specific legal review.

## Developer And Operational Tooling

- `pnpm dev`, `devsafe`, `build`, and `start` run the Next.js application.
- Payload commands generate types/import maps or expose the Payload CLI.
- `pnpm generate:block-thumbnails` captures admin block-picker previews.
- `pnpm export:db` uses `mongodump` to create a compressed archive under `backups/`.
- `pnpm migrate:offices` migrates legacy office data.
- Vitest covers schema, hooks, helpers, route behavior, rendering, providers, and documentation vocabulary; Playwright covers core Admin and frontend journeys.
- There is no repository CI workflow. The supplied Dockerfile builds a non-root Next.js standalone production image; production containers require durable MongoDB and S3-compatible media storage.
