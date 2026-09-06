---
target: Payload Admin panel UX
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
timestamp: 2026-09-06T20-14-06Z
slug: src-payload-config-ts
---
# Admin UX critique

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Attention counts and publication badges are useful, but some query failures render as zero and high-impact state changes lack strong consequence previews. |
| 2 | Match with the real world | 3 | Institutional language is generally clear; operational labels and stored values still leak technical vocabulary. |
| 3 | User control and freedom | 3 | Drafts, versions, trash, cancel, and Page-creation recovery are strong; review approval and site-mode activation need more deliberate exits and confirmations. |
| 4 | Consistency and standards | 3 | Payload patterns are mostly respected, but dashboard, list, theme, and date conventions diverge. |
| 5 | Error prevention | 3 | Validation and access guardrails are extensive; permission assignment and public-state changes need stronger prevention. |
| 6 | Recognition rather than recall | 2 | Editors must understand 29 grants, dependencies, 57 blocks, and a long Admin navigation without summaries or recommendations. |
| 7 | Flexibility and efficiency | 2 | Quick actions, recents, searchable lists, and recipes help, but there are no permission presets, favorites, or role-specific workspaces. |
| 8 | Aesthetic and minimalist design | 2 | The guided Page setup is focused, while the duplicated dashboard, full-access sidebar, permission form, and operational records are dense. |
| 9 | Error recognition and recovery | 3 | Many errors are precise and Page creation has recovery, but dashboard failures and some operational states are ambiguous. |
| 10 | Help and documentation | 2 | Repository documentation and field descriptions are strong, but help is not available in-context in the Admin. |
| **Total** |  | **26/40** | **Acceptable foundation; significant UX consolidation remains.** |

## Design Specificity Verdict

The Admin has product-specific information architecture and governance inside a largely stock Payload shell. Pages, reusable sections, institutional News & Events, Reviews moderation, site modes, feature-filtered access, and the Page recipe flow are meaningfully tailored. Visually and interactionally, however, the dashboard and most editing surfaces remain category-interchangeable. The strongest product character is in the schema and rules rather than in a coherent Admin operating experience.

The deterministic detector returned zero findings for `src/components/admin`. That is not a clean bill of health: it did not cover Payload schema configuration and cannot detect permission contradictions, information overload, task-flow problems, or most inline-style risks. The independent source/browser passes found these manually.

## Overall Impression

The governance layer is already stronger than the presentation layer. The highest-value move is not a reskin; it is turning the Admin from a collection directory into a role-aware editorial workspace. The guided Page creation flow is the best incumbent pattern to extend: focused task, clear choices, explicit progress, recovery, responsive behavior, and restrained styling.

## What Is Working

1. The feature model fails closed in navigation and server access, and user-scoped dashboard queries enforce access rather than merely hiding links.
2. Page creation is focused and resilient: labelled controls, two clear starting points, submission feedback, Cancel, retry/recovery, responsive stacking, keyboard focus, and reduced-motion handling.
3. Drafts, versions, trash/restore, immutable operational fields, publication blockers, review moderation hooks, and last-Admin protection provide strong safety foundations.

## Cognitive Load

Five of eight checks fail, indicating high load for full-access Admins and new editors:

- Single focus fails because the dashboard combines attention, totals, quick actions, recent edits, submissions, and then Payload's complete default overview.
- Chunking and grouping pass because destinations, grants, and forms use named groups, tabs, rows, and collapsibles.
- Visual hierarchy mostly passes, especially in the attention dashboard and Page recipe flow.
- One-thing-at-a-time fails in the User form, where credentials, role, and 29 grants are managed together.
- Minimal choices fails at 29 grants, five quick actions, and 57 Page blocks.
- Working memory fails because effective access and feature dependencies are not summarized.
- Progressive disclosure fails because all permission groups are expanded and the Advanced block library remains broad.

## Priority Issues

### P1 — Dashboard and navigation repeat too much of the same information

**Evidence:** `src/payload.config.ts` registers `DashboardOverview` through `beforeDashboard`, so the custom workspace is followed by Payload's default collection/global overview. Live DOM inspection confirmed the duplicate destination and create/show-all links. A full Admin has ten navigation groups and 29 grant-controlled destinations; several group/destination names also collide, including News & Events, Media, and Forms.

**Why it matters:** The dashboard becomes a long directory instead of a decision surface, frequent destinations compete with low-frequency configuration, and users must scroll past repeated actions.

**Fix:** Replace the dashboard view rather than prepend to it. Keep only Needs Attention, role-relevant quick actions, recent work, and a compact destination launcher. Persist navigation group state, collapse low-frequency configuration by default, rename exact group/destination collisions, and add pinned/recent destinations.

**Suggested command:** `$impeccable distill`

### P1 — Permission assignment lacks an effective-access model

**Evidence:** `src/collections/Users.ts` renders 29 checkbox grants across ten collapsibles, all expanded, in fixed three-column rows. There are no selected counts, presets, group toggles, search, dependency explanations, or pre-save summary. Authorization changes clear the user's sessions, but that consequence is not disclosed in the form.

**Why it matters:** Admins can over-grant, under-grant, miss dependencies, or unexpectedly interrupt active Site Managers. Action Queue and Audit Log are especially easy to misunderstand because visible data also depends on other source-feature grants.

**Fix:** Collapse groups by default; add selected/total counts, search, select/clear group controls, safe job-based presets, and a live effective-access summary. Before Save, show added/removed destinations, dependency implications, and the session-revocation consequence.

**Suggested command:** `$impeccable clarify`

### P1 — High-impact public changes look like ordinary field edits

**Evidence:** setting a submitted Review to Approved publishes it on Save, while Maintenance & Modes can replace the public site through a normal field-and-save flow.

**Why it matters:** Moderation and whole-site mode changes have much larger consequences than routine edits. Help text alone does not provide a deliberate decision moment.

**Fix:** Provide dedicated Approve and Reject actions with a public preview, consequence summary, confirmation, and decision note. Give maintenance activation its own impact panel, selected-page preview, affected-route explanation, and explicit activation confirmation.

**Suggested command:** `$impeccable harden`

### P1 — Operational destinations expose storage structure instead of the job to be done

**Evidence:** Action Queue presents a dense multi-column list and Details/Source/System tabs; Form Submissions combine operational fields, attribution, timestamps, promotion diagnostics, and raw data. Dashboard attention cards make these screens primary next steps.

**Why it matters:** A Site Manager arrives to resolve work but must translate schema into a workflow: understand the request, find its source, act, return, and update status.

**Fix:** Create task-focused list/detail presentations. Lead with summary, reason, submitter/source context, assignment, status, due date, and a real Open Source Record action. Render submission values as readable labelled rows and move diagnostics/system metadata into an Admin-only collapsed area.

**Suggested command:** `$impeccable shape`

### P2 — Status, semantics, responsive behavior, and visual tokens are inconsistent

**Evidence:** failed content-count queries render as legitimate zeroes while failed attention counts show unavailable; the dashboard can claim no features for a Site Manager who holds only one of the 21 grants not represented by its widgets; Reviews are omitted from Recently Edited despite being counted elsewhere; dashboard section labels are styled paragraphs rather than headings; the submissions table sits inside `overflow: hidden` without a narrow-layout alternative; fixed hex accents do not follow Payload theme tokens. Several draft-enabled collection lists omit `_status`, and date/status labels use inconsistent formatting.

**Why it matters:** Editors can mistake data failures for empty content, receive contradictory access messages, lose columns on narrow screens, and relearn status cues between destinations.

**Fix:** derive empty state from the complete grant set; represent all failed counts as unavailable; add Reviews or rename the recent list; use semantic sections/headings; reflow submission rows on mobile; centralize Admin colors, badges, spacing, date formatting, and list-column conventions; include `_status` everywhere it affects publishing.

**Suggested command:** `$impeccable audit`

## Persona Red Flags

### Admin assigning access

The long permission form lacks presets, effective-access preview, dependency explanations, and a session-revocation warning. Partial or excessive access is easy to save accidentally.

### Site Manager triaging work

Dashboard attention is useful, but the destination then becomes schema-oriented. Action Queue data can also appear unavailable when the direct queue grant exists but required source-feature grants do not.

### First-time institutional editor

The excellent two-choice Page setup leads into 57 blocks and a mix of collection, reusable-section, global-template, taxonomy, and site-mode concepts without in-context onboarding. Component-style names and web-operations terms increase support dependence.

## Minor Observations

- Quick Actions presents five equal-weight choices; rank the primary action or move infrequent actions into a secondary menu.
- Stored values such as `general`, `new`, and potentially `in_review` leak into dashboard copy instead of human labels.
- Some custom Admin components use inline styles and fixed colors while Page Recipe Setup uses a maintainable SCSS/token approach.
- The dashboard custom links do not define component-local hover/focus-visible states.
- The user-menu trigger advertises menu semantics without implementing a complete menu keyboard pattern; it should be a proper menu or a labelled disclosure.
- Destination-level descriptions are missing for Media, Site Identity, Maintenance & Modes, and Users.
- Repository editor guides are comprehensive, but the Admin has no role-specific onboarding, contextual help links, or feature glossary.

## Questions to Consider

- Should Site Manager access start from named editorial jobs such as Page Editor, News Publisher, and Review Moderator, with advanced overrides?
- Which five destinations should a full Admin reach without scrolling?
- Should Action Queue become the primary operational workspace, with source records and decision actions embedded directly?
- Which institutional page outcomes deserve guided recipes before editors ever see the full block library?
