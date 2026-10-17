# Payload Model

## Registered Collections

Registration order in [payload.config.ts](../../../../src/payload.config.ts) is intentional:

1. Editorial collections: Pages and Articles under Content; NewsEvents and NewsEventClassifications under News & Events; Reviews and ReusableSections under Content.
2. Taxonomy: Categories (Topics), Tags.
3. Navigation and structure: NavigationLinks, Headers, Footers, OfficeLocations, Redirects, SystemPages.
4. Media: Media, GalleryAlbums.
5. Intake: Forms, FormSubmissions and hidden, non-upload FormAttachments.
6. Administration: WorkQueue (Action Queue), OperationalAuditEvents (Audit Log), Users, and hidden TwoFactorCredentials.

Exact symbols and files are generated in [project-inventory.json](project-inventory.json). Collections receive Trash through [withTrash.ts](../../../../src/plugins/withTrash.ts), except NewsEventClassifications: classification deletion remains a guarded hard delete. An in-use delete identifies the first referencing News & Events entry, Page, Reusable Section, Calendar/Annual Calendar/Tabs container, or Detail Page Template so the editor can remove or replace that relationship; classifications that must remain connected are archived instead. Content and structural presets opt into drafts/versions in their own configs; operational records and users are not public content.

Pages have a non-persisted `pageEditingGuide` UI field before Layout. Its server component
reads only the current account's optional visibility preference with `req`, `user` and
`overrideAccess: false`; the client observes native form state. Preferences never grant access
or mark content saved/published. Native block controls now use explicit Block/Blocks labels.
The existing draft/publication/access schemas and routes remain authoritative; generated type
changes are descriptions only. See [guide contract](../../../../docs/operations/page-editing-guide.md).

## Registered Globals

Nine globals are registered:

1. SiteSettings — identity, regional timezone, contact, address, legal Pages, social destinations.
2. ThemeSettings — preset and system/light/dark scheme.
3. SEOSettings — default titles, metadata, image, robots, verification.
4. AnalyticsSettings — GTM or GA4 configuration.
5. CookieConsentSettings — banner enablement, variants, placement, copy.
6. PageSettings — homepage, header/footer presets, announcement, Page defaults.
7. NewsEventsDetailTemplate — ordered Page-compatible News/Event detail layout plus one global-only dynamic content block, presented with the News & Events Admin group.
8. SearchSettings — up to six unique operator-managed suggested search terms, governed by the Search
   Settings feature with draft/version recovery; public rendering trims, de-duplicates, and caps
   legacy rows defensively.
9. SystemModeSettings — off, maintenance, or coming-soon behavior and referenced presets. The active
   schema has no authenticated public-route bypass; any historical stored
   `bypassForLoggedInAdmins` value is ignored and deliberately left untouched.

## Ownership and Relationships

- Pages own hierarchical public routes and composed layouts, including the Page-backed `/news-events`
  index. Every Page-compatible block receives an optional centrally defined `anchorId`; Pages and
  Reusable Sections reject direct duplicate values, while runtime document-order claiming protects
  against duplicates introduced by nested or repeated Reusable Sections. Parent validation prevents
  cycles; hooks populate URL previews, synchronize links, create redirects after path changes, and
  revalidate caches. Published slug changes preserve MongoDB string IDs when creating the automatic
  permanent redirect, so saving a renamed Page and resolving its former URL remain one transaction.
- SiteSettings owns the Privacy Policy and Terms and Conditions Page relationships used by the public footer and consent UI. The dated legal-page migration creates only missing exact-slug Pages, fills only relationships empty in both published and latest states, and has an intentionally non-destructive rollback; later legal-copy changes remain editor-owned Page publications.
- Articles, NewsEvents, and Reviews own their detail content, taxonomy, SEO, native draft/publication state, and preview behavior. NewsEvents, NewsEventClassifications, and NewsEventsDetailTemplate share the `News & Events` Admin group. The entry editor keeps Content, Event Details, SEO, and Publication as its four primary tabs; Content also owns the required active Entry Classification relationship, featured-image controls, and a collapsed Topics & Tags group without changing their top-level stored paths. NewsEventClassifications provides centrally managed, public classification records with Story/Event behavior, semantic Calendar color, and archive-in-place lifecycle controls. Seeded records retain a hidden immutable legacy value; referenced records cannot be deleted or change behavior. NewsEvents entries require one classification relationship; request-aware validation resolves its behavior, keeps Event fields visible, validates dates and location for Event behavior, supports an all-day flag with an inclusive end date, and clears Event-only data, including `featuredInHighlights`, for Story behavior. Timed featured Events require an end date. Highlights renders up to three eligible featured Events before three eligible non-featured Events; Tabs ignores that flag and exposes the complete published classification directory, ordering Event classifications as current/upcoming then recent past. SiteSettings owns the supported IANA timezone and falls back to `Asia/Kolkata`; public News/Event adapters preformat labels and date keys in that timezone so browser locale cannot change grouping, while visitor time labels omit technical GMT/UTC suffixes. The hidden optional `contentType` field and an original-document fallback remain only for unmigrated entry updates during the compatibility release. Public News/Event adapters expose the resolved classification and behavior while retaining the classification slug as deprecated `contentType`. Public list loaders query canonical relationship IDs and also match a seeded legacy value only when an entry has no classification relationship, so unmigrated records remain visible without allowing stale compatibility data to override migrated behavior. NewsEventsDetailTemplate owns the shared ordered Page-block composition. Its global-only `newsEventsContent` block binds the current entry and owns article/sidebar appearance, image ratio and shared overlay settings, share visibility, and public author label. Published templates require exactly one dynamic block; drafts may remain incomplete. The retained legacy entry Byline is hidden and ignored publicly.
- ReusableSections own shared block stacks and the anchors configured on their nested blocks. Direct
  recursive selection is excluded; renderers stop nesting after depth 10.
- NavigationLinks provide reusable destinations and page-synchronized records. Headers and Footers provide versioned shell presets.
- SystemPages pair one type with its matching block and are referenced from system modes.
- Media owns server-side public marketing-asset uploads, extension/MIME/signature format validation before Payload file generation or replacement cleanup, alt requirements, usage detection, deletion guards, storage health, queue sync, and audit events. Format validation is not malware scanning; private form documents now use separate FormAttachments metadata/private storage; format detection is not scanning or quarantine. External scanning remains an explicit integration. GalleryAlbums own ordered reusable image sets.
- Forms define general, lead, and review-intent inputs and notifications. An optional per-field
  `contactRole` maps one Text/Email/Phone control to submitter name/email/phone with arbitrary machine
  names; uniqueness/type validation applies. Legacy alias lookup remains only for unassigned roles.
  FormSubmissions own immutable raw data, captured published intake snapshots/content fingerprints
  and native read-only original question/answer rows, plus operational state, activity, assignment
  and optional Review promotion. Owner activity compares raw/populated MongoDB string IDs and supported finite numeric IDs; owner-only changes stamp Last Action At, while unchanged or omitted owners do not. Existing timestamp field access remains immutable to ordinary updates. Snapshots preserve Payload array-row IDs where present and original
  select labels; legacy submissions remain raw-data-only without backfill. The fingerprint is not a
  Payload version ID. Existing Contact33/Review public presentations remain fixed and revisionless for
  compatibility. Generic Form and Contact6 now carry the published fingerprint;
  stale intake returns a sanitized 409 changed-form definition before persistence
  or notifications. The shared client preserves valid answers by unchanged unique
  row ID/control type, explains cleared answers and requires deliberate resubmission.
  Generic clients now carry an attempt key; hidden immutable receipt hashes and a unique sparse Mongo index protect accepted retries for the submission lifetime. Replays return the original confirmation before current-revision checks or side effects; conflicting answers require a deliberate new attempt. Keyless legacy clients retain the existing protocol. Notification recovery and full identity lifecycle acceptance remain separate work. Historical CSV export is documented below. See [retry contract](../../../../docs/planning/form-submission-retries.md). Shared form validation
  rejects non-plain answer records, undeclared names and malformed scalar values; checkbox inputs keep
  finite legacy HTML encodings. The fixed review engine explicitly opts into its seven separately
  validated extra keys. Authoring reserves constructor/prototype/website, validates supported types,
  and caps schemas at 100 fields. The Generic Form block renders the fifteen current controls through the same validator,
  selects a reusable published General/Lead schema and disables submissions in
  authenticated Live Preview. Native field and option rows open for editing. Private
  operational configuration is excluded from the public client projection.
  URL and Number extend that explicit contract. URL accepts complete HTTP(S) references without embedded
  credentials or internal whitespace; answers are never fetched/automatically linked. Number uses a
  decimal-mode text input and stores validated decimal strings, with optional finite min/max/positive
  increment settings and exact scaled-integer comparisons in `formNumber.ts`. Numeric whole-number
  settings must be safe integers. Active numeric settings enter snapshots/fingerprints and stale
  recovery revalidates them. Fixed Review rejects these controls. Existing six-control schemas retain
  their hashes; no backfill. URL/Number questions named after legacy contact aliases are excluded from
  contact-metadata inference, so arbitrary compatible names do not become invalid submitter emails
  or mislabeled contacts. Existing six-control aliases and explicit contact-role mappings remain intact. See [control contract](../../../../docs/planning/form-url-number-controls.md).
  General/Lead questions now support public help text and validated presentation-only initial answers,
  optional initially checked checkboxes, and bounded whole-number Text/Textarea length limits. Required
  checkboxes start unchecked. Active settings enter captured published fingerprints/snapshots; absent
  new configuration preserves legacy hashes. Shared explicit field projection serves browser, preview
  and intake; dormant type-specific settings are excluded. Fixed Review Submission rejects unsupported
  configuration. Duplicate present field/choice row identities fail authoring, legacy missing IDs remain
  supported, and choice IDs do not alter the legacy fingerprint. See [question configuration](../../../../docs/planning/form-field-configuration.md).
  Questions also support stable-ID visibility rules against earlier questions. Every rule must
  match; typed exact values and answered/unanswered checks share one preview/public/intake evaluator.
  Hidden nonempty values are rejected server-side and omitted from normalized submissions/history;
  hidden private upload tokens are never claimed. Conditional requiredness applies only while shown.
  See [conditional question contract](../../../../docs/planning/form-conditional-rules.md).
- WorkQueue stores deduplicated actionable conditions. OperationalAuditEvents stores selected immutable operational history. Both record their source feature for Site Manager row filtering. Users own authentication, Admin/Site Manager roles, and feature grants.

## Feature and Publication Governance

The only roles are Admin and Site Manager. First-account setup hides role and feature choices and displays an administrator notice; the server assigns Admin even if a different role is submitted. Role selection is visible only to authenticated Admins. Anonymous first-Admin creation requires both a literally empty Users collection, including trashed records, and the explicit runtime bootstrap policy; production defaults that policy off and additionally pins bootstrap to one normalized configured email. Payload's unique email index selects the atomic winner if same-address bootstrap requests race. Non-production ignores the email pin and remains flag-only. Admins implicitly hold every registered feature and may grant any subset of the 29 Admin destinations to Site Managers. A missing grant fails closed in the sidebar and at the Payload access layer. Relationship dependencies receive bounded read access without exposing the destination or permitting mutation.

The Users editor keeps those grants as native `features.<key>` checkboxes. It presents an effective-
access summary and unsaved global/group bulk controls, while the ten sidebar-aligned groups begin
collapsed with their feature counts. Dependency access is identified as read-only, and the editor
warns that saving authorization changes invalidates the Site Manager's active sessions. These controls
only update Payload form state; normalization, authorization, session invalidation, and audit hooks
remain authoritative on save.

The Payload dashboard uses one custom dashboard body instead of inserting content before Payload's
default collection/global cards. It consumes the already-authenticated dashboard user, creates only
feature-authorized Local API queries with `overrideAccess: false`, reports failed authorized counts as
unavailable, includes Reviews in recent edits, and distinguishes a zero-grant account from an account
whose grants do not have dashboard metrics. Payload continues to own the surrounding Admin shell.

Governed content uses Payload's native `_status` as its only draft/publication state. Open or blocked approval/publish-issue queue items prevent publishing; in-progress items do not. Publishing stamps actor and time metadata. Public review submissions additionally remain draft and pending until an Admin or Reviews-granted Site Manager approves or rejects them.

Read [adminFeatures.ts](../../../../src/access/adminFeatures.ts), [featureAccess.ts](../../../../src/access/featureAccess.ts), [enforcePublicationPolicy.ts](../../../../src/hooks/enforcePublicationPolicy.ts), [enforceReviewModeration.ts](../../../../src/hooks/enforceReviewModeration.ts), and the [editorial governance runbook](../../../../docs/operations/editorial-governance.md) together before changing this model.

## Shared Fields and Hook Safety

- [bodyEditorConfig.ts](../../../../src/fields/bodyEditorConfig.ts) defines one complete fixed-toolbar
  Lexical editor used explicitly by Article bodies, News/Event bodies, Rich Text blocks, Q&A answers,
  and the Payload fallback. H1 remains reserved for the surrounding document title.
- [buildSEOFields.ts](../../../../src/fields/buildSEOFields.ts) defines reusable route SEO controls.
- [cmsLinkFields.ts](../../../../src/fields/cmsLinkFields.ts) defines reusable Navigation Link relationships.
- [projectSlugField.ts](../../../../src/fields/projectSlugField.ts) wraps Payload's generated slug field for all slug-based collections. It supplies missing create slugs before validation under Payload 3.90 without changing existing or explicitly chosen URLs. It collapses separators and assigns the first available `-copy`, `-copy-2`, and later suffix while preserving existing stored slugs.

Anonymous reads of draft-enabled public collections are constrained to published documents at the
Payload access layer. Submitted Reviews additionally require approved moderation, and internal
Form/Media fields require an appropriate feature grant. Payload Local API calls bypass access
by default. Use `overrideAccess: false` when acting for a user. Pass `req` into nested operations so
they share transactions. Use request context flags when a hook writes data that could trigger itself.
Page and Review cache-revalidation hooks honor `SKIP_CACHE_REVALIDATION_CONTEXT` only when it is
explicitly `true`, allowing trusted request-external maintenance writes to avoid calling Next cache
APIs without a request store; ordinary content writes continue to revalidate normally.
Run `pnpm generate:types` after schema changes and keep
[payload-types.ts](../../../../src/payload-types.ts) synchronized.


## Optional account security and form additions

Users can enroll their own account in optional TOTP two-factor authentication through password-confirmed Users endpoints. A hidden TwoFactorCredentials collection denies all ordinary API access and stores encrypted secrets, hashed recovery codes, compare-and-swap revisions, attempt counters, and a session cutoff. Login and password reset enforce enabled factors. One-time authenticator steps and recovery codes cannot be replayed. Settings changes invalidate existing sessions. Independent security-state writes intentionally survive failed login transaction rollback; account deletion cleanup uses the request transaction. Existing first-admin policy, feature governance and user field protections remain authoritative.

Forms support a Phone field with international-friendly formatting, 7–15 digit validation, and constrained Contact33 input. FormSubmissions stores immutable searchable submitterPhone. Review-intent forms reject required fields that the fixed Review Submission UI cannot provide. Notification and confirmation emails use site identity, timezone-aware dates, readable select labels and clickable contacts. Existing request-body, field-value, metadata and rate limits remain enforced.

## Payload 3.90.2 auth/storage baseline

Generated user types include `resetPasswordRequestedAt`; password changes/reset revoke other sessions under upstream hardened authentication. Existing MongoDB/provider/access configuration is retained. Raster/PDF-only upload policy and server validation remain authoritative; no restricted-file or unsafe-fetch opt-in. Operators must recreate pending scheduled publish/unpublish events after upgrading if present. See `docs/operations/dependency-audit-remediation-2026-10-07.md`.

## Choice form contract

Forms now supports Radio (one string) and Checkbox group/Multi-select (unique option-value arrays). Native initial-selection rows and whole-number min/max selection settings map through the same public/intake projection; dormant settings stay inactive. New options are bounded at 100 and labels/values at 500 characters. Required/minimum/maximum checks do not fill missing defaults. Same-ID/type recovery filters removed choices and retains a still-valid remainder, with partial/full clearing explained before deliberate resubmission. Snapshot JSON envelopes retain raw arrays and original labels; escaped notifications and the submission event use the same answers. Contact alias inference excludes new generic controls, and fixed Review rejects unsupported choices. See the [contract and registration guide](../../../../docs/planning/form-choice-controls.md).

## Switch and temporal form answers

Forms adds strict boolean Switch and timezone-free Date (`YYYY-MM-DD`, real calendar years 0001–9999)/Time (`HH:mm`, local minute precision) controls. Native text bounds avoid CMS datetime conversion and allow one inclusive same-day window. Only active valid bounds/defaults enter the public/intake projection and revision; dormant values stay stored. Required switches start off and require explicit on-state; existing Checkbox encodings remain compatible. Recovery preserves same-ID/type answers only while valid under current rules and never refills defaults. Original local strings and boolean meaning remain in JSON snapshots, notifications and event transport; generic contact-like names do not become contact metadata. Fixed Review rejects unsupported types. See the [contract](../../../../docs/planning/form-switch-date-time-controls.md).

## Private form attachments

File questions complete the fifteen-control transport catalogue through bounded token arrays and native allowed-format/size/count settings. Internal FormAttachments denies all direct collection APIs, including Admin. One byte-bounded upload endpoint validates published revision, stable field/attempt ownership, extension/content/size and durable uniqueness; transactional capture claims files with the submission receipt. Original filenames/labels are immutable history, and notifications link to the Admin submission without bytes or direct file URLs. Authenticated downloads require full inbox permission, an access-enforced exact submission read and immutable/internal-receipt linkage, including after Form deletion; byte integrity is checked. Pending files expire after 24 hours; bounded cleanup retains accepted/trash references and retries permanent deletions. New native download UI is import-map registered. Section-scoped rows, antivirus, deployed bucket acceptance and reliable email outbox remain separate work. See [contract](../../../../docs/planning/form-private-attachments.md) and [operations](../../../../docs/operations/private-form-attachments.md).


### Ordered dynamic-form entries

Reusable Form `fields` now has an optional `entryType` discriminator. Missing/null
means Question, preserving existing paths and IDs. Headings, descriptions,
separators and one-level groups share the ordered native array; groups reuse the
explicit `formQuestionFields.ts` schema. Global validation caps all questions at
100 and top-level entries at 200, with unique names, contact roles and identities.
`formLayout.ts` flattens only questions and derives a minimal public `entries`
projection. GenericForm and Contact6 production/disabled preview share sourced
fieldset/legend/description/divider presentation. Fixed Contact33/Review reject
layout entries. Previously selected Contact33 Forms gaining layout become unavailable; revisionless layout submissions fail before storage/email. Existing question-only revision hashes stay unchanged; layouts
contribute optional ordered `formSnapshot.entries` to revision/history. Refresh
updates layout while retaining valid stable-ID answers; display rows never become
answers/notification rows. Grouped files retain private-provider publication and
intake boundaries. No migration/new environment/dependency/style is introduced.
See [layout contract](../../../../docs/planning/form-layout-entries.md).


### Native form API ownership

`formEndpoints.ts` registers reusable Form submit/upload handlers and the private
submission download on their owning Payload collections. These public URLs remain
`/api/forms/:slug/submit`, `/api/forms/:slug/attachments` and
`/api/form-submissions/:id/attachments/:token`; there is one REST dispatch owner
and one implementation per URL, rather than overlapping Next handlers and
Payload's API catch-all. Lazy adapters pass the existing `req.payload` instance
and the original unread Request stream to handlers under `src/endpoints/forms`.
The 256KiB JSON limit, 3MiB upload stream limit, published-revision checks,
idempotency/transaction claims, generic history/notifications, and current
authorized no-store binary download checks remain mandatory. No eager Payload
body/file parsing, public Media fallback, route prewarming or weaker test assertion
is introduced. CI's previous upload requests reached Payload REST and returned
route-not-found; native registration makes this URL resolvable by that router.
The underlying platform routing discrepancy is not claimed to be diagnosed.


### Supported Form appearance

Forms has one optional named `appearance` group, explicitly registered by
`formAppearanceField.ts`: approved maximum widths, compact/default spacing,
one/two/default question columns and semantic submit-button variant/size/shape/width.
`formAppearance.ts` validates allowlists and canonically omits default/null values,
preserving legacy revision hashes. Active settings enter minimal public projection
and optional original snapshot/revision, never answer rows. Draft isolation and
explicit changed-form recovery carry appearance; compatible answers remain.
Fixed Review/Contact33 reject non-default settings, including later Form edits;
revisionless intake rejects active appearance before persistence/email. See
[contract](../../../../docs/planning/form-appearance-controls.md).


### Historical submission exports

The native FormSubmissions list extends its existing filters/search with one
sourced export action. `GET /api/form-submissions/export` requires authentication
and full inbox permission, then reads bounded cursor batches with the same req/user
and `overrideAccess: false`; dependency/placement reads are insufficient. CSV uses
one row per captured answer, original title/slug/question ID/name/label/type/revision,
readable display and typed JSON. Legacy data is explicit without invented labels.
No current Form lookup, file token/URL/bytes, hidden receipt or staff notes are
exported. Ordinary exports exclude Trash. UTF-8 BOM/quoted cells/CRLF and formula
neutralization protect spreadsheet use. More than 1,000 submissions or 8 MiB
returns a recoverable error without partial CSV; start-time creation cutoff and
ID cursors avoid offset drift. Workflow status/membership are best-effort, not an
atomic backup. Test-mode exclusion and configurable webhooks remain future work.
See [contract](../../../../docs/planning/form-revision-exports.md).

## Bounded section authorization rollout

Only Admin and Site Manager roles exist. Users own Admin-managed `sectionRoots`
(root Page relationships) as well as feature grants. Saving changed grants clears
sessions. Accounts may read their own authorization metadata; changes remain
Admin-only and other-user assignment projections remain sanitized.

`sectionAccess.ts` combines features with current latest-draft Page ancestry or
Form/Reusable Section ownership. Page IDs, not URL prefixes, define scope. Managers
create children and owned resources but cannot create/move/trash roots or move
content between sections; Admins control shared published definitions. ReadVersions
constraints use version parent IDs in Payload 3.90.2; restore writes recheck ownership
in beforeChange as well as normal beforeValidate. No legacy ownership is guessed.

Published Form ownership is copied at intake to FormSubmissions. Inbox access is
independent of placement, and CSV/files inherit submission access. Moving Forms
does not move old answers. Unassigned submissions are Admin-only. Related queue
and audit rows use current source scope; other feature grants remain site-wide,
including Media and globals. This is a bounded first rollout, not complete tenant
isolation. Limits: 50 roots, 5,000 effective source IDs and 100 Page levels; overflows
fail closed. Request-only permission memoization is not an authorization cache
across requests. See [runbook](../../../../docs/operations/section-scoped-access.md).


Dashboard onboarding stores only `forma-getting-started-v1` visibility in the
built-in `payload-preferences` collection/endpoint. Session-derived ownership
and access-enforced reads isolate accounts; saved preferences cannot authorize
a task. Current root Page reads suppress scoped actions when assignments are
missing/unavailable. Minimal current draft reads supply resume links; native
editors still enforce permission on entry/save. Recent work reads latest saved
draft state. There is no new collection/schema/migration/environment setting,
bootstrap wizard, invitation or automatic content/publication operation. See
[onboarding scope](../../../../docs/operations/admin-getting-started.md).


SiteSettings and ThemeSettings explicitly register a non-persisted `siteSetupGuide`
UI field. Their shared `forma-site-setup-guide-v1` preference is account-owned and
independent of Dashboard/Page visibility. Only granted update features see the
server adapter; it threads the current request through access-enforced preference
reads. No stored setting path/default, access policy, version behavior or migration
changes. Native dirty/processing facts govern guidance, never permissions or
claimed completion. See [setup contract](../../../../docs/operations/site-setup-guide.md).


PageSettings registers `siteStructureGuide` inside Site Structure. Its server
adapter requires the Layout Defaults update feature and threads the user/request
through an access-enforced account preference read. The independent
`forma-site-structure-guide-v1` preference stores only visibility. Header/Footer
edit links require their management grants, never dependency-read access. Existing
Page scope, site-wide settings grants, field paths/defaults, homepage validation
and publication authority remain unchanged. Collection/field descriptions clarify
menu ownership; generated type changes are documentation only.


Users registers a non-persisted `teamSetupGuide` UI field. Its server adapter
requires the acting Admin and loads only that account's
`forma-team-setup-guide-v1` visibility with current request/access enforcement.
The native client summarizes selected grants/sections and distinguishes
section-scoped, site-wide, supporting-read and source-filtered operation access.
It neither grants permission nor validates root topology; native Save and
server access remain authoritative. No data field, role, credential, migration or
account lifecycle change is introduced.
