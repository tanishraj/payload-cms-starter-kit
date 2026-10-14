# Configurable form questions

This bounded milestone-2 increment adds native question configuration to reusable General/Lead Forms used by Generic Form and Contact Cards & Form. The broader FORM-05 and DF-02/06 acceptance remains open for the full identity/change/export lifecycle.

## Editor flow

Select or create a reusable Form from the page block’s relationship drawer. Add native field rows, choose a control, and enter its label and unique machine name. Optional help text appears below the question. Initial answer applies to Text, Email, Phone, Textarea and Select (use the option’s value for Select). Initially checked applies to optional Checkbox only; required acceptance questions must start unchecked. Invalid initial answers prevent publication.

Text/Textarea expose minimum and maximum character counts. Use whole numbers, minimum at least zero, maximum at least one, minimum no greater than maximum. Maximum cannot exceed the existing caps: Text 500, Textarea 10,000. Empty optional answers are valid; non-empty answers are trimmed before validation. Email and Phone retain their existing format and length rules, without new configurable length settings. Help text has a 1,000-character cap.

Edit/reorder an existing native row to retain Payload’s field identity. Relabel changes presentation; rename changes future stored answer keys and can require external mapping updates. Original submission labels/keys remain captured. Delete/recreate creates a new question. Existing option rows retain their IDs during editing/reordering; duplicate non-empty field/choice IDs are rejected, while legacy missing IDs remain supported. Choice IDs are projected for UI identity but remain outside the legacy revision hash; selected-answer compatibility continues to use the accepted option value, as previously decided.

Question help explains the rename/delete effects and option-value compatibility. Type-specific limits and checkbox settings remain stored but inactive on other types; they become active if the original type is restored. Changing from text to select can make an initial answer invalid: update or clear the visible Initial answer before publishing. Review Submission has a fixed presentation and rejects this new configuration, with an explanation. Legacy Contact33 remains fixed; use the two generic blocks for configurable question presentation.

## Visitor and history contracts

Initial answers only initialize a fresh response. The endpoint never substitutes a default for an omitted required answer. Retry preserves entered answers. Changed-question recovery preserves only valid same-ID/type answers and clears incompatible answers with an explanation; it does not refill cleared/new questions from defaults. Visitors review and resubmit explicitly.

The shared validator owns browser and server limits. Help text and errors both associate with the control through aria-describedby; inline errors retain first-error focus. Generic Form and Contact6 use the same production presentation. Native preview remains disabled for submission.

Published fingerprints and immutable intake snapshots capture active help/default/length settings. Validation changes therefore trigger existing stale-form recovery before writes or notifications. No meaningful new configuration means a byte-compatible legacy fingerprint. Null/empty settings and false initial checks do not invalidate a legacy revision. Draft-only changes stay out of public intake. No existing submissions are backfilled.

## Verification and status

Branch: `feat/form-field-configuration`, based on the merged owner-activity increment. Storybook-first presentation reviewed in desktop/mobile and existing Neutral light/dark; Configured Validation play verifies defaults, accessible help/error association, invalid-answer blocking and corrected confirmation. Finish disposition: ship this bounded configuration presentation, preserving sourced structure and tokens. This is not a general accessibility certification; the earlier workshop contrast limitations remain documented.

Focused tests cover invalid limits/defaults, identity collisions, legacy rows/fingerprints, server keyless validation, sanitized revision refresh, captured settings, both layouts and changed-limit recovery. Native journeys and required release gates are recorded in the implementation checklist after execution. No dependencies, environment variables, migrations or backfills added. Full control catalogue, private files, conditional/layout rules, export and durable delivery remain later forms increments.
