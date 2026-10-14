# Forms and access baseline

Reviewed: 2026-10-14 (Asia/Dubai), source commit `984502cd027084b0bd43fdc1a85b5786ed9957a7`.
Resolution asset for [Establish the forms and access baseline](../../.scratch/website-builder-catalogue/issues/01-forms-access-baseline.md).

## Evidence boundary

This is a reuse/gap assessment, not full feature certification. Current registered source, generated types and focused tests were inspected. Fresh evidence: **172 tests pass in 16 existing suites** covering form validation/history/intake/presentation/loading, notifications, request limits, role/grant administration, migration, public reads and preview access. Route/database collaborators are mocked in these suites; this is not a fresh MongoDB, browser, email-provider, distributed-runtime or production acceptance run.

Previously recorded evidence remains separate: the [Contact Cards & Form CI run](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/37664823414) reports 2,351 integration tests passing, one Docker-dependent skip, both governance journeys, both native form journeys and production build. No such broad run was repeated for this baseline.

## Reusable source seams

- [Forms](../../src/collections/Forms.ts): registered native draft/versioned reusable definitions, custom names/labels, six supported controls, required/options, optional contact roles and configured recipients/confirmation. Native relationship drawers select published general/lead Forms via [access-enforced relationship validation](../../src/blocks/shared/genericFormField.ts).
- [Shared validation](../../src/lib/forms.ts) and [production presentation](../../src/components/revamp/generic-form.tsx): scalar normalization, strict unknown-name/type checks, current value limits, labelled/focused errors, pending lock, answer retention on unconfirmed requests and disabled preview. Generic Form and Contact Cards & Form reuse these seams.
- [Published loader](../../src/lib/genericForm.server.ts) and [minimal projection](../../src/lib/genericFormShared.ts): public published reads and private configuration exclusion. Presentation blocks own styling/layout; schema examples are not fixed questions.
- [Intake route](../../src/app/api/forms/[slug]/submit/route.ts): reads the current published Form, validates bounded JSON/metadata/answers, captures data before event/email handling and uses server-owned recipients. Event integration is currently a [no-op seam](../../src/lib/formSubmissionEvents.ts), not a delivered webhook.
- [Submission snapshot](../../src/lib/formSubmissionSnapshot.ts) and [FormSubmissions](../../src/collections/FormSubmissions.ts): captured original labels/names/options, typed raw values, immutable answer/history fields, mutable operational status/owner/notes, optional review promotion and follow-up queue. Fingerprints are not Payload version IDs; legacy records remain raw-data-only.
- [Feature policy](../../src/access/featureAccess.ts), [feature definitions](../../src/access/adminFeatures.ts), [Users](../../src/collections/Users.ts) and [Pages](../../src/collections/Pages.ts): Admin/Site Manager roles, 29 feature grants, read-only dependency access, protected account/grant fields, last-Admin checks and session invalidation. They do not implement page-root/descendant resource scopes.

## Feature assessment

`Source present` means reusable source exists, not complete acceptance. `Partial` means some applicable behavior exists; `Gap` means the requested behavior was not found in inspected registered paths. Work/verification status remains in the implementation checklist.

| Feature | Baseline | Reuse and remaining acceptance |
| --- | --- | --- |
| FORM-01 | Partial | Reusable native Forms/drawers/drafts work; full grouping/control/authoring acceptance remains. |
| FORM-02 | Source present | Generic custom labels/names already certified by the recorded native journey; fresh renderer/intake contracts pass. Keep the existing checked box. |
| FORM-03 | Partial | Text/email/phone/textarea/select/checkbox plus a presentation submit button; broader controls/private file transport remain. |
| FORM-04 | Partial | Existing upstream stacked/Contact6 layout and typed presentation props; persisted display entries/groups and full layout controls remain. |
| FORM-05 | Partial | Payload field-row IDs, labels/keys, placeholders, required/options and fixed limits; option identity, defaults/help, configurable constraints and compatibility policy remain. |
| FORM-06 | Partial | Unique valid names/reserved names validated; historical labels captured. Published rename/integration warnings and usability remain. |
| FORM-07 | Gap | No declarative visibility/required condition contract in current six-control definitions. |
| FORM-08 | Partial | Explicit types/renderers/validators exist; complete supported-control registration/evolution contract remains. |
| FORM-09 | Gap | Follow-on controls deliberately deferred; not part of initial completion. |
| SUBMIT-01 | Partial | Published definition read and snapshot/fingerprint captured; draft isolation has recorded native evidence. Published revision protocol/groups/presentation contract incomplete. |
| SUBMIT-02 | Partial | Immutable readable historical answers and field IDs captured; no backfill, identity lifecycle or flattened historical export proof. |
| SUBMIT-03 | Partial | Shared strict scalar/options/required/size validation, checkbox must be checked; no conditions or visitor-selected revision check yet. |
| SUBMIT-04 | Gap | Browser sends values/metadata, no expected revision; server validates against latest published schema, without explicit changed-form recovery. |
| SUBMIT-05 | Gap | No private form-attachment intake/lifecycle/access path. Public Media is not equivalent. |
| SUBMIT-06 | Partial | Honeypot and bounded in-memory per-form/IP limiting; no durable server idempotency or deduplicated notification retry. |
| SUBMIT-07 | Partial | Current control errors/focus/pending/success and deliberate retry retain answers; stale schema, expanded controls and production usability acceptance remain. |
| SUBMIT-08 | Partial | Editor-owned recipients and optional contact roles/confirmation exist; separate reply-to/title mapping and authority rules remain. |
| SUBMIT-09 | Partial | Persistence precedes emails; email failures logged and success retained. No durable delivery state/outbox/retry contract. |
| SUBMIT-10 | Partial | Readable answers/status/owner/notes/follow-up queue; section-scoped rows and target workflow-state acceptance remain. String-ID owner activity issue reproduced below. |
| SUBMIT-11 | Partial | Raw/snapshot data available to authorized collection consumers; no new flattened export path found, event seam is no-op. Generic export/webhook acceptance remains. |
| SUBMIT-12 | Partial | Storybook callbacks isolated; Live Preview disabled. No authorized marked stored-test mode excluding ordinary inbox/export/email paths. |
| ACCESS-01 | Source present | Two roles, Admin implicit full access, account protection/bootstrap/last-Admin behavior have passing focused contracts; broad operational acceptance remains. |
| ACCESS-02 | Gap | No stable page-root/descendant grant data or row query constraints. Feature grants are site-wide. |
| ACCESS-03 | Partial | Manager Page write/publish authority exists with feature grant; section confinement does not. Existing open/blocked approval or publish-issue queue items can block publication; no blanket Admin approval requirement. |
| ACCESS-04 | Gap | Parent/path validation is content structure, not scope inheritance/move enforcement. |
| ACCESS-05 | Partial | Dependencies permit read without mutation; Forms/reusable content/global settings currently use feature-wide grants, not section-owned versus Admin-managed shared ownership. |
| ACCESS-06 | Partial | Form placement dependency and full inbox grant already separate; no section/record/attachment-specific permissions. |
| ACCESS-07 | Partial | Collection/API and authenticated preview policies reuse feature checks, relationship validation enforces Local API access; requested cross-section boundaries/history/jobs/import proof absent. |
| ACCESS-08 | Partial | Grant/role edits protected and changed access clears sessions; no section revocation or scheduled-execution scope guarantees. |
| ACCESS-09 | Partial | Effective feature/dependency summary exists; manageable page sections, scoped counts/pickers/impact summaries remain. |

## DF proof assessment

| Proof | Current evidence and boundary |
| --- | --- |
| DF-01 | Existing path audit complete; this review refreshes evidence, not a second implementation. |
| DF-02 | Field-row identity and snapshot fingerprint partial; client revision negotiation and complete identity lifecycle remain. |
| DF-03 | Recorded native custom-field proof; fresh six-control generic contracts pass. |
| DF-04 | Fresh strict scalar/request/intake contracts pass; condition/revision/durable duplicate protection remain. |
| DF-05 | Source inbox/contact mapping/notification seam reusable; export, delivery-state/retry and scoped operator acceptance remain. |
| DF-06 | Snapshot tests preserve old meaning across field changes; no in-flight changed-schema recovery or fresh database/browser history proof. |
| DF-07 | Six controls/upstream layouts reusable; broader catalogue, display groups and private files remain. |
| DF-08 | Existing supported presentation props/stories reusable; conditions and expanded props remain. |
| DF-09 | Feature/private-projection/disabled-preview/error contracts pass; requested section/file boundaries and usability proof remain. |
| DF-10 | Not closed: broader acceptance and operator/developer guides depend on remaining implementation. |

## Reproduced inbox defect

[updateFormSubmissionActivity](../../src/hooks/updateFormSubmissionActivity.ts) normalizes only numeric owner IDs, while generated MongoDB User/FormSubmission relationships use string IDs. An isolated call with original owner `manager-old` and new owner `manager-new`, otherwise unchanged, reports `ownerChanged: true` and `activityTimestampAdded: false`. Existing numeric-owner tests do not catch this. Capture a regression test and fix in the inbox increment; this baseline does not modify production behavior.

### Owner-activity follow-up — 14 October 2026

The bounded owner-activity fix is implemented on `fix/form-submission-owner-activity`. Six new string-owner regression cases reproduced the defect before the change. All 40 focused hook/intake/API tests now pass, including real disposable-Mongo persistence with an authorized Site Manager, unchanged timestamps, immutable answers and denied reassignment without the feature grant. Raw/populated string IDs and legacy finite numeric IDs are handled consistently. Merge/CI evidence belongs in the implementation checklist; this does not certify the full inbox/export or section-scope capability.

## Fresh checks and exclusions

Fresh command: `pnpm test:int` targeting forms-dynamic-history, forms-submission, forms-phone, forms-strict-values, form-notifications, generic-form-loader/integration/presentation, admin-features, feature-access-matrix/controls, user-feature-administration, two-role-feature-permissions-migration, public-content-access, preview-access and request-limits suites. Result: 16 suites, 172 tests pass. Isolated synthetic string-owner hook reproduction confirms the defect above.

The user additionally requested PR/branch housekeeping. No open PRs were found. Fresh `pnpm audit:prod` fails: two high findings (Braces and Next.js), 21 moderate, six low; the Braces exception is expired. Audit remediation is a merge prerequisite, not evidence against form test results. Do not renew the old exception silently.

No fresh end-to-end/browser/database/provider/production tests, no full build, no migrations, no new environment variables, and no feature/proof completion checkoffs in this baseline.
