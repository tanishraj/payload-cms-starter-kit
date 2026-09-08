# Admin Dashboard and Permission UX Implementation Plan

**Goal:** Remove duplicate dashboard content, improve Site Manager permission authoring, and place
block anchor IDs under progressive disclosure without changing access semantics or stored data.

**Specification:**
`docs/superpowers/specs/2026-09-07-admin-dashboard-permissions-ux-design.md`

## Constraints

- Preserve unrelated working-tree changes.
- Do not stage or commit.
- Keep all 29 feature keys, dependency edges, access helpers, hooks, and storage paths unchanged.
- Use Payload's native form state and Save action.

## Task 1: Lock the desired contracts with tests

**Files:**

- Modify: `tests/int/dashboard-capability-filtering.int.spec.tsx`
- Modify: `tests/int/user-feature-administration.int.spec.ts`
- Modify: `tests/int/block-anchor-navigation.int.spec.tsx`
- Create: `tests/int/feature-access-controls.int.spec.tsx`

Add assertions for the dashboard view registration, truthful failures, Reviews recent edits,
non-widget grants, permission progressive disclosure and component registrations, pure effective
access calculations, bulk form updates, and the unnamed Advanced anchor wrapper. Run the focused
tests and confirm the new assertions fail before implementation.

## Task 2: Replace and harden the dashboard body

**Files:**

- Modify: `src/payload.config.ts`
- Create: `src/components/admin/DashboardView.tsx`
- Modify: `src/components/admin/DashboardOverview.tsx`
- Create: `src/components/admin/DashboardOverview.scss`

Register the full dashboard body component, consume its authenticated props, normalize failed
counts to unavailable values, query recent Reviews, render semantic regions, add the non-widget
feature fallback, and make the submissions region responsive.

## Task 3: Improve Site Manager feature assignment

**Files:**

- Modify: `src/collections/Users.ts`
- Create: `src/components/admin/FeatureAccessControls.tsx`
- Create: `src/components/admin/FeatureAccessControls.scss`
- Create: `src/components/admin/featureAccessPresentation.ts`

Add the overview and group UI fields, collapsed group labels/counts, direct and dependency summaries,
and global/group bulk controls. Preserve the native checkbox fields and all authorization hooks.

## Task 4: Move block anchors under Advanced

**Files:**

- Modify: `src/blocks/shared/blockAnchor.ts`

Wrap the existing text field in one unnamed collapsed `Advanced` collapsible so the database shape is
unchanged.

## Task 5: Synchronize generated and maintained context

**Files:**

- Regenerate: `src/app/(payload)/admin/importMap.js`
- Regenerate if changed: `src/payload-types.ts`
- Modify: `.agents/skills/project-context/references/payload-model.md`
- Modify: `.agents/skills/project-context/references/block-system.md`
- Modify: `docs/operations/editorial-governance.md`
- Update: `.agents/skills/project-context/references/project-inventory.json`

Run `pnpm generate:importmap`, `pnpm generate:types`, the focused test set, lint/type/build checks,
`pnpm project-context:update`, and `pnpm project-context:check`. Review the final diff against the
change-impact map and leave all files uncommitted.
