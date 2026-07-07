# CMS Foundation Audit

## Executive Summary

## Audit Scope

### In Scope

- judging this repo as a single-site marketing CMS starter that should be copied for future client projects
- evaluating platform foundation, content architecture, editorial workflows, marketing operations, and starter-kit reusability
- identifying current strengths, gaps, risks, and sequencing

### Out of Scope

- block library breadth
- visual design polish
- landing page creativity
- speculative multi-tenant architecture
- unrelated frontend component expansion

## Current Strengths

- The repo already models core marketing-site concepts such as pages, redirects, navigation links, forms, form submissions, system pages, headers, footers, and site-wide settings.
- `src/payload.config.ts` registers a coherent CMS surface instead of a bare Payload install, including content collections, site globals, a rich-text editor, email integration, and a trash workflow plugin.
- `src/app/(frontend)/pageData.ts` centralizes frontend content resolution instead of scattering Payload access across route files, including homepage lookup, published-page resolution, and system-mode checks.
- `src/globals/PageSettings.ts` provides a workable system-defaults surface for homepage, header, footer, and system-mode behavior, with validation around published references.
- `src/collections/SystemPages.ts` treats maintenance, coming soon, and 404 behavior as managed CMS content instead of hardcoded templates, with type-aware layout validation.
- `src/collections/NavigationLinks.ts` already separates reusable destinations from page layout content, which is the right direction for menus, CTAs, and synced page links.
- Page publishing, live preview, redirect generation, and navigation synchronization already exist in the core page model, which means the starter is solving real CMS integrity problems rather than only rendering static pages.
- The repo has an automated test entry point under `tests/int/api.int.spec.ts`, which gives the starter at least a foothold for future behavioral coverage.
## Prioritized Gap Audit

Use this exact structure for every finding:

- **Critical** — Short finding statement.
  - Category: Platform Foundation
  - Evidence: `exact/file.ts` plus the concrete behavior it demonstrates
  - Why it matters: one sentence tying the problem to starter reliability, editor safety, or client reuse
  - Recommended direction: one sentence describing the correction without implementation detail

### Platform Foundation

- **Important** — The starter still reads like a modified Payload template rather than a productized client-copyable starter.
  - Category: Platform Foundation
  - Evidence: `README.md` still presents the repo as "Payload Blank Template", describes generic template setup, and does not document the actual CMS feature set or client clone workflow.
  - Why it matters: a starter stops being reusable when setup, operating assumptions, and handoff guidance live only in code.
  - Recommended direction: rewrite the README and onboarding docs around the real CMS capabilities, environment requirements, and expected clone path for new client sites.
- **Important** — Infrastructure choices are still coupled directly into the core Payload config.
  - Category: Platform Foundation
  - Evidence: `src/payload.config.ts` hard-wires `sqliteAdapter`, configures `resendAdapter` inline, and throws in production when Resend variables are missing.
  - Why it matters: copying the starter to a new client should not require editing core config just to adapt storage, database, or email provider assumptions.
  - Recommended direction: move provider assumptions behind documented environment conventions and clear extension seams so deployments can vary without restructuring the CMS core.
- **Important** — The current test baseline is too thin for a starter that aims to be production-safe and reusable.
  - Category: Platform Foundation
  - Evidence: `tests/int/api.int.spec.ts` only verifies that the `users` collection can be fetched and does not cover page resolution, publishing rules, system pages, or starter-specific workflows.
  - Why it matters: a copied starter needs regression protection around its platform behaviors, not only proof that Payload boots.
  - Recommended direction: expand tests around the starter's real CMS contracts, especially route resolution, settings validation, and publishing guardrails.

### Content Architecture

- **Important** — The current schema already covers real marketing-site entities, which is a strong foundation rather than an empty starter.
  - Category: Content Architecture
  - Evidence: `src/collections/Pages.ts`, `src/collections/SystemPages.ts`, `src/collections/NavigationLinks.ts`, and `src/globals/PageSettings.ts` define core page, system-page, navigation, and site-default models.
  - Why it matters: the audit needs to preserve and refine existing capability instead of treating the starter as if the core CMS model is still missing.
  - Recommended direction: keep these entities as the backbone of the starter and tighten the conventions around how future client sites extend them.
- **Important** — Page behavior ownership is powerful but concentrated, which will make the starter harder to reason about as it gets copied and extended.
  - Category: Content Architecture
  - Evidence: `src/collections/Pages.ts` owns hierarchy validation, preview URLs, SEO fields, publishing hooks, redirect generation, and navigation sync behavior inside a single collection definition.
  - Why it matters: when too many site concerns converge in one content type, future client projects inherit complexity without a clear extension model.
  - Recommended direction: keep the page collection as the content hub, but document and progressively separate cross-cutting responsibilities into clearer starter conventions.
- **Important** — Site structure is modeled across collections and globals, but the starter does not yet explain those ownership boundaries explicitly.
  - Category: Content Architecture
  - Evidence: `src/globals/PageSettings.ts` decides the active homepage, header, footer, and system overrides while `src/collections/SystemPages.ts` and `src/collections/NavigationLinks.ts` define the reusable content those globals point at.
  - Why it matters: editors and developers cloning the starter need to know where structure lives, or they will create duplicate patterns and misplace content.
  - Recommended direction: formalize the content model map so page content, reusable navigation entities, and site-wide defaults have obvious ownership rules.

### Editorial Workflows

### Marketing Operations

### Starter-Kit Reusability

## Target State

## Phased Roadmap

### Phase 1: Foundation And Safety

### Phase 2: Operational CMS Gaps

### Phase 3: Reusability And Handoff

### Phase 4: Block Expansion Readiness

## Appendix: Evidence Base

- `README.md` — setup and deployment narrative still reflects the base template more than the current CMS feature set.
- `src/payload.config.ts` — confirms collection/global registration, provider coupling, and the current database/email assumptions.
- `src/collections/Pages.ts` — shows the core marketing page model, live preview setup, publishing hooks, redirect behavior, hierarchy validation, and SEO ownership.
- `src/collections/SystemPages.ts` — shows the current treatment of system-mode content as managed CMS entities with type-constrained layouts.
- `src/collections/NavigationLinks.ts` — shows the reusable link model and the page-sync design direction for shared destinations.
- `src/globals/PageSettings.ts` — shows how site-wide defaults, published-reference validation, and system behaviors are currently owned.
- `src/app/(frontend)/pageData.ts` — shows centralized frontend content resolution for homepage lookup, published pages, metadata, and system-mode behavior.
- `tests/int/api.int.spec.ts` — shows the current minimal test baseline.
