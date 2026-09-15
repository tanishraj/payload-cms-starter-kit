# Storybook Implementation Plan

> **For agentic workers:** Execute inline using executing-plans; the user approved the proposed Storybook design.

**Goal:** Provide an interactive, database-independent catalogue for the block revamp.

**Architecture:** Storybook imports production presentation components with typed sample props. It uses shared global CSS, official neutral theme tokens, App Router mocks, and light/dark and viewport controls. Payload Live Preview remains the integration environment.

**Tech Stack:** Storybook 10.6, Next.js Vite framework, React, Tailwind CSS 4.

## Global Constraints

Preserve upstream UI sourcing rules. Do not replace existing components or CMS schemas. Do not load Payload configuration, database credentials, or production content into stories. Use local sample assets. Mark existing adapted components accurately rather than claiming upstream parity.

## Tasks

- [x] Add pinned Storybook framework, docs, themes, and accessibility dependencies; add `storybook` and `build-storybook` scripts.
- [x] Configure `.storybook/main.ts`, isolated Next configuration, shared CSS, official neutral tokens, toolbar themes, and viewport presets.
- [x] Add typed stories for existing Button, Accordion, and Logos20 with source references, editable args, interaction checks, and edge states.
- [x] Document authoring rules and require stories for replacement blocks in AGENTS.md.
- [x] Validate static build, TypeScript, focused lint, and browser rendering/theme/interaction behavior. Refresh and check project context.

## Validation

Run `pnpm build-storybook`, `pnpm exec tsc --noEmit`, focused ESLint, and a browser smoke check against the built catalogue. The build must work without a MongoDB connection. Check that stories render shared components, theme switching works, and accordion interaction succeeds.

## Results

Static Storybook build, TypeScript, focused ESLint, and 31 theme/content/logo integration tests pass. Browser inspection verified live stories, successful accordion interaction checks, official neutral dark tokens, font fallbacks, and responsive toolbar support. Build has an advisory chunk-size warning from the development catalogue dependencies. Existing production components and schemas remain intact; only CSS import ordering changed to satisfy Vite/PostCSS.
