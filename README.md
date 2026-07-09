# Payload CMS Marketing Starter

This repository is an editorial-first marketing CMS starter built to be copied for one client website at a time. It already includes page routing, system pages, articles, reviews, forms, SEO defaults, editorial governance, and capability-based admin access.

## Supported Starter Contract

- local development: `SQLite` plus local-disk uploads
- email: `none` or `resend`
- Vercel database target: `Postgres`
- Vercel deploy status today: blocked by design until a durable media adapter is added

The repo now fails fast if you try to boot a Vercel production profile with the default local-disk `media` behavior. That keeps the starter honest for client handoff.

## First Boot

1. Copy `.env.example` to `.env`.
2. Keep `DATABASE_PROVIDER=sqlite` for local development.
3. Set `PAYLOAD_SECRET`.
4. Run `pnpm install`.
5. Run `pnpm dev`.
6. Open `http://localhost:3000` and create the first admin user.

## What This Starter Already Covers

- hierarchical pages with preview, redirects, and managed homepage selection
- reusable navigation, headers, footers, and system pages
- articles with lexical rich text, taxonomies, and SEO controls
- moderated reviews promoted from form submissions into public content
- forms, submissions, notifications, throttling, assignment, and follow-up states
- editorial governance, publish guardrails, and operational audit history

## Role Model

- `Admin`: full access, user management, and recovery control
- `Site Manager`: trusted website operator with structural and system-level controls
- `Content Manager`: non-technical publisher for normal website content

## Content Ownership

The CMS already separates structural site content, editorial inventory, and site-wide defaults:

- `pages`, `navigation-links`, `headers`, `footers`, and `system-pages` own the public site structure
- `articles`, `reviews`, `categories`, and `tags` own editorial inventory
- `forms` and `form-submissions` own intake and lead operations
- `page-settings`, `system-mode-settings`, `site-settings`, `theme-settings`, and `seo-settings` own site-wide defaults

See [docs/architecture/content-model-map.md](docs/architecture/content-model-map.md) for the full ownership map.

## Handoff Docs

- [CMS operator guide](docs/guides/README.md)
- [Starter clone checklist](docs/operations/starter-clone-checklist.md)
- [Content model map](docs/architecture/content-model-map.md)
- [Editorial governance](docs/operations/editorial-governance.md)
- [Vercel Postgres deployment](docs/operations/vercel-postgres-deployment.md)

## Environment

Local development defaults:

- `DATABASE_PROVIDER=sqlite`
- `DATABASE_URL=file:./payload-cms-next-tailwind-shadcn-starter-kit.db`
- `PAYLOAD_SECRET`
- `EMAIL_PROVIDER=none`

Optional email variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `RESEND_OVERRIDE_TO_EMAIL`

Preview and production URL support:

- `NEXT_PUBLIC_SERVER_URL`

## Tooling

- `Node.js`: `^18.20.2 || >=20.9.0`
- `pnpm`: `^9 || ^10 || ^11`

## Testing

- `pnpm test:int`
- `pnpm test:e2e`
- `pnpm test`

Use the integration suite to verify starter behavior, homepage resolution, and runtime contract checks before handing the repo to a client team.

## Starter Conventions

- Treat this repo as one deployment and one dataset per client site.
- Replace branding and operational defaults through globals before changing collection structure.
- Extend behavior through `src/lib` or `src/config` seams instead of editing core collection logic ad hoc.
- Treat provider configuration as runtime configuration, not content-model logic.
- Keep the starter contract explicit. If a deployment path is not safe, document it and reject it early.
- Add new blocks only after the CMS foundation, guardrails, and operational seams are stable.
