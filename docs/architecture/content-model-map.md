# Content Model Map

This starter already has clear ownership boundaries for marketing-site content. Use this map before adding new collections or globals so client-specific changes land in the right place.

## Pages

`pages` is the main collection for marketing content. It owns hierarchical URLs, draft and publish state, live preview, redirects, page-level SEO fields, and block-based page layouts. Use it for normal public-facing pages such as home, about, services, and contact.

## Navigation Links

`navigation-links` stores reusable destinations for menus, CTAs, utility links, and page-synced links. Use it when a destination needs to be shared across headers, footers, or page content without duplicating URL logic.

## Headers And Footers

`headers` and `footers` own reusable structural chrome for the public site. Use them for shared navigation, logos, social links, and repeated CTA surfaces instead of rebuilding those patterns inside page layouts.

## System Pages

`system-pages` stores managed presets for 404, maintenance, and coming-soon experiences. These are not normal marketing pages. They are selected by type and then activated through Website Defaults and Website Modes when the frontend should override public routes.

## Editorial Inventory

`articles` owns long-form editorial content with lexical rich text, featured media, taxonomies, archive behavior, and SEO fields. Use it for authored posts, resources, and newsroom-style content.

`reviews` owns approved public testimonials promoted from form submissions. Use it for moderated review content that should be displayed on the public website after internal review.

`categories` and `tags` provide reusable taxonomy for articles and reviews. Use them instead of ad hoc free-text labels when content needs filtering, archive pages, or shared SEO surfaces.

## Intake And Lead Operations

`forms` owns public submission schemas, field definitions, notification recipients, throttling behavior, and submission intent.

`form-submissions` owns stored submissions, assignment, follow-up state, and operational handling after a visitor submits a form.

Review intake starts in `forms` and `form-submissions`; public-facing reviews only belong in `reviews` after editorial approval.

## Website Defaults

`page-settings` is the control surface for site-wide routing and structural defaults. It chooses the active homepage, header, and footer. Use it when a setting changes how the whole site resolves content.

## Website Modes

`system-mode-settings` is the control surface for site-wide fallback behavior. It chooses the active 404 page and maintenance or coming-soon override behavior when the public site should temporarily stop using the normal frontend content flow.

## Site Settings

`site-settings` owns client identity and operational contact data: site name, site description, logos, favicon, contact details, address, map embed URL, and social links. Replace these values early in each clone.

## SEO Settings

`seo-settings` owns the fallback SEO contract for the whole site. It defines default titles, title templates, descriptions, default Open Graph media, robots rules, and Google site verification when pages do not provide their own overrides.

## Theme Settings

`theme-settings` owns presentation defaults that apply site-wide, including the chosen theme preset and color-scheme behavior. Treat it as the place for client-wide visual defaults, not page-specific design decisions.

## Reusable Sections

`reusable-sections` stores named block collections that can be referenced from any page layout. A single edit to a reusable section propagates automatically to every page that references it. Use it for shared content that appears on multiple pages and must stay in sync: accreditation strips, seasonal CTAs, recurring disclaimers.

## Analytics Settings

`analytics-settings` owns the GTM container ID and GA4 measurement ID for the public website. All analytics scripts are injected only after a visitor grants cookie consent. This global is the sole place for third-party analytics configuration — do not paste tracking scripts into page content or blocks.

## Site Search

The website exposes a built-in search surface at `/search` and via a `Cmd+K` overlay. Search is always active and requires no CMS configuration. It queries pages, articles, and news-events in real time. A `WebSite` JSON-LD schema with `SearchAction` is emitted in the layout `<head>` to register the search endpoint with Google.

## RSS Feeds

The website automatically generates RSS 2.0 and Atom feeds at `/articles/feed.xml` and `/news-events/feed.xml`. These are linked via `<link rel="alternate">` autodiscovery tags in the layout `<head>` so feed readers detect them automatically. No CMS configuration is needed.

## Extension Rules

- Add client-specific collections beside the core starter collections instead of overloading `pages`, `system-pages`, or `navigation-links`.
- Prefer hooks and `src/lib` helpers for cross-cutting behavior such as notifications, automations, or publishing side effects.
- Keep global ownership explicit so branding, routing defaults, fallback modes, SEO defaults, and theme defaults do not drift across multiple globals.
- Keep intake flows in `forms` and `form-submissions`, and only promote curated public content into editorial collections when that distinction matters operationally.
