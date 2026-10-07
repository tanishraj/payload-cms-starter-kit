# Dynamic forms: first implementation audit

Updated: 6 October 2026 (Asia/Dubai). This records the backend foundation, generic-form workshop and native Payload integration.

| Seam | Current path and remaining gap |
| --- | --- |
| Authoring | [Forms](../../src/collections/Forms.ts) provides reusable draft/published schemas with six control types, editable labels/names/options and required state. Optional contact roles now support custom metadata names. Additional controls, grouping, conditions and authoring helpers remain. |
| Definition validation | [forms](../../src/lib/forms.ts) checks names, select options, role uniqueness/type and fixed-review required-field restrictions. Rejects unsupported types/reserved names and schemas over 100 fields. Shared intake rejects undeclared answers, malformed scalar values and non-plain answer records; known legacy checkbox encodings remain supported. The fixed review engine explicitly allows its seven separately validated extra keys. Conditions/hidden fields and stale revisions remain. |
| Public presentations | [Contact33](../../src/blocks/Contact33/Component.tsx), its [schema adapter](../../src/lib/contact33Form.ts), and [Review Submission](../../src/blocks/ReviewSubmission/Component.tsx) still expect their fixed fields. The authenticated upstream [GenericForm](../../src/components/revamp/generic-form.tsx) now renders all six current controls from arbitrary field definitions in [Storybook](../operations/storybook.md#generic-form-workshop). Caller-owned transport is separate. The `genericForm` native block now selects a reusable General/Lead definition, with published-only public projection/transport and disabled client-safe Live Preview. The isolated native browser journey passed custom-field authoring, publication, submission, captured answers, draft isolation and disabled preview. |
| Intake | [POST route](../../src/app/api/forms/[slug]/submit/route.ts) reads published Forms, enforces body/rate/honeypot controls, validates answers, stores data, then emits events/promotes reviews/sends email. The accepted revision is currently the latest published definition read for that request. |
| Captured history | [snapshot helper](../../src/lib/formSubmissionSnapshot.ts) captures ordered field IDs/names/labels/types/options/roles, form identity/title/intent, typed values and readable answers. Content fingerprint is deterministic and excludes answer values. This is not a Payload version ID or a full presentation archive. |
| Inbox and access | [FormSubmissions](../../src/collections/FormSubmissions.ts) now displays captured questions/answers through native read-only fields. Original data remains immutable and operational edits remain available. Review dependency reads continue to strip private history. Native rendering still needs browser acceptance. |
| Export | New fields are available to authorized collection API/export consumers. Existing data remains supported. Flattened historical-answer CSV formatting and operator export acceptance remain unverified; no new export endpoint is added. |
| Delivery | [notifications](../../src/lib/formNotifications.ts) shares answer formatting with history and uses mapped contacts. Stored submissions survive email/event/promotion failures as before; durable notification retries and duplicate protection remain separate gaps. |
| Compatibility | Optional schema additions need no backfill. Existing Forms without roles keep alias behavior; old submissions keep raw data. Stable Payload field-row IDs survive ordinary edits; legacy missing IDs stay null rather than using names as fabricated identities. No database records were changed by this implementation task. |
| Environment | No environment variables or dependencies are introduced. Existing `.env.example` remains authoritative. |

## Verification and next increment

Focused mocked integration tests prove custom-name contact routing, role validation,
captured typed/readable answers, history isolation after schema edits, deterministic
fingerprints, optional/read-only history fields and review dependency redaction.
Existing contact, review, phone and notification contracts remain covered. The isolated MongoDB 8.0.29 replica test also verifies persisted typed answers,
form edits preserving historical data, and denial of answer/snapshot mutation while
operational updates succeed. These checks do not certify admin-browser UX, a
production database deployment. The separate native browser journey now proves the public generic path on disposable MongoDB. Record actual commands/results in the implementation checklist.

The native Generic Form increment is merged into develop through [PR #17](https://github.com/tanishraj/payload-cms-starter-kit/pull/17). [GitHub Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/37466757847) passed 2,332 integration tests (one Docker-dependent test skipped), both governance journeys, the native form journey and the production build. Contact6 is the next native increment: authenticated upstream layout, editable cards/hours and reusable questions through the same Form engine and shared website theme. Its implementation and native acceptance are tracked in the checklist; no fixed example-input schema is introduced.
Follow with expected-revision/stale-client policy, additional controls/conditional intake,
generic exports and retry/duplicate behavior. DF-02 and the broader FORM/SUBMIT
groups remain incomplete until their full acceptance passes.

Verification: 36 form/API regression tests and 16 documentation/context tests pass
on supported Node 22.13.1; TypeScript, changed-file lint and project-context checks
pass. The API suite uses its disposable `_test` replica and cleanup, not the local
application database. Payload types were regenerated. No environment additions.

## Generic workshop verification

Authenticated Pro retrieval succeeded with the updated ignored local registry key;
no credentials are copied into source, stories or logs. No new dependency, runtime
environment variable or database migration is introduced. `onSubmit` callbacks
in stories are demonstrations only. Shared strict-value changes are active in
the existing API, with route tests proving rejection occurs before persistence,
email or event emission. Browser review covers desktop/mobile, light/dark,
validation, pending, unconfirmed requests and confirmation; final evidence is
recorded in the checklist. A browser retry can still duplicate a previously stored
request after a lost response; client locking is not server idempotency.

### Contact6 implementation boundary (2026-10-07)

Adds the sourced presentation, fresh Card dependency source, one Storybook entry, native config/server/preview adapters, canonical registration, content-only section profile, generated types and picker fixture/JPEG. Both dynamic-form blocks share `createGenericFormField` and the published access-enforced loader/projection. The generic renderer gains only a typed Contact6 presentation layout; validation/state/transport stay shared. No package dependency, runtime environment variable or data migration. Native browser acceptance runs both Generic Form and Contact6 using the same custom text/select/checkbox authoring journey. Navigation waits for DOM then real editor readiness instead of unrelated whole-page load completion.
