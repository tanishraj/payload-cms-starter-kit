# Starter Clone Checklist

Use this checklist when copying the starter into a new client repository. The goal is to replace client-specific defaults without disturbing the core CMS behavior or the current starter contract.

## Replace Client Identity

- Update the project name and description in `package.json` if the clone will be published or handed off.
- Replace brand, contact, address, social, and identity defaults in `site-settings`.
- Review logo, favicon, and default SEO imagery stored through the `media` collection.
- Replace any example theme preset choice in `theme-settings` with the client-approved default.

## Confirm Runtime And Provider Choices

- Keep `DATABASE_PROVIDER=sqlite` for local development.
- Set `PAYLOAD_SECRET` for every environment.
- Configure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` if the site should send notifications.
- Decide whether `RESEND_FROM_NAME` and `RESEND_OVERRIDE_TO_EMAIL` are needed for staging or QA.
- Confirm `NEXT_PUBLIC_SERVER_URL` matches the public base URL used for previews and metadata.

## Review CMS Defaults

- Choose the homepage in `page-settings`.
- Choose the active header and footer presets in `page-settings`.
- Confirm the published 404, maintenance, and coming-soon presets in `system-pages`.
- Review default SEO values in `seo-settings`.
- Review admin users and editor capabilities before handing the project to a client team.

## Verify Content And Intake Workflows

- Create or review at least one `article` with its taxonomy and SEO values.
- Submit a published form and confirm submissions persist in `form-submissions`.
- Confirm notification recipients are configured on each live form that should send alerts.
- Submit one review form, approve the submission flow, and confirm the public-facing review content path behaves as expected.
- Check that redirects and page previews work with the configured public URL.

## Verify Deployment Assumptions

- Confirm `DATABASE_PROVIDER=postgres` and `POSTGRES_URL` before any Vercel deployment work.
- Do not treat the default `media` upload behavior as durable on Vercel.
- If the client needs editor-managed uploads in production, add and verify a durable media adapter before launch.
- Verify the configured homepage, 404 page, maintenance page, and coming-soon page all resolve correctly.

## Run Starter Verification

- Run `pnpm test:int`.
- Run `pnpm test:e2e`.
- Start the app with `pnpm dev` and confirm the public site, admin login, and preview routes load.
- Review [docs/architecture/content-model-map.md](../architecture/content-model-map.md) before adding client-specific content types.

## Safe Customization Boundaries

- Replace branding, contact details, and presentation defaults in globals before changing collection structure.
- Replace provider environment configuration through `src/config/runtime.ts` and `src/config/providers.ts`.
- Extend form routing or downstream lead handling through `src/lib/formSubmissionEvents.ts` instead of editing submission persistence rules in every clone.
- Keep content ownership explicit instead of pushing unrelated behavior into `pages` or site globals.
