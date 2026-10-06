# Website feature implementation checklist

Updated: 6 October 2026 (Asia/Dubai).

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

## How to maintain the checklist

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
- [ ] **DF-08 — Complete conditions and appearance.** Declarative visibility/required
  rules and supported size/shape/layout props work in Payload preview, public
  rendering and Storybook. Preserve selected upstream presentation requirements.
- [ ] **DF-09 — Verify access and failure states.** Unauthorized edits/inbox/file
  access are denied; drafts do not alter live forms; accessible errors, retry,
  pending/success and safe test mode are exercised.
- [ ] **DF-10 — Close acceptance and document.** Focused integration/browser/manual
  checks pass; examples and operator/developer guides describe the actual behavior.
  Update corresponding FORM/SUBMIT groups with commit and verification evidence.

DF-02 is in progress: published intake snapshots, Payload field-row identity,
content fingerprints, immutable readable answer rows and legacy compatibility are
implemented. Client revision negotiation/retention and browser/database acceptance
remain. DF-03/04/09 now also have workshop evidence: an authenticated upstream
generic presentation renders the six current control types, shares strict scalar
validation, and exercises accessible errors/pending/success/retry. Native Generic Form block/public/disabled Live Preview integration is implemented
and passed the native browser journey. Conditional values, stale revisions and server
duplicate protection remain; broader boxes stay open. Form blocks use shared theme
tokens and select reusable schemas; their example question lists are not authoritative.
[Implementation audit](dynamic-forms-implementation.md) records boundaries.

## Delivery sequence

| Order | Work | Gate |
| --- | --- | --- |
| 1 — Selected | Dynamic forms and generic submissions: DF-01–10, FORM and SUBMIT | Custom field → public render → validated submission → revision-aware inbox/export. Include required security/access prerequisites. |
| 2 — Recommended next | Section-scoped Site Manager permissions: ACCESS, applicable PAGE/SEC/VERIFY | Allowed operations succeed; direct cross-scope API/preview/history/file operations fail. |
| 3 | Draft/publication/history reliability and shared changes | Conflict, restore-as-draft, shared draft isolation and failed delivery behavior verified. |
| 4 | Theme/props/Storybook, reusable data and remaining content capabilities | Extend verified existing behavior; new presentations follow Storybook-first revamp conventions. |
| 5 | Media/search/SEO/site experiences and operational gaps | Assess and verify starter coverage before adding functionality. |
| 6 | Release verification | Accessibility/usability, staging, backup restore and rollback evidence; no unresolved data-loss or access leaks. |

Existing Storybook/block revamp work is preserved. It is not automatically declared
complete or expanded into a rebuild of the existing catalogue. Cross-cutting safety
and compatibility tasks can be prerequisites of any phase. Onboarding and admin
UX acceptance applies within each phase; see the [role journeys and readiness
plan](admin-onboarding-ux.md). Deliver the first useful draft flow before client
handoff without moving the selected dynamic-forms priority.

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

- [ ] **DESIGN-07 — Configurable breakpoints [Decision needed].** Retain the requested
  site-level breakpoint capability and impact preview. The earlier implementation
  proposal generates bounded CSS; fixed V1 breakpoints are an explicit fallback,
  not an unnoticed downgrade. Reassess against the starter's upstream layouts.

  Work: Assess · Priority: Decision · Baseline: Not yet assessed.
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

  Work: Merged into develop · Priority: First enhancement · Baseline: Partial.
  The Generic Form block selects reusable definitions and renders the six supported
  controls without fixed keys. Contact33 remains a compatible historical presentation.
  Evidence: [Forms](../../src/collections/Forms.ts), [shared renderer](../../src/components/revamp/generic-form.tsx),
  [native browser journey](../../tests/e2e/generic-form.e2e.spec.ts),
  [integration contracts](../../tests/int/generic-form-integration.int.spec.tsx).
  Owner: Codex · Commit/PR: [PR #17](https://github.com/tanishraj/payload-cms-starter-kit/pull/17) (`816ca33f`) · Verified on: 2026-10-06.
  Acceptance: custom text/select/checkbox fields authored in Payload, public submission
  stored under custom names with readable answers; no new collection columns,
  endpoint or email template. FORM-03's broader control catalogue remains open.

- [ ] **FORM-03 — Initial control catalogue.** Text, multiline text, email, phone, URL,
  number, single select, multi-select, radio group, checkbox, checkbox group,
  switch, date, time, file upload and submit button.

  Work: Assess · Priority: First enhancement · Baseline: Partial.
  Initial finding: Current options: text, email, phone, textarea, select, checkbox. Complete the requested initial catalogue through one extensible contract.
  Evidence: [src/lib/forms.ts](../../src/lib/forms.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **FORM-04 — Layout entries.** Headings, descriptions, separators and field groups;
  supported width, spacing, size, shape, variant and responsive presentation.

  Work: Assess · Priority: First enhancement · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **FORM-05 — Identity and configuration.** Stable field ID separate from editable
  label/name/order; help text, placeholder, default, required state and type-specific
  length/range/file constraints. Choice options have stable IDs/values and labels.

  Work: Assess · Priority: First enhancement · Baseline: Partial.
  Initial finding: Current SimpleFormField uses name/label/options; verify and design stable identity independently of name and order.
  Evidence: [src/lib/forms.ts](../../src/lib/forms.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **FORM-06 — Safe keys.** Unique documented field-name rules, reserved-name checks,
  multilingual labels and useful inline errors. Relabelling never changes the key;
  renaming a published key warns about exports/integrations.

  Work: Assess · Priority: First enhancement · Baseline: Partial.
  Initial finding: Field-name validation and editable labels exist; revision-safe renaming remains to verify.
  Evidence: [src/collections/Forms.ts](../../src/collections/Forms.ts), [src/lib/forms.ts](../../src/lib/forms.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **FORM-07 — Conditions.** Declarative show/require rules reference stable field
  IDs; client and server agree. No executable configuration.

  Work: Assess · Priority: First enhancement · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **FORM-08 — Extensibility.** One registered implementation adds a genuinely new
  control type with rendering, validation and answer formatting. Unknown/incomplete
  controls cannot publish as working. “Any control” means this extensible contract.

  Work: Assess · Priority: First enhancement · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **FORM-09 — Follow-on controls [Later].** Rating, range, date range, repeaters and
  multi-step flows. Password/payment capture needs dedicated domain integrations,
  not ordinary stored form answers.

  Work: Deferred · Priority: Later · Baseline: Not yet assessed.
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

  Work: Assess · Priority: First enhancement · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-04 — Revision changes.** Define a bounded accepted-revision policy for
  in-flight visitors; a retired schema returns a recoverable form-changed message
  and preserves safe values for review instead of reinterpreting them silently.

  Work: Assess · Priority: First enhancement · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-05 — Uploads.** Type/size validation, scoped access, private storage
  where appropriate, lifecycle cleanup and separately authorized attachment reads.

  Work: Assess · Priority: First enhancement · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-06 — Spam and duplicate protection.** Server-side abuse controls/rate
  limits; duplicate-request handling and deduplicated notification delivery.

  Work: Assess · Priority: First enhancement · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-07 — Visitor feedback.** Labelled field errors and summary, focus first
  invalid field, pending state, success message and retry without unnecessary
  re-entry. Do not expose private data or uploads through public caches.

  Work: Assess · Priority: First enhancement · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-08 — Configurable notification mappings.** Approved recipients/handlers,
  optional field-selected reply-to and inbox title; team notifications and optional
  submitter confirmation. Submitted values never choose arbitrary recipients.

  Work: In progress · Priority: First enhancement · Baseline: Partial.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.
  Increment evidence: [dynamic-form history audit](dynamic-forms-implementation.md). Full feature acceptance remains incomplete.

- [ ] **SUBMIT-09 — Reliable delivery.** Persist valid submissions before sending
  notifications; retry failed notifications without losing/duplicating answers.
  Display delivery state separately from successful submission storage.

  Work: Assess · Priority: First enhancement · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-10 — Operational inbox.** Separately scoped access, owner, internal notes,
  New/In progress/Resolved/Spam states, follow-up and readable generic answers.
  Submitted answers remain distinct from mutable staff workflow metadata.

  Work: Assess · Priority: First enhancement · Baseline: Source present.
  Initial finding: Submission operations and queue hooks exist; recheck generic answers and separate row-level scope.
  Evidence: [src/collections/FormSubmissions.ts](../../src/collections/FormSubmissions.ts), [src/hooks/syncFormSubmissionToWorkQueue.ts](../../src/hooks/syncFormSubmissionToWorkQueue.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-11 — Exports/integrations.** Authorized export and webhook mappings use
  the submitted revision's field names; renames/removals preserve historical meaning.

  Work: Assess · Priority: First enhancement · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **SUBMIT-12 — Test mode.** Clearly labelled form testing without real notifications
  or ordinary production submissions; Storybook never calls production services.

  Work: Assess · Priority: First enhancement · Baseline: Not yet assessed.
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

  Work: Assess · Priority: Backlog · Baseline: Gap.
  Initial finding: Page create/update/readVersions currently use feature-wide grants; implement requested page-root/descendant constraints.
  Evidence: [src/collections/Pages.ts](../../src/collections/Pages.ts), [src/access/featureAccess.ts](../../src/access/featureAccess.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACCESS-03 — Manager autonomy.** Within scope, create pages, add/configure/
  reorder blocks, save, preview and publish directly. No designer-only structural
  privilege or mandatory Admin/Publisher approval.

  Work: Assess · Priority: Backlog · Baseline: Partial.
  Initial finding: Feature-granted Page writes exist; check scoped autonomy and existing publication issue/approval policy.
  Evidence: [src/collections/Pages.ts](../../src/collections/Pages.ts), [src/access/featureAccess.ts](../../src/access/featureAccess.ts).
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACCESS-04 — Inheritance and moves.** New descendants inherit the authorized
  parent scope. New roots, scope reassignment and cross-scope moves are Admin-only
  by default. Slug changes cannot expand permissions.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACCESS-05 — Shared resources.** Users, grants, integrations, site settings and
  global header/footer default to Admin-only. Managers may select approved shared
  published resources without gaining permission to mutate their originals.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACCESS-06 — Separate resource permissions.** Scoped media upload/use, protected
  shared-asset replacement/deletion, collection publication and form-inbox access
  independent from permission to place a Form block.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACCESS-07 — Every entry point.** Enforce scope for Payload Admin, REST, enabled
  GraphQL, user-acting Local API, preview/history/restore, upload, jobs and any future
  import route. Hidden navigation is not access control.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACCESS-08 — Grant changes.** Managers cannot self-assign scope. Revocation
  applies to subsequent saves, publication, restore and scheduled execution.

  Work: Assess · Priority: Backlog · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ACCESS-09 — Permission diagnostics [Recommended].** Effective-access summary
  for Admin; manageable sections and scoped tasks for Managers. Relationship pickers,
  counts and impact summaries must not expose private out-of-scope records.

  Work: Assess · Priority: Candidate · Baseline: Not yet assessed.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

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

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-02 — Safe prerequisite diagnostics.** Non-mutating runtime/database/storage/preview checks report readiness, affected task and actionable fix without displaying secrets. Assess existing validation before adding tooling.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-03 — Build versus launch readiness.** Separate authoring prerequisites from production launch checks. Optional email/analytics/domain work does not block local drafts; existing production constraints remain enforced.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-04 — First Admin orientation.** Explain first-account ownership and show a short next-action area leading to a real first draft. No automatic publication or lengthy mandatory walkthrough.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-05 — Minimal site setup.** Use valid existing defaults; let an Admin set identity, theme and timezone with concise explanations. Advanced production settings remain separate and current values are preserved.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-06 — First-page journey.** Guide title → blank page or recipe → native block edit → save draft → authenticated preview → explicit publish when intended. Preserve native drawer and existing edit behavior.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-07 — Understandable recipes.** Starting points explain intended use and included sections with accurate previews where available. Keep blank creation and prevent misleading or unavailable block promises.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-08 — Safe example content.** Optional examples are clearly marked drafts, explicitly requested, idempotent and removable without deleting real records. Never overwrite existing content or silently seed production.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-09 — Progress based on facts.** Derive readiness/completion from current server facts where measurable. Personal skip/dismiss preferences never imply healthy infrastructure, correct grants or published content.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-10 — Skip, resume and replay.** Users can dismiss optional guidance, resume relevant incomplete tasks and reopen help. Returning users do not repeat onboarding; deleted/moved/restricted records resolve safely.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Not yet assessed.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-11 — Role-aware starting point.** Admin sees useful full-access actions; Manager sees allowed features and eventual sections. Developer setup is not a third role and onboarding never grants access.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-12 — Manager access explanation.** Summarize actual create/edit/publish permissions and assigned scope in plain language. Direct links and server operations revalidate scope; read-only dependencies are labelled.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

- [ ] **ONBOARD-13 — No-assignment recovery.** An active Manager with no grants sees an explanation, configured Admin contact route and retry action. No dead create links, hidden-record disclosure or automatic escalation.

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

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

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

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

  Work: Assess · Priority: Cross-cutting / Handoff · Baseline: Partial.
  Acceptance/source map: [Admin UX plan](admin-onboarding-ux.md). Baselines are source inspection only; runtime and user acceptance remain unverified.
  Owner: — · Commit/PR: — · Verified on: — · Acceptance/test evidence: —.

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
retention and backup objectives, supported runtime breakpoints, generic collection
expansion, source-license suitability and release timing. These do not block
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

| 2026-10-07 | DF-03/09; FORM-02; DEV-01/03 | In progress | Codex | Contact6 sourced via authenticated CLI, reusable Form relationship, same generic validation/intake, editable contact cards/hours, shared website theme and disabled preview. Source layout keeps the first two short questions side by side on wider screens; all other questions remain ordered/full-width. One canonical Storybook entry. SSR controls stay disabled until hydration; HTML fallback is POST so early clicks cannot place answers in URLs. | [PR #19](https://github.com/tanishraj/payload-cms-starter-kit/pull/19) | Both native authoring/publication/custom-name submission/draft isolation/disabled-preview journeys pass locally on Payload 3.90.2 (1.1m), after correcting create-slug ordering and guarding hydration. Twenty-nine form checks, TypeScript, changed-file lint and final Storybook build pass; final full CI pending. Browser confirms custom-name submission and 390px wrapping. Website preview and Neutral dark scan have no WCAG A/AA violations; upstream Neutral light muted-text contrast remains a documented workshop finding, not a changed site palette. Newly published Payload/Sharp high/critical advisories block the merge gate; isolated prerequisite branch `fix/payload-sharp-security-patches` will patch them. The existing Braces exception is unchanged. No environment variables or data migration. |
| 2026-10-07 | Dependency prerequisite for Contact6 | In progress | Codex | New Payload/Sharp high/critical advisories patch the aligned Payload family to 3.90.2 and Sharp to 0.35.5; retarget the existing scoped Undici patch because upstream pins 7.29.0. TOTP replay acceptance reuses the exact enrollment code across a clock boundary. Preserve title-derived creation URLs before required validation under Payload 3.90; initialize disposable governance models before transaction writes and inspect real collapse/readiness state. | [PR #20](https://github.com/tanishraj/payload-cms-starter-kit/pull/20) | [Upgrade review](../operations/dependency-audit-remediation-2026-10-07.md). Audit, TypeScript/lint/generated artifacts and 71 initial focused checks pass. Initial Quality exposed native slug validation and governance fixture/readiness failures; compatibility corrections and 21 real MongoDB/API/slug/navigation/fixture checks pass. Final full Quality is pending. Braces approval unchanged; no new environment setting or live data migration. |
