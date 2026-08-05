---
name: payload-cms-starter-kit
description: Work safely in this editorial Payload CMS and Next.js starter. Use for changes to collections, globals, access control, editorial workflow, page blocks, frontend routes, forms, SEO, search, media, providers, operational tooling, tests, or documentation in this repository.
---

# Payload CMS Marketing Starter

Read `AGENTS.md` and `.agents/skills/payload/SKILL.md` before changing Payload configuration. Treat the registered source in `src/payload.config.ts`, `src/app`, and package scripts as authoritative.

## Start With The Right Map

- Read `docs/architecture/feature-inventory.md` for the complete runtime, schema, route, API, block, provider, and tooling inventory.
- Read `docs/architecture/content-model-map.md` before adding or moving content ownership.
- Read the relevant file in `docs/guides` for operator-visible behavior.
- Read `docs/operations/runtime-and-providers.md` before changing environment/provider behavior.
- Read `docs/operations/editorial-governance.md` before changing roles, capabilities, workflow, queue, audit, or recovery behavior.

## Preserve Core Contracts

- Keep one deployment and one dataset per client site.
- Keep MongoDB as the supported database unless the runtime contract and documentation are intentionally expanded together.
- Keep local disk for local media and require durable S3-compatible storage for Vercel production.
- Enforce access control when Local API calls act for a user; remember that `overrideAccess` defaults to bypassing access.
- Pass `req` through nested Payload operations so hooks share the transaction.
- Use context flags for hooks that write records and might re-trigger themselves.
- Keep Page, Article, News & Event, Review, and System Page publication aligned with editorial workflow and Action Queue blockers.
- Preserve public/draft filtering in frontend queries and live preview.
- Keep generated `src/payload-types.ts` synchronized with schema descriptions and fields.

## Change Workflow

1. Inspect the config, frontend consumer, hooks, helpers, and relevant tests together.
2. Add or update tests for the intended contract.
3. Implement the smallest coherent change without moving unrelated ownership.
4. Run `pnpm generate:types` after schema changes and `pnpm generate:importmap` after custom Admin component changes.
5. Run focused Vitest files, then `pnpm test:int`; use an isolated MongoDB database.
6. Run `pnpm lint` and `pnpm build` when the affected surface warrants them.
7. Update the operator guide, feature inventory, content map, environment example, or runbook in the same change when behavior is user-visible.

## Block Changes

Register a Page block consistently in its config, production renderer, live-preview renderer, thumbnail manifest/fixture, generated thumbnail asset, generated Payload types, tests, and `docs/guides/blocks.md`. Keep Header, Footer, and System Page blocks restricted to their intended collections.

## Operational Safety

- Never point E2E tests, migrations, or destructive seed helpers at production data.
- Export MongoDB before bulk migrations or permanent Trash deletion.
- Treat database archives, provider credentials, Resend overrides, and reconciliation tokens as secrets.
- Verify media references and storage health before deleting or replacing critical assets.
- Document current implementation boundaries honestly instead of promising behavior that only exists in a historical plan.
