# Content Model Map

This starter already has clear ownership boundaries for marketing-site content. Use this map before adding new collections or globals so client-specific changes land in the right place.

## Pages

`pages` is the main collection for marketing content. It owns hierarchical URLs, draft and publish state, live preview, redirects, page-level SEO fields, and block-based page layouts. Use it for normal public-facing pages such as home, about, services, and contact.

## Navigation Links

`navigation-links` stores reusable destinations for menus, CTAs, utility links, and page-synced links. Use it when a destination needs to be shared across headers, footers, or page content without duplicating URL logic.

## System Pages

`system-pages` stores managed presets for 404, maintenance, and coming-soon experiences. These are not normal marketing pages. They are selected by type and then activated through site defaults when the frontend should override public routes.

## Site Defaults

`page-settings` is the control surface for site-wide routing and structural defaults. It chooses the active homepage, header, footer, system-page presets, and site mode behavior. Use it when a setting changes how the whole site resolves content.

## Site Settings

`site-settings` owns client identity and operational contact data: site name, site description, logos, favicon, contact details, address, map embed URL, and social links. Replace these values early in each clone.

## SEO Settings

`seo-settings` owns the fallback SEO contract for the whole site. It defines default titles, title templates, descriptions, default Open Graph media, robots rules, and Google site verification when pages do not provide their own overrides.

## Theme Settings

`theme-settings` owns presentation defaults that apply site-wide, including the chosen theme preset and color-scheme behavior. Treat it as the place for client-wide visual defaults, not page-specific design decisions.

## Extension Rules

- Add client-specific collections beside the core starter collections instead of overloading `pages`, `system-pages`, or `navigation-links`.
- Prefer hooks and `src/lib` helpers for cross-cutting behavior such as notifications, automations, or publishing side effects.
- Keep global ownership explicit so branding, routing defaults, SEO defaults, and theme defaults do not drift across multiple globals.
