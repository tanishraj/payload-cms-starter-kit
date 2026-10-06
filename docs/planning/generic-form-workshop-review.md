# Generic form workshop review

Reviewed 6 October 2026. Disposition: **ship**. This review covers the
Storybook presentation; native Payload/public/Live Preview acceptance remains open.

## Direction and evidence

Authenticated Shadcnblocks `form-form-patterns-4` supplies the stacked form;
`checkbox-checkbox-standard-1` supplies binary-control composition. Official
Neutral light/dark and fresh Radix Luma dependencies remain the visual authority.
The full installed source was reviewed before adaptation; the CLI's combined
`view` output truncates the second source item. No generated comp was used.

The artifact is [GenericForm](../../src/components/revamp/generic-form.tsx), with
synthetic [stories](../../src/stories/revamp/GenericForm.stories.tsx). The bounded
browser review captured desktop/mobile in both themes, mobile validation errors,
and desktop network-error, pending and success states. No horizontal overflow
was reported. Server-field rejection also completed without browser errors.
The detector reported no findings. Screenshots were supplied to an independent
reviewer; they are local review artifacts, not published website assets.

## Independent verdict

### Persistence

PRODUCT.md records the enhancement direction. Record the scoped workshop design
and brief before handoff. Public production theme ownership does not change.

### Fidelity

| Element or promise | Verdict | Evidence |
| --- | --- | --- |
| Stacked composition | Match | Heading, description, FieldGroup and full-width submit retain the upstream reading order and max-w-md measure. |
| Type | Match | System sans, bold 24px heading and subordinate labels/body preserve Neutral/Luma. |
| Material | Match | Plain semantic surfaces; no invented effects or substitute imagery. |
| Six configurable controls | Adaptation | Names, labels, options and required state are schema-driven. |
| Blank control surfaces | Match; inherited limitation | Upstream bg-background overrides Luma's input fill. Low boundary visibility is inherited; focus/error rings remain. |
| Errors and recovery | Adaptation | Inline errors, summary, focus targeting and preserved answers support generic submissions. |
| Pending and success | Adaptation | Pending disables controls; successful confirmation removes controls and receives focus. |
| Responsive composition | Match | Mobile retains reading order, readable labels and the full-width action without visible clipping. |
| Storybook truth | Match | Synthetic data is identified; demo confirmation says nothing was saved or sent. |
| Direction contract | Match | Schema-driven questions, Neutral/Luma presentation and correction-to-confirmation sequence are present. A concept seed is inapplicable to pinned source. |

### Ceiling

Reached for the constrained upstream presentation. Added ornament, display
typography or motion would depart from the source. Standalone hover/keyboard
screenshots were not supplied; styles and focus handling are present in source,
and interaction tests cover validation/server rejection/confirmation focus.

### Material fixes

None. Sampled light error text is #e7000b against white, approximately 4.77:1.
No visible overflow, misleading success claim or answer-loss regression appeared
in the supplied evidence. The review did not run a browser or certify CMS integration.

### Keep

Preserve upstream composition, semantic tokens, custom schema names/labels,
caller-owned persistence, field-linked errors and answer-preserving retry.

## Verification boundary

Focused tests prove strict text/select/checkbox intake, finite legacy checkbox
encodings, reserved authoring names and size bounds, fixed-review compatibility,
rejection before persistence/email/events, duplicate-event locking while pending,
error association/focus, unique IDs, schema replacement and retry without answer
loss. The presentation takes a typed asynchronous callback; no public API adapter
or native block registration is added in this increment. Server idempotency,
accepted old revisions, conditions, additional controls and generic exports remain
separate work. See the [tracking checklist](feature-implementation-checklist.md).
