# Payload CMS Marketing Starter

This repository is a single-site marketing CMS starter built with Payload, Next.js, and TypeScript. It is meant to be copied for new client projects once the brand, providers, and site defaults are replaced.

## Quick Start

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env`.
3. Set the required environment variables for your database, Payload secret, and email provider.
4. Start the app with `pnpm dev`.
5. Open `http://localhost:3000` and create the first admin user.

## Features

- Pages with hierarchy, preview, redirects, and SEO controls
- Navigation links, headers, footers, and site defaults
- System pages for 404, maintenance, and coming soon
- Editorial roles, publish guardrails, and operational audit history
- Forms with validation, throttling, persistence, and notifications
- Media uploads plus capability-based admin access for CMS operators

## Clone For A New Client

1. Copy `.env.example` to `.env`.
2. Replace branding and contact defaults in `site-settings`.
3. Choose runtime providers for database and email.
4. Review theme presets and starter conventions.
5. Follow [docs/operations/starter-clone-checklist.md](docs/operations/starter-clone-checklist.md).

## Content Model

The starter already separates page content, reusable site structure, and site-wide defaults:

- `pages` owns hierarchical marketing pages, live preview, redirects, and page-level SEO.
- `navigation-links` stores reusable destinations for menus, CTAs, and synced page links.
- `system-pages` stores managed 404, maintenance, and coming-soon experiences.
- `page-settings` chooses the active homepage, header, and footer.
- `system-mode-settings` owns maintenance mode, coming-soon mode, 404 selection, and admin bypass behavior.
- `site-settings`, `seo-settings`, and `theme-settings` hold brand, SEO, and presentation defaults.

See [docs/architecture/content-model-map.md](docs/architecture/content-model-map.md) for the full ownership map.

## Environment

Local development defaults:

- `DATABASE_PROVIDER=sqlite`
- `DATABASE_URL=file:./payload-cms-next-tailwind-shadcn-starter-kit.db`
- `PAYLOAD_SECRET`

Vercel deployments:

- `DATABASE_PROVIDER=postgres`
- `POSTGRES_URL`
- `PAYLOAD_SECRET`

Email:

- `EMAIL_PROVIDER=none | resend`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`

Optional but currently supported:

- `RESEND_OVERRIDE_TO_EMAIL`
- `NEXT_PUBLIC_SERVER_URL`

## Tooling

- `Node.js`: `^18.20.2 || >=20.9.0`
- `pnpm`: `^9 || ^10 || ^11`

## Deployment

- local/dev uses `SQLite`
- Vercel preview and production use `Postgres`
- see [docs/operations/vercel-postgres-deployment.md](docs/operations/vercel-postgres-deployment.md)

## Editorial Operations

- [Editorial governance](./docs/operations/editorial-governance.md)
- [Vercel Postgres deployment](./docs/operations/vercel-postgres-deployment.md)

## Testing

- `pnpm test:int`
- `pnpm test:e2e`
- `pnpm test`

Use integration tests to verify CMS behaviors and route resolution before cloning or handing off a client project.

## Starter Conventions

- Treat this repo as one deployment and one dataset per client site.
- Keep `Pages`, `SystemPages`, `NavigationLinks`, and site globals as the core starter primitives.
- Extend behavior through dedicated `src/lib` or `src/config` seams before editing core collection logic.
- Treat provider configuration as runtime configuration, not content-model logic.
- Keep core content ownership in the existing collections and globals unless a change solves a real CMS gap.
- Add new blocks only after the CMS foundation, guardrails, and operational seams are stable.
- Prefer documented extension points over editing core config ad hoc in every clone.
