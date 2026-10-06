# Archived feature scope — Payload-native editing

Archived into payload-cms-starter-kit on 6 October 2026 (Asia/Dubai).
Source: Forma `idea/13-payload-native-feature-scope.md`, recorded 3 October 2026.
Source SHA-256: `cfe30b69fb9d9e29120a0b9c91a016480af136ba2c29336108d7a47bff1eb183`.

[The implementation checklist](feature-implementation-checklist.md) owns current
progress and decisions. This reference preserves the original complete inventory,
not runtime status. Its formerly unresolved repository decision is superseded:
implementation now happens in this starter. MongoDB remains the current supported
baseline. Historical Forma architecture/sequence references below do not mandate
porting its PostgreSQL or separate visual editor. Original local citations are
recorded as historical file names rather than unresolved links.

Date: 3 October 2026 (Asia/Dubai).

Status: consolidated requirements and scope decision, not an implementation-completion report.

## 1. Current decision and reading guide

The user has decided to keep Payload's existing administration and block-editing
system and **not implement Forma's separate visual editor**. The remaining Forma
website capabilities are retained below. The reuse direction is to build on
`payload-cms-starter-kit`, rather than recreate its existing website functionality.

Pages are still assembled from configurable blocks. Editors use Payload
collections, fields, relationships, native block controls, drafts, versions and
Live Preview. Forms are configured through Payload as well. A custom canvas,
layers panel or inspector is not a dependency for any retained feature.

This decision supersedes conflicting visual-editor requirements in `00`–`12`,
the old implementation sequence and the prototype described in
ADR 004 (`../docs/adr/004-visual-editor-preview.md` in the original Forma plan). The two-role requirements in
`10` and dynamic-form/Storybook requirements in `12` remain, with their editing
interactions adapted to Payload. Older plans remain historical source material.

This is a documentation change only. No application code, route, data, branch,
database or sibling-repository file is removed, migrated or replaced. Existing
Forma prototype code is preserved; its eventual retirement/reuse is separate work.

### Scope labels

| Label | Meaning |
| --- | --- |
| Retained | A requested or established Forma capability, adapted to Payload where needed. Not a claim that it is implemented or that every item ships in the first release. |
| Recommended | Previously proposed improvement, kept visible without silently making it mandatory launch scope. |
| Later | Previously deferred or explicitly follow-on work. |
| Excluded | Superseded requirement or functionality outside the selected product. |
| Decision needed | A technical or rollout choice that the editor decision does not settle. |

Items in sections 3–24 are **Retained** unless labelled otherwise. Stable IDs
identify feature groups for a later starter-kit gap assessment. Do not infer
completion from a checked-in schema, README claim or an existing test file.

## 2. Product boundaries

- **CORE-01 — Reusable website platform.** Create different content-driven
  websites from shared components, blocks and content models; one site per
  deployment for the initial product.
- **CORE-02 — Existing stack.** Next.js, Payload, Tailwind, shadcn/ui and theming,
  Storybook, and CVA where useful. Reuse working starter capabilities first.
- **CORE-03 — Structured content.** Persist typed page/block/form data, references
  and configuration; do not save arbitrary generated HTML as the page model.
- **CORE-04 — Content ownership.** Pages own composition; collections own records;
  globals own site-wide defaults; reusable content owns explicitly shared items.
- **CORE-05 — Generic core.** Institutional examples such as faculty, departments
  and insurers are optional collection configurations, not hardcoded platform rules.
- **CORE-06 — Reference-only SNMIH.** Demonstrate comparable website capabilities
  using original sample content. No SNMIH migration, replica, branding/content copy,
  admissions policy or clinical system is requested.
- **CORE-07 — Consistent rendering.** Storybook, Payload Live Preview and the public
  website use the same production presentation components and compatible data.
- **CORE-08 — Reuse before replacement.** Keep functioning starter features and
  their tests; implement verified gaps. This inventory is not a direction to
  rebuild its block catalogue, authentication, forms or deployment tooling.

## 3. Payload administration and page composition

- **PAGE-01 — Page records.** Title, slug/path, parent section, ordered layout,
  SEO, draft/publication status, revision/history metadata, search configuration
  and permitted overrides.
- **PAGE-02 — Blank-page creation.** Create a page with a title and authorized
  parent; suggest an editable slug, validate collisions and open its Payload edit
  screen. Only Admins create/assign new top-level scopes.
- **PAGE-03 — Block operations.** Add approved blocks, edit fields, reorder,
  duplicate, remove, give meaningful internal names, and configure supported
  visibility. Use native Payload controls; provide accessible alternatives where
  a required operation otherwise depends only on dragging.
- **PAGE-04 — Block discovery.** Understandable block names, descriptions,
  categories, search and preview thumbnails in the Payload selection experience
  as the catalogue grows. A separate block-library sidebar is excluded.
- **PAGE-05 — Page discovery.** Search/filter manageable pages by title, location,
  publication state and owner where applicable; show section context and breadcrumbs.
- **PAGE-06 — Duplication.** Duplicate pages/sections as drafts with fresh IDs,
  safe slugs and non-colliding anchors. Recheck references and destination scope.
- **PAGE-07 — Hierarchical URLs and moves.** Maintain parent/child relationships;
  deliberate slug/move changes update affected paths and redirects without changing
  permission grants accidentally. Cross-scope moves are Admin-controlled.
- **PAGE-08 — Clear fields.** Required markers, contextual help, sensible defaults,
  relevant conditional fields, inline errors and a navigable validation summary.
  Expose content first; group advanced settings through Payload's existing patterns.
- **PAGE-09 — Relationships.** Search/select pages, collection records, assets and
  reusable content by meaningful labels rather than manually entering IDs or URLs.
- **PAGE-10 — Optional productivity [Recommended].** Two or three editable starting
  layouts with Blank always available; safe cross-page block copy/paste; an
  access-filtered admin command palette. Favorites/recent blocks remain lower priority.

## 4. Block catalogue, layout and supported configuration

- **BLOCK-01 — Representative base catalogue.** Hero, Rich Content, Image + Content,
  Stats/Features and CTA. These are coverage examples, not a reason to discard the
  starter's larger working catalogue or rebuild equivalent blocks.
- **BLOCK-02 — Previously outlined variants.** Hero: centered, split, background
  image, minimal. Rich Content: default, two-column, narrow. Image + Content:
  left/right/above. Stats: grid/inline/cards. CTA: banner/boxed/split. Map to licensed,
  supported existing components before adding a new variant.
- **BLOCK-03 — Extended catalogue.** Accordion/FAQ, Tabs, Testimonials, Logo Cloud,
  Team/People Grid, Timeline, Pricing Table, generic Form, Map and Video. Gallery,
  document listings, announcements and data listings support the reference-site
  capability proof. Expansion is phased after the common lifecycle works.
- **BLOCK-04 — Typed props.** Supported content, media, actions, behavior, variant,
  shape, size, alignment, spacing, background, width and responsive options.
  Exposed controls must change real behavior; no nonfunctional configuration knobs.
- **BLOCK-05 — Controlled sections.** Full/container/narrow widths, padding, gap,
  columns, stacking, alignment, backgrounds and visibility as supported settings.
  Where nested composition is needed, use Section-owned named slots such as
  main/sidebar containing terminal blocks; no arbitrarily recursive Sections.
- **BLOCK-06 — Structural constraints.** Allowed parent/child types, root-only
  blocks, depth limits and maximum instances. Validate in Payload and server-side,
  with useful reasons instead of silently dropping invalid content.
- **BLOCK-07 — Stable identity.** Preserve block IDs during ordinary edits,
  reorder and history restoration; distinguish IDs from user-visible anchor names.
  Copying creates new IDs and resolves anchor collisions.
- **BLOCK-08 — Missing/unknown content.** Preserve unrecognized block data, report
  unsupported types/versions and block unsafe publication. Provide safe public
  fallbacks and actionable admin errors.
- **BLOCK-09 — Common states.** Empty, loading, failed, long-content and missing-media
  states; predictable output when a referenced record becomes unavailable.
- **BLOCK-10 — Provenance.** Record component/block sources and licenses. Pro source
  access does not itself establish reuse rights for every deployment/distribution
  model; verify the intended use before importing assets.

## 5. Design system, themes and responsive behavior

- **DESIGN-01 — Semantic tokens.** Background/foreground, primary/secondary/accent,
  muted, border, success/warning/destructive, card/input/button appearance, spacing,
  container widths, typography, radius, shadows, density and stacking layers.
- **DESIGN-02 — Theme presets.** Approximately two or three complete presets to
  prove theme reuse, including light/dark values. Preserve the selected official
  shadcn foundation; additional presets are deliberate additions, not an automatic
  replacement of the starter's current appearance.
- **DESIGN-03 — Sparse overrides.** Payload settings select a preset and store only
  changed tokens. Reset to Default removes an override; untouched values continue
  to inherit future preset changes. Preview representative output before publication.
- **DESIGN-04 — Color modes.** Light, dark, system preference and optional visitor
  toggle; supported section-level theme scope; avoid a flash of the wrong theme.
- **DESIGN-05 — Typography.** Curated heading/body font choices and semantic scales;
  load only selected families/weights, with self-hosting where appropriate. Changing
  an approved selection through the CMS should not require site-specific code.
- **DESIGN-06 — Responsive options.** Supported per-breakpoint columns, stacking,
  spacing, gap, alignment, direction, width and visibility. Distinguish inherited
  values from explicit overrides; offer Reset/Use inherited value.
- **DESIGN-07 — Configurable breakpoints [Decision needed].** Retain the requested
  site-level breakpoint capability and impact preview. The earlier implementation
  proposal generates bounded CSS; fixed V1 breakpoints are an explicit fallback,
  not an unnoticed downgrade. Reassess against the starter's upstream layouts.
- **DESIGN-08 — Capability settings.** Admins enable supported component options
  and choose defaults globally. Disabled choices disappear from new configuration;
  previously saved values remain renderable and receive a migration/warning policy.
- **DESIGN-09 — Safe styling.** Editors choose supported semantic options, not
  arbitrary CSS, Tailwind classes, executable expressions or untrusted HTML.
- **DESIGN-10 — Shared primitives.** Button, Link/Action, Icon, Media/Image, File,
  Heading, Rich Text, List, Container, Grid and form controls. Improve common
  behavior once and reuse it throughout the block catalogue.
- **DESIGN-11 — Button capabilities.** Text, icon-only and text-plus-icon; icon
  position; approved appearances/sizes and shapes. Square/rounded/pill/circle/
  angled/hexagon were outlined candidate shapes, not a requirement to fabricate
  unsupported upstream variants. Icon-only controls need accessible labels.
- **DESIGN-12 — Heading capabilities.** Semantic level independent of visual size,
  alignment, automatic wrapping, structured controlled breaks by breakpoint and
  accent segments, retaining readable accessible text.

## 6. Shared actions, links and downloads

- **ACTION-01 — Typed destinations.** Internal pages, routable collection records,
  external URLs, same/cross-page anchors, files, email and phone.
- **ACTION-02 — Presentation independent of destination.** Text link, button,
  icon button and text-plus-icon button; block-specific allowed action types/counts.
- **ACTION-03 — Behavior.** Same/new tab, file view/download, supported mail subject
  and phone normalization. Show only relevant Payload configuration fields.
- **ACTION-04 — Central safety.** Safe schemes, escaped values, appropriate link
  relations and real link/button semantics; no duplicated ad hoc URL handling.
- **ACTION-05 — Reference integrity.** Resolve internal paths from stable record
  references; validate deleted/unpublished targets and invalid anchors. Provide
  explicit fallback behavior and permission-safe relationship choices.

## 7. Content collections, dynamic listings and detail pages

- **CONTENT-01 — Reusable structured content.** Articles, News/Events, People,
  Departments, Courses, Documents, Categories/Tags and Announcements as enabled
  for a site. Institution-specific labels/adapters remain optional.
- **CONTENT-02 — Reference-site extensions.** Grouped departments and related people;
  insurer/partner logo records; categorized public-disclosure documents by session/
  year, effective date, review date and current/historical status.
- **CONTENT-03 — Stable adapters.** Resolve CMS records into typed presentation
  models with sensible defaults; collection-schema changes should not require
  rewriting every block. Batch/deduplicate compatible reads per request.
- **CONTENT-04 — Configurable listings.** Approved source, item count, selected
  records or query, category/type/date/featured filters, ordering and field toggles
  for image/date/excerpt/author/category. Cards/list/featured/carousel presentations
  and responsive columns where supported.
- **CONTENT-05 — Pagination and states.** None, load-more or crawlable paged URLs;
  useful empty/error/loading output rather than blank sections.
- **CONTENT-06 — Dynamic detail routes.** Published records get routes without
  separately authoring a Page per record; shared detail layouts, related content,
  metadata and authenticated draft/sample-record preview.
- **CONTENT-07 — Typed bindings.** Select approved content fields with compatible
  value types and fallbacks through Payload configuration. No `{{expression}}`
  execution or arbitrary JavaScript. Support title/image/body/author/date/related
  data as appropriate to the source.
- **CONTENT-08 — Public filters/tabs.** URL-synchronized category/search state,
  bookmarkable links, back/forward restoration and accessible keyboard behavior.
- **CONTENT-09 — Page-level search.** Small-list local filtering and large-list
  server search/pagination, configurable threshold, debounce, query state and
  announced result counts. The earlier proposed threshold was 200 items.
- **CONTENT-10 — Date-aware content.** Events expose start/end dates; distinguish
  upcoming/past events. News/notices can carry publication/expiry windows; time
  boundaries must also update cached output.

## 8. Globals, inheritance, navigation and reusable content

- **GLOBAL-01 — Site settings.** Branding, light/dark logos, favicon/social/app
  icons, appearance, fonts, responsive settings, SEO defaults, social links,
  integrations, search and timezone.
- **GLOBAL-02 — Header/footer/navigation.** Edit through Payload globals/collections;
  supported two-level dropdowns, mega-menu and mobile drawer with keyboard/focus
  handling. Navigation is site structure, not copied into every Page.
- **GLOBAL-03 — Inheritance.** Site/global → section/content-type → page → block/
  local overrides. Store differences and show which values are inherited.
- **GLOBAL-04 — Explicit header modes.** Global, Global with overrides, Full
  override, Alternate header and No header; permit CTA-only overrides while logo
  and navigation remain inherited. Apply the supported model consistently to
  footer, navigation, theme, SEO and component defaults.
- **GLOBAL-05 — Deterministic resolution.** Define object merging, array replacement,
  explicit clearing and inheritance separately; Reset restores inheritance.
- **GLOBAL-06 — Reusable content.** Shared CTA, contact information, notices,
  disclaimers and sections; explicit reference versus copy, permitted field
  overrides and a clear route to edit the shared original.
- **GLOBAL-07 — Shared publication.** Shared items/settings have drafts and explicit
  publication. Draft changes do not change live pages; show affected pages and
  representative previews before publishing. Enforce separate shared-edit permissions.
- **GLOBAL-08 — Dependency safety.** Where-used lists, cycle detection and blocked
  deletion of referenced items. Invalidate affected pages when shared content changes.
- **GLOBAL-09 — History boundary.** Page restore restores page-owned data/references.
  References resolve to current published shared entities; historical previews
  disclose that limit. Exact whole-site historical snapshots are later work.

## 9. Dynamic forms — authoring and control catalogue

- **FORM-01 — Payload form authoring.** Create a reusable form, add/reorder/group
  controls, configure fields and presentation, preview and publish through Payload.
  A Page Form block selects a form; authorized users can create/edit that related
  form and return to the page. No separate visual form editor is required.
- **FORM-02 — Configurable fields.** Adding a supported control with a custom
  label/name works without a new collection column, endpoint, hand-coded renderer
  or email template. Do not require fields literally named `name`, `email` or `message`.
- **FORM-03 — Initial control catalogue.** Text, multiline text, email, phone, URL,
  number, single select, multi-select, radio group, checkbox, checkbox group,
  switch, date, time, file upload and submit button.
- **FORM-04 — Layout entries.** Headings, descriptions, separators and field groups;
  supported width, spacing, size, shape, variant and responsive presentation.
- **FORM-05 — Identity and configuration.** Stable field ID separate from editable
  label/name/order; help text, placeholder, default, required state and type-specific
  length/range/file constraints. Choice options have stable IDs/values and labels.
- **FORM-06 — Safe keys.** Unique documented field-name rules, reserved-name checks,
  multilingual labels and useful inline errors. Relabelling never changes the key;
  renaming a published key warns about exports/integrations.
- **FORM-07 — Conditions.** Declarative show/require rules reference stable field
  IDs; client and server agree. No executable configuration.
- **FORM-08 — Extensibility.** One registered implementation adds a genuinely new
  control type with rendering, validation and answer formatting. Unknown/incomplete
  controls cannot publish as working. “Any control” means this extensible contract.
- **FORM-09 — Follow-on controls [Later].** Rating, range, date range, repeaters and
  multi-step flows. Password/payment capture needs dedicated domain integrations,
  not ordinary stored form answers.

## 10. Form intake, submissions and notifications

- **SUBMIT-01 — Versioned definitions.** Store ordered fields/groups, presentation
  and submission configuration against a published form revision. Form drafts
  must not alter live forms.
- **SUBMIT-02 — Historical answers.** Submissions reference the exact published
  revision and retain field-label/key metadata or an immutable schema snapshot.
  Store typed answers by stable field ID; display/export with submitted labels/names.
- **SUBMIT-03 — Generic server validation.** Load an allowed published revision;
  validate types, required rules, conditions, options and request/value sizes;
  reject unknown fields. Hidden inactive answers are omitted; a required checkbox
  must be checked, not simply present.
- **SUBMIT-04 — Revision changes.** Define a bounded accepted-revision policy for
  in-flight visitors; a retired schema returns a recoverable form-changed message
  and preserves safe values for review instead of reinterpreting them silently.
- **SUBMIT-05 — Uploads.** Type/size validation, scoped access, private storage
  where appropriate, lifecycle cleanup and separately authorized attachment reads.
- **SUBMIT-06 — Spam and duplicate protection.** Server-side abuse controls/rate
  limits; duplicate-request handling and deduplicated notification delivery.
- **SUBMIT-07 — Visitor feedback.** Labelled field errors and summary, focus first
  invalid field, pending state, success message and retry without unnecessary
  re-entry. Do not expose private data or uploads through public caches.
- **SUBMIT-08 — Configurable notification mappings.** Approved recipients/handlers,
  optional field-selected reply-to and inbox title; team notifications and optional
  submitter confirmation. Submitted values never choose arbitrary recipients.
- **SUBMIT-09 — Reliable delivery.** Persist valid submissions before sending
  notifications; retry failed notifications without losing/duplicating answers.
  Display delivery state separately from successful submission storage.
- **SUBMIT-10 — Operational inbox.** Separately scoped access, owner, internal notes,
  New/In progress/Resolved/Spam states, follow-up and readable generic answers.
  Submitted answers remain distinct from mutable staff workflow metadata.
- **SUBMIT-11 — Exports/integrations.** Authorized export and webhook mappings use
  the submitted revision's field names; renames/removals preserve historical meaning.
- **SUBMIT-12 — Test mode.** Clearly labelled form testing without real notifications
  or ordinary production submissions; Storybook never calls production services.

## 11. Accounts, roles and scoped permissions

- **ACCESS-01 — Two role types.** Admin and Site Manager, with any number of
  accounts. Admin has full access and can create either role. Preserve at least
  one active Admin; no public privilege escalation.
- **ACCESS-02 — Section grants.** Assign stable page-root IDs and descendants,
  plus separate collection/record scopes. Multiple grants combine additively;
  deny outside assigned scope. Do not authorize by URL prefix alone.
- **ACCESS-03 — Manager autonomy.** Within scope, create pages, add/configure/
  reorder blocks, save, preview and publish directly. No designer-only structural
  privilege or mandatory Admin/Publisher approval.
- **ACCESS-04 — Inheritance and moves.** New descendants inherit the authorized
  parent scope. New roots, scope reassignment and cross-scope moves are Admin-only
  by default. Slug changes cannot expand permissions.
- **ACCESS-05 — Shared resources.** Users, grants, integrations, site settings and
  global header/footer default to Admin-only. Managers may select approved shared
  published resources without gaining permission to mutate their originals.
- **ACCESS-06 — Separate resource permissions.** Scoped media upload/use, protected
  shared-asset replacement/deletion, collection publication and form-inbox access
  independent from permission to place a Form block.
- **ACCESS-07 — Every entry point.** Enforce scope for Payload Admin, REST, enabled
  GraphQL, user-acting Local API, preview/history/restore, upload, jobs and any future
  import route. Hidden navigation is not access control.
- **ACCESS-08 — Grant changes.** Managers cannot self-assign scope. Revocation
  applies to subsequent saves, publication, restore and scheduled execution.
- **ACCESS-09 — Permission diagnostics [Recommended].** Effective-access summary
  for Admin; manageable sections and scoped tasks for Managers. Relationship pickers,
  counts and impact summaries must not expose private out-of-scope records.

## 12. Drafts, autosave, conflicts, publication and history

- **PUBLISH-01 — Native lifecycle.** Use Payload drafts, autosave, explicit Save
  Draft, preview, publish and unpublish; configure/verify them instead of building
  a second editor persistence or version-history system.
- **PUBLISH-02 — Honest state.** Distinguish unsaved/saving/saved/failed drafts from
  the published revision. Failed saves retain current input and offer retry;
  session expiry and permission revocation must not silently discard work.
- **PUBLISH-03 — Conflict safety.** Document locking plus expected-revision checks
  on writes; stale updates cannot silently overwrite newer content. Explain conflicts
  and provide permitted compare/reload/copy recovery through Payload integration.
- **PUBLISH-04 — Recovery boundary.** Retain the no-silent-data-loss objective and
  unsaved-navigation warnings. Durable browser/offline recovery is a recommendation
  to evaluate after native autosave; do not claim it exists by using Payload. No
  standalone canvas history engine, patch protocol or offline editor is required.
- **PUBLISH-05 — Self-check.** Review intended changes, blocking issues, warnings
  and publish scope before publishing the exact current saved revision. This is
  the authorized editor's self-check, not another person's approval gate.
- **PUBLISH-06 — Authoritative validation.** Required fields, schema/structure,
  unknown blocks, invalid actions and dangling required references block publication.
  SEO gaps, image weight, headings, contrast and embed counts produce targeted
  guidance; severity policies are explicit and tested server-side across APIs.
- **PUBLISH-07 — Coordinated commit.** Persist content/layout/SEO/references and
  native version identity consistently within Payload's transaction context.
  Do not add a competing version table or bypass access through custom endpoints.
- **PUBLISH-08 — Delivery after commit.** Cache invalidation, external search and
  notifications use retryable jobs/outbox where needed. Require idempotency,
  deduplication, leases, ordering, backoff and visible dead-letter failures.
- **PUBLISH-09 — Accurate live status.** Separate database publication from pending/
  failed downstream delivery; retry delivery without asking editors to republish.
- **PUBLISH-10 — History and diff.** Author, timestamp, revision, change summary,
  added/removed/modified blocks and access-controlled historical preview. Set an
  explicit published-version/autosave retention policy.
- **PUBLISH-11 — Restore as draft.** Preserve history, record the restored source,
  review differences and create a new draft. Explicit publish follows; restore
  does not silently publish or rewind global/shared dependencies.
- **PUBLISH-12 — Unpublish.** Warn about affected links/references, remove public
  delivery/search entries, invalidate caches and retain an audit record. Do not
  suppress native history merely to satisfy an obsolete plan rule.
- **PUBLISH-13 — Scheduling.** Publication/expiry jobs with explicit site timezone,
  status, cancellation and authorization recheck; test missed/retried jobs and
  invalidation at start/end boundaries.

## 13. Preview and editing quality without a custom editor

- **PREVIEW-01 — Payload Live Preview.** Preview configured content using the real
  block presentation; client-side updates where supported and refresh-on-save for
  resolved server data. Verify the behavior instead of assuming all blocks update
  identically. Retain preview-before-publication without a separate Forma canvas.
- **PREVIEW-02 — Responsive proof.** Desktop/tablet/mobile previews plus intermediate
  widths in supported preview/browser tooling; verify actual responsive layout.
- **PREVIEW-03 — Protection.** Authenticated scoped draft/historical reads; any
  shareable preview token must be scoped, expiring and deliberately authorized.
  Preview content is private/no-store/noindex and never leaks through public APIs.
- **PREVIEW-04 — Rendering boundaries.** Keep site theme separate from Payload
  chrome; no secrets/server-only modules in preview browser bundles. Validate
  integrations and frame policy under production security headers.
- **PREVIEW-05 — Shared changes.** Preview sample affected pages for theme,
  navigation, reusable-content and form updates before their own publication.
- **PREVIEW-06 — Usability [Recommended gate].** Test nontechnical editors creating
  a page, adding/reordering a block, editing a responsive setting, using a dynamic
  form, recovering from save failure, publishing and restoring through Payload.
  Include keyboard-only use; measure outcomes rather than assuming native UI solves all UX.

## 14. Media, documents and image delivery

- **MEDIA-01 — Managed assets.** Approved JPEG/PNG/WebP/AVIF/SVG images and PDF/
  DOC/DOCX/XLS/XLSX documents, subject to a validated per-type upload policy.
- **MEDIA-02 — Metadata.** Title, alt/decorative intent, caption, filename, type,
  dimensions, size, category/folder, focal point/crop and accessibility metadata.
- **MEDIA-03 — Library workflow.** Search, filters, folders/collections, authorized
  bulk operations, focal-point crop preview and bulk alt-text maintenance.
- **MEDIA-04 — Safe replacement.** Current/historical where-used tracking, replacement
  previews and reference checks; protect assets needed for historical restoration.
  Soft deletion/retention with deliberate permanent-purge policy.
- **MEDIA-05 — Document lifecycle.** Stable landing URLs with a current download,
  historical files, category/session/year, owner/effective/review dates and status.
  Replacing a prospectus should not break existing links.
- **MEDIA-06 — Object storage.** Metadata in Payload, durable files in the chosen
  storage provider; distinguish public site assets from private form attachments.
  Reconcile stored metadata with actual objects.
- **MEDIA-07 — Derivatives.** Background processing, use-case presets for logo/
  avatar/card/content/OG, useful widths/formats, retries and visible failed jobs;
  preserve originals and avoid generating every combination needlessly.
- **MEDIA-08 — Responsive delivery.** `srcset`/`sizes` reflect rendered block width;
  focal-point positioning, dimensions, placeholders, priority for appropriate
  above-fold media and lazy loading elsewhere. Avoid double-transforming derivatives.
- **MEDIA-09 — Asset integrity.** Content hashes/deduplication as an engineering
  approach, without conflating separate access policies or deleting historical assets.

## 15. SEO, URLs, redirects and structured metadata

- **SEO-01 — Page/record fields.** Title, description, canonical, OG title/
  description/image, social-card metadata and index/follow directives, with
  page → content-type → site fallbacks and dynamic-route support.
- **SEO-02 — Structured data.** Appropriate Organization, WebSite, Article/
  NewsArticle, Event, Person, Course and BreadcrumbList output from valid content;
  do not invent institutional claims merely to populate metadata.
- **SEO-03 — Sitemap/robots.** Include all eligible published records with pagination
  and an index when needed; exclude draft/noindex output; refresh on lifecycle
  changes and keep staging/private areas out of indexing.
- **SEO-04 — Social images.** Uploaded image overrides or generated branded/theme-aware
  image using title and configured fonts, cached and invalidated appropriately.
- **SEO-05 — Redirect manager.** Manual redirects, 301/302/307/308, enabled state,
  duplicate-source checks, loop/chain detection, destination validation and deliberate
  preserve/strip/exact-match query handling.
- **SEO-06 — Slug/move redirects.** Offer old-to-new redirects on published page,
  record or parent-path changes; include descendants and audit deliberate declines.
- **SEO-07 — Redirect CSV.** Retain outlined bulk redirect administration with dry
  run/diff, validation and permission checks. This is distinct from deferred
  website-content import or a SNMIH migration project.

## 16. Search and deep linking

- **SEARCH-01 — Global search.** Search published pages and enabled content/document
  collections, including declared meaningful block text, descriptions and categories.
  Exclude configuration noise, secrets, drafts and unauthorized records.
- **SEARCH-02 — Search service.** Provider-independent interface, appropriate
  ranking/field weighting, bounded queries and measurable performance. The old
  PostgreSQL FTS implementation is a database-dependent proposal, not yet the
  selected provider for the starter-based product.
- **SEARCH-03 — Index lifecycle.** Publish/update/unpublish/delete integration,
  resumable rebuilds, rich-text-to-text extraction and reliable external delivery
  if the index lives outside the content transaction.
- **SEARCH-04 — Public search UX.** Grouped result types/counts, escaped highlighted
  matches, useful empty states, keyboard/live-region support, a no-JavaScript GET
  fallback and noindex search results.
- **SEARCH-05 — Precise destinations.** Results can carry route, query state and
  anchor. Activate the right category/tab/pagination before scrolling/focusing;
  respect sticky headers and reduced motion. Fall back safely if the deep link
  cannot resolve. Keep meaningful anchors stable across routine edits.

## 17. Site-wide experiences, consent and integrations

- **SITE-01 — Global experiences.** Back to Top, announcement bar, campaign/
  celebration modal, emergency notice and cookie/consent interface.
- **SITE-02 — Shared configuration.** Enabled state, content/actions, supported
  styling/display mode, start/end times, all/include/exclude page targeting or
  collection targeting, and frequency rules where appropriate.
- **SITE-03 — Scheduling/frequency.** Always, per-session, per-user or every-N-days
  options where justified; expiry removes delivered content, not merely CSS
  visibility. Emergency notices may bypass ordinary frequency limits.
- **SITE-04 — Announcements.** Title, description, type, priority, time window,
  action and publication state; reusable in bars, notices pages and featured blocks.
- **SITE-05 — Rotation accessibility.** Configurable interval/transition, pause on
  hover/focus, manual controls, reduced motion and server-readable content.
- **SITE-06 — Modal accessibility.** Focus trapping/restoration, accessible naming,
  Escape and usable dismiss controls where dismissal is permitted.
- **SITE-07 — Consent.** Durable consent preferences control optional analytics/
  integrations; a cookie banner is not simply a frequency-limited announcement.
  Privacy/legal page content remains the site owner's responsibility.
- **SITE-08 — Central integrations.** Analytics, tag manager, maps and video through
  approved settings/providers; controlled loading and performance budgets. Restricted
  script requests require a dedicated Admin/security policy, not raw block injection.
- **SITE-09 — Lightweight embeds.** Facade/interaction loading for maps/video where
  appropriate, compatible with consent and security policy.
- **SITE-10 — System pages [Recommended].** CMS-configured 404, maintenance and
  coming-soon states with code-owned failure fallbacks, appropriate status codes
  and preserved authenticated admin access. Whole-site maintenance is Admin-only.

## 18. Content lifecycle, operations and portability

- **OPS-01 — Ownership.** Content owner, review date, reminders and explicit
  archive/unpublish policy. An overdue review does not silently unpublish content.
- **OPS-02 — Recoverable lifecycle.** Scoped unpublish/trash/restore for Managers;
  Admin-only permanent deletion. Show references/children first, block unsafe
  parent deletion and avoid silent cascades. Restore checks current scope and slug.
- **OPS-03 — Needs-attention queue [Recommended].** Failed publication/delivery,
  broken internal references, missing assets, overdue content and unanswered forms;
  reason, owner and a direct correction link. Deduplicate and resolve from source
  state. Unavailable counts must not appear as zero; informational tasks do not
  impose mandatory approval gates.
- **OPS-04 — Internal-reference checks [Recommended].** Permission-safe impact lists
  and validation of links/anchors. External website crawling remains later work.
- **OPS-05 — Portable export.** Versioned structured site/content export with media
  manifest, relationship identities and documented format. Protect secrets/private
  submissions and apply explicit export permissions.
- **OPS-06 — Import boundary [Later].** General content CSV/WordPress/source imports,
  mapping UI and migration connectors remain deferred until a real need. Safe
  database/block schema migrations and redirect CSV are separate retained features.
- **OPS-07 — Guides [Recommended].** Page-versus-collection/global/reusable-content
  modelling guide; contextual help, onboarding and operator handoff documentation.

## 19. Authentication, security and audit

- **SEC-01 — Account security.** Secure bootstrap/login/session/password-reset
  behavior and protection against privilege escalation across all APIs.
- **SEC-02 — TOTP MFA.** Enrollment with QR, confirmation before enablement,
  encrypted secrets, hashed single-use recovery codes, regeneration and audited
  recovery/reset. Enforcement policy uses Admin/Site Manager roles only.
- **SEC-03 — Complete MFA enforcement.** Rate limits, replay/session protection,
  bounded clock drift and recovery flows; evaluate maintained integrations and
  existing starter implementation before creating custom authentication.
- **SEC-04 — Input/uploads.** Server-side validation, actual MIME/type checks,
  allowed types and sizes, safe filenames/paths, SVG sanitization or rejection,
  safe rich-text output and appropriately isolated upload delivery.
- **SEC-05 — Abuse controls.** Auth, upload, search and form-intake rate limits
  suitable for the selected single/multi-instance hosting arrangement.
- **SEC-06 — Headers/CSP.** HSTS, content-type, referrer, permissions and frame
  protection; tested script policy for public pages, Payload admin and Live Preview.
  Reconcile nonce/dynamic-rendering requirements with public caching explicitly.
- **SEC-07 — Audit trail.** Publish/unpublish/restore/delete, roles/grants, MFA,
  settings, redirects and authentication events; actor, time, entity and safe
  before/after summary with appropriate request context. Append-only controls,
  filtered admin views/export and documented retention; never log credentials.
- **SEC-08 — Secrets/environment.** Every new variable documented in its owning
  `.env.example`, including purpose and production requirement; real credentials
  stay ignored or in deployment secrets and out of client bundles/build artifacts.
- **SEC-09 — Dependency policy [Recommended].** Security reporting process,
  dependency/license tracking, controlled updates, audits and upgrade verification.

## 20. Accessibility, localization readiness and public quality

- **QUALITY-01 — Accessibility target.** WCAG 2.2 AA for public output and retained
  admin customizations, tested manually and automatically.
- **QUALITY-02 — Interaction basics.** Semantic headings/landmarks, skip links,
  labels, meaningful link/button semantics, visible/unobscured focus, keyboard
  navigation and non-drag alternatives; no color/hover/icon-only communication.
- **QUALITY-03 — Content guardrails.** Alt/decorative intent, heading hierarchy,
  contrast, image dimensions, accessible carousels/forms/navigation and targeted
  remediation guidance. Automated checks alone do not prove compliance.
- **QUALITY-04 — Responsive/reduced motion.** Narrow-screen and intermediate-width
  layouts, 200% zoom/reflow, long content, text direction and reduced-motion behavior.
- **QUALITY-05 — Locale foundations.** Locale-aware output/query/cache identities,
  translation relationships, localized paths and fallbacks, approved localized
  fields and logical CSS/RTL fixtures. Initial content remains English; enabled
  languages and URL prefixes require a site-specific decision.
- **QUALITY-06 — Print [Recommended].** Useful print styles for content-heavy
  pages/documents, with navigation/overlays handled appropriately.

## 21. Performance, caching and failure isolation

- **PERF-01 — Server-first output.** Server rendering/data resolution with small
  client boundaries for real interaction; static block presentation should not
  require client JavaScript merely because another block is interactive.
- **PERF-02 — Data efficiency.** Request-level deduplication/batching, concurrent
  independent resolution, pagination, appropriate indexes and connection limits.
  Measure actual query counts rather than equating concurrency with fewer queries.
- **PERF-03 — Targeted caching.** Cache public pages/shared data/assets and invalidate
  affected documents, collections, paths and dependencies on lifecycle changes.
  Avoid routine full-site purges; draft/private data never shares public caches.
- **PERF-04 — Dependency coverage.** Record references on save/publish and account
  for dynamic queries/newly matching records; shared changes and scheduled start/
  end times invalidate all affected output, including external CDN delivery.
- **PERF-05 — Isolated failures.** Resolver/server-render failures and client
  rendering failures have explicit separate fallbacks/logging. One failing block
  should not unnecessarily remove the rest of a page.
- **PERF-06 — Page health.** Payload-accessible guidance for oversized media,
  missing dimensions, excessive blocks/embeds/fonts, estimated client weight and
  above-fold resources. Configurable advisory thresholds with links to the issue.
- **PERF-07 — Measured budgets.** JavaScript, media, fonts, scripts, queries, render
  performance and LCP/INP/CLS; CI gates on reproducible representative fixtures,
  plus real-user measurements where appropriate.
- **PERF-08 — Streaming.** Use supported streaming/loading boundaries for dynamic
  content without sacrificing useful server-rendered content or error handling.

## 22. Storybook and developer contracts

- **DEV-01 — Real components.** Stories import the production presentation used
  by Payload preview/public pages; no parallel story-only component implementations.
- **DEV-02 — Required stories.** Docs, Default and Playground for reusable
  components, blocks and form controls; meaningful variants and empty/loading/
  disabled/error/long-content states.
- **DEV-03 — Working controls.** Typed `args`/`argTypes` for supported content,
  behavior, appearance, shape, size, layout and responsive props. Stateful harnesses
  for controlled inputs, callback spies and labelled complex fixtures.
- **DEV-04 — Shared decorators.** Theme, light/dark and viewport tooling; resolver
  fixtures simulate data/failure states without production CMS/services or secrets.
- **DEV-05 — Mapping contracts.** Document which props are persisted Payload fields,
  derived resolver data or developer-only callbacks. CMS controls expose supported,
  permitted choices; Storybook is not an authorization bypass.
- **DEV-06 — Registration consistency.** Block/control metadata, defaults, validation,
  constraints, searchable text and supported capabilities stay aligned with Payload
  schemas, rendering and stories. Reuse typed definitions where useful.
- **DEV-07 — No unnecessary framework [Decision needed].** A full field-definition
  DSL/code generator was an earlier implementation proposal. Retain consistency
  goals but assess the starter's explicit registrations before mandating a new
  abstraction. Custom inspector generation is excluded.
- **DEV-08 — Import boundaries.** Browser-safe presentations/metadata separated
  from server resolvers and Payload configuration. Server-rendered wrappers are
  allowed; no blanket ban on all async files or ordinary application links.
- **DEV-09 — Scaffolding [Recommended].** Small generator for block/control schema,
  presentation, stories, fixtures, registration and relevant tests; golden-path
  guides for adding a block, collection, control and debugging preview.
- **DEV-10 — Tooling.** Typechecking, lint/format, exact compatible version policy,
  deterministic fixtures, architecture checks, CI and short ADRs for material choices.
  Package version/changelog tooling becomes relevant when multiple sites consume releases.

## 23. Schema evolution, testing and release evidence

- **VERIFY-01 — Versioned schemas.** Block/control schema version distinct from
  document revision; stable IDs and lossless Payload data mapping.
- **VERIFY-02 — Safe migrations.** Explicit sequential/idempotent upgrades,
  resumable backfills and diagnostics; expand/contract database evolution.
  Preserve fields/history until older content is safely supported.
- **VERIFY-03 — Deliberate proof.** Exercise a real block schema change against
  stored drafts, published data and historical restore before relying on migrations.
- **VERIFY-04 — Tests by boundary.** Unit tests for validation/actions/adapters/
  inheritance; component/Storybook interaction and accessibility tests; real-database
  integration; end-to-end page/form/publication/search/redirect/MFA workflows.
- **VERIFY-05 — Access regression tests.** Admin assignment and scoped Manager
  create/edit/publish, forged scope/parent changes, revoked grants, preview/history/
  submission/file access and direct API denials.
- **VERIFY-06 — Save/publish resilience.** Two-tab conflicts, pending/failed saves,
  draft isolation, shared publication, job retries/duplicates/order, restore-as-draft
  and server/resolver failures.
- **VERIFY-07 — Dynamic-form proof.** Custom field such as `preferred_department`
  renders, validates, stores, displays and exports without backend changes. Test
  reorder/relabel/rename/remove/type/option changes and historical submissions.
- **VERIFY-08 — Visual regression [Recommended].** Representative theme/viewport/
  state screenshots in Storybook; avoid indiscriminate combinatorial story expansion.
- **VERIFY-09 — Capability demonstration.** Original institutional homepage,
  department listing/detail, news/events, document library, gallery and dynamic
  enquiry form created through Payload. Managers publish their own sections and
  fail cross-scope requests. No SNMIH visual-fidelity criterion.
- **VERIFY-10 — Generic reuse check [Later].** A small corporate example reuses the
  same core without institutional terms becoming platform dependencies.
- **VERIFY-11 — Launch acceptance.** Staging, actual usability/accessibility results,
  backup restore and deployment rollback; no unresolved data-loss, unauthorized
  publication or draft-leak defects. Documentation is not completion evidence.

## 24. Deployment, email, observability and disaster recovery

- **RUN-01 — Local setup.** Reproducible app/database/media/email development
  environment with documented commands and production-relevant behavior. Preserve
  existing ignored environment files during setup.
- **RUN-02 — Runtime preflight [Recommended].** Validate database, canonical origin,
  secrets, storage, email and worker/scheduler configuration; Admin-only setup
  diagnostics and explicit service test actions, not only variable-presence checks.
- **RUN-03 — Transactional email.** Provider/SMTP boundary for password reset,
  security notices, form notifications and publish/delivery failures; templates,
  retry state and safe test environments.
- **RUN-04 — Background execution.** Deployed workers/scheduler for publication,
  expiry, delivery, derivatives, reminders and cleanup. Evaluate existing Payload
  Jobs before adding another queue service; preserve transaction/retry guarantees.
- **RUN-05 — Production delivery.** Reproducible container/build, durable storage,
  health-gated rollout, protected deployment secrets, safe migrations and tested
  rollback. Cloudflare/VPS/Coolify was Forma's proposed topology, not a newly
  confirmed replacement for the starter's supported hosting contract.
- **RUN-06 — Staging.** Production-like configuration, access protection/noindex,
  sanitized data, safe email targets and verification before promotion.
- **RUN-07 — Observability.** Structured correlated logs, error tracking/releases,
  traces for render/resolver/publish paths, private operational diagnostics and
  appropriately minimal health endpoints for database/storage/jobs/migrations.
- **RUN-08 — Alerts.** Public/admin uptime, failed publishes/delivery/uploads,
  dead-letter jobs, latency, database connectivity, disk/storage use and deployment
  health. Do not expose operational secrets in public checks.
- **RUN-09 — Backup.** Database and durable media protection independent of native
  version history; off-host backups, retention, object versioning and documented
  recovery objectives. Point-in-time recovery where supported by the chosen database.
- **RUN-10 — Restore drill.** Restore into an isolated environment, verify records,
  assets, authentication and rendered output; document recovery time/data-loss
  objectives and repeat the drill. Backups on the same failed server are insufficient.
- **RUN-11 — Operational documentation.** Deployment, rollback, disaster recovery,
  secret rotation, upgrade policy and developer/operator handoff.

## 25. Previously proposed numerical targets — retain for review, not promises

These targets came from `04`, `05`, `06` and `08`. They need reproducible fixtures,
hardware/network assumptions and starter-baseline measurements before adoption.
They are not claims of achieved performance or automatic launch commitments.

| Area | Earlier proposal |
| --- | --- |
| Themes/fonts | About 2–3 themes; curated font proposal of 8 families with limited weights. |
| Theme/responsive CSS | Theme CSS under 4 KB; generated breakpoint CSS under 8 KB gzip, with a 15 KB fallback gate. |
| Page guidance | Warn above 30 blocks, more than 2 third-party embeds, or an above-fold original image over 2 MB; configure thresholds. |
| SEO guidance | Description-length guidance of 50–160 characters; contextual warning, not an SEO guarantee. |
| Search/filtering | Local filtering threshold 200 items; search benchmark under 100 ms at 50,000 rows. |
| Delivery | Scheduled publication within 60 seconds; example outbox policy of 5 attempts then dead-letter. |
| History | Keep published versions; example pruning of autosave drafts older than 30 days, subject to retention/storage policy. |
| Rendering | At most 6 database round trips on the seeded dynamic page; 50-RPS pool/load proof. |
| Cache/redirects | At most 10 invalidation tags on a seeded publication; 5,000 cached redirects with under 1 ms matching overhead. |
| Media | Example mobile card image at most 60 KB; 1200×630 generated OG image; 10 MB upload proof without synchronous heavy processing. |
| Public web quality | Mobile Lighthouse performance ≥90, accessibility 100, best practices/SEO ≥95; LCP ≤2 s, CLS ≤0.05, INP ≤200 ms with appropriate measurement. |
| Accessibility tests | Zero detected axe violations on tested stories, plus manual checks; not a proof of universal accessibility. |
| Availability | Proposed availability ≥99.5%, p95 TTFB ≤400 ms and publish success ≥99.9%. |
| MFA | Example 10 recovery codes, 5 attempts/15 minutes and ±1 TOTP window; threat-model and test before adopting. |
| Backup/deployment | Example nightly off-host backups retained 30 days, point-in-time recovery and container under 400 MB. |
| Test coverage | Proposed ≥80% overall and ≥90% for key registry/design-system code; meaningful behavior coverage takes precedence over mirroring implementation. |
| Usability | Five representative editors; proposed four of five complete core tasks unassisted, zero data loss/accidental publication. Reframe all tasks around Payload. |

Custom-editor timing targets such as a 16 ms canvas edit commit are excluded.

## 26. Explicitly excluded and deferred features

### Excluded by the current decision

- Standalone Forma `/editor` product, three-panel editor shell and custom canvas.
- Dragging blocks onto a rendered canvas; cross-frame drag coordinates and selection
  overlays; synchronized layers/outline panel and canvas-specific block toolbar.
- Custom generated side inspector, canvas-specific responsive panel UI and inline
  WYSIWYG/Webflow-style editing.
- Forma-specific canvas message/patch protocol, normalized selection state,
  canvas undo/redo history and dedicated offline editor persistence engine.
- Custom visual form-building canvas; use Payload fields/arrays/blocks/relationships.
- Mandatory designer/publisher/viewer roles, mandatory approval workflows and
  restrictions preventing an authorized Site Manager from composing/publishing.
- Rebuilding working starter features simply to match old package paths or a
  previously proposed compiler/registry architecture.

Native Payload block reordering, field editing, applicable undo behavior, version
history and Live Preview remain allowed. Removing a custom UI does not remove
the website's layout, responsive settings, page composition or content safety.

### Later or outside the requested product

- Full multisite/multitenant administration and cross-tenant isolation rollout.
- Heavy website-template system/marketplace and public plugin marketplace.
- AI content generation, real-time collaborative editing/multiplayer cursors,
  arbitrary CSS/HTML/script editing and advanced animation-building tools.
- Mandatory submit/approve/reviewer-comment machinery; optional future governance
  must not change today's two-role direct-publish requirement.
- Atomic multi-document releases and exact historical whole-site replay.
- General website/content migration connectors and WordPress importer.
- SMS MFA, passkeys/WebAuthn and A/B testing.
- External link crawler and full CRM workflow for form submissions.
- Advanced form controls/flows listed in FORM-09; payment/password domains need
  purpose-built integration if ever requested.
- Dedicated external developer/headless API product; ordinary authorized Payload
  endpoints remain implementation capabilities.
- Product-usage analytics (block usage, time to publish, abandoned edits) and
  DB-backed feature flags were lower-priority recommendations, not required features.
- Patient records or clinical workflows; commerce/payment processing is not
  implied by a pricing block, enquiry form or healthcare website example.

## 27. Starter reuse and decisions still open

The earlier source review found substantial starter coverage for page blocks,
live preview, shared sections, media, navigation, forms/intake, SEO, redirects,
search and operations. That is evidence for reuse, not a verified feature-by-feature
acceptance report. Its test suite was not rerun for this document.

| Decision | Current position |
| --- | --- |
| Authoring UI | Settled: Payload's existing system; no separate visual editor. |
| Reuse strategy | Starter-first; evaluate gaps before implementing replacements. |
| Database | Unresolved: starter uses MongoDB; Forma's prototype uses PostgreSQL. No migration/adapter switch is authorized by this inventory. |
| Repository/workspace | No files copied or repository rebased. Existing Forma app + private design-system ownership remains until a deliberate integration decision. Do not recreate superseded primitives/Storybook packages. |
| Scoped access | Starter feature grants are not proof of page-root/descendant authorization. Map and test ACCESS-02–08. |
| Dynamic forms | Configurable stored fields do not prove every public form presentation is generic. Map the full FORM/SUBMIT contract, including fixed-layout limitations. |
| Authentication | Audit/reuse starter MFA/session/recovery paths before considering another implementation. |
| Theme/breakpoints | Preserve established theme; agree the runtime breakpoint approach/fallback and supported upstream variants. |
| Registry/codegen | Prefer existing typed registrations unless a concrete gap justifies additional derivation tooling. |
| Hosting/search/jobs | Reconcile starter providers with Forma's earlier VPS/Postgres assumptions before selecting adapters and release topology. |
| Languages/retention | Choose site languages/URLs, published-history and submission retention, backup objectives and privacy policy explicitly. |
| Licenses | Verify source provenance and rights for the actual deployment/distribution model; no blanket permission inferred. |
| Release scope | This inventories all outlined features, not a single-sprint plan. Prioritize retained gaps and recommended additions after auditing actual starter behavior. |

Suggested next planning artifact: a matrix with these feature IDs, starter source
evidence, status (`present and verified`, `partial`, `missing`, `not applicable`),
required changes and acceptance tests. That assessment should precede implementation.

## 28. Traceability and superseded work packages

| Source | Retained coverage / treatment |
| --- | --- |
| 00 — Original log (`00-rough-idea-log.md` in the original Forma plan), §§1–16 | Product, structured data, themes, primitives, actions, headings, blocks and constrained layouts: sections 2–6. |
| 00, §§17–21 | Custom visual interactions excluded; native block operations/discovery and Live Preview retained in sections 3 and 13. |
| 00, §§22–40 | Pages, collections, listings, detail layouts, globals, inheritance, media, SEO, redirects, experiences and search: sections 3, 7–8, 14–17. |
| 00, §§41–59 | Publication/history, saving, two-role corrections, MFA, performance, security, backups, tests and schema evolution: sections 11–12 and 19–24. |
| 00, §§60–73 | Development/deployment/reuse principles and V1/deferred summaries: sections 2, 22–27. Old visual-builder sequence is superseded. |
| 01 — Master plan (`01-master-plan.md` in the original Forma plan) | Preserve feature coverage; old E8/M6/custom-editor milestones and timing/status tables are historical, not the next implementation order. |
| 02 — ADRs (`02-architecture-decisions.md` in the original Forma plan), 03 — Contracts (`03-foundations-and-contracts.md` in the original Forma plan) | Retain data, rendering, action, access, migration and inheritance guarantees. Database-specific mechanisms and full DSL remain subject to starter reconciliation. |
| 04 — Core work packages (`04-work-packages-core.md` in the original Forma plan), WP-001–042 | Retain relevant setup, design-system, Storybook, block/rendering/content/access outcomes. Reuse starter implementation; obsolete package/version names do not mandate a restructure. |
| 04, WP-043–045 | Exclude the custom builder shell, canvas/layers and generated inspector. Rehome applicable saving/accessibility/validation outcomes to Payload. |
| 04, WP-046 | Replace canvas journey with native Payload create → configure blocks → preview → save → publish → history → restore-draft → publish. |
| 05 — Platform work packages (`05-work-packages-platform.md` in the original Forma plan), WP-047–060 | Retain dynamic content, bindings, navigation/inheritance/reuse; edit through Payload. |
| 05, WP-061–085 | Retain publish/delivery/history/schedules, SEO/redirects/media/search, site experiences and security with corrections from `09`/`10`. |
| 05, WP-086–092 | Retain relevant CI/performance/operations/deployment/scaffold outcomes. Page-health guidance lives in Payload; custom canvas performance targets are removed. |
| 06 — Improvements (`06-improvements-and-gaps.md` in the original Forma plan) | Preserve recommendations and deferred items separately; obsolete role/import/package prescriptions yield to later decisions. |
| 07 — Execution guide (`07-llm-execution-guide.md` in the original Forma plan) | Process reference, not additional product features; old sequence/dependencies need adjustment before execution. |
| 08 — Editor experience (`08-editor-experience.md` in the original Forma plan) | Retain clear state, safe saves/conflicts, shared publication, accessibility and usability goals; exclude custom workspace composition. |
| 09 — Amendments (`09-plan-amendments.md` in the original Forma plan), UX-001–012 | Retain storage/migrations, native preview/security, saving/access, shared publishing, forms, lifecycle, export, bindings/locales and acceptance. Remove canvas-specific UX-002/004/005 and mandatory-review assumptions superseded by `10`. |
| 10 — Roles/reference capabilities (`10-reference-capabilities-and-access.md` in the original Forma plan) | Two roles, scoped independent publication, generic institutional capabilities, reference-only SNMIH and deferred content import remain authoritative. |
| 11 — Starter review (`11-starter-kit-review.md` in the original Forma plan) | Preserve valuable permission/operations/media/forms/preflight ideas. Its “inspiration only” reuse restriction is superseded by the starter-first direction. |
| 12 — Dynamic forms/Storybook (`12-dynamic-forms-and-storybook.md` in the original Forma plan) | Retain the full control/configuration/submission/Storybook contract. UX-008b now uses Payload form authoring, without a separate inspector/canvas prerequisite. |
| ADR 001 (`../docs/adr/001-design-system-ownership.md` in the original Forma plan), ADR 002 (`../docs/adr/002-application-foundation.md` in the original Forma plan), ADR 003 (`../docs/adr/003-page-persistence.md` in the original Forma plan), ADR 004 (`../docs/adr/004-visual-editor-preview.md` in the original Forma plan) | Historical architecture/implementation evidence. No prototype claim automatically establishes equivalent starter behavior; ADR 004's separate editor is no longer the product direction. |

This inventory preserves feature intent while replacing the authoring interface.
It does not silently approve a database change, migration, rewrite or production release.
