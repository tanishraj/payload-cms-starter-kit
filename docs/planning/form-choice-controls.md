# Radio and multiple-choice form controls

Bounded forms increment on `feat/form-choice-controls`, based on merged develop `0414bb15`. Payload-native editing and Live Preview remain the editing model. Eleven controls now share the explicit form contract; switch, date/time and private file controls remain in the completion plan.

## Authoring and answers

- Radio stores one option value as text. Optional Radio answers can be cleared; required Radio needs one selection.
- Checkbox group and Multi-select store arrays of unique, exact option values. They never parse comma-separated strings, coerce scalars or infer arbitrary values. Omitted optional answers normalize to an empty array; defaults are never supplied by intake.
- New choice definitions allow 1–100 options. Each new option has a non-empty label/value of at most 500 characters; values cannot have surrounding whitespace. Payload row identities remain independent of labels/values. The earlier Select contract stays compatible.
- Initial selections are native rows containing option values. Empty starting state is allowed. Non-empty defaults must satisfy active count rules. Defaults are presentation-only and never refill recovered answers.
- Minimum/maximum selections are whole numbers; minimum is at least zero, maximum is 1 through the available option count, and minimum cannot exceed maximum. Required means at least one, even with minimum zero. A configured minimum also applies to an otherwise optional question; the presentation marks it as required and explains count limits before submission. Limits and defaults remain stored but inactive when changing to another control type.
- Valid arrays normalize into authored option order. Checkbox clicks and search selections remain editable; exceeding the maximum produces a shared inline validation error so answers remain visible for correction.
- Legacy contact-name inference excludes all newly introduced generic controls. Radio named `email` or `submitterEmail` remains an ordinary choice answer; explicit Text/Email/Phone contact roles remain authoritative.
- The fixed Review presentation cannot render these controls; publication rejects them with General/Lead guidance. Existing six-control behavior and legacy revision hashes remain compatible.

## Recovery and history

Recovery requires the same unique stable field ID and control type. For multiple answers, removed option values are filtered out. The remaining selection survives only if it still satisfies current validation. A new count constraint that invalidates the remaining answer clears it with an explanation. Recreated/type-changed questions clear their answers. The visitor receives separate partial-removal and full-clear messages, reviews the refreshed form and deliberately submits again.

Intake captures array values in the existing JSON envelope `{raw: [...]}` and copies original option labels into the immutable schema snapshot and readable display answer. Notification text and HTML format those original labels; HTML is escaped. No new endpoint, submission column or per-form template is required. The existing submission event seam accepts the same typed arrays.

Retry receipts still compare the exact accepted request (including revision and array order), without weakening existing duplicate protection. The browser resolver emits authored-order arrays, making unchanged visitor retries stable. External callers must reuse the original body for the same request key; a changed answer/body requires a new attempt key.

## Verified source and presentation

Authenticated Pro registry retrieval through the configured CLI on 14 October 2026:

- `@shadcnblocks/radio-group-radio-group-form-1`
- `@shadcnblocks/field-field-toggles-2`
- `@shadcnblocks/combobox-combobox-multi-select-3`

Production `form-choice-control.tsx` preserves their radio rows, horizontal checkbox fields and count-trigger searchable picker. Exact Radix Luma RadioGroup/Command/Popover dependencies and their Dialog/InputGroup dependencies were installed in a disposable registry directory and reviewed. Existing primitives were not overwritten. `cn` imports use the project utility; Popover accepts the owning theme container. `cmdk@1.1.1` is the only added runtime dependency. No new environment variable or form stylesheet.

Native Contact6 review exposed a picker option covered by the bottom cookie-consent bar. The picker now uses the supported `side="top"` preference with Radix collision handling, leaving styling/layers unchanged. Native selection is tested while consent is visible, then the visitor rejects optional cookies through the normal action. Visitor actions have a bounded timeout; no forced clicks or hidden-overlay shortcuts.

Integration adaptations are controlled answers, unique IDs, shared validation, meaningful labels, error/focus association, disabled states, optional Radio clearing and theme-contained portals. The picker labels its generated command input through cmdk's supported `label` API; its trigger controls the actual named dialog. Selected option names announce selection independently of keyboard highlighting. Canonical `Blocks/Generic Form` stories cover the production component; no second block catalogue entry.

Storybook was built and its validation/removal and changed-choice recovery plays reached confirmation before Payload integration. Desktop, 390px and Neutral dark previews reviewed. Native acceptance covers both Generic Form and Contact6. Broader full-admin accessibility and earlier workshop contrast qualification remain open.

## Adding another control

Keep explicit typed registrations rather than a schema language. A new control must update `formFieldTypeOptions`/`SimpleFormField` and its active configuration helper, type-specific definition/answer validation and initial-answer behavior. Add a verified-source production presentation and canonical Storybook states first. Then map the same configuration in `Forms`, regenerate Payload types and verify public/intake projection. Extend snapshot formatting, notifications, recovery, contact-metadata safety and event/transport consumers for any new answer shape. Include fixed Review compatibility, public/draft isolation, unknown-definition rejection and duplicate-safe retry regressions. Preserve legacy hashes and inactive settings. File transport requires the separate private-file boundary; registering a visual file input alone does not implement it.

## Verification checkpoint

159 focused form tests and all 15 project-context tests pass. Storybook builds and the new validation/recovery browser plays pass; desktop/mobile/dark source review completed. Both native journeys pass without retries, including consent-visible picker interaction, native defaults/count settings, partial recovery, raw array history and identical lost-confirmation retry. The final isolated full regression has 2,509 passing tests and one Docker-dependent skip; the production build passes. TypeScript, lint (one existing AdminUserMenu warning), production audit under the unchanged approved Braces exception, Payload types/import-map and final deterministic inventory checks pass before commit/push. Initial temporary verification issues are retained in the work log; no gate was weakened. Merge status is recorded in the main implementation checklist; this document does not declare broad forms acceptance complete.
