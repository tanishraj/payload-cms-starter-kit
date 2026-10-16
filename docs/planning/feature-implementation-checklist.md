# Website feature implementation checklist

Updated: 16 October 2026 (Asia/Dubai).

## Current direction

All new work happens in **payload-cms-starter-kit**. The Forma repository is a
preserved prototype and historical requirements source; implementation has moved
here. Extend this starter's working features and follow its current repository
conventions. Keep Payload's native administration, block composition and Live
Preview. A separate visual editor is excluded.

The user selected **dynamic forms and generic submissions as the first enhancement**.
The active baseline remains the starter's supported MongoDB, storage and email
contracts. Moving work here does not require a database conversion or a new
workspace/package structure. New environment settings must be documented in this
repository's `.env.example` in the same implementation change, with purpose and
production requirement; secrets stay in ignored files or deployment settings.

This file is the implementation tracker. [Feature scope reference](feature-scope-reference.md)
archives the full earlier inventory, rationale, numerical proposals and deferred
scope so future work does not depend on opening the Forma repository.
[Technical feature inventory](../architecture/feature-inventory.md) describes
registered current functionality; this checklist describes target acceptance.

The [complete-catalogue Wayfinder map](../../.scratch/website-builder-catalogue/map.md)
tracks remaining planning decisions. Its [coverage index](../../.scratch/website-builder-catalogue/coverage.md)
routes all 242 groups and ten separate DF proof steps. Planning tickets and confirmed
directions do not complete feature acceptance; this file remains the implementation tracker.

## Latest sequencing decision — 16 October 2026

The user accepts the current core forms implementation and protected email links,
and asks to move beyond forms. Start section-scoped Site Manager access, then
onboarding. Notification outbox/retries, advanced notification mappings, webhooks,
safe test mode and advanced controls stay deferred; their broad boxes are not
claimed complete. This supersedes the earlier forms-first exit sequence below.
Only Admin and Site Manager roles exist. A secure link is permission-checked on
access, not a bearer/public URL. See the [section access runbook](../operations/section-scoped-access.md).

The first scope increment covers Pages, Forms, Reusable Sections, submissions and
related operational rows. Other destinations retain explicitly labelled site-wide
feature grants. Full ACCESS-02/05/06/07/09 acceptance remains open for broader
collections/media, diagnostics and entry-point evidence.

## How to maintain the checklist

- Delivery workflow confirmed by the user on 2026-10-14: complete one feature
  increment, pass its acceptance and required repository checks, then merge into
  `develop` before starting the next feature on a fresh branch. Keep commits clean
  and pushed; delete only confirmed-merged feature branches and preserve `develop`.
  Failed merge gates must be resolved; an expired security approval is not renewed
  by general authorization to merge.
- A box means **the entire feature's applicable acceptance is verified**. An empty
  box may mean existing behavior needs verification, a partial enhancement remains,
  or the feature has not been assessed. It never means “rebuild this feature.”
- Work statuses: `Assess`, `Ready`, `In progress`, `Blocked`, `Deferred`, `Verified`,
  or `Not applicable`. Keep the box empty until Verified. For Not applicable, record
  the agreed reason instead of counting it as an implementation success.
- Baselines: `Source present`, `Partial`, `Gap`, or `Not yet assessed`. Source
  presence is not runtime acceptance. Initial evidence is read-only inspection at
  commit `180d0e2d83221d47e26068afb6b23977c1351b65`; tests were not rerun to certify these features.
- Keep the stable feature IDs. Before implementing, record applicable acceptance,
  baseline/source evidence, dependencies, owner and intended changes in the work log.
- After implementation, update status, completion date, commit/PR and actual test
  evidence. If existing behavior passes all acceptance, verify it without rewriting it.
- `Recommended` entries need prioritization; `Later` entries stay Deferred.
  `Decision needed` entries need a recorded choice. Retained scope does not mean
  every feature must ship in the next release.
- Update this tracker in every implementation that affects its features. Use the
  starter's project-context update/check workflow; update operator documentation
  when behavior changes. Do not mark a feature complete merely because a plan exists.

## First enhancement: dynamic forms and generic submissions

These proof tasks break down the selected first enhancement. Their checkboxes
track the proof; the FORM/SUBMIT groups below track the complete capability.

- [x] **DF-01 — Map the current path.** Review Forms, validation, all form block
  presentations, intake, stored answers, inbox, exports, notifications and existing
  tests. Record what is reusable and which presentations require fixed names.

  Evidence: [current path audit](dynamic-forms-implementation.md); source mapping
  complete, broad capability acceptance still pending.
- [ ] **DF-02 — Define stable identities and revisions.** Separate field ID from
  label/name/order; define published schema identity and stored-answer metadata.
  Preserve existing forms/submissions through an explicit compatibility policy.
- [x] **DF-03 — Prove custom fields.** Author text/select/checkbox fields through
  Payload, including `preferred_department` with a custom label, options and
  required validation. Use the shared production renderer, without fixed contact keys.

  Evidence: [native browser journey](../../tests/e2e/generic-form.e2e.spec.ts) passed
  on an isolated test database: editor-authored text/select/checkbox questions,
  public validation and submission, readable typed answers, draft isolation and
  disabled Live Preview. Shared renderer tests cover all six currently supported types.
- [ ] **DF-04 — Prove validation/intake.** Client and server agree; reject malformed,
  extra and inactive hidden values. Store valid typed answers against their schema
  revision and prevent accidental duplicate submissions.
- [ ] **DF-05 — Prove operational use.** Readable generic answers in the authorized
  inbox and export; optional reply-to/title mappings; stored submissions survive
  notification failure and retry without duplicates.
- [ ] **DF-06 — Prove schema changes.** Reorder, relabel, rename, change options/type
  and remove a field while preserving readable historical submissions. Define
  behavior for an in-flight visitor submitting an older revision.
- [ ] **DF-07 — Complete controls and layout.** Expand to FORM-03/04 and type-specific
  validation through the same contract; private file intake needs a scoped storage
  and attachment access design, not the public Media trust boundary.
- [x] **DF-08 — Complete conditions and appearance.** Declarative visibility/required
  rules and supported size/shape/layout props work in Payload preview, public
  rendering and Storybook. Preserve selected upstream presentation requirements.
  Verified for the supported appearance and stable-ID all-match rule contract.
  Appearance merged in PR #30; conditions merged in [PR #31](https://github.com/tanishraj/payload-cms-starter-kit/pull/31)
  as `e18690eb` after [exact-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38861826953)
  passed on `311fec42`. Both native form journeys passed first attempt; renderer,
  schema/intake/recovery tests, Storybook and production build passed. See the
  [condition contract](form-conditional-rules.md). Advanced rule groups/scripting
  and configurable responsive breakpoints remain outside this supported contract.
- [ ] **DF-09 — Verify access and failure states.** Unauthorized edits/inbox/file
  access are denied; drafts do not alter live forms; accessible errors, retry,
  pending/success and safe test mode are exercised.
- [ ] **DF-10 — Close acceptance and document.** Focused integration/browser/manual
  checks pass; examples and operator/developer guides describe the actual behavior.
  Update corresponding FORM/SUBMIT groups with commit and verification evidence.

DF-02 is in progress: published intake snapshots, Payload field-row identity,
content fingerprints, immutable readable answers and legacy compatibility exist.
The generic-client stale-revision recovery increment is implemented; full identity,
retention and remaining acceptance stay open. DF-03/04/09 have workshop and recorded
native browser evidence for the six current controls, custom names, strict scalar
validation, accessible feedback and disabled Live Preview. Conditions, complete
revision lifecycle and notification recovery remain; the durable retry increment is implemented but its merge is security-gated. Form blocks use
shared theme tokens and select reusable schemas; example questions are not authoritative.
[Implementation audit](dynamic-forms-implementation.md), [baseline assessment](forms-access-baseline.md)
and [recovery increment](form-revision-recovery.md) and [retry increment](form-submission-retries.md) distinguish shipped source, fresh
tests and remaining acceptance.

The user reaffirmed on 2026-10-14: finish the forms milestone before other builder items. The [forms completion sequence](forms-completion-plan.md) makes its remaining work and exit evidence explicit; full feature acceptance stays in this checklist. Existing FORM-09 later scope remains deferred.

## Delivery sequence

| Order | Work | Gate |
| --- | --- | --- |
| 1 — Core accepted; advanced work deferred | Dynamic forms and generic submissions: DF-01–10, FORM and SUBMIT | Custom field → public render → validated submission → revision-aware inbox/export. Include required security/access prerequisites. |
| 2 — First increment shipped (PR #33); broader scopes open | Section-scoped Site Manager permissions: ACCESS, applicable PAGE/SEC/VERIFY | Allowed operations succeed; direct cross-scope API/preview/history/file operations fail. |
| 3 — Selected; optional guide shipped (PR #34), developer setup in progress | Developer/Admin/Site Manager onboarding and everyday UX | Optional current-access guidance, preserved environment, safe setup diagnostics and real draft/preview evidence. |
| 4 | Draft/publication/history reliability and shared changes | Conflict, restore-as-draft, shared draft isolation and failed delivery behavior verified. |
| 5 | Theme/props/Storybook, reusable data and remaining content capabilities | Extend verified existing behavior; new presentations follow Storybook-first revamp conventions. |
| 6 | Media/search/SEO/site experiences and operational gaps | Assess and verify starter coverage before adding functionality. |
| 7 | Release verification | Accessibility/usability, staging, backup restore and rollback evidence; no unresolved data-loss or access leaks. |

Existing Storybook/block revamp work is preserved. It is not automatically declared
complete or expanded into a rebuild of the existing catalogue. Cross-cutting safety
and compatibility tasks can be prerequisites of any phase. Onboarding and admin
UX acceptance applies within each phase; see the [role journeys and readiness
plan](admin-onboarding-ux.md). Deliver the first useful draft flow before client
handoff; the latest sequencing decision above supersedes historical forms-first instructions.

## Initial source findings

| Finding | Evidence | Tracking |
| --- | --- | --- |
| Pages are native blocks/drafts with guided creation | [Pages](../../src/collections/Pages.ts), [PageCreateView](../../src/components/admin/PageCreateView.tsx) | PAGE/PUBLISH; assess full acceptance. |
| Page access currently uses feature grants | [featureAccess](../../src/access/featureAccess.ts) | ACCESS-02–08: add/test page-root and record constraints. |
| Form field options currently cover six types | [forms](../../src/lib/forms.ts) | FORM-03: expand through a shared contract. |
| Contact33 has fixed field-name/type expectations | [contact33Form](../../src/lib/contact33Form.ts) | FORM-02: generic form presentation is the first priority. |
| Reusable Forms and an operational submission collection exist | [Forms](../../src/collections/Forms.ts), [FormSubmissions](../../src/collections/FormSubmissions.ts) | FORM/SUBMIT: reuse and assess revision-safe historical answers. |
| MFA, redirects, search and backup tooling exist | See relevant feature entries below | Verify applicable behavior; do not create competing implementations. |

## Feature catalogue and acceptance checklist

All **206** original feature groups are preserved below. An additional 36
onboarding/admin UX groups follow the original catalogue. Initial boxes are empty
because this tracker has not certified their full acceptance. Recommended/later
items and implementation decisions retain their labels. Numerical targets,
exclusions and complete source traceability are in the local scope reference.

### Product boundaries

- [ ] **CORE-01 — Reusable website platform.** Create different content-driven
  websites from shared components, blocks and content models; one site per
  deployment for the initial product.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CORE-02 — Existing stack.** Next.js, Payload, Tailwind, shadcn/ui and theming,
  Storybook, and CVA where useful. Reuse working starter capabilities first.

  Work: Assess · Priority: Backlog · Baseline: Source present.
  Initial finding: Keep current Next/Payload/Tailwind/Storybook stack; MongoDB remains the supported adapter.
  Evidence: [package.json](../../package.json), [src/config/providers.ts](../../src/config/providers.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CORE-03 — Structured content.** Persist typed page/block/form data, references
  and configuration; do not save arbitrary generated HTML as the page model.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CORE-04 — Content ownership.** Pages own composition; collections own records;
  globals own site-wide defaults; reusable content owns explicitly shared items.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CORE-05 — Generic core.** Institutional examples such as faculty, departments
  and insurers are optional collection configurations, not hardcoded platform rules.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CORE-06 — Reference-only SNMIH.** Demonstrate comparable website capabilities
  using original sample content. No SNMIH migration, replica, branding/content copy,
  admissions policy or clinical system is requested.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CORE-07 — Consistent rendering.** Storybook, Payload Live Preview and the public
  website use the same production presentation components and compatible data.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CORE-08 — Reuse before replacement.** Keep functioning starter features and
  their tests; implement verified gaps. This inventory is not a direction to
  rebuild its block catalogue, authentication, forms or deployment tooling.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Payload administration and page composition

- [ ] **PAGE-01 — Page records.** Title, slug/path, parent section, ordered layout,
  SEO, draft/publication status, revision/history metadata, search configuration
  and permitted overrides.

  Work: Assess · Priority: Backlog · Baseline: Source present.
  Initial finding: Native Page schema exists; assess each requested field and permission behavior before completion.
  Evidence: [src/collections/Pages.ts](../../src/collections/Pages.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PAGE-02 — Blank-page creation.** Create a page with a title and authorized
  parent; suggest an editable slug, validate collisions and open its Payload edit
  screen. Only Admins create/assign new top-level scopes.

  Work: Assess · Priority: Backlog · Baseline: Partial.
  Initial finding: Guided creation exists. Authorized parent/subtree assignment needs separate assessment.
  Evidence: [src/components/admin/PageCreateView.tsx](../../src/components/admin/PageCreateView.tsx), [src/access/featureAccess.ts](../../src/access/featureAccess.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PAGE-03 — Block operations.** Add approved blocks, edit fields, reorder,
  duplicate, remove, give meaningful internal names, and configure supported
  visibility. Use native Payload controls; provide accessible alternatives where
  a required operation otherwise depends only on dragging.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PAGE-04 — Block discovery.** Understandable block names, descriptions,
  categories, search and preview thumbnails in the Payload selection experience
  as the catalogue grows. A separate block-library sidebar is excluded.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PAGE-05 — Page discovery.** Search/filter manageable pages by title, location,
  publication state and owner where applicable; show section context and breadcrumbs.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PAGE-06 — Duplication.** Duplicate pages/sections as drafts with fresh IDs,
  safe slugs and non-colliding anchors. Recheck references and destination scope.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PAGE-07 — Hierarchical URLs and moves.** Maintain parent/child relationships;
  deliberate slug/move changes update affected paths and redirects without changing
  permission grants accidentally. Cross-scope moves are Admin-controlled.

  Work: Assess · Priority: Backlog · Baseline: Partial.
  Initial finding: Hierarchical Pages and redirect hooks exist; do not infer scoped-move authorization.
  Evidence: [src/collections/Pages.ts](../../src/collections/Pages.ts), [src/hooks/createRedirectsForChangedPagePath.ts](../../src/hooks/createRedirectsForChangedPagePath.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PAGE-08 — Clear fields.** Required markers, contextual help, sensible defaults,
  relevant conditional fields, inline errors and a navigable validation summary.
  Expose content first; group advanced settings through Payload's existing patterns.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PAGE-09 — Relationships.** Search/select pages, collection records, assets and
  reusable content by meaningful labels rather than manually entering IDs or URLs.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PAGE-10 — Optional productivity [Recommended].** Two or three editable starting
  layouts with Blank always available; safe cross-page block copy/paste; an
  access-filtered admin command palette. Favorites/recent blocks remain lower priority.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Block catalogue, layout and supported configuration

- [ ] **BLOCK-01 — Representative base catalogue.** Hero, Rich Content, Image + Content,
  Stats/Features and CTA. These are coverage examples, not a reason to discard the
  starter's larger working catalogue or rebuild equivalent blocks.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **BLOCK-02 — Previously outlined variants.** Hero: centered, split, background
  image, minimal. Rich Content: default, two-column, narrow. Image + Content:
  left/right/above. Stats: grid/inline/cards. CTA: banner/boxed/split. Map to licensed,
  supported existing components before adding a new variant.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **BLOCK-03 — Extended catalogue.** Accordion/FAQ, Tabs, Testimonials, Logo Cloud,
  Team/People Grid, Timeline, Pricing Table, generic Form, Map and Video. Gallery,
  document listings, announcements and data listings support the reference-site
  capability proof. Expansion is phased after the common lifecycle works.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **BLOCK-04 — Typed props.** Supported content, media, actions, behavior, variant,
  shape, size, alignment, spacing, background, width and responsive options.
  Exposed controls must change real behavior; no nonfunctional configuration knobs.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **BLOCK-05 — Controlled sections.** Full/container/narrow widths, padding, gap,
  columns, stacking, alignment, backgrounds and visibility as supported settings.
  Where nested composition is needed, use Section-owned named slots such as
  main/sidebar containing terminal blocks; no arbitrarily recursive Sections.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **BLOCK-06 — Structural constraints.** Allowed parent/child types, root-only
  blocks, depth limits and maximum instances. Validate in Payload and server-side,
  with useful reasons instead of silently dropping invalid content.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **BLOCK-07 — Stable identity.** Preserve block IDs during ordinary edits,
  reorder and history restoration; distinguish IDs from user-visible anchor names.
  Copying creates new IDs and resolves anchor collisions.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **BLOCK-08 — Missing/unknown content.** Preserve unrecognized block data, report
  unsupported types/versions and block unsafe publication. Provide safe public
  fallbacks and actionable admin errors.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **BLOCK-09 — Common states.** Empty, loading, failed, long-content and missing-media
  states; predictable output when a referenced record becomes unavailable.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **BLOCK-10 — Provenance.** Record component/block sources and licenses. Pro source
  access does not itself establish reuse rights for every deployment/distribution
  model; verify the intended use before importing assets.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Design system, themes and responsive behavior

- [ ] **DESIGN-01 — Semantic tokens.** Background/foreground, primary/secondary/accent,
  muted, border, success/warning/destructive, card/input/button appearance, spacing,
  container widths, typography, radius, shadows, density and stacking layers.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DESIGN-02 — Theme presets.** Approximately two or three complete presets to
  prove theme reuse, including light/dark values. Preserve the selected official
  shadcn foundation; additional presets are deliberate additions, not an automatic
  replacement of the starter's current appearance.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DESIGN-03 — Sparse overrides.** Payload settings select a preset and store only
  changed tokens. Reset to Default removes an override; untouched values continue
  to inherit future preset changes. Preview representative output before publication.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DESIGN-04 — Color modes.** Light, dark, system preference and optional visitor
  toggle; supported section-level theme scope; avoid a flash of the wrong theme.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DESIGN-05 — Typography.** Curated heading/body font choices and semantic scales;
  load only selected families/weights, with self-hosting where appropriate. Changing
  an approved selection through the CMS should not require site-specific code.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DESIGN-06 — Responsive options.** Supported per-breakpoint columns, stacking,
  spacing, gap, alignment, direction, width and visibility. Distinguish inherited
  values from explicit overrides; offer Reset/Use inherited value.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DESIGN-07 — Configurable breakpoints [Later].** Retain the requested
  site-level breakpoint capability and impact preview. The user accepted selected
  upstream blocks’ fixed breakpoints initially on 2026-10-14; configurable
  breakpoints remain a later planned capability. Detailed rollout constraints
  belong to [Define theme, supported props and responsive rollout](../../.scratch/website-builder-catalogue/issues/12-themes-props-responsive.md).

  Work: Deferred · Priority: Later · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DESIGN-08 — Capability settings.** Admins enable supported component options
  and choose defaults globally. Disabled choices disappear from new configuration;
  previously saved values remain renderable and receive a migration/warning policy.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DESIGN-09 — Safe styling.** Editors choose supported semantic options, not
  arbitrary CSS, Tailwind classes, executable expressions or untrusted HTML.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DESIGN-10 — Shared primitives.** Button, Link/Action, Icon, Media/Image, File,
  Heading, Rich Text, List, Container, Grid and form controls. Improve common
  behavior once and reuse it throughout the block catalogue.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DESIGN-11 — Button capabilities.** Text, icon-only and text-plus-icon; icon
  position; approved appearances/sizes and shapes. Square/rounded/pill/circle/
  angled/hexagon were outlined candidate shapes, not a requirement to fabricate
  unsupported upstream variants. Icon-only controls need accessible labels.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DESIGN-12 — Heading capabilities.** Semantic level independent of visual size,
  alignment, automatic wrapping, structured controlled breaks by breakpoint and
  accent segments, retaining readable accessible text.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Shared actions, links and downloads

- [ ] **ACTION-01 — Typed destinations.** Internal pages, routable collection records,
  external URLs, same/cross-page anchors, files, email and phone.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACTION-02 — Presentation independent of destination.** Text link, button,
  icon button and text-plus-icon button; block-specific allowed action types/counts.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACTION-03 — Behavior.** Same/new tab, file view/download, supported mail subject
  and phone normalization. Show only relevant Payload configuration fields.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACTION-04 — Central safety.** Safe schemes, escaped values, appropriate link
  relations and real link/button semantics; no duplicated ad hoc URL handling.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACTION-05 — Reference integrity.** Resolve internal paths from stable record
  references; validate deleted/unpublished targets and invalid anchors. Provide
  explicit fallback behavior and permission-safe relationship choices.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Content collections, dynamic listings and detail pages

- [ ] **CONTENT-01 — Reusable structured content.** Articles, News/Events, People,
  Departments, Courses, Documents, Categories/Tags and Announcements as enabled
  for a site. Institution-specific labels/adapters remain optional.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CONTENT-02 — Reference-site extensions.** Grouped departments and related people;
  insurer/partner logo records; categorized public-disclosure documents by session/
  year, effective date, review date and current/historical status.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CONTENT-03 — Stable adapters.** Resolve CMS records into typed presentation
  models with sensible defaults; collection-schema changes should not require
  rewriting every block. Batch/deduplicate compatible reads per request.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CONTENT-04 — Configurable listings.** Approved source, item count, selected
  records or query, category/type/date/featured filters, ordering and field toggles
  for image/date/excerpt/author/category. Cards/list/featured/carousel presentations
  and responsive columns where supported.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CONTENT-05 — Pagination and states.** None, load-more or crawlable paged URLs;
  useful empty/error/loading output rather than blank sections.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CONTENT-06 — Dynamic detail routes.** Published records get routes without
  separately authoring a Page per record; shared detail layouts, related content,
  metadata and authenticated draft/sample-record preview.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CONTENT-07 — Typed bindings.** Select approved content fields with compatible
  value types and fallbacks through Payload configuration. No `{{expression}}`
  execution or arbitrary JavaScript. Support title/image/body/author/date/related
  data as appropriate to the source.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CONTENT-08 — Public filters/tabs.** URL-synchronized category/search state,
  bookmarkable links, back/forward restoration and accessible keyboard behavior.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CONTENT-09 — Page-level search.** Small-list local filtering and large-list
  server search/pagination, configurable threshold, debounce, query state and
  announced result counts. The earlier proposed threshold was 200 items.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **CONTENT-10 — Date-aware content.** Events expose start/end dates; distinguish
  upcoming/past events. News/notices can carry publication/expiry windows; time
  boundaries must also update cached output.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Globals, inheritance, navigation and reusable content

- [ ] **GLOBAL-01 — Site settings.** Branding, light/dark logos, favicon/social/app
  icons, appearance, fonts, responsive settings, SEO defaults, social links,
  integrations, search and timezone.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **GLOBAL-02 — Header/footer/navigation.** Edit through Payload globals/collections;
  supported two-level dropdowns, mega-menu and mobile drawer with keyboard/focus
  handling. Navigation is site structure, not copied into every Page.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **GLOBAL-03 — Inheritance.** Site/global → section/content-type → page → block/
  local overrides. Store differences and show which values are inherited.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **GLOBAL-04 — Explicit header modes.** Global, Global with overrides, Full
  override, Alternate header and No header; permit CTA-only overrides while logo
  and navigation remain inherited. Apply the supported model consistently to
  footer, navigation, theme, SEO and component defaults.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **GLOBAL-05 — Deterministic resolution.** Define object merging, array replacement,
  explicit clearing and inheritance separately; Reset restores inheritance.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **GLOBAL-06 — Reusable content.** Shared CTA, contact information, notices,
  disclaimers and sections; explicit reference versus copy, permitted field
  overrides and a clear route to edit the shared original.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **GLOBAL-07 — Shared publication.** Shared items/settings have drafts and explicit
  publication. Draft changes do not change live pages; show affected pages and
  representative previews before publishing. Enforce separate shared-edit permissions.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **GLOBAL-08 — Dependency safety.** Where-used lists, cycle detection and blocked
  deletion of referenced items. Invalidate affected pages when shared content changes.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **GLOBAL-09 — History boundary.** Page restore restores page-owned data/references.
  References resolve to current published shared entities; historical previews
  disclose that limit. Exact whole-site historical snapshots are later work.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Dynamic forms — authoring and control catalogue

- [ ] **FORM-01 — Payload form authoring.** Create a reusable form, add/reorder/group
  controls, configure fields and presentation, preview and publish through Payload.
  A Page Form block selects a form; authorized users can create/edit that related
  form and return to the page. No separate visual form editor is required.

  Work: In progress · Priority: First enhancement · Baseline: Partial.
  Initial finding: Reusable Payload form definitions exist; generic public composition and full preview flow remain to assess.
  Evidence: [src/collections/Forms.ts](../../src/collections/Forms.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.
  Increment evidence: [dynamic-form history audit](dynamic-forms-implementation.md). Full feature acceptance remains incomplete.

- [x] **FORM-02 — Configurable fields.** Adding a supported control with a custom
  label/name works without a new collection column, endpoint, hand-coded renderer
  or email template. Do not require fields literally named `name`, `email` or `message`.

  Work: Merged into develop · Priority: First enhancement · Baseline: Source present.
  The Generic Form block selects reusable definitions and renders the six supported
  controls without fixed keys. Contact Cards & Form adds the sourced Contact6 layout
  through the same contract. Contact33 remains a compatible historical presentation.
  Evidence: [Forms](../../src/collections/Forms.ts), [shared renderer](../../src/components/revamp/generic-form.tsx),
  [native browser journey](../../tests/e2e/generic-form.e2e.spec.ts),
  [integration contracts](../../tests/int/generic-form-integration.int.spec.tsx).
  Owner: Codex · Commit/PR: [PR #17](https://github.com/tanishraj/payload-cms-starter-kit/pull/17) (`816ca33f`), [PR #19](https://github.com/tanishraj/payload-cms-starter-kit/pull/19) (`0f6ed635`) · Verified on: 2026-10-07.
  Acceptance: custom text/select/checkbox fields authored in Payload, public submission
  stored under custom names with readable answers; no new collection columns,
  endpoint or email template. FORM-03's broader control catalogue remains open.

- [x] **FORM-03 — Initial control catalogue.** Text, multiline text, email, phone, URL,
  number, single select, multi-select, radio group, checkbox, checkbox group,
  switch, date, time, file upload and submit button.

  Work: Verified · Priority: First enhancement · Baseline: Partial.
  Current evidence: Fifteen registered question controls share typed native authoring, presentation, validation and original answer capture. The existing configurable submit button completes the initial catalogue. Private-file transport, original filenames, authorization, retry/recovery and artifact exclusion are verified in [PR #28](https://github.com/tanishraj/payload-cms-starter-kit/pull/28); layout/conditions, broad scopes, hosted provider/scanning acceptance and remaining forms milestones are separate.
  Evidence: [control registration](form-choice-controls.md#adding-another-control), [attachment contract](form-private-attachments.md), `src/lib/forms.ts`, `tests/int/form-files*`, `tests/e2e/generic-form.e2e.spec.ts`.
  Owner: Codex · Commit/PR: [PR #28](https://github.com/tanishraj/payload-cms-starter-kit/pull/28), `083082d6` · Verified on: 2026-10-14 · Acceptance: [current-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38587383727) on `1b4ba8a8` — 2,637 integration pass/one Docker-dependent skip, native form journeys and gated production build pass. Governance passed first attempt. Contact6 passed first attempt; Generic Form passed on retry after the initial public-page navigation exceeded 20 seconds before upload interaction. Broader VERIFY/AdminUX repeatability remains open; no assertion or warning was suppressed.

- [ ] **FORM-04 — Layout entries.** Headings, descriptions, separators and field groups;
  supported width, spacing, size, shape, variant and responsive presentation.

  Work: In progress · Priority: First enhancement · Baseline: Partial.
  Current increment: ordered native display entries/groups and sourced Form appearance are merged. Stable-ID conditional rules are next; see [appearance contract](form-appearance-controls.md). Full forms acceptance remains open.
  Owner: Codex · Commit/PR: [PR #29](https://github.com/tanishraj/payload-cms-starter-kit/pull/29), `2d18b58a`; [PR #30](https://github.com/tanishraj/payload-cms-starter-kit/pull/30), `9c6f148a` · Verified on: 2026-10-15 · Acceptance/test evidence: appearance local integration suite 2,693 passed/one Docker-dependent skip; both native Generic Form and Contact6 journeys passed locally; production build verified 73 traces and no private uploads. Focused appearance/layout/client/database tests (77 passed), Storybook build, type generation, TypeScript, targeted ESLint and project-context checks pass. Exact-head [Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38641309862) passed: 2,693 integration tests/one Docker skip; production artifact 73 traces/no private uploads. Hosted native Generic Form was marked flaky after a 420-second timeout and retry navigation timeout, then the workflow passed. Broader browser repeatability remains a VERIFY/ADMINUX follow-up.

- [ ] **FORM-05 — Identity and configuration.** Stable field ID separate from editable
  label/name/order; help text, placeholder, default, required state and type-specific
  length/range/file constraints. Choice options have stable IDs/values and labels.

  Work: In progress · Priority: First enhancement · Baseline: Partial.
  Current evidence: Native stable field/choice row identities, public help/defaults, current Text/Textarea constraints and original answer capture are implemented and locally verified. Remaining control-specific range/file constraints and the full change/export lifecycle stay open.
  Evidence: [configuration contract](form-field-configuration.md), [src/lib/forms.ts](../../src/lib/forms.ts), [configuration tests](../../tests/int/form-field-configuration.int.spec.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **FORM-06 — Safe keys.** Unique documented field-name rules, reserved-name checks,
  multilingual labels and useful inline errors. Relabelling never changes the key;
  renaming a published key warns about exports/integrations.

  Work: In progress · Priority: First enhancement · Baseline: Partial.
  Current evidence: Unique/reserved-key validation remains in place. Native editing now explains rename effects; snapshot and same-ID recovery tests preserve original names and valid answers. Full multilingual-label authoring and export/integration acceptance remain open.
  Evidence: [configuration contract](form-field-configuration.md), [src/collections/Forms.ts](../../src/collections/Forms.ts), [src/lib/forms.ts](../../src/lib/forms.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [x] **FORM-07 — Conditions.** Declarative show/require rules reference stable field
  IDs; client and server agree. No executable configuration.

  Work: Verified · Priority: First enhancement · Baseline: Gap.
  Evidence: [condition contract](form-conditional-rules.md); shared evaluator and authoring validation,
  active-only client/server answers, conditional requiredness, hidden file-token protection,
  published fingerprints and explicit recovery. Both canonical native journeys passed first attempt.
  Owner: Codex · Commit/PR: [PR #31](https://github.com/tanishraj/payload-cms-starter-kit/pull/31), merge `e18690eb` · Verified on: 2026-10-16 · Acceptance: [exact-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38861826953) on `311fec42`.

- [x] **FORM-08 — Extensibility.** One registered implementation adds a genuinely new
  control type with rendering, validation and answer formatting. Unknown/incomplete
  controls cannot publish as working. “Any control” means this extensible contract.

  Work: Verified · Priority: First enhancement · Baseline: Partial.
  Current evidence: URL/Number extend explicit scalar schemas, rendering, validation and captured formatting; native publication rejects unknown controls and invalid rules/defaults. Choice controls now extend array transport, formatting, original-label snapshots, notifications and recovery, with explicit [developer registration guidance](form-choice-controls.md#adding-another-control). [PR #26](https://github.com/tanishraj/payload-cms-starter-kit/pull/26) merged as `d00ca7e7` after [current-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38558813736) passed on `460017ea`. CI: 2,509 integration tests/one Docker-dependent skip; both governance and both native form journeys pass on the first attempt; fresh production build passes. See [URL/Number contract](form-url-number-controls.md).
  Owner: Codex · Commit/PR: [PR #26](https://github.com/tanishraj/payload-cms-starter-kit/pull/26), `d00ca7e7` · Verified on: 2026-10-14 · Acceptance/test evidence: explicit new scalar/array types, shared validation/rendering/history/notifications/recovery, native unknown-control rejection, registration guide and current-head Quality. The larger initial control catalogue remains open.

- [ ] **FORM-09 — Follow-on controls [Later].** Rating, range, date range, repeaters and
  multi-step flows. Password/payment capture needs dedicated domain integrations,
  not ordinary stored form answers.

  Work: Deferred · Priority: Later · Baseline: Gap.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Form intake, submissions and notifications

- [ ] **SUBMIT-01 — Versioned definitions.** Store ordered fields/groups, presentation
  and submission configuration against a published form revision. Form drafts
  must not alter live forms.

  Work: In progress · Priority: First enhancement · Baseline: Partial.
  Initial finding: Forms use native drafts. A published schema-revision/snapshot contract still needs assessment.
  Evidence: [src/collections/Forms.ts](../../src/collections/Forms.ts), [src/collections/FormSubmissions.ts](../../src/collections/FormSubmissions.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.
  Increment evidence: [dynamic-form history audit](dynamic-forms-implementation.md). Full feature acceptance remains incomplete.

- [ ] **SUBMIT-02 — Historical answers.** Submissions reference the exact published
  revision and retain field-label/key metadata or an immutable schema snapshot.
  Store typed answers by stable field ID; display/export with submitted labels/names.

  Work: In progress · Priority: First enhancement · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.
  Increment evidence: [dynamic-form history audit](dynamic-forms-implementation.md). Full feature acceptance remains incomplete.

- [ ] **SUBMIT-03 — Generic server validation.** Load an allowed published revision;
  validate types, required rules, conditions, options and request/value sizes;
  reject unknown fields. Hidden inactive answers are omitted; a required checkbox
  must be checked, not simply present.

  Work: Assess · Priority: First enhancement · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-04 — Revision changes.** Define a bounded accepted-revision policy for
  in-flight visitors; a retired schema returns a recoverable form-changed message
  and preserves safe values for review instead of reinterpreting them silently.

  Work: In progress · Priority: First enhancement · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

  Increment evidence: [generic published-revision recovery](form-revision-recovery.md); legacy revisionless clients and full lifecycle acceptance remain outside this increment.

- [ ] **SUBMIT-05 — Uploads.** Type/size validation, scoped access, private storage
  where appropriate, lifecycle cleanup and separately authorized attachment reads.

  Work: In progress · Priority: First enhancement · Baseline: Gap.
  Current evidence: Private metadata/storage, signature/type/size/count checks, transaction-protected capture/cleanup, original attachment history, notification submission links and access-enforced downloads are implemented. Focused tests and both native browser journeys pass; broader section scopes and hosted bucket/scheduling/email acceptance remain open.
  Evidence: [attachment contract](form-private-attachments.md), [operations](../operations/private-form-attachments.md), `tests/int/form-files*`, `tests/e2e/generic-form.e2e.spec.ts`.
  Owner: Codex · Commit/PR: `feat/form-private-attachments`, PR pending · Verified on: 2026-10-14 · Acceptance: bounded local release gates pending.

- [ ] **SUBMIT-06 — Spam and duplicate protection.** Server-side abuse controls/rate
  limits; duplicate-request handling and deduplicated notification delivery.

  Work: Assess · Priority: First enhancement · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-07 — Visitor feedback.** Labelled field errors and summary, focus first
  invalid field, pending state, success message and retry without unnecessary
  re-entry. Do not expose private data or uploads through public caches.

  Work: Assess · Priority: First enhancement · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-08 — Configurable notification mappings.** Approved recipients/handlers,
  optional field-selected reply-to and inbox title; team notifications and optional
  submitter confirmation. Submitted values never choose arbitrary recipients.

  Work: Deferred · Priority: Later · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.
  Increment evidence: [dynamic-form history audit](dynamic-forms-implementation.md). Full feature acceptance remains incomplete.

- [ ] **SUBMIT-09 — Reliable delivery.** Persist valid submissions before sending
  notifications; retry failed notifications without losing/duplicating answers.
  Display delivery state separately from successful submission storage.

  Work: Deferred · Priority: Later · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-10 — Operational inbox.** Separately scoped access, owner, internal notes,
  New/In progress/Resolved/Spam states, follow-up and readable generic answers.
  Submitted answers remain distinct from mutable staff workflow metadata.

  Work: Assess · Priority: First enhancement · Baseline: Partial.
  Initial finding: Submission operations and queue hooks exist; recheck generic answers and separate row-level scope.
  Evidence: [src/collections/FormSubmissions.ts](../../src/collections/FormSubmissions.ts), [src/hooks/syncFormSubmissionToWorkQueue.ts](../../src/hooks/syncFormSubmissionToWorkQueue.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-11 — Exports/integrations.** Authorized export and webhook mappings use
  the submitted revision's field names; renames/removals preserve historical meaning.

  Work: In progress · Priority: First enhancement · Baseline: Partial.
  Evidence: [historical CSV contract](form-revision-exports.md), native inbox filtered/search export,
  captured question identity/labels/names/typed values and explicit legacy rows. Full inbox
  permission plus access-enforced batch reads; private file tokens and staff notes excluded.
  Owner: Codex · Commit/PR: [feature PR](https://github.com/tanishraj/payload-cms-starter-kit/pulls?q=is%3Apr+head%3Afeat%2Fform-revision-exports) · Verified on: 2026-10-16 · Acceptance: 41 focused export tests and final full regression pass (2,745 tests / one existing Docker-dependent skip). Both native form download journeys and both governance journeys pass first attempt. Production/private-artifact and Storybook builds, generators/type/lint/context/audit pass. Exact-head Quality remains the merge gate. Configurable webhook mappings and broader acceptance remain open.

- [ ] **SUBMIT-12 — Test mode.** Clearly labelled form testing without real notifications
  or ordinary production submissions; Storybook never calls production services.

  Work: Deferred · Priority: Later · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Accounts, roles and scoped permissions

- [ ] **ACCESS-01 — Two role types.** Admin and Site Manager, with any number of
  accounts. Admin has full access and can create either role. Preserve at least
  one active Admin; no public privilege escalation.

  Work: Assess · Priority: Backlog · Baseline: Source present.
  Initial finding: Two role types and feature grants exist; verify bootstrap/last-Admin behavior in focused tests.
  Evidence: [src/access/adminFeatures.ts](../../src/access/adminFeatures.ts), [src/access/featureAccess.ts](../../src/access/featureAccess.ts), [src/collections/Users.ts](../../src/collections/Users.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACCESS-02 — Section grants.** Assign stable page-root IDs and descendants,
  plus separate collection/record scopes. Multiple grants combine additively;
  deny outside assigned scope. Do not authorize by URL prefix alone.

  Work: In progress · Priority: Selected · Baseline: Gap.
  Initial finding: Page-root/descendant constraints are implemented for this bounded increment; broader collection/record scopes remain open. See the section access runbook.
  Evidence: [src/collections/Pages.ts](../../src/collections/Pages.ts), [src/access/featureAccess.ts](../../src/access/featureAccess.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

  Current increment: [section scope contract](../operations/section-scoped-access.md). Native root grants, current hierarchy/resource ownership, separate inbox/file access and session revocation are implemented. Full feature acceptance stays open beyond this bounded rollout; final verification/merge evidence is in the work log.

- [ ] **ACCESS-03 — Manager autonomy.** Within scope, create pages, add/configure/
  reorder blocks, save, preview and publish directly. No designer-only structural
  privilege or mandatory Admin/Publisher approval.

  Work: In progress · Priority: Selected · Baseline: Partial.
  Initial finding: Feature-granted Page writes exist; check scoped autonomy and existing publication issue/approval policy.
  Evidence: [src/collections/Pages.ts](../../src/collections/Pages.ts), [src/access/featureAccess.ts](../../src/access/featureAccess.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

  Current increment: [section scope contract](../operations/section-scoped-access.md). Native root grants, current hierarchy/resource ownership, separate inbox/file access and session revocation are implemented. Full feature acceptance stays open beyond this bounded rollout; final verification/merge evidence is in the work log.

- [ ] **ACCESS-04 — Inheritance and moves.** New descendants inherit the authorized
  parent scope. New roots, scope reassignment and cross-scope moves are Admin-only
  by default. Slug changes cannot expand permissions.

  Work: In progress · Priority: Selected · Baseline: Gap.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

  Current increment: [section scope contract](../operations/section-scoped-access.md). Native root grants, current hierarchy/resource ownership, separate inbox/file access and session revocation are implemented. Full feature acceptance stays open beyond this bounded rollout; final verification/merge evidence is in the work log.

- [ ] **ACCESS-05 — Shared resources.** Users, grants, integrations, site settings and
  global header/footer default to Admin-only. Managers may select approved shared
  published resources without gaining permission to mutate their originals.
  User-confirmed direction (2026-10-14): Managers create/manage section-owned
  Forms and reusable content; Admins control resources shared across sections.
  Detailed sharing/move/migration policy and enforcement remain unverified.

  Work: In progress · Priority: Selected · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

  Current increment: [section scope contract](../operations/section-scoped-access.md). Native root grants, current hierarchy/resource ownership, separate inbox/file access and session revocation are implemented. Full feature acceptance stays open beyond this bounded rollout; final verification/merge evidence is in the work log.

- [ ] **ACCESS-06 — Separate resource permissions.** Scoped media upload/use, protected
  shared-asset replacement/deletion, collection publication and form-inbox access
  independent from permission to place a Form block.

  Work: In progress · Priority: Selected · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

  Current increment: [section scope contract](../operations/section-scoped-access.md). Native root grants, current hierarchy/resource ownership, separate inbox/file access and session revocation are implemented. Full feature acceptance stays open beyond this bounded rollout; final verification/merge evidence is in the work log.

- [ ] **ACCESS-07 — Every entry point.** Enforce scope for Payload Admin, REST, enabled
  GraphQL, user-acting Local API, preview/history/restore, upload, jobs and any future
  import route. Hidden navigation is not access control.

  Work: In progress · Priority: Selected · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

  Current increment: [section scope contract](../operations/section-scoped-access.md). Native root grants, current hierarchy/resource ownership, separate inbox/file access and session revocation are implemented. Full feature acceptance stays open beyond this bounded rollout; final verification/merge evidence is in the work log.

- [ ] **ACCESS-08 — Grant changes.** Managers cannot self-assign scope. Revocation
  applies to subsequent saves, publication, restore and scheduled execution.

  Work: In progress · Priority: Selected · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

  Current increment: [section scope contract](../operations/section-scoped-access.md). Native root grants, current hierarchy/resource ownership, separate inbox/file access and session revocation are implemented. Full feature acceptance stays open beyond this bounded rollout; final verification/merge evidence is in the work log.

- [ ] **ACCESS-09 — Permission diagnostics [Recommended].** Effective-access summary
  for Admin; manageable sections and scoped tasks for Managers. Relationship pickers,
  counts and impact summaries must not expose private out-of-scope records.

  Work: In progress · Priority: Selected · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

  Current increment: [section scope contract](../operations/section-scoped-access.md). Native root grants, current hierarchy/resource ownership, separate inbox/file access and session revocation are implemented. Full feature acceptance stays open beyond this bounded rollout; final verification/merge evidence is in the work log.

### Drafts, autosave, conflicts, publication and history


- [ ] **PUBLISH-01 — Native lifecycle.** Use Payload drafts, autosave, explicit Save
  Draft, preview, publish and unpublish; configure/verify them instead of building
  a second editor persistence or version-history system.

  Work: Assess · Priority: Backlog · Baseline: Partial.
  Initial finding: Native drafts exist. Pages currently declare drafts:true without explicit autosave settings; assess autosave/locking separately.
  Evidence: [src/collections/Pages.ts](../../src/collections/Pages.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-02 — Honest state.** Distinguish unsaved/saving/saved/failed drafts from
  the published revision. Failed saves retain current input and offer retry;
  session expiry and permission revocation must not silently discard work.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-03 — Conflict safety.** Document locking plus expected-revision checks
  on writes; stale updates cannot silently overwrite newer content. Explain conflicts
  and provide permitted compare/reload/copy recovery through Payload integration.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-04 — Recovery boundary.** Retain the no-silent-data-loss objective and
  unsaved-navigation warnings. Durable browser/offline recovery is a recommendation
  to evaluate after native autosave; do not claim it exists by using Payload. No
  standalone canvas history engine, patch protocol or offline editor is required.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-05 — Self-check.** Review intended changes, blocking issues, warnings
  and publish scope before publishing the exact current saved revision. This is
  the authorized editor's self-check, not another person's approval gate.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Initial finding: Compare existing governance gates with direct publication; content-quality checks and submitted-review moderation are distinct from mandatory page approval.
  Evidence: [.agents/skills/project-context/references/payload-model.md](../../.agents/skills/project-context/references/payload-model.md).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-06 — Authoritative validation.** Required fields, schema/structure,
  unknown blocks, invalid actions and dangling required references block publication.
  SEO gaps, image weight, headings, contrast and embed counts produce targeted
  guidance; severity policies are explicit and tested server-side across APIs.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-07 — Coordinated commit.** Persist content/layout/SEO/references and
  native version identity consistently within Payload's transaction context.
  Do not add a competing version table or bypass access through custom endpoints.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-08 — Delivery after commit.** Cache invalidation, external search and
  notifications use retryable jobs/outbox where needed. Require idempotency,
  deduplication, leases, ordering, backoff and visible dead-letter failures.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-09 — Accurate live status.** Separate database publication from pending/
  failed downstream delivery; retry delivery without asking editors to republish.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-10 — History and diff.** Author, timestamp, revision, change summary,
  added/removed/modified blocks and access-controlled historical preview. Set an
  explicit published-version/autosave retention policy.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-11 — Restore as draft.** Preserve history, record the restored source,
  review differences and create a new draft. Explicit publish follows; restore
  does not silently publish or rewind global/shared dependencies.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-12 — Unpublish.** Warn about affected links/references, remove public
  delivery/search entries, invalidate caches and retain an audit record. Do not
  suppress native history merely to satisfy an obsolete plan rule.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PUBLISH-13 — Scheduling.** Publication/expiry jobs with explicit site timezone,
  status, cancellation and authorization recheck; test missed/retried jobs and
  invalidation at start/end boundaries.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Preview and editing quality without a custom editor

- [ ] **PREVIEW-01 — Payload Live Preview.** Preview configured content using the real
  block presentation; client-side updates where supported and refresh-on-save for
  resolved server data. Verify the behavior instead of assuming all blocks update
  identically. Retain preview-before-publication without a separate Forma canvas.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PREVIEW-02 — Responsive proof.** Desktop/tablet/mobile previews plus intermediate
  widths in supported preview/browser tooling; verify actual responsive layout.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PREVIEW-03 — Protection.** Authenticated scoped draft/historical reads; any
  shareable preview token must be scoped, expiring and deliberately authorized.
  Preview content is private/no-store/noindex and never leaks through public APIs.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PREVIEW-04 — Rendering boundaries.** Keep site theme separate from Payload
  chrome; no secrets/server-only modules in preview browser bundles. Validate
  integrations and frame policy under production security headers.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PREVIEW-05 — Shared changes.** Preview sample affected pages for theme,
  navigation, reusable-content and form updates before their own publication.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PREVIEW-06 — Usability [Recommended gate].** Test nontechnical editors creating
  a page, adding/reordering a block, editing a responsive setting, using a dynamic
  form, recovering from save failure, publishing and restoring through Payload.
  Include keyboard-only use; measure outcomes rather than assuming native UI solves all UX.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Media, documents and image delivery

- [ ] **MEDIA-01 — Managed assets.** Approved JPEG/PNG/WebP/AVIF/SVG images and PDF/
  DOC/DOCX/XLS/XLSX documents, subject to a validated per-type upload policy.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **MEDIA-02 — Metadata.** Title, alt/decorative intent, caption, filename, type,
  dimensions, size, category/folder, focal point/crop and accessibility metadata.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **MEDIA-03 — Library workflow.** Search, filters, folders/collections, authorized
  bulk operations, focal-point crop preview and bulk alt-text maintenance.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **MEDIA-04 — Safe replacement.** Current/historical where-used tracking, replacement
  previews and reference checks; protect assets needed for historical restoration.
  Soft deletion/retention with deliberate permanent-purge policy.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **MEDIA-05 — Document lifecycle.** Stable landing URLs with a current download,
  historical files, category/session/year, owner/effective/review dates and status.
  Replacing a prospectus should not break existing links.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **MEDIA-06 — Object storage.** Metadata in Payload, durable files in the chosen
  storage provider; distinguish public site assets from private form attachments.
  Reconcile stored metadata with actual objects.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **MEDIA-07 — Derivatives.** Background processing, use-case presets for logo/
  avatar/card/content/OG, useful widths/formats, retries and visible failed jobs;
  preserve originals and avoid generating every combination needlessly.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **MEDIA-08 — Responsive delivery.** `srcset`/`sizes` reflect rendered block width;
  focal-point positioning, dimensions, placeholders, priority for appropriate
  above-fold media and lazy loading elsewhere. Avoid double-transforming derivatives.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **MEDIA-09 — Asset integrity.** Content hashes/deduplication as an engineering
  approach, without conflating separate access policies or deleting historical assets.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### SEO, URLs, redirects and structured metadata

- [ ] **SEO-01 — Page/record fields.** Title, description, canonical, OG title/
  description/image, social-card metadata and index/follow directives, with
  page → content-type → site fallbacks and dynamic-route support.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEO-02 — Structured data.** Appropriate Organization, WebSite, Article/
  NewsArticle, Event, Person, Course and BreadcrumbList output from valid content;
  do not invent institutional claims merely to populate metadata.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEO-03 — Sitemap/robots.** Include all eligible published records with pagination
  and an index when needed; exclude draft/noindex output; refresh on lifecycle
  changes and keep staging/private areas out of indexing.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEO-04 — Social images.** Uploaded image overrides or generated branded/theme-aware
  image using title and configured fonts, cached and invalidated appropriately.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEO-05 — Redirect manager.** Manual redirects, 301/302/307/308, enabled state,
  duplicate-source checks, loop/chain detection, destination validation and deliberate
  preserve/strip/exact-match query handling.

  Work: Assess · Priority: Backlog · Baseline: Source present.
  Initial finding: Redirect collection, helpers and tests exist; assess every requested mode and validation rule.
  Evidence: [src/collections/Redirects.ts](../../src/collections/Redirects.ts), [src/lib/redirects.ts](../../src/lib/redirects.ts), [tests/int/redirects.int.spec.ts](../../tests/int/redirects.int.spec.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEO-06 — Slug/move redirects.** Offer old-to-new redirects on published page,
  record or parent-path changes; include descendants and audit deliberate declines.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEO-07 — Redirect CSV.** Retain outlined bulk redirect administration with dry
  run/diff, validation and permission checks. This is distinct from deferred
  website-content import or a SNMIH migration project.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Search and deep linking

- [ ] **SEARCH-01 — Global search.** Search published pages and enabled content/document
  collections, including declared meaningful block text, descriptions and categories.
  Exclude configuration noise, secrets, drafts and unauthorized records.

  Work: Assess · Priority: Backlog · Baseline: Source present.
  Initial finding: Search helpers and endpoint exist; check target coverage and public filtering.
  Evidence: [src/lib/search.ts](../../src/lib/search.ts), [src/app/api/search/route.ts](../../src/app/api/search/route.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEARCH-02 — Search service.** Provider-independent interface, appropriate
  ranking/field weighting, bounded queries and measurable performance. The old
  PostgreSQL FTS implementation is a database-dependent proposal, not yet the
  selected provider for the starter-based product.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEARCH-03 — Index lifecycle.** Publish/update/unpublish/delete integration,
  resumable rebuilds, rich-text-to-text extraction and reliable external delivery
  if the index lives outside the content transaction.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEARCH-04 — Public search UX.** Grouped result types/counts, escaped highlighted
  matches, useful empty states, keyboard/live-region support, a no-JavaScript GET
  fallback and noindex search results.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEARCH-05 — Precise destinations.** Results can carry route, query state and
  anchor. Activate the right category/tab/pagination before scrolling/focusing;
  respect sticky headers and reduced motion. Fall back safely if the deep link
  cannot resolve. Keep meaningful anchors stable across routine edits.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Site-wide experiences, consent and integrations

- [ ] **SITE-01 — Global experiences.** Back to Top, announcement bar, campaign/
  celebration modal, emergency notice and cookie/consent interface.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SITE-02 — Shared configuration.** Enabled state, content/actions, supported
  styling/display mode, start/end times, all/include/exclude page targeting or
  collection targeting, and frequency rules where appropriate.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SITE-03 — Scheduling/frequency.** Always, per-session, per-user or every-N-days
  options where justified; expiry removes delivered content, not merely CSS
  visibility. Emergency notices may bypass ordinary frequency limits.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SITE-04 — Announcements.** Title, description, type, priority, time window,
  action and publication state; reusable in bars, notices pages and featured blocks.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SITE-05 — Rotation accessibility.** Configurable interval/transition, pause on
  hover/focus, manual controls, reduced motion and server-readable content.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SITE-06 — Modal accessibility.** Focus trapping/restoration, accessible naming,
  Escape and usable dismiss controls where dismissal is permitted.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SITE-07 — Consent.** Durable consent preferences control optional analytics/
  integrations; a cookie banner is not simply a frequency-limited announcement.
  Privacy/legal page content remains the site owner's responsibility.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SITE-08 — Central integrations.** Analytics, tag manager, maps and video through
  approved settings/providers; controlled loading and performance budgets. Restricted
  script requests require a dedicated Admin/security policy, not raw block injection.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SITE-09 — Lightweight embeds.** Facade/interaction loading for maps/video where
  appropriate, compatible with consent and security policy.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SITE-10 — System pages [Recommended].** CMS-configured 404, maintenance and
  coming-soon states with code-owned failure fallbacks, appropriate status codes
  and preserved authenticated admin access. Whole-site maintenance is Admin-only.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Content lifecycle, operations and portability

- [ ] **OPS-01 — Ownership.** Content owner, review date, reminders and explicit
  archive/unpublish policy. An overdue review does not silently unpublish content.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **OPS-02 — Recoverable lifecycle.** Scoped unpublish/trash/restore for Managers;
  Admin-only permanent deletion. Show references/children first, block unsafe
  parent deletion and avoid silent cascades. Restore checks current scope and slug.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **OPS-03 — Needs-attention queue [Recommended].** Failed publication/delivery,
  broken internal references, missing assets, overdue content and unanswered forms;
  reason, owner and a direct correction link. Deduplicate and resolve from source
  state. Unavailable counts must not appear as zero; informational tasks do not
  impose mandatory approval gates.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **OPS-04 — Internal-reference checks [Recommended].** Permission-safe impact lists
  and validation of links/anchors. External website crawling remains later work.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **OPS-05 — Portable export.** Versioned structured site/content export with media
  manifest, relationship identities and documented format. Protect secrets/private
  submissions and apply explicit export permissions.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **OPS-06 — Import boundary [Later].** General content CSV/WordPress/source imports,
  mapping UI and migration connectors remain deferred until a real need. Safe
  database/block schema migrations and redirect CSV are separate retained features.

  Work: Deferred · Priority: Later · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **OPS-07 — Guides [Recommended].** Page-versus-collection/global/reusable-content
  modelling guide; contextual help, onboarding and operator handoff documentation.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Authentication, security and audit

- [ ] **SEC-01 — Account security.** Secure bootstrap/login/session/password-reset
  behavior and protection against privilege escalation across all APIs.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEC-02 — TOTP MFA.** Enrollment with QR, confirmation before enablement,
  encrypted secrets, hashed single-use recovery codes, regeneration and audited
  recovery/reset. Enforcement policy uses Admin/Site Manager roles only.

  Work: Assess · Priority: Backlog · Baseline: Source present.
  Initial finding: MFA implementation and focused tests exist; audit/reuse before implementing changes.
  Evidence: [src/lib/twoFactor.ts](../../src/lib/twoFactor.ts), [src/lib/twoFactorCrypto.ts](../../src/lib/twoFactorCrypto.ts), [tests/int/two-factor-auth.int.spec.ts](../../tests/int/two-factor-auth.int.spec.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEC-03 — Complete MFA enforcement.** Rate limits, replay/session protection,
  bounded clock drift and recovery flows; evaluate maintained integrations and
  existing starter implementation before creating custom authentication.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEC-04 — Input/uploads.** Server-side validation, actual MIME/type checks,
  allowed types and sizes, safe filenames/paths, SVG sanitization or rejection,
  safe rich-text output and appropriately isolated upload delivery.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEC-05 — Abuse controls.** Auth, upload, search and form-intake rate limits
  suitable for the selected single/multi-instance hosting arrangement.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEC-06 — Headers/CSP.** HSTS, content-type, referrer, permissions and frame
  protection; tested script policy for public pages, Payload admin and Live Preview.
  Reconcile nonce/dynamic-rendering requirements with public caching explicitly.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEC-07 — Audit trail.** Publish/unpublish/restore/delete, roles/grants, MFA,
  settings, redirects and authentication events; actor, time, entity and safe
  before/after summary with appropriate request context. Append-only controls,
  filtered admin views/export and documented retention; never log credentials.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEC-08 — Secrets/environment.** Every new variable documented in its owning
  `.env.example`, including purpose and production requirement; real credentials
  stay ignored or in deployment secrets and out of client bundles/build artifacts.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SEC-09 — Dependency policy [Recommended].** Security reporting process,
  dependency/license tracking, controlled updates, audits and upgrade verification.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Accessibility, localization readiness and public quality

- [ ] **QUALITY-01 — Accessibility target.** WCAG 2.2 AA for public output and retained
  admin customizations, tested manually and automatically.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **QUALITY-02 — Interaction basics.** Semantic headings/landmarks, skip links,
  labels, meaningful link/button semantics, visible/unobscured focus, keyboard
  navigation and non-drag alternatives; no color/hover/icon-only communication.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **QUALITY-03 — Content guardrails.** Alt/decorative intent, heading hierarchy,
  contrast, image dimensions, accessible carousels/forms/navigation and targeted
  remediation guidance. Automated checks alone do not prove compliance.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **QUALITY-04 — Responsive/reduced motion.** Narrow-screen and intermediate-width
  layouts, 200% zoom/reflow, long content, text direction and reduced-motion behavior.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **QUALITY-05 — Locale foundations.** Locale-aware output/query/cache identities,
  translation relationships, localized paths and fallbacks, approved localized
  fields and logical CSS/RTL fixtures. Initial content remains English; enabled
  languages and URL prefixes require a site-specific decision.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **QUALITY-06 — Print [Recommended].** Useful print styles for content-heavy
  pages/documents, with navigation/overlays handled appropriately.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Performance, caching and failure isolation

- [ ] **PERF-01 — Server-first output.** Server rendering/data resolution with small
  client boundaries for real interaction; static block presentation should not
  require client JavaScript merely because another block is interactive.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PERF-02 — Data efficiency.** Request-level deduplication/batching, concurrent
  independent resolution, pagination, appropriate indexes and connection limits.
  Measure actual query counts rather than equating concurrency with fewer queries.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PERF-03 — Targeted caching.** Cache public pages/shared data/assets and invalidate
  affected documents, collections, paths and dependencies on lifecycle changes.
  Avoid routine full-site purges; draft/private data never shares public caches.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PERF-04 — Dependency coverage.** Record references on save/publish and account
  for dynamic queries/newly matching records; shared changes and scheduled start/
  end times invalidate all affected output, including external CDN delivery.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PERF-05 — Isolated failures.** Resolver/server-render failures and client
  rendering failures have explicit separate fallbacks/logging. One failing block
  should not unnecessarily remove the rest of a page.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PERF-06 — Page health.** Payload-accessible guidance for oversized media,
  missing dimensions, excessive blocks/embeds/fonts, estimated client weight and
  above-fold resources. Configurable advisory thresholds with links to the issue.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PERF-07 — Measured budgets.** JavaScript, media, fonts, scripts, queries, render
  performance and LCP/INP/CLS; CI gates on reproducible representative fixtures,
  plus real-user measurements where appropriate.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **PERF-08 — Streaming.** Use supported streaming/loading boundaries for dynamic
  content without sacrificing useful server-rendered content or error handling.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Storybook and developer contracts

- [ ] **DEV-01 — Real components.** Stories import the production presentation used
  by Payload preview/public pages; no parallel story-only component implementations.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DEV-02 — Required stories.** Docs, Default and Playground for reusable
  components, blocks and form controls; meaningful variants and empty/loading/
  disabled/error/long-content states.

  Work: Assess · Priority: Backlog · Baseline: Partial.
  Increment: All 67 current blocks now have one canonical Storybook entry, Docs and editable Default samples using production components/shared fixtures. Supported padding and long-copy states are included where relevant. Full component/control edge-state acceptance remains open.
  Evidence: [src/stories/revamp/Button.stories.tsx](../../src/stories/revamp/Button.stories.tsx), [docs/operations/storybook.md](../../docs/operations/storybook.md).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DEV-03 — Working controls.** Typed `args`/`argTypes` for supported content,
  behavior, appearance, shape, size, layout and responsive props. Stateful harnesses
  for controlled inputs, callback spies and labelled complex fixtures.

  Work: Assess · Priority: Backlog · Baseline: Partial.
  Increment: Existing block stories use typed production props and labelled sample controls; Generic Form retains its richer schema/interaction playground. Complete control/edge-state coverage across the eventual catalogue remains open.
  Evidence: [src/stories/revamp/Button.stories.tsx](../../src/stories/revamp/Button.stories.tsx).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DEV-04 — Shared decorators.** Theme, light/dark and viewport tooling; resolver
  fixtures simulate data/failure states without production CMS/services or secrets.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DEV-05 — Mapping contracts.** Document which props are persisted Payload fields,
  derived resolver data or developer-only callbacks. CMS controls expose supported,
  permitted choices; Storybook is not an authorization bypass.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DEV-06 — Registration consistency.** Block/control metadata, defaults, validation,
  constraints, searchable text and supported capabilities stay aligned with Payload
  schemas, rendering and stories. Reuse typed definitions where useful.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DEV-07 — No unnecessary framework [Decision needed].** A full field-definition
  DSL/code generator was an earlier implementation proposal. Retain consistency
  goals but assess the starter's explicit registrations before mandating a new
  abstraction. Custom inspector generation is excluded.

  Work: Assess · Priority: Decision · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DEV-08 — Import boundaries.** Browser-safe presentations/metadata separated
  from server resolvers and Payload configuration. Server-rendered wrappers are
  allowed; no blanket ban on all async files or ordinary application links.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DEV-09 — Scaffolding [Recommended].** Small generator for block/control schema,
  presentation, stories, fixtures, registration and relevant tests; golden-path
  guides for adding a block, collection, control and debugging preview.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **DEV-10 — Tooling.** Typechecking, lint/format, exact compatible version policy,
  deterministic fixtures, architecture checks, CI and short ADRs for material choices.
  Package version/changelog tooling becomes relevant when multiple sites consume releases.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Schema evolution, testing and release evidence

- [ ] **VERIFY-01 — Versioned schemas.** Block/control schema version distinct from
  document revision; stable IDs and lossless Payload data mapping.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **VERIFY-02 — Safe migrations.** Explicit sequential/idempotent upgrades,
  resumable backfills and diagnostics; expand/contract database evolution.
  Preserve fields/history until older content is safely supported.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **VERIFY-03 — Deliberate proof.** Exercise a real block schema change against
  stored drafts, published data and historical restore before relying on migrations.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **VERIFY-04 — Tests by boundary.** Unit tests for validation/actions/adapters/
  inheritance; component/Storybook interaction and accessibility tests; real-database
  integration; end-to-end page/form/publication/search/redirect/MFA workflows.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **VERIFY-05 — Access regression tests.** Admin assignment and scoped Manager
  create/edit/publish, forged scope/parent changes, revoked grants, preview/history/
  submission/file access and direct API denials.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **VERIFY-06 — Save/publish resilience.** Two-tab conflicts, pending/failed saves,
  draft isolation, shared publication, job retries/duplicates/order, restore-as-draft
  and server/resolver failures.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **VERIFY-07 — Dynamic-form proof.** Custom field such as `preferred_department`
  renders, validates, stores, displays and exports without backend changes. Test
  reorder/relabel/rename/remove/type/option changes and historical submissions.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **VERIFY-08 — Visual regression [Recommended].** Representative theme/viewport/
  state screenshots in Storybook; avoid indiscriminate combinatorial story expansion.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **VERIFY-09 — Capability demonstration.** Original institutional homepage,
  department listing/detail, news/events, document library, gallery and dynamic
  enquiry form created through Payload. Managers publish their own sections and
  fail cross-scope requests. No SNMIH visual-fidelity criterion.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **VERIFY-10 — Generic reuse check [Later].** A small corporate example reuses the
  same core without institutional terms becoming platform dependencies.

  Work: Deferred · Priority: Later · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **VERIFY-11 — Launch acceptance.** Staging, actual usability/accessibility results,
  backup restore and deployment rollback; no unresolved data-loss, unauthorized
  publication or draft-leak defects. Documentation is not completion evidence.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Deployment, email, observability and disaster recovery

- [ ] **RUN-01 — Local setup.** Reproducible app/database/media/email development
  environment with documented commands and production-relevant behavior. Preserve
  existing ignored environment files during setup.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **RUN-02 — Runtime preflight [Recommended].** Validate database, canonical origin,
  secrets, storage, email and worker/scheduler configuration; Admin-only setup
  diagnostics and explicit service test actions, not only variable-presence checks.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **RUN-03 — Transactional email.** Provider/SMTP boundary for password reset,
  security notices, form notifications and publish/delivery failures; templates,
  retry state and safe test environments.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **RUN-04 — Background execution.** Deployed workers/scheduler for publication,
  expiry, delivery, derivatives, reminders and cleanup. Evaluate existing Payload
  Jobs before adding another queue service; preserve transaction/retry guarantees.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **RUN-05 — Production delivery.** Reproducible container/build, durable storage,
  health-gated rollout, protected deployment secrets, safe migrations and tested
  rollback. Cloudflare/VPS/Coolify was Forma's proposed topology, not a newly
  confirmed replacement for the starter's supported hosting contract.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **RUN-06 — Staging.** Production-like configuration, access protection/noindex,
  sanitized data, safe email targets and verification before promotion.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **RUN-07 — Observability.** Structured correlated logs, error tracking/releases,
  traces for render/resolver/publish paths, private operational diagnostics and
  appropriately minimal health endpoints for database/storage/jobs/migrations.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **RUN-08 — Alerts.** Public/admin uptime, failed publishes/delivery/uploads,
  dead-letter jobs, latency, database connectivity, disk/storage use and deployment
  health. Do not expose operational secrets in public checks.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **RUN-09 — Backup.** Database and durable media protection independent of native
  version history; off-host backups, retention, object versioning and documented
  recovery objectives. Point-in-time recovery where supported by the chosen database.

  Work: Assess · Priority: Backlog · Baseline: Source present.
  Initial finding: MongoDB backup tooling and tests exist; verify the retained database/media/retention objectives rather than porting pg_dump instructions.
  Evidence: [scripts/backup-prod-db.ts](../../scripts/backup-prod-db.ts), [docs/operations/database-backups.md](../../docs/operations/database-backups.md), [tests/int/prod-db-backup.int.spec.ts](../../tests/int/prod-db-backup.int.spec.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **RUN-10 — Restore drill.** Restore into an isolated environment, verify records,
  assets, authentication and rendered output; document recovery time/data-loss
  objectives and repeat the drill. Backups on the same failed server are insufficient.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **RUN-11 — Operational documentation.** Deployment, rollback, disaster recovery,
  secret rotation, upgrade policy and developer/operator handoff.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.


## Added onboarding and admin UX acceptance

The user requested easy developer and editor onboarding on 6 October 2026.
These **36 additional groups** extend the 206 original groups above, for **242
feature groups**, plus the 10 DF proof tasks (252 task checkboxes). None are
marked complete. [Admin onboarding and everyday UX plan](admin-onboarding-ux.md)
defines role journeys, build/launch readiness, reuse points and acceptance studies.
Overlapping groups share implementation and evidence with PAGE, ACCESS, FORM,
PUBLISH, DEV and VERIFY; do not create duplicate subsystems.

Dynamic forms remains the first selected enhancement. Apply relevant UX criteria
within each feature delivery; complete the first-draft onboarding path before client
handoff. Manager section guidance depends on verified ACCESS work.

### Onboarding and handoff

- [ ] **ONBOARD-01 — Developer quickstart.** One discoverable, tested path from clone to working admin and first preview, with supported runtime/package manager, environment template, MongoDB prerequisites and concrete troubleshooting. Never overwrite a local environment file.

  Work: In progress · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/developer-quickstart` · Verified on: 2026-10-16 · Increment: [developer quickstart](../operations/developer-quickstart.md), read-only CLI and isolated clone-fixture tests. Local verification: 2,797 integration tests pass (one existing Docker-dependent skip), including real CLI precedence/exit-code/secret-redaction and read-only Mongo/filesystem checks; TypeScript/lint/audit/context pass. [PR #35](https://github.com/tanishraj/payload-cms-starter-kit/pull/35) merged after successful [Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38912799551); Review fixture cleanup needed one retry. Authenticated first-preview and broader launch/usability acceptance remain explicit manual work.

- [ ] **ONBOARD-02 — Safe prerequisite diagnostics.** Non-mutating runtime/database/storage/preview checks report readiness, affected task and actionable fix without displaying secrets. Assess existing validation before adding tooling.

  Work: In progress · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/developer-quickstart` · Verified on: 2026-10-16 · Increment: [developer quickstart](../operations/developer-quickstart.md), read-only CLI and isolated clone-fixture tests. Local verification: 2,797 integration tests pass (one existing Docker-dependent skip), including real CLI precedence/exit-code/secret-redaction and read-only Mongo/filesystem checks; TypeScript/lint/audit/context pass. [PR #35](https://github.com/tanishraj/payload-cms-starter-kit/pull/35) merged after successful [Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38912799551); Review fixture cleanup needed one retry. Authenticated first-preview and broader launch/usability acceptance remain explicit manual work.

- [ ] **ONBOARD-03 — Build versus launch readiness.** Separate authoring prerequisites from production launch checks. Optional email/analytics/domain work does not block local drafts; existing production constraints remain enforced.

  Work: In progress · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/developer-quickstart` · Verified on: 2026-10-16 · Increment: [developer quickstart](../operations/developer-quickstart.md), read-only CLI and isolated clone-fixture tests. Local verification: 2,797 integration tests pass (one existing Docker-dependent skip), including real CLI precedence/exit-code/secret-redaction and read-only Mongo/filesystem checks; TypeScript/lint/audit/context pass. [PR #35](https://github.com/tanishraj/payload-cms-starter-kit/pull/35) merged after successful [Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38912799551); Review fixture cleanup needed one retry. Authenticated first-preview and broader launch/usability acceptance remain explicit manual work.

- [ ] **ONBOARD-04 — First Admin orientation.** Explain first-account ownership and show a short next-action area leading to a real first draft. No automatic publication or lengthy mandatory walkthrough.

  Work: In progress · Priority: Selected · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/admin-onboarding` · Verified on: 2026-10-16 · Increment: [optional dashboard guide](../operations/admin-getting-started.md), native preference/focus/scoped-task evidence in the work log. Broader acceptance stays open.

- [x] **ONBOARD-05 — Minimal site setup.** Use valid existing defaults; let an Admin set identity, theme and timezone with concise explanations. Advanced production settings remain separate and current values are preserved.

  Work: Verified native implementation · Priority: Cross-cutting / Handoff · Baseline: Existing native globals.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/site-setup-onboarding` · Verified on: 2026-10-16 · Increment: [native site setup guide](../operations/site-setup-guide.md), Dashboard shortcut, permission-aware native guidance and shared personal visibility. Sixty focused checks and a real native draft/isolation journey pass; scoped light/dark accessibility has no violations or incomplete checks. Full local regression passes (2,842 tests; one existing Docker skip), all five native governance/onboarding journeys pass without retries, and production build/private-artifact checks pass. Exact-head CI and merge evidence live in the feature PR; the broader novice-user study remains open in the UX plan.

- [ ] **ONBOARD-06 — First-page journey.** Guide title → blank page or recipe → native block edit → save draft → authenticated preview → explicit publish when intended. Preserve native drawer and existing edit behavior.

  Work: In progress · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/first-draft-onboarding` · Verified on: 2026-10-16 · Increment: [native Page guide](../operations/page-editing-guide.md), sourced shared presentation, current form-state guidance and independent preferences. [PR #36](https://github.com/tanishraj/payload-cms-starter-kit/pull/36) merged after green Quality (2,825 integration tests; one existing skip; three browser cases needed retries, documented on the PR). Novice-user study and broader first-page acceptance stay open.

- [ ] **ONBOARD-07 — Understandable recipes.** Starting points explain intended use and included sections with accurate previews where available. Keep blank creation and prevent misleading or unavailable block promises.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-08 — Safe example content.** Optional examples are clearly marked drafts, explicitly requested, idempotent and removable without deleting real records. Never overwrite existing content or silently seed production.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-09 — Progress based on facts.** Derive readiness/completion from current server facts where measurable. Personal skip/dismiss preferences never imply healthy infrastructure, correct grants or published content.

  Work: In progress · Priority: Selected · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/admin-onboarding` · Verified on: 2026-10-16 · Increment: [optional dashboard guide](../operations/admin-getting-started.md), native preference/focus/scoped-task evidence in the work log. Broader acceptance stays open.

- [x] **ONBOARD-10 — Skip, resume and replay.** Users can dismiss optional guidance, resume relevant incomplete tasks and reopen help. Returning users do not repeat onboarding; deleted/moved/restricted records resolve safely.

  Work: Verified · Priority: Selected · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/admin-onboarding` · Verified on: 2026-10-16 · Increment: [optional dashboard guide](../operations/admin-getting-started.md), native preference/focus/scoped-task evidence in the work log. Verified for the supported dashboard guide: account-owned hide/reopen survives reload, current scoped drafts supply resume links, missing/revoked assignments override hidden guidance, and native destinations recheck access. A general help index remains ONBOARD-17.

- [ ] **ONBOARD-11 — Role-aware starting point.** Admin sees useful full-access actions; Manager sees allowed features and eventual sections. Developer setup is not a third role and onboarding never grants access.

  Work: In progress · Priority: Selected · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/admin-onboarding` · Verified on: 2026-10-16 · Increment: [optional dashboard guide](../operations/admin-getting-started.md), native preference/focus/scoped-task evidence in the work log. Broader acceptance stays open.

- [ ] **ONBOARD-12 — Manager access explanation.** Summarize actual create/edit/publish permissions and assigned scope in plain language. Direct links and server operations revalidate scope; read-only dependencies are labelled.

  Work: In progress · Priority: Selected · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/admin-onboarding` · Verified on: 2026-10-16 · Increment: [optional dashboard guide](../operations/admin-getting-started.md), native preference/focus/scoped-task evidence in the work log. Broader acceptance stays open.

- [ ] **ONBOARD-13 — No-assignment recovery.** An active Manager with no grants sees an explanation, configured Admin contact route and retry action. No dead create links, hidden-record disclosure or automatic escalation.

  Work: In progress · Priority: Selected · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/admin-onboarding` · Verified on: 2026-10-16 · Increment: [optional dashboard guide](../operations/admin-getting-started.md), native preference/focus/scoped-task evidence in the work log. Broader acceptance stays open.

- [ ] **ONBOARD-14 — Team setup guidance.** Admins can create either role and assign features/scopes with clear dependencies and least-access defaults for Managers. Preview effective access without logging in as another user.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-15 — Account activation and recovery.** Assess existing authentication first. If invitations are added, provide expiring single-use activation, deliberate resend, understandable expired-link states and a safe no-email setup path; never expose credentials.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-16 — Form first-use journey.** Create reusable form → add control → custom label/name → validation/options → preview/test → attach to page → deliberate publication → readable generic inbox. Reuse the shared schema and renderer.

  Work: Assess · Priority: First enhancement · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-17 — Contextual learning.** Short help beside unfamiliar tasks explains Page, Block, Collection and shared ownership. Examples and a discoverable task-based help index are dismissible/reopenable and role-safe.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-18 — Launch and handoff checklist.** Admin/operator readiness covers public identity/homepage/navigation, canonical URL, durable media, applicable legal/SEO/email, backup/restore and deployment. Explain missing items and dependent functions.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-19 — Onboarding usability evidence.** Observe representative novice editors and unfamiliar developers; record independent task completion, time, assistance, errors and accidental publication. Planning targets in the UX plan require actual pilot evidence.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-20 — Minimal onboarding data.** Keep readiness state separate from user preferences, define reset/version behavior and minimize stored metadata. Observation or telemetry must not capture content, submission answers or secrets.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

### Everyday administration

- [ ] **ADMINUX-01 — Task-oriented navigation.** Use consistent content/settings terminology and familiar Payload routes. Prioritize accessible common tasks while keeping all Admin features discoverable; preserve server access enforcement.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-02 — Useful dashboard actions.** Reuse recent edits and attention indicators; offer a relevant next task and resume links with draft/public state. Distinguish actual counts, unavailable queries and access-filtered results.

  Work: In progress · Priority: Selected · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/admin-onboarding` · Verified on: 2026-10-16 · Increment: [optional dashboard guide](../operations/admin-getting-started.md), native preference/focus/scoped-task evidence in the work log. Broader acceptance stays open.

- [ ] **ADMINUX-03 — Progressive configuration.** Show common content controls first and reveal advanced options on demand. Configured values remain visible and required errors cannot be hidden inside collapsed groups.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-04 — Recognizable block selection.** Explain purpose with accurate thumbnails/categories and discoverable search/filter where supported. Keyboard users can select blocks; no-result states offer a valid next step.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-05 — Clear content ownership.** Explain page content, collection references, reusable sections and global effects at the edit point. Shared read-only records and edits affecting other pages are recognizable.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-06 — Distinct empty and failure states.** First use, no results, no access, archived/cleared content, loading and failed queries have different messages/actions. Query failures never look like an empty site.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-07 — Trustworthy save status.** Display unsaved, saving, saved and failed states based on actual outcomes. Preserve recoverable input across failures and warn about leaving genuinely unsaved work without duplicating native prompts.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-08 — Actionable validation.** Associate errors with fields, preserve values, announce status and offer a clear correction. Cross-field errors and inaccessible advanced fields remain discoverable.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-09 — Understandable preview.** Identify draft context, target page and available viewport checks. Missing or stale preview has an explanation and retry path; authentication and scope remain enforced.

  Work: In progress · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: Codex · Commit/PR: `feat/first-draft-onboarding` · Verified on: 2026-10-16 · Increment: [native Page guide](../operations/page-editing-guide.md), sourced shared presentation, current form-state guidance and independent preferences. [PR #36](https://github.com/tanishraj/payload-cms-starter-kit/pull/36) merged after green Quality (2,825 integration tests; one existing skip; three browser cases needed retries, documented on the PR). Novice-user study and broader first-page acceptance stay open.

- [ ] **ADMINUX-10 — Explicit publishing outcome.** Explain draft versus public state and publish impact, confirm actual success and provide the public URL. Ordinary scoped Manager publishing needs no extra approval; failed delivery is reported accurately.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-11 — Safe destructive/shared actions.** Explain concrete effects of delete, bulk actions and shared edits; use applicable native recovery/history. Confirm consequential actions without adding confirmation to every routine save.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-12 — Navigation and homepage guidance.** Link the page-creation journey to permitted navigation/homepage settings, explain public reachability and missing links, and prevent Manager actions outside their assigned authority.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-13 — Media selection assistance.** Explain upload requirements, missing/invalid files, descriptive alt text and references to reused assets. Scope-sensitive or private form uploads retain their distinct storage/access boundaries.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-14 — Form authoring clarity.** Suggest editable valid names, explain identity versus label/name, catch duplicates and show control/options/validation/conditions in the production preview. Schema changes explain historical-answer preservation.

  Work: Assess · Priority: First enhancement · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ADMINUX-15 — Generic inbox and safe testing.** Custom answers are readable and labelled, with discoverable status/filter/export actions. Test submissions are marked, authorized and excluded from ordinary inbox/export/notifications by default.

  Work: In progress · Priority: First enhancement · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.
  Increment evidence: [dynamic-form history audit](dynamic-forms-implementation.md). Full feature acceptance remains incomplete.

- [ ] **ADMINUX-16 — Accessible and resilient admin flows.** Verify keyboard/focus/labels/errors/status announcements, zoom/reflow, narrow screens, long labels and recoverable network interruptions. Retries do not duplicate drafts or submissions.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

## Deferred scope and open decisions

The [local scope reference](feature-scope-reference.md) preserves all exclusions,
follow-on ideas and proposed numerical targets. The custom visual editor is outside
this tracker. AI generation, a template/plugin marketplace, full multitenancy,
multiplayer editing, atomic multi-document releases, exact site-history replay,
website import connectors and advanced form controls are not silently added to the
first enhancement.

Keep the current MongoDB/provider/runtime contract. Reassess only if a concrete
requirement needs a change. Remaining choices include launch languages/URLs,
retention and backup objectives, later configurable-breakpoint constraints, generic
collection expansion, source-license suitability and release timing. These do not block
creating or maintaining this checklist.

Record-content moderation for public review submissions is an existing separate
workflow. It must not be confused with a mandatory approval gate for Site Managers
publishing ordinary pages within their eventual assigned scopes.

## Work log

Add a row when selecting/starting a task and update it before completion. Keep
feature boxes synchronized; record blockers with a concrete next action.

| Date | Feature/task IDs | Status | Owner | Change/decision | Commit/PR | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-06 | Project direction | Recorded | User | Move implementation to this starter; retain Payload editing; preserve Forma as historical source. | — | Conversation decision. |
| 2026-10-06 | DF-01–10; FORM/SUBMIT | Selected | — | Dynamic forms and generic submissions are the first enhancement. | — | User selected this priority; implementation has not started in this tracking task. |
| 2026-10-06 | All 206 groups | Assess | — | Initial read-only source findings; full acceptance audit pending. | Baseline 180d0e2 | Source presence only; no runtime-completion claims. |
| 2026-10-06 | ONBOARD-01–20; ADMINUX-01–16 | Assess | — | Add developer/Admin/Manager journeys, resumable contextual help, build/launch readiness and usability acceptance. Reuse dashboard and page recipes; preserve dynamic forms as first enhancement. | — | Source/document inspection only; no application UI shipped by this planning change. |
| 2026-10-06 | DF-01; DF-02; FORM-01; SUBMIT-01/02/08; ADMINUX-15 | In progress | Codex | Map current form paths; add custom contact roles and immutable published-intake snapshots/readable answers. Preserve legacy forms/data; no backfill or new environment settings. | [PR #14](https://github.com/tanishraj/payload-cms-starter-kit/pull/14) | 49 focused form/API/documentation/context tests pass after syncing develop on Node 22.13.1; TypeScript, changed-file lint and context checks pass. Isolated MongoDB 8.0.29 verifies persistence and immutable operational updates. Generic renderer, stale revisions, exports and admin-browser acceptance remain. |
| 2026-10-06 | Dependency gate prerequisite | Merged; bounded exception active | Codex | Prepare Next.js and transitive security patches on a separate branch. Remaining Braces 3.0.3 has no published fixed version; user approved only the exact Braces entry expiring 2026-10-13. | [PR #15](https://github.com/tanishraj/payload-cms-starter-kit/pull/15) | 2,268 integration tests pass; one Docker test skipped. TypeScript/full lint/generators/context pass. [Concrete remediation/proposal](../operations/dependency-audit-remediation-2026-10-06.md). Production audit passes with only the exact approved entry; GitHub Quality passes, including both governance journeys and the production build; merged into develop. |
| 2026-10-06 | DF-03/04/09; FORM-02/06; SUBMIT-03/07 | Merged; broader acceptance pending | Codex | Authenticated upstream generic form presentation with six controls/custom names, supported Storybook controls/states, shared strict-value rejection and legacy compatibility. No public block or new environment settings. | [PR #16](https://github.com/tanishraj/payload-cms-starter-kit/pull/16) (presentation commit `93597d2`) | 87 focused form/intake/context tests pass; TypeScript, changed-file lint, generated types and Storybook build pass. Desktop/mobile light/dark and failure/pending/success checks completed; independent UX disposition ship with no material fixes. Scoped design/context documentation recorded. GitHub Quality passed, including both governance journeys and the production build; merged into develop. |
| 2026-10-06 | DF-03/09; FORM-02; ADMINUX authoring | Merged into develop | Codex | Native Generic Form block, published-only minimal client projection, arbitrary supported custom questions, disabled preview, recoverable transport, open native field/option rows, shared theme. User confirmed reusable Form relationships and rejected a form-specific stylesheet. One Storybook catalogue entry contains interactive and CMS states. Contact6 source retrieved for the next layout feature. | [PR #17](https://github.com/tanishraj/payload-cms-starter-kit/pull/17) (`816ca33f`) | [GitHub Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/37466757847) passes: 2,332 integration tests, one Docker-dependent test skipped, both governance journeys, native form journey and production build. TypeScript, full lint, dependency audit and generated-artifact checks pass. Local Storybook build/catalogue and context checks pass; shared-theme picker thumbnail regenerated and inspected. The native journey awaits Payload row metadata, field-value responses and form readiness. Merged into develop; next branch `feat/contact6-dynamic-form`. No new environment variables/dependencies or data migration. |
| 2026-10-06 | DEV-01/02/03/04/06 | Merged into develop | Codex | User requested all current blocks in Storybook. Add one canonical entry for each of 67 blocks, reuse production presentations and thumbnail samples, retain Generic Form states, conditionally use existing website CSS and reject CMS API fetches. Contact6 implementation is deferred until this catalogue increment finishes. | [PR #18](https://github.com/tanishraj/payload-cms-starter-kit/pull/18) (`652cb34e`) | TypeScript, changed-file lint and Storybook build pass; 25 catalogue/fixture/theme checks pass. Live catalogue has 67 blocks and 143 stories; all 67 Default stories render in the browser. Docs controls, website-to-Neutral theme cleanup, dark disabled Generic Form preview and a 390px dark Hero Banner are verified. Final context checks pass; 40 focused catalogue/fixture/theme/context checks pass after inventory refresh. [GitHub Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/37471101257) passes the full regression suite, governance/form browser journeys and production build. Merged into develop; fresh next-feature branch `feat/contact6-reusable-form`. No schema, environment, dependency or data changes. |
| 2026-10-07 | DF-03/09; FORM-02; DEV-01/03 | Merged into develop | Codex | Contact Cards & Form, sourced from Contact6 through authenticated CLI, selects a reusable Form and shares generic validation/intake. Editable cards/hours, first-two-short-question responsive row, shared website theme, disabled preview and one canonical Storybook entry. | [PR #19](https://github.com/tanishraj/payload-cms-starter-kit/pull/19) (`0f6ed635`) | [GitHub Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/37664823414) passes 2,351 integration tests (one Docker-dependent test skipped), both governance journeys, both native form authoring/publication/submission/draft-isolation/disabled-preview journeys and production build. TypeScript, full lint (one existing warning), dependency audit and generated-artifact checks pass. Local focused checks and Storybook build pass; browser verifies custom-name submission and 390px wrapping. Website preview and Neutral dark have no scoped WCAG A/AA violations; upstream Neutral light muted-text contrast remains documented. Dependency prerequisite PR #20 merged first; approved Braces exception unchanged. No new environment variables or live data migration. Fresh next-feature branch: `feat/form-control-catalogue`. Broader control/revision/condition/idempotency boxes remain open. |
| 2026-10-07 | Dependency prerequisite for Contact6 | Merged into develop | Codex | Patch new Payload/Sharp advisories with aligned Payload 3.90.2 and Sharp 0.35.5; retain scoped Undici 7.29.1. Align disabled S3 client-upload compatibility, replay the exact enrollment TOTP code and preserve initial generated slugs before required validation. Await disposable fixture indexes and native browser readiness. | [PR #20](https://github.com/tanishraj/payload-cms-starter-kit/pull/20) (`f440365e`) | [Upgrade review](../operations/dependency-audit-remediation-2026-10-07.md). [GitHub Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/37529400212) passes 2,336 integration tests (one Docker-dependent test skipped), governance/native-form browser journeys and production build. Audit, TypeScript/lint, generated artifacts, 71 focused dependency/storage/auth/context checks and 21 API/slug/navigation/fixture checks pass. Braces approval unchanged; no new environment setting or live data migration. Operators must recreate pending scheduled publish/unpublish jobs where applicable. The Admin grant/revoke journey passed on retry after a conditional-field readiness timeout; browser repeatability remains an ADMINUX/VERIFY follow-up. |
| 2026-10-14 | Full catalogue planning; ACCESS; DF-02/06; DESIGN-07; FORM-08/DEV | Charted; acceptance unchanged | User / Codex | Plan all 242 groups. Confirm section-owned resources with Admin-managed shared resources and independent inbox access; stale-form refresh preserving compatible answers; fixed upstream breakpoints initially/configurable later; explicit typed registrations with small helpers. Create a local Wayfinder map and open decision tickets; preserve dynamic forms first. | Current planning branch; see Git history for this change. | Read-only document/source review; coverage/dependency/link integrity passes; project-context update is a checked no-op, context check passes and all 15 focused project-context tests pass. No child decision resolved or application behavior changed. Braces exception expired on 2026-10-13; fresh audit/remediation required before the next implementation merge, no extension approved. |
| 2026-10-14 | FORM-01–09; SUBMIT-01–12; ACCESS-01–09; DF-01–10 | Baseline assessed; full acceptance unchanged | Codex | Resolve the first Wayfinder baseline task with [reuse/gap/evidence assessment](forms-access-baseline.md); record string-ID owner activity defect for inbox work. User authorizes the bounded stale-form recovery increment; detailed identity policy remains open. | Baseline commit `72a1e02`; included in [PR #21](https://github.com/tanishraj/payload-cms-starter-kit/pull/21). | 172 focused tests pass in 16 suites; isolated hook reproduction confirms owner defect. Prior native journeys remain separate evidence. Fresh production audit fails on high Braces/Next findings and expired exception; merge prerequisite. No app/environment/data changes or checkbox updates. |
| 2026-10-14 | DF-04/09; SUBMIT-03/04/07; ADMINUX-15/16 | Implemented bounded increment; merge blocked by dependency audit | Codex | [Durable submission retry protection](form-submission-retries.md): scoped attempt keys, immutable private receipt hashes, verified unique sparse Mongo constraint, original confirmation replay, explicit new responses for changed answers, lifetime protection including Trash and unconfirmed transaction-race recovery. | [PR #22](https://github.com/tanishraj/payload-cms-starter-kit/pull/22) · implementation `eaa04835`; draft pending the security gate. | Disposable Mongo concurrency and both native form journeys verify one stored response after a lost confirmation; full isolated suite passes 2,369 tests with one Docker-dependent skip and production build passes. Static checks pass, one pre-existing lint warning. All 69 final focused form/database/context checks pass, including independent same-answer form instances and receipt replay from Trash. Both retry workshop plays pass in isolated Chrome; Storybook build, generated types/import map and final TypeScript/lint/context checks pass. Production audit still fails on high Next/Braces findings and expired Braces exception; no renewal approved. No new environment setting, dependency or live database mutation. Broad catalogue boxes remain open. |
| 2026-10-14 | PR #22 security prerequisite; SEC/QUALITY | Next patch verified; explicit Braces renewal pending | Codex | Align the exact Next family to 16.3.8 with existing transitive pins retained. Prepare the exact unapproved 14–21 October Braces proposal without changing the active exception. | [PR #22](https://github.com/tanishraj/payload-cms-starter-kit/pull/22); [security review](../operations/dependency-audit-remediation-2026-10-14.md) | 50 focused policy/version/context tests, TypeScript/lint, 2,370 isolated integration tests (one Docker skip), production build and both native form journeys pass. Next findings removed; authoritative audit still fails on Braces and its expired exception. Candidate renewal passes dry-run validation only; no approval, merge or branch deletion yet. Feature counts unchanged. |
| 2026-10-14 | PR #22 merge gate | Exact seven-day renewal approved; Quality pending | User / Codex | Apply only the approved Braces entry from October 14 to 21, retaining advisory/version/mitigation/owner and the unchanged evaluator. Merge only after required checks pass; preserve develop and create the next feature branch afterward. | [PR #22](https://github.com/tanishraj/payload-cms-starter-kit/pull/22); [approved review](../operations/dependency-audit-remediation-2026-10-14.md) | Explicit user security approval recorded in the conversation. Authoritative audit passes with only the approved Braces entry; all 46 policy/version tests pass and project context is current. Prior Next patch/full regression evidence unchanged; current-head GitHub Quality must pass before merge. No future renewal or other advisory waived. |
| 2026-10-14 | PR #22 generated context gate | Inventory regenerated after final approval docs | Codex | Reproduce the single CI inventory mismatch locally; regenerate after all monitored operations-document edits and rerun the unchanged deterministic contract. | [Quality run](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38528080879); PR #22 | First renewal run: audit passes, 2,369 integration tests pass, one inventory failure, one Docker skip. Final documentation was written after inventory generation; no runtime or audit evaluator change. All 15 local context tests now pass after CI-order Payload generators and final inventory generation; no Payload artifact drift. Fresh Quality remains required before merge. |
| 2026-10-14 | Durable retries; PR #22 merge and branch cleanup | Merged into develop | Codex | Merge the verified exact PR head, sync develop, delete only its matching local/remote feature branch, then create `fix/form-submission-owner-activity` from the merge before next implementation. | [PR #22](https://github.com/tanishraj/payload-cms-starter-kit/pull/22) · `6d5b9a49` · [Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38529685828) | Quality passes audit, artifacts/types/lint, 2,370 integration tests (one Docker skip), both governance and native-form journeys and production build. Exact local context tests pass, including a fresh checkout. Braces expiry remains October 21; no extra exception or future renewal approved. Broad feature boxes unchanged. |
| 2026-10-14 | SUBMIT-10; DF-05; ADMINUX-15 | Ready; not implemented | Codex | Next bounded inbox increment: owner-only changes must update Last action for raw/populated MongoDB string IDs; retain supported numeric compatibility and avoid updates for unchanged/missing owners. Assess before fixing and keep status/notes behavior. | `fix/form-submission-owner-activity`, based on `6d5b9a49` | Existing [baseline defect](forms-access-baseline.md#reproduced-inbox-defect) and numeric-only hook/test inspected. Regression cases and implementation remain to be completed on this fresh branch; do not close full inbox/export acceptance. |
| 2026-10-14 | SUBMIT-10; DF-05; ADMINUX-15 | Owner-activity increment locally verified; Quality pending | Codex | Normalize raw/populated string owner IDs while retaining numeric compatibility. Owner-only changes stamp Last Action At; unchanged/omitted owners do not. Preserve access and immutable answer/timestamp fields. | [PR #23](https://github.com/tanishraj/payload-cms-starter-kit/pull/23) · implementation `d17330dd`; current-head Quality pending | Six string-ID cases failed before the fix; all 40 focused hook/intake/API tests pass afterward, including an authorized Site Manager and denied reassignment on disposable MongoDB. All 55 final focused tests, TypeScript/lint, generated types/no drift, context update/check and production audit pass. Required current-head Quality remains before merge; broad inbox acceptance stays open. |
| 2026-10-14 | Delivery priority; forms completion | Forms remain first | User / Codex | User explicitly chose to finish forms before other items after reviewing the recommendation. Publish the ordered forms completion plan with current foundation, remaining milestones and existing later scope; required form/inbox/file permissions stay prerequisites. | [Forms completion sequence](forms-completion-plan.md) | Planning order clarified; no extra feature boxes checked or implementation acceptance inferred. Website-wide scopes/onboarding follow the forms milestone. |
| 2026-10-14 | SUBMIT-10; DF-05; ADMINUX-15 | Owner-activity increment merged into develop | Codex | Merge the verified exact PR #23 head, sync develop, delete its matching local/remote branch and create `feat/form-field-configuration` for the next forms milestone. | [PR #23](https://github.com/tanishraj/payload-cms-starter-kit/pull/23) · `8495a4a7` · [Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38535686556) | All 55 local focused tests and 2,386 CI integration tests pass (one Docker skip); native form journeys, production build and all gates pass. Governance Admin grant/revoke passed on retry after the existing Content grants conditional-field visibility timeout; repeatability remains a VERIFY/ADMINUX follow-up. No full inbox/section-scope/export checkbox closed. |
| 2026-10-14 | FORM-01/05/06; DF-02/06 | Next forms increment ready for implementation | Codex | Assess stable field/choice identities, help text, defaults and type-specific constraints through explicit typed schemas, production consumers and Storybook. Preserve prior schemas/submissions and document actual supported configuration. | `feat/form-field-configuration`, based on `8495a4a7` | Forms-first priority reaffirmed by the user. Fresh branch created before next implementation; [forms completion sequence](forms-completion-plan.md) remains the delivery map. No new configuration behavior claimed yet. |
| 2026-10-14 | DF-02/04/06/09; SUBMIT-01/04/07; FORM-05/06; DEV-03 | Implemented increment; merge blocked by dependency audit | Codex | [Published revision recovery](form-revision-recovery.md): reject stale generic requests before storage/email, return public updated questions, preserve only valid same-ID/type answers, explain clearing and require review/resubmission. Both generic layouts share the path; legacy revisionless clients preserved. | [PR #21](https://github.com/tanishraj/payload-cms-starter-kit/pull/21) · implementation commit `5a5ec86`; draft, dependency gate blocks merge. | 65 focused recovery/story tests and 16 documentation/context tests pass. Full isolated regression: 2,364 pass, one Docker-dependent skip; both native form journeys pass without retry in the final run, including stale rejection/no storage, stable-ID preservation, changed-type clearing and one reviewed resubmission. Production/Storybook builds, TypeScript and full lint pass (one existing warning). Fixture import order fixed after local loader diagnosis. Context inventory/references updated and check passes. Production audit fails on high Braces/Next findings and expired exception; no waiver extended. No new environment/dependency/schema/migration changes. Broad feature/proof boxes remain open. |

## Completion record template

For each implementation, record:

```text
Feature IDs / proof tasks:
Applicable acceptance:
Existing source and reusable behavior:
Remaining change and dependencies:
Owner and status:
Migration/backward-compatibility impact:
Environment/template impact:
Commit or PR:
Tests/manual checks actually run and results:
Remaining limitations or reason for deferral:
Documentation updated:
```

The project-context skill inventory remains the technical source map. This tracker
owns progress against the carried-forward requirements; operator documentation
owns the instructions for shipped behavior.

| 2026-10-14 | FORM-01/05/06; DF-02/06 | Merged bounded configuration increment | Codex | Native help/initial answer/Text-Textarea length settings, required-checkbox choice protection, stable row collision checks, shared sanitized projection, active-setting snapshots/fingerprints and editing guidance. Preserve legacy hashes and fixed-client boundaries. | [PR #24](https://github.com/tanishraj/payload-cms-starter-kit/pull/24) | Final local regression: 2,411 integration tests pass, one Docker-dependent skip; both native form journeys pass without retry on disposable MongoDB. Storybook build, Configured Validation browser play and desktop/390px light/dark review pass. TypeScript, full lint (one existing warning), Payload generators, final deterministic inventory checks/tests and production build pass. Production audit passes under the unchanged approved Braces exception expiring October 21. [PR #24](https://github.com/tanishraj/payload-cms-starter-kit/pull/24) merged as `1b347b89` after [current-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38541507234) passed on `bf9e7b21`. CI integration: 2,411 pass/one Docker-dependent skip; both native form journeys and production build pass. Governance has one first-attempt pass and one pass on retry after the existing Content-grants checkbox readiness timeout; repeatability remains an open VERIFY/ADMINUX follow-up.; broad acceptance boxes remain open. See [configuration contract](form-field-configuration.md). |

| 2026-10-14 | FORM-01/05/06; ADMINUX-14 | Editor recovery correction verified | Codex | Keep already-configured settings visible for clearing after switching to fixed Review intent; do not hide the cause of publication validation. New unused settings remain hidden for Review. | PR #24 follow-up | Conditional authoring regression, both native form journeys without retry, final full local regression (2,411 pass/one Docker-dependent skip), production build, TypeScript, lint and deterministic inventory checks pass. No presentation/source/theme additions. |

| 2026-10-14 | FORM-03/08; DF-07 | Next forms increment ready | Codex | Add URL and Number as the first bounded initial-catalogue increment through explicit typed definitions, sourced production Input, shared validation/formatting and canonical Storybook/native evidence. Remaining controls and files retain their sequence. | `feat/form-url-number-controls`, based on `1b347b89` | Previous configuration increment merged and its branch removed after verified current-head Quality. Fresh branch created before new feature implementation; no new controls claimed yet. |

| 2026-10-14 | FORM-03/05/08; DF-07; DF-02/06 | URL/Number increment merged | Codex | Add URL and precise decimal Number through explicit definitions and existing sourced Input. Shared URL validation, numeric min/max/increment rules, decimal-string history and changed-rule recovery. Fixed Review compatibility and six-control legacy behavior preserved. | [PR #25](https://github.com/tanishraj/payload-cms-starter-kit/pull/25) | 145 focused tests, TypeScript, Storybook build/play and desktop/390px/dark review pass. Full isolated regression: 2,476 pass/one Docker-dependent skip; production build passes. Both native journeys pass without retry, including rejected publication for unknown controls, invalid step and invalid defaults. Full lint passes with one existing warning; Payload generators, production audit and final deterministic inventory checks/tests pass. [PR #25](https://github.com/tanishraj/payload-cms-starter-kit/pull/25) merged as `0414bb15` after [current-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38550735278) passed on `5bed362b`. CI integration: 2,476 pass/one Docker-dependent skip; native form journeys and fresh production build pass. Both governance journeys and both native form journeys pass on the first attempt; generated-output cleanup and fresh production compiler pass. Earlier CI failure is retained in the work log as a diagnosed generated-dev-artifact incident. See [control contract](form-url-number-controls.md); broad catalogue/forms acceptance remains open. |

| 2026-10-14 | FORM-03/06/08; SUBMIT-02 | New-control name compatibility verified | Codex | Exclude URL/Number answers from legacy contact-alias inference. A Number question named email stays an ordinary typed answer and does not populate submitterEmail. Preserve six-control aliases and explicit contact-role mappings. | PR #25 follow-up | 97 targeted tests, both native journeys without retries using the email question name, full isolated regression (2,476 pass/one Docker-dependent skip), production build, TypeScript, lint and deterministic context pass. |

| 2026-10-14 | VERIFY; DEV-03 | CI generated-output isolation verified locally | Codex | Initial PR #25 CI head passed integration/browser gates but failed production TypeScript on malformed ignored `.next/dev/types/routes.d.ts` (TS1128). Add a CI-only fixed `rm -rf .next` step after browser teardown and before the unchanged production build. Preserve command allowlist, source/type gates and read-only permissions. | PR #25 follow-up | Deliberately malformed generated dev declaration reproduces TS1128 in the disposable checkout. Exact cleanup followed by 2,476 passing full integration tests/one Docker-dependent skip and fresh production build succeeds. All 12 strict workflow contract tests, affected context checks and control tests pass. The dev generator's corruption mechanism is not asserted; fresh production output owns its types. User caches and application build scripts remain unchanged. |

| 2026-10-14 | FORM-03/05/08; DF-07 | Next forms increment ready | Codex | Add the remaining choice controls through sourced presentations, explicit typed schemas and a shared scalar/multiple-answer contract. Start with radio, checkbox group and multi-select; preserve current controls, historical meaning, review/preview and retry contracts. | `feat/form-choice-controls`, based on `0414bb15` | URL/Number increment merged after verified current-head Quality; its branch deleted. Fresh branch created before implementation. No choice controls claimed yet. |

| 2026-10-14 | FORM-03/05/06/08; DF-07; SUBMIT-02/03 | Choice increment implemented; release verification in progress | Codex | Authenticated radio, checkbox-group and searchable multi-select presentations reviewed in canonical Storybook before Payload authoring integration. Shared scalar/array answers, count/default rules, partial removed-choice recovery, immutable original labels and escaped notifications; arbitrary contact-like names remain ordinary answers. | `feat/form-choice-controls` | 156 focused tests and Storybook build/validation/recovery plays pass; desktop/mobile/dark reviewed. Native and complete release gates pending; no broad forms completion claimed. See [contract](form-choice-controls.md). |

| 2026-10-14 | FORM-03/05/06/08; DF-07; SUBMIT-02/03; VERIFY | Choice increment verified locally before commit/push | Codex | Eleven controls, original-label scalar/array history, count/default authoring, changed-choice recovery and safe retry verified. New picker uses supported above-trigger placement after a native trace exposed bottom consent-bar occlusion; no forced click or layer override. | `feat/form-choice-controls`; PR pending | 159 focused form + 15 context tests; full isolated regression 2,509 pass/one Docker-dependent skip; both native journeys pass without retry; production/Storybook builds and new selection/recovery plays pass. TypeScript, lint (one existing warning), production audit and Payload generators pass; inventory matches source. First disposable full run lacked Git metadata (three repository-contract failures), corrected in the harness; initial Contact6 run exposed consent occlusion, fixed in source and verified twice. No checks skipped or weakened. |

| 2026-10-14 | FORM-03/05/06/08; DF-07; SUBMIT-02/03 | Choice increment merged; FORM-08 extensibility verified | Codex | Explicit new Radio/Checkbox-group/Multi-select registration demonstrates scalar/array validation, rendering and captured formatting through native Payload and both production blocks. Unknown/incomplete controls cannot publish; developer registration guide documents the same contract. Full control catalogue/forms milestone remain open. | [PR #26](https://github.com/tanishraj/payload-cms-starter-kit/pull/26), `d00ca7e7` | [PR #26](https://github.com/tanishraj/payload-cms-starter-kit/pull/26) merged as `d00ca7e7` after [current-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38558813736) passed on `460017ea`. CI: 2,509 integration tests/one Docker-dependent skip; both governance and both native form journeys pass on the first attempt; fresh production build passes. Verified merged branch deleted locally/remotely. Fresh `feat/form-switch-date-time-controls` created from merged develop before new implementation; develop preserved. |

| 2026-10-14 | FORM-03/05; DF-07; SUBMIT-02/03 | Switch/Date/Time implemented; release verification in progress | Codex | Verified authenticated sourced presentation in canonical Storybook before native Payload integration. Strict boolean switch, calendar-day and minute local-time strings, inclusive bounds, active settings/defaults, contact-name safety and same-ID rule recovery. No timezone conversion or new form stylesheet/dependency/env. | `feat/form-switch-date-time-controls` | Initial 229 affected tests, both new Storybook plays and desktop/mobile/dark review pass. Native/release verification pending; initial required-label test lookup corrected without weakening validation. See [contract](form-switch-date-time-controls.md). |

| 2026-10-14 | FORM-03/05; DF-07; SUBMIT-02/03; VERIFY | Switch/Date/Time verified locally before commit/push | Codex | Fourteen controls retain shared authoring/intake/history/recovery. Native picker dark chrome follows owning theme; strict boolean and canonical day/local-minute strings never auto-convert or fill omitted defaults. Required-label test lookup corrected; no production validation weakened. | `feat/form-switch-date-time-controls`; PR pending | 233 affected form tests and all 15 context tests pass; full isolated regression: 2,583 pass/one Docker-dependent skip. Both native journeys pass without retries, including actual authoring, invalid publication, range errors, raw local values/boolean history, changed-rule recovery and identical lost-confirmation retry. Production/Storybook builds, both new plays, TypeScript, lint (one existing AdminUserMenu warning), Payload generators, production audit under the unchanged approved Braces exception and deterministic inventory checks pass before commit/push. One native React flushSync lifecycle warning retained for broader VERIFY/AdminUX review; no warnings/checks suppressed. Full forms/catalogue acceptance remains open. |

| 2026-10-14 | FORM-03/05; DF-07; SUBMIT-02/03; VERIFY | Switch/Date/Time increment merged | Codex | Fourteen registered question controls, strict booleans, canonical calendar days/local minute times, inclusive native bounds and unchanged historical/recovery/retry meaning. Private attachments remain open. | [PR #27](https://github.com/tanishraj/payload-cms-starter-kit/pull/27), `5b6d81a9` | [PR #27](https://github.com/tanishraj/payload-cms-starter-kit/pull/27) merged as `5b6d81a9` after [current-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38565943611) passed on `247c468b`. CI: 2,583 integration tests/one Docker-dependent skip; both native form journeys pass on the first attempt; fresh production build passes. Governance has one first-attempt pass and one pass on retry after the previously recorded Content-grants checkbox readiness timeout; broader VERIFY/AdminUX repeatability remains open. Verified merged branch deleted locally/remotely; develop preserved. Fresh `feat/form-private-attachments` created from merged develop before implementation. |

| 2026-10-14 | SUBMIT-05; applicable FORM-03/05; ACCESS prerequisites | Private attachment milestone ready | Codex | Establish private storage and bounded upload transport, authorized reads, scope/lifecycle cleanup and failed-submission behavior before exposing a working file control. Public Media is not the private attachment boundary. Preserve typed shared form contracts and verified source/Storybook-first workflow. | `feat/form-private-attachments`, based on `5b6d81a9` | Previous controls increment merged after current-head Quality. Fresh branch created before implementation; attachment capability and production provider/access acceptance are not claimed yet. |

| 2026-10-14 | SUBMIT-05; FORM-03/05; DF-07; ACCESS prerequisites | Private uploads implemented; release verification in progress | Codex | Authenticated sourced picker/progress reviewed before Payload integration. Separate private metadata/storage, bounded upload ownership/content validation, transaction-protected receipt/cleanup, authorized integrity-checked downloads and email submission links; no actual email attachments. | `feat/form-private-attachments` | New focused policy/presentation/Mongo/S3 tests pass; both expanded native journeys pass without retries after real empty-selector and transactional-pagination defects were corrected. Final release/current-head merge evidence pending. Hosted provider/scanning/section-scope acceptance remains explicit. |

| 2026-10-14 | SUBMIT-05; FORM-03/05; DF-07; VERIFY | Private uploads verified locally before commit/push | Codex | Fifteen question controls; bounded private upload/capture/download/history and cleanup. Source workshop and native administration review complete. Production configuration is explicit and disabled until private S3 is configured; hosted policy/scheduling/scanning and section scopes remain separate acceptance. | `feat/form-private-attachments`, PR pending | Full isolated regression: 2,630 pass/one Docker-dependent skip; both final native upload journeys pass without retries (3.0m), including signed-in download, anonymous denial, stale-file preservation, duplicate-safe retry and disabled preview. Production/Storybook builds, 47 new focused tests, all 15 context tests, TypeScript, lint (one existing warning), Payload generators and exception-aware production audit pass. Initial obsolete 22-collection inventory assertion updated for the real 23rd internal collection; no digest/check weakening. Required-label workshop locator corrected. No local secrets or production data used in disposable acceptance runs. |

| 2026-10-14 | SUBMIT-05; VERIFY | Private build-artifact boundary hardened before merge | Codex | A synthetic local upload reproduced Next.js tracing it into standalone output despite production local uploads being disabled. Add explicit tracing/Docker-context exclusions and a read-only mandatory artifact check after every production build. | `feat/form-private-attachments`, PR #28 update pending | Prior-head CI is not merge evidence for this additional privacy fix. Local artifact reproduction is confirmed; fixed regression, fresh release and new current-head Quality must pass before merge. No real user file was involved. |

| 2026-10-14 | SUBMIT-05; FORM-03/05; VERIFY | Final private-upload boundary verified locally | Codex | Production tracing/Docker exclusions and a mandatory artifact gate prevent local private files entering bundles. A genuine new response clears pending/error/uploaded file rows, explains re-upload and preserves ordinary answers. | PR #28 final-head update pending | Full final isolated suite: 2,637 pass/one Docker-dependent skip; both final native journeys pass without retries (2.7m); production/Storybook builds, type/lint/audit/generators and all 15 context tests pass. Fresh production build with a synthetic private file present reports 79 traces and privateUploadsIncluded=false; the same guard first rejected the reproduced old bundle. One repeat hit an occupied disposable Mongo port in API fixture startup; rerunning after browser teardown passed without code/assertion changes or skipped fixtures. Earlier CI on ace7edce is superseded for merge; final current-head Quality is required. |

| 2026-10-14 | FORM-03; SUBMIT-05; DF-07; VERIFY | Private-file increment merged; initial catalogue verified | Codex | Fifteen question controls and configurable submit, private metadata/storage, authorized history/downloads, durable retry/recovery, cleanup and deployment artifact protection. Broad scoped-resource/provider/remaining forms acceptance is still open. | [PR #28](https://github.com/tanishraj/payload-cms-starter-kit/pull/28), `083082d6` | [Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38587383727) passed on exact head `1b4ba8a8`: 2,637 integration pass/one Docker-dependent skip; native form journeys and fresh production build/private-artifact check pass. Governance passed first attempt. Contact6 passed first attempt; Generic Form passed on retry after the initial public-page navigation exceeded 20 seconds before upload interaction. Broader VERIFY/AdminUX repeatability remains open; no assertion or warning was suppressed. Verified merged feature branch deleted locally/remotely; develop preserved. Fresh `feat/form-layout-entries` created from merged develop before new implementation. |

| 2026-10-14 | FORM-04; applicable FORM-07/DF-08 | Next forms increment ready | Codex | Continue forms with typed layout/display entries such as headings, descriptions, separators and groups, using verified source/Storybook first. Conditions follow as a bounded increment; do not introduce a visual editor or weaken question/answer identity. | `feat/form-layout-entries`, based on `083082d6` | Private-file increment merged after final-head Quality. No layout-entry implementation claimed yet; the full forms checklist remains active. |


| 2026-10-14 | FORM-04; DF-07; SUBMIT-01/02; ADMINUX | Layout increment implemented; release verification in progress | Codex | One ordered native array of questions, headings, descriptions, separators and groups, sourced Storybook first. Legacy paths/IDs/revision hashes preserved; groups share question schema and global validation. Optional layout revision/history, explicit recovery and no phantom answer/email rows. | `feat/form-layout-entries` | Desktop light/mobile dark reviewed, Storybook validation/submission play complete; actual browser first-error focus and component focus checks pass. 24 layout contracts and 11 private-file/database tests pass. Expanded native journeys/full release gates and merge pending. Appearance/conditions/broad acceptance remain open. |


| 2026-10-14 | FORM-04; DF-07; SUBMIT-01/02; VERIFY | Layout increment locally verified; CI pending | Codex | Canonical sourced layout presentation, one ordered native authoring flow, question-only answer boundary, legacy revision compatibility and layout-aware history/recovery. | `feat/form-layout-entries` | Complete isolated regression: 2,664 integration tests pass/one Docker-dependent skip; Generic Form and Contact6 native journeys pass without retries (3.4m). Production build/private-artifact inspection, Storybook build/play, type/lint, Payload generators, deterministic context and audit pass under the unchanged approved Braces exception. No new environment/dependency/migration/stylesheet. CI/merge pending; broad FORM-04 appearance/acceptance and conditions remain open. |


Native form API ownership correction is under final verification. The shared
Payload REST router owns submit/upload/private-download URLs and preserves
unread bounded streams, publication/revision/retry and access/transaction checks.
Direct real-MongoDB routing tests exercise rejection, accepted receipt replay,
private downloads and trash retention. Failed Quality on `f9930e9` remains part
of the record; the final exact-head gate must pass before merge.


2026-10-15: Canonical native REST correction passes final local release gates:
2,665 integration tests/one Docker-dependent skip, both governance journeys
(52.3s) followed by both native form journeys (2.9m), all without retries or
diagnostic preloading. Fixture imports load Payload before its dependent config;
all assertions remain. Actual REST tests retain JSON/upload bounds, accepted
receipt replay, authorized/private downloads, unrelated-token rejection, original
files after Form deletion and trash retention. Fresh production build inspects
73 traces with no private uploads. Types, lint (one existing warning), Payload
generators, context checks/tests and unchanged approved-exception audit pass.
Exact-head Quality/merge evidence remains pending.


| 2026-10-15 | FORM-04; DF-07; SUBMIT-01/02/05; VERIFY; ADMINUX | Layout/native-API increment merged | Codex | Ordered native questions/headings/descriptions/separators/groups, stable identities, layout revision/history/recovery, no display answers, and one canonical Payload owner for bounded form submit/upload/private-download URLs. Source/Storybook precedes native authoring integration. Fixed clients fail closed for unsupported layouts. | [PR #29](https://github.com/tanishraj/payload-cms-starter-kit/pull/29), `2d18b58a` | [Exact-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38630786542) passes on `c32cca69`: 2,665 integration tests/one Docker-dependent skip; both native form journeys first attempt (7.2m); production artifact has 73 traces/no private uploads. Both governance journeys pass, with Admin feature grants requiring one retry after Pages-grant visibility exceeded five seconds. Broad VERIFY/AdminUX repeatability stays open. Earlier failed route-dispatch run and correction retained in the contract. Local complete suite, four ordinary-loader browser journeys without retry, builds/types/lint/generators/context/audit pass. Verified feature tip deleted locally/remotely; develop preserved. |

| 2026-10-15 | FORM-04; DF-08 | Sourced appearance increment merged | Codex | One reusable Form owns supported width, spacing, columns and submit appearance/size/shape/width. Active values enter the published revision and original history; legacy defaults remain compatible; stale recovery preserves compatible answers. | [PR #30](https://github.com/tanishraj/payload-cms-starter-kit/pull/30), source `6a20ce7e`, merge `9c6f148a` | [Exact-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38641309862) passed: 2,693 integration tests/one Docker skip; native forms and production build passed; artifact guard reported 73 traces/no private uploads. Native Generic Form browser case was flaky after a 420-second timeout and a retry navigation timeout before overall success. Broader repeatability remains open; no completion checkbox inferred. Feature branch deleted locally/remotely; develop preserved. |


| 2026-10-15 | FORM-04; DF-08; applicable history/UX | Appearance increment merged; conditions next | Codex | One explicit native Form appearance group maps to sourced typed Storybook/production/preview props. Legacy defaults/hashes stay unchanged; active settings enter revision/original history and stale recovery without changing answers. Fixed clients fail closed. See [contract](form-appearance-controls.md). | [PR #30](https://github.com/tanishraj/payload-cms-starter-kit/pull/30), merge `9c6f148a`; next branch `feat/form-conditional-rules` | Storybook-first desktop/mobile/dark review and play complete. Local: 2,693 integration tests passed/one Docker skip; both native journeys passed; 73 production traces/no private uploads; Storybook build, typegen, TypeScript, ESLint and context checks pass. Exact-head Quality passed with one flaky Generic Form browser case (420-second timeout and retry navigation timeout before overall success). Known Neutral light contrast remains; no new dependencies/environment/styles. Conditions follow separately. |

| 2026-10-16 | DF-08; VERIFY; CI diagnostics | Browser regression fixed locally; exact-head CI next | Codex | Correct required-question lookup to use the accessible textbox name and author both source-select options before testing conditional hide/reveal. Add user-approved, pinned seven-day retention of only Playwright reports/results, keeping read-only permissions and ownership-checked Mongo cleanup. | [PR #31](https://github.com/tanishraj/payload-cms-starter-kit/pull/31), `feat/form-conditional-rules` | Chromium reproduction proves raw exact-label matching includes the decorative required marker. Both complete native form journeys pass locally in 3.3 minutes against isolated MongoDB 8.0.29 on Node 22.13.1. All 49 focused form/workflow/context tests, TypeScript and changed-file lint pass; deterministic inventory refreshed. No runtime, schema, dependency or environment-variable changes in this fix. CI/merge status remains governed by PR #31; no broader forms checkbox closed. |

| 2026-10-16 | DF-08; FORM-07; VERIFY | Conditions merged; historical export increment started | Codex | PR #31 merged after exact-head Quality; verified feature branch deleted. Continue forms on fresh `feat/form-revision-exports`, based on `e18690eb`, with native filtered/search CSV export from captured question metadata. | [PR #31](https://github.com/tanishraj/payload-cms-starter-kit/pull/31); new export PR pending | [Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38861826953) passed on `311fec42`; all four native governance/form journeys passed first attempt, integration/build/private-artifact gates passed. Export focused tests pass; current full release verification remains pending. No new environment/provider/dependency/style; broad forms acceptance stays open. |

| 2026-10-16 | SUBMIT-02/11; ADMINUX-15; VERIFY | Historical CSV increment implemented and locally verified | Codex | Native inbox filters/search across pages; original captured identity/labels/names/options/typed values; honest legacy rows; file-token/staff-note omission; spreadsheet safety; explicit access, invalid-filter and size failures. | [Feature PR](https://github.com/tanishraj/payload-cms-starter-kit/pulls?q=is%3Apr+head%3Afeat%2Fform-revision-exports) | 41 focused tests; final full integration 2,745 passed/one existing Docker-dependent skip; both native form journeys (3.4m) and both governance journeys (31.3s) passed first attempt. Final production build inspected 73 traces/no private uploads; Storybook and required generators/type/lint/context/audit pass. Singular/plural feedback has focused coverage. Exact-head GitHub Quality is required before merge. Webhook mappings, notification reliability and safe test mode remain open. |

| 2026-10-16 | ACCESS-02–09; PAGE; SUBMIT-05/10 | Implemented and locally verified; merge governed by PR | Codex | User accepts core forms and protected email links; advanced forms deferred. Add native section roots, descendant Page policies, section-owned Forms/Reusable Sections, intake-captured submission scope, protected CSV/files and related operational rows. Other feature grants stay explicitly site-wide. | [Feature PR](https://github.com/tanishraj/payload-cms-starter-kit/pulls?q=is%3Apr+head%3Afeat%2Fsection-scoped-access) | Local full regression: 2,757 passed/one existing Docker-dependent skip; both governance journeys pass (39.1s), final frozen-source native form journeys pass (3.0m). Production build: 73 traces/no private uploads. Generators, TypeScript, full lint (one existing warning), dependency policy and context pass; 49 final access/context contracts pass. An earlier Contact6 authoring wait timed out while server source was edited; the final source-frozen run passed, without weakening assertions. Exact-head CI and merge status are governed by the linked PR. See [runbook](../operations/section-scoped-access.md). No environment/provider/dependency change or ownership backfill. |

| 2026-10-16 | SUBMIT-02/11; VERIFY | Export increment merged; advanced forms deferred | Codex | PR #32 merged as `76e3dba2`; user accepts core forms and protected email links. Section access is selected next. | [PR #32](https://github.com/tanishraj/payload-cms-starter-kit/pull/32) | [Exact-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38873878285) passed: 2,745 integration tests/one existing Docker skip, both governance and both native form journeys, production private-artifact guard. Generic Form passed on retry after its initial public navigation timed out; broader repeatability remains open. No claim that the earlier pending checks or all broad forms boxes are complete. |

| 2026-10-16 | ONBOARD-04/09–13; ADMINUX-02 | In progress | Codex | On fresh `feat/admin-onboarding`, build one optional sourced next-task guide, current section-aware dashboard actions, account-owned dismiss/reopen preferences and honest no-access/query-failure states. Reuse native editors and existing recipes; no setup wizard, readiness claims or automatic content creation/publication. | Feature PR to follow | Storybook-first source: authenticated `@shadcnblocks/empty-empty-actions-2`; production presentation, controls, Default/edge states and hide/reopen play. Desktop light/390px dark review passes. Payload data/persistence integration and release evidence follow. |

| 2026-10-16 | ONBOARD-04/09–13; ADMINUX-02 | Native integration verified; final release gates | Codex | Access-enforced current sections/drafts; latest saved recent work; account-owned native preferences; confirmed persistence and hydration-safe keyboard controls; non-dismissible missing-access recovery. No setup wizard/readiness claims, data seed, invitation or automatic publication. | `feat/admin-onboarding` | Focused model/client/dashboard/Mongo tests pass; full integration 2,778 pass/one existing Docker-dependent skip. Native governance/onboarding pass (43.0s). A first fixture-only setup timeout, fixed keyboard hydration race and corrected partial-group test fixture are recorded, without weaker assertions/timeouts. Desktop/mobile review and two scoped axe scans pass (0 WCAG A/AA violations or incomplete checks). Form regressions and production/CI gates follow. |

| 2026-10-16 | ONBOARD-10; applicable ONBOARD-04/09/11–13; ADMINUX-02 | Supported guide locally verified; merge governed by PR | Codex | Optional sourced dashboard next action, account-owned visibility and hydration-safe keyboard recovery; current sections/drafts drive destinations and missing-access states. ONBOARD-10 is verified for this supported guide; broader onboarding/readiness/help/support/pilot groups remain open. | [Feature PR](https://github.com/tanishraj/payload-cms-starter-kit/pulls?q=is%3Apr+head%3Afeat%2Fadmin-onboarding) | Final full integration: 2,778 pass/one existing Docker-dependent skip. Native governance/onboarding: 2 pass (43.0s); existing Generic Form/Contact6 journeys: 2 pass (3.2m), no retry. Fresh production guard: 73 traces/no private uploads; final Storybook, type, lint (one existing warning), generators, audit and context pass. Scoped light/dark axe: zero WCAG A/AA violations/incomplete checks. Exact-head CI and merge status belong to the linked PR. No new environment variable/dependency/schema/migration; no readiness or novice-study claim. |


| 2026-10-16 | ONBOARD-10; VERIFY | First CI failure diagnosed; browser lifecycle corrected | Codex | First PR #34 Quality passed integration, then failed the Manager Page redirect assertion. Retry trace showed HTTP 400 duplicate slug; created records were previously registered for cleanup only after the URL assertion. Verify native create response/status/draft, register cleanup immediately and wait for the exact editor navigation. First-attempt save timing is unknown because its trace was not collected. | [PR #34](https://github.com/tanishraj/payload-cms-starter-kit/pull/34), [failed run evidence](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38889839101) | Fresh local Next run: both governance journeys pass (1.1m). Updated response-aware journey: both pass (46.8s). No production behavior/access/slug policy or timeout was relaxed. Exact-head Quality must pass before merge; the earlier failure remains recorded. |


| 2026-10-16 | ONBOARD-10; VERIFY | Fixture and browser journey boundaries corrected | Codex | Second CI passed integration. Retry trace proves scoped native Page save returned 201 and editor opened; the combined journey later exhausted its unchanged three-minute budget during re-login. Other attempts stalled before UI. Split access/onboarding/Review journeys; preload Payload before worker fixture imports; clean recorded Page IDs through the guarded Local API even after browser closure. | [PR #34](https://github.com/tanishraj/payload-cms-starter-kit/pull/34), [second failure evidence](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38897909977) | Worker/config and real-Mongo fixture contracts pass (9 tests), including child-before-root exact-ID cleanup and unrelated Page preservation. No application behavior, access/slug policy, timeout or retry count was relaxed. Repeated browser and exact-head CI verification follow; the original startup-stall internals remain unproven. |


| 2026-10-16 | ONBOARD-10; VERIFY | Fixture process boundary verified; repeated browser checks running | Codex | Preload-only experiment also stalled locally and was discarded. Governance browser helpers now use a short-lived standalone Node process with explicit loader flags, bounded failure deadline, guarded loopback test URI, structured IPC and shutdown before success. Shared account definitions stay pure; original Local API fixtures retain exact-ID cleanup. | [PR #34](https://github.com/tanishraj/payload-cms-starter-kit/pull/34) | Standalone seed/cleanup pass. All 14 process/config/real-Mongo contracts pass, including unsafe-DB rejection before fork, loader isolation, shutdown ordering, sanitized failure and killing a stalled child. Three native journeys are running twice without retries; full regression and exact-head CI follow. No production code, environment contract or browser timeout change. |


| 2026-10-16 | ONBOARD-10; VERIFY | Repeated native journeys pass after process lifecycle fix | Codex | Earlier isolated-process run passed five cases and exposed an IPC cleanup exit. Retain the child disconnect listener during async work, stop on parent loss and wait for close plus result. Keep safe exit-code/signal errors; no raw driver output. Access/onboarding/Review cases remain separate with unchanged native assertions and budgets. | [PR #34](https://github.com/tanishraj/payload-cms-starter-kit/pull/34) | Three native journeys repeated twice with zero retries: 6 pass (1.5m). Full integration: 2,783 pass/one existing skip. Process/config/real-Mongo contracts: 14 pass, lifecycle contract recheck: 5 pass. Final deterministic context and current-head Quality remain release gates; earlier CI/local failures remain recorded. |


| 2026-10-16 | ONBOARD-10; VERIFY | Canonical fixture boot order corrected | Codex | Third CI passed integration, access administration and Review moderation. Onboarding UI completed, but cleanup stalled and retries collided with retained fixtures. Initialize canonical Payload config before fixture helper imports; report config/import/database phases separately. | [PR #34](https://github.com/tanishraj/payload-cms-starter-kit/pull/34), [third CI evidence](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38903102965) | Ten actual seed/cleanup cycles pass (20 isolated processes). Focused JS lint passes. Native repeat, deterministic context and current-head CI follow; no application access/slug policy or timeout changed. |


| 2026-10-16 | ONBOARD-10; VERIFY | Canonical boot runtime checks pass | Codex | Canonical config initialization now precedes fixture helper imports, with precise import/database stages. | [PR #34](https://github.com/tanishraj/payload-cms-starter-kit/pull/34) | Ten real seed/cleanup cycles pass (20 processes); three native journeys repeated twice with no retries pass (6 cases, 1.6m). JS lint passes. Full integration and current-head Quality govern the final commit/merge. |

### Developer setup increment

| Date | Feature/task IDs | Status | Owner | Change/decision | Commit/PR | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-16 | ONBOARD-01–03 | Developer setup increment in progress | Codex | Reuse existing runtime/provider validation and Compose; add one quickstart and operator-only read-only setup checks. Preserve existing env files, explain empty-database bootstrap, distinguish checked capability from manual preview/upload/launch work, and suppress raw errors/ambient driver logging. | `feat/developer-quickstart` | Focused runtime/dependency and real CLI clone-fixture checks pass; production constraints unchanged. Local full regression and current-head Quality follow. No new environment variable, application role, schema, seed or content publication. |
| 2026-10-16 | ONBOARD-01–03; VERIFY | Developer setup locally verified | Codex | One discoverable native-admin quickstart plus `pnpm setup:check [--production]`; reuse Next environment loading and startup validators. No automatic setup mutations or readiness overclaim. Pin diagnostic-only Next env/driver dependencies already present in the lock graph; retain transitive versions. | `feat/developer-quickstart` | Full integration: 2,797 pass/one existing Docker skip. Final focused release checks: 24 pass. TypeScript, full lint (one existing warning), approved production audit and deterministic context pass. CJS interop and dangling-symlink cases corrected before release. No new env variable/schema/migration/UI; native browser/production regression and exact-head merge status follow in GitHub Quality. |

### First draft onboarding increment

| Date | Feature/task IDs | Status | Owner | Change/decision | Commit/PR | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-16 | ONBOARD-06/10; ADMINUX-09 | In progress | Codex | Reuse the sourced guide in native Page Content with current form facts, independent account visibility and safe saved-preview routing; keep native save/publish/Live Preview authority. Explicit Add Block labels match guidance. | `feat/first-draft-onboarding` | Authenticated source reverified, Storybook build and desktop/mobile light/dark review pass; 39 focused tests pass. Initial native test exposed collapsed rows and was corrected to expand them. Full browser/release evidence follows. No environment variable, seed, automatic publication or separate visual editor. |

| 2026-10-16 | ONBOARD-06/10; ADMINUX-09 | Native guide verified; final regression pending | Codex | Correct own-account lock handling so editing does not hide guidance. Preserve sourced button opacity against Payload's focused-link rule. Saved preview excludes live unsaved text and keeps the editor open. | `feat/first-draft-onboarding` | Native blank draft → Add Block → Save Draft → authenticated saved preview → independent hide/reopen passes (25.8s); anonymous preview denied. Scoped light/dark axe: zero violations and incomplete checks. Earlier native failures and contrast indeterminacy led to explicit row expansion, lock-identity regression coverage and the scoped integration fix; no assertion was removed. Other three governance journeys pass. Full regression/current-head CI follow. |

| 2026-10-16 | ONBOARD-06/10; VERIFY | Final source freeze and inventory refresh | Codex | The first full suite passed all behavior tests but failed the deterministic inventory after the last browser-test edit. Regenerate the source fingerprint after final edits and rerun; keep the inventory assertion intact. | `feat/first-draft-onboarding` | 2,810 tests passed/one inventory failure/one existing Docker skip in the initial full run. TypeScript and Storybook build pass; corrected native journey and scoped light/dark axe pass with no incomplete results. Final full regression and exact-head CI remain gates. |

| 2026-10-16 | ONBOARD-06/10; ADMINUX-09; VERIFY | Supported guide locally verified | Codex | Native form facts, independent account visibility, exact Add Block label, preserved current-author lock and safe saved-preview routing. No separate save/publish or visual-editor implementation. | [Feature PR](https://github.com/tanishraj/payload-cms-starter-kit/pulls?q=is%3Apr+head%3Afeat%2Ffirst-draft-onboarding) | Final full integration: 2,811 pass/one existing Docker skip. All four native governance/onboarding journeys pass (1.2m), plus both Generic Form/Contact6 journeys (3.0m), no retries. New saved-preview case proves unsaved text preservation/exclusion, authenticated/anonymous boundary, draft status and independent hide/reopen; Site Manager creation guidance is verified. Scoped native light/dark axe: zero violations/incomplete results. Storybook build, TypeScript, lint (one existing warning), approved audit and context pass. Production build and current-head Quality/merge evidence are recorded in the linked PR; broader novice-user/onboarding acceptance remains open. |

| 2026-10-16 | ONBOARD-06/10; ADMINUX-09; VERIFY | Local release gates pass | Codex | Complete final source/context review and preserve Payload-native editing with the reviewed optional guide. | [Feature PR](https://github.com/tanishraj/payload-cms-starter-kit/pulls?q=is%3Apr+head%3Afeat%2Ffirst-draft-onboarding) | Full integration: 2,811 pass/one existing skip; four governance/onboarding cases and two form cases pass without retries. Final focused policy/context/guide checks: 79 pass. Frozen install, generators, TypeScript, lint (one existing warning), approved audit, Storybook and production build pass; artifact guard: 73 traces/no private uploads. Architecture, Payload model, block-system narrative and deterministic inventory reviewed/updated. Exact-head Quality and merge status are owned by the linked PR; no broad novice-study or launch-readiness claim. |


| 2026-10-16 | ONBOARD-06/10; VERIFY | PR #36 CI regression diagnosed | Codex | The first run passed all 2,811 integration tests (one existing skip) and the new Page journey on its first attempt. Review fixture config import required two retries. The retained form trace shows a public cold navigation exceeding 20 seconds; all fixture API cleanup completed. A later retry produced no completion before the 45-minute job limit. Move the form test account seed out of Playwright into the existing 90-second guarded process, and align public navigation with the existing 120-second preview cold-compile allowance. | [PR #36](https://github.com/tanishraj/payload-cms-starter-kit/pull/36), [cancelled run and retained trace](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38932590999) | Fourteen fixture/process/database-safety contracts pass. Local browser regression and exact-head CI follow. No production behavior, form assertion, overall test/job timeout or retry count changed; the underlying intermittent Payload config-loader stall remains unproven. |


| 2026-10-16 | ONBOARD-06/10; VERIFY | Matching upstream loader fix applied to test worker | Codex | The bounded-seed change passed both form journeys (3.3m) but local governance still reproduced the config import stall before the Page UI (three other cases passed). The installed Lexical 0.50 Node entry uses top-level dynamic-import wrappers; adapt [Payload's upstream static-export resolver](https://github.com/payloadcms/payload/pull/18398) inside the fixture process before config loading. Preserve explicit conditions and unrelated resolution; do not upgrade or patch application packages. | [PR #36](https://github.com/tanishraj/payload-cms-starter-kit/pull/36) | All 26 focused process, loader and database-safety checks pass, including static dev/prod selection and unchanged React/built-in resolution. Repeated native governance, forms and exact-head CI follow. The earlier bounded-only failure is retained; no assertion, overall timeout or retry count was relaxed. |


| 2026-10-16 | ONBOARD-06/10; VERIFY | Resolver regression verified; exact-head CI gate | Codex | All four native access/onboarding/Page/Review journeys repeated twice with the final test-only resolver, with no retries or fixture stalls. Keep the bounded process for form account setup and the targeted cold public-navigation allowance. | [PR #36](https://github.com/tanishraj/payload-cms-starter-kit/pull/36), [live feature-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions?query=branch%3Afeat%2Ffirst-draft-onboarding) | Eight browser cases pass (2.2m); 26 process/loader/safety tests pass. TypeScript and affected lint pass. The bounded-process forms run passed both cases (3.3m); the final-resolver form repeat and fresh exact-head Quality are recorded on the PR. Merge requires green Quality; no application package upgrade or new environment setting. |


| 2026-10-16 | ONBOARD-05; ADMINUX-03/07/09 | Native site setup verified; release gates pending | Codex | Reuse existing Site Identity Brand/Regional and Appearance fields with the sourced guide and one Admin dashboard shortcut. Respect feature grants, current native dirty/processing/lock facts and account-owned shared setup visibility. Preserve stored settings, defaults and explicit publication. | `feat/site-setup-onboarding` | Storybook build and desktop/light/mobile/dark review pass; 60 focused tests pass. The first test run exposed unsupported DOM matchers in the new tests; replaced them with the repository's existing DOM assertions (no dependency added). Native setup passed first attempt (20.5s), including two native draft saves, unchanged public identity/theme and shared hide/reopen. Scoped axe has zero violations and incomplete checks. Full regression and exact-head Quality follow. |


| 2026-10-16 | ONBOARD-05; VERIFY | Local release verification complete | Codex | Complete the bounded native site-setup increment. Existing globals/defaults/permissions remain authoritative; broader onboarding usability acceptance stays separate. | `feat/site-setup-onboarding`, [live feature-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions?query=branch%3Afeat%2Fsite-setup-onboarding) | Full integration: 2,842 passed, one existing opt-in Docker skip; all five native governance/onboarding journeys pass without retries (1.2m). Production build passes and artifact guard reports 73 traces/private uploads excluded. Storybook build, generators, TypeScript, lint (one existing warning), approved dependency audit, deterministic context and the scoped visual detector pass. The focused native setup case and light/dark accessibility evidence are recorded above; exact-head CI/merge evidence is owned by the feature PR. No environment variable or migration introduced. |


| 2026-10-16 | ONBOARD-05; VERIFY | Explicit saved-preset proof | Codex | Strengthen the native setup test to inspect the actual Appearance save response for the selected preset and draft status, in addition to public-value isolation. The first PR-head CI run was intentionally cancelled as superseded before publishing this verification update. | [PR #37](https://github.com/tanishraj/payload-cms-starter-kit/pull/37) | The strengthened native journey passes without retries (16.8s). Application/presentation code is unchanged from the verified production build. Refresh the deterministic inventory and rerun the local integration gate for the final test source; exact-head CI/merge evidence is recorded on the PR. |
