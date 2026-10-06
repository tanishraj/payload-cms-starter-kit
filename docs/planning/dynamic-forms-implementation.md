# Dynamic forms: first implementation audit

Updated: 6 October 2026 (Asia/Dubai). This records the first backend increment.

| Seam | Current path and remaining gap |
| --- | --- |
| Authoring | [Forms](../../src/collections/Forms.ts) provides reusable draft/published schemas with six control types, editable labels/names/options and required state. Optional contact roles now support custom metadata names. Additional controls, grouping, conditions and authoring helpers remain. |
| Definition validation | [forms](../../src/lib/forms.ts) checks names, select options, role uniqueness/type and fixed-review required-field restrictions. Strict rejection of undeclared/malformed values remains acceptance work. |
| Public presentations | [Contact33](../../src/blocks/Contact33/Component.tsx), its [schema adapter](../../src/lib/contact33Form.ts), and [Review Submission](../../src/blocks/ReviewSubmission/Component.tsx) still expect their fixed fields. New custom controls need a verified upstream generic presentation and Storybook proof. |
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
production database deployment or public generic rendering. Record actual commands/results in the implementation checklist.

Next: verified upstream generic form presentation in the revamp Storybook catalogue,
then native Payload block integration and end-to-end custom field creation/submission.
Follow with expected-revision/stale-client policy, additional controls, strict intake,
generic exports and retry/duplicate behavior. DF-02 and the broader FORM/SUBMIT
groups remain incomplete until their full acceptance passes.

Verification: 36 form/API regression tests and 16 documentation/context tests pass
on supported Node 22.13.1; TypeScript, changed-file lint and project-context checks
pass. The API suite uses its disposable `_test` replica and cleanup, not the local
application database. Payload types were regenerated. No environment additions.
