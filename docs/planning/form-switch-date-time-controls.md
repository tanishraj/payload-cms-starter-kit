# Switch, Date and Time form controls

Bounded forms increment on `feat/form-switch-date-time-controls`, created from verified merged develop `d00ca7e7` before implementation. Fourteen controls share native Forms, Generic Form and Contact6. Private file transport remains the next milestone; the complete forms milestone is still open.

## Answer and authoring contract

- Switch stores a strict JSON boolean. Only `true`, `false` or omission are accepted; strings, numeric and HTML-checkbox encodings are rejected for this new type. Omission becomes false, never the configured initial value. Existing Checkbox keeps its finite legacy encodings unchanged.
- Optional switches may start on using the existing `defaultChecked` setting. Required switches must start off and be deliberately turned on; the visitor receives a focused error otherwise. Required means an affirmative answer, not just presence of a boolean key. Changing Checkbox to Switch is a control-type change, so stale-answer recovery does not reinterpret it automatically.
- Date stores a canonical calendar day string `YYYY-MM-DD`, years 0001–9999. Gregorian month lengths and leap-year rules are checked without creating a Date/UTC instant. Impossible dates, ambiguous formats, timestamps and offsets are rejected.
- Time stores a local, minute-precision `HH:mm` string, 00:00–23:59. Seconds, offsets, timestamps and AM/PM transport strings are rejected. Native browser inputs can display localized date/time formats; their canonical submitted values remain stable. No site/browser timezone conversion is performed.
- Optional inclusive Date bounds (`minDate`, `maxDate`) and Time bounds (`minTime`, `maxTime`) use native Payload Text fields to avoid CMS datetime conversion. Bounds must be valid canonical strings and minimum cannot exceed maximum. Time describes one same-day window; overnight windows are not silently interpreted. Blank bounds clear the rule. Inactive settings remain stored but excluded from current validation/revisions.
- Initial Date/Time answers use `defaultValue` and must satisfy active rules. Optional blank answers are allowed; required omission fails even with a configured default. Intake never fills omitted answers. Bounds and active defaults are part of the published revision/snapshot.
- New generic Date/Time/Switch answers never populate legacy contact aliases. For example, Time named `phone` stays an ordinary answer with no submitterPhone or telephone link. Explicit supported Text/Email/Phone contact roles remain unchanged.
- Fixed Review forms reject these controls with General/Lead guidance. Unknown types and invalid rules/defaults cannot publish as working questions.

## Recovery and historical meaning

The existing unique stable-ID and same-control-type policy applies. Still-valid local values survive relabel/reorder/rename; stricter bounds clear incompatible values with an explanation. A previously off Switch that becomes required clears to the off state and requires the visitor's explicit new choice. Defaults never refill recovered answers. The visitor reviews and deliberately resubmits.

Existing raw JSON envelopes retain strings and booleans, with the original labels/type and active rules in immutable snapshots. Date/Time display answers preserve their canonical day/time; Switch displays Yes/No. Notification formatting uses those same local values, escaping HTML and adding contact links only for actual Email/Phone controls. The submission event/transport seam needs no new shape. Durable receipts compare the same original body/revision; browser retries retain one accepted-attempt key. Draft isolation and preview-disabled submissions remain covered.

## Source and UX review

Authenticated Pro retrieval through the configured CLI on 14 October 2026:

- `@shadcnblocks/switch-switch-labeled-1`
- `@shadcnblocks/input-input-types-5`
- `@shadcnblocks/input-input-special-2`

The exact Radix Luma Switch dependency was reviewed through CLI preview and added without replacing existing primitives. Date/Time reuse installed Input and the sourced decorative Calendar/Clock position/padding. Field labels, errors, help/focus, controlled answers and caller-owned transport remain in the canonical Generic Form presentation. Typed `FormTemporalControl` forwards supported input props and keeps upstream defaults; decorative icons cannot intercept clicks. Native picker chrome follows the owning light/dark scheme through scoped utilities after visual review exposed a dark icon visibility issue. No new theme, form stylesheet, dependency or environment variable.

Storybook Default/playground, temporal validation and changed-rule recovery use the production presentation under one `Blocks/Generic Form` entry. Both new plays reach confirmation, including deliberate corrected resubmission. Desktop, 390px and Neutral dark reviewed before native integration. Visitor help explains permitted dates/times; canonical formats/timezone semantics belong in editor guidance and this contract. Native browser pickers retain platform-specific appearance; broad browser/accessibility acceptance and the prior workshop contrast qualification stay open.

## Verification checkpoint

233 affected form tests and all 15 context tests pass; full isolated regression: 2,583 pass/one Docker-dependent skip. Both native journeys pass without retries, including actual authoring, invalid publication, range errors, raw local values/boolean history, changed-rule recovery and identical lost-confirmation retry. Production/Storybook builds, both new plays, TypeScript, lint (one existing AdminUserMenu warning), Payload generators, production audit under the unchanged approved Braces exception and deterministic inventory checks pass before commit/push. The native run logged one React flushSync lifecycle warning; no browser assertion or submission failed in the final run, and no warning/check was suppressed. Broader browser/admin warning review remains open. The first native run used an exact required-label lookup that omitted the asterisk; only the lookup was corrected, retaining user-facing label selection and real browser interactions. Required-label semantics and production validation were not weakened.

The complete release gates and exact-head CI/merge evidence are recorded in the main implementation checklist. Registration guidance remains in [the choice-control contract](form-choice-controls.md#adding-another-control); these types extend that same explicit contract rather than a new schema language.
