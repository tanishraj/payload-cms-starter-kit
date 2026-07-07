# Starter Clone Checklist

Use this checklist when copying the starter into a new client repository. The goal is to replace client-specific defaults without disturbing the core CMS behavior.

## Replace Client Identity

- Update the project name and description in `package.json` if the clone will be published or handed off.
- Replace brand, contact, and social defaults in the `site-settings` global.
- Review logo, favicon, and media defaults stored through the `media` collection.
- Replace any example theme preset choice in `theme-settings` with the client-approved default.

## Choose Runtime Providers

- Set `DATABASE_URL` for the target environment.
- Set `PAYLOAD_SECRET` for the deployed project.
- Configure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` if the site should send form notifications.
- Decide whether `RESEND_FROM_NAME` and `RESEND_OVERRIDE_TO_EMAIL` are needed for staging or QA.
- Confirm `NEXT_PUBLIC_SERVER_URL` matches the public base URL used for previews and metadata.

## Review CMS Defaults

- Choose the homepage in `page-settings`.
- Choose the active header and footer presets in `page-settings`.
- Confirm the published 404, maintenance, and coming-soon presets in `system-pages`.
- Review default SEO values in `seo-settings`.
- Review editor capabilities and admin users before handing the project to a client team.

## Verify Operational Integrations

- Submit a published form and confirm submissions persist in `form-submissions`.
- Confirm notification recipients are configured on each live form that should send alerts.
- Verify media uploads work in the target environment.
- Check that redirects and page previews work with the deployed public URL.

## Run Starter Verification

- Run `pnpm test:int`.
- Run `pnpm test:e2e`.
- Start the app with `pnpm dev` and confirm the public site, admin login, and preview routes load.
- Review [docs/architecture/content-model-map.md](../architecture/content-model-map.md) before adding client-specific content types.

## Safe Customization Boundaries

- Replace branding, contact details, and presentation defaults in globals before changing collection structure.
- Replace provider environment configuration through `src/config/runtime.ts` and `src/config/providers.ts`.
- Extend form routing or downstream lead handling through `src/lib/formSubmissionEvents.ts` instead of editing submission persistence rules in every clone.
