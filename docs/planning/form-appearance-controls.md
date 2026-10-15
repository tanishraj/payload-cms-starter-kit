# Supported form appearance

Bounded FORM-04 increment, 15 October 2026. One reusable Form owns appearance;
Generic Form and Contact Cards & Form pass the same typed `appearance` props to
the production presentation. Native editing and disabled Live Preview remain.
Conditions follow separately. This is not an arbitrary CSS/theme editor.

## Editor contract

Open **Forms → Form appearance**, including from the relationship drawer on a
Page. Defaults preserve the selected block. Settings affect every placement of
this reusable Form; use another Form when placements need different settings.
The Form owns the question layout/submit action; the Page block still owns its
outer card/section, heading, descriptive copy and section padding.

| Setting | Supported choices | Default and limits |
| --- | --- | --- |
| Form width | Block default, Narrow, Wide, Fill available space | Default is 28rem Generic Form / available Contact6 card width. Narrow caps at 20rem; Wide at 42rem. Never exceeds the owning block. |
| Question columns | Block default, One, Two when space allows | Default retains Contact6’s first-two-short-question row. Explicit Two uses a fixed **32rem available form-width** container breakpoint; narrower forms stay stacked. No question order changes. |
| Question spacing | Block default, Compact | Compact uses the sourced 12px gap in the form and question groups; label/help/error spacing stays readable. Explicit two-column default uses the sourced 16px grid gap. |
| Submit appearance | Primary, Outline, Secondary | Semantic website theme colors; no supplied color/CSS values, destructive/link/icon-only submit variants. |
| Submit size | Default, Small, Large | Upstream `default`/`sm`/`lg`. No extra-small or icon-only public submit action. |
| Submit shape | Theme default, Pill | Inherited button radius or sourced `rounded-full`; question-control shapes retain their upstream defaults. |
| Submit width | Full width, Fit label | Fit label stays at the form start; long labels can wrap. |

Headings, descriptions, dividers and whole groups span the grid. Inside groups,
short questions can share a row. Textarea, file, choice sets, checkbox and switch
remain full width for their labels/help/error/interaction. Two columns depend on
available form width, so a Contact6 card can remain stacked on a wide screen.
Breakpoints are fixed; site-configurable breakpoints remain later scope.

Review Submission and fixed Contact 33 cannot render non-default appearance.
Review publication validation explains restoring defaults or changing intent.
Contact33 relationship validation/runtime reject newly selected or later-edited
unsupported Forms. Revisionless intake rejects non-default appearance before
storage/email, preventing a fixed client from silently ignoring authored settings.

## Projection, revision and history

`formAppearanceField.ts` explicitly registers native selects. The browser-safe
`formAppearance.ts` validates a plain object and supported option allowlists;
arbitrary keys/styles/unknown variants are unavailable. `projectFormAppearance`
emits only active non-default settings in canonical key order. Absence, null,
empty groups and explicit defaults retain legacy public output/revision hashes.

Published projection includes appearance, never internal notes/notification data.
Draft changes do not alter public output. Both production/preview adapters use
the same props; preview does not submit or upload. Appearance-only prop edits
do not remount question controls or discard typed answers.

Active appearance contributes optional original `formSnapshot.appearance` and
the shared published/intake revision. It creates no answer row and cannot change
validation, field IDs/names or contact metadata. Snapshot format remains 1 with
an optional additive property. A visitor holding an older published revision
refreshes appearance with the questions/layout and retains compatible answers;
they explicitly review and submit again. A malformed refresh fails closed.
Existing accepted-attempt replay still returns the original receipt after later
appearance edits, without storing another response or repeating notifications.

## Sourcing and review

Authenticated CLI retrieval on 15 October 2026:

- `@shadcnblocks/form-form-layouts-3`: `max-w-2xl`, grid pairs, 16px gap.
- `@shadcnblocks/form-form-layouts-6`: `max-w-sm`, compact 12px form/FieldGroup gap.
- `@shadcnblocks/button-button-standard-1` / `button-button-outline-1` /
  `button-button-secondary-1`: semantic text-button variants.
- `@shadcnblocks/button-button-standard-4`: fully rounded button.
- `@shadcnblocks/button-button-sizes-1` / `button-button-sizes-2`: text sizes.

Retained base: `form-form-patterns-4`, Contact6 and the merged display/group sources.
Adaptations: schema-driven control slots, fixed container-width responsive stacking,
long/compound question spans, plain typed appearance and native data transport.
Primitives are reused, with no package/theme/stylesheet/environment additions.

Storybook preceded Payload integration. The existing canonical **Blocks/Generic
Form** and **Blocks/Contact Cards & Form** entries expose appearance controls;
Appearance/Appearance Preview and Narrow Appearance use synthetic data only.
Desktop 1280px light / mobile 390px dark review shows two/one columns, 12px gaps,
no horizontal overflow, usable groups and actual first-error focus. The new play
finishes with the expected validation feedback. A transient module-load failure
occurred on the first story transition; a fresh task browser confirmed the play.
Contact6 shape and mobile wrapping were reviewed; dark axe WCAG A/AA has zero
violations. Existing Neutral light muted-surface contrast findings persist and
are recorded in the Storybook runbook; this is not complete AA/theme acceptance.
Finish verdict: bounded sourced appearance increment is merged. Local focused/full
integration, native browser journeys, Storybook, types/lint and the production
artifact guard pass. Exact-head Quality passed and PR #30 merged; its hosted
Generic Form browser case was marked flaky after a 420-second timeout and retry
navigation timeout before overall success. Broader browser repeatability remains
open. No visual-editor work.

## Verification and delivery

`tests/int/form-appearance.int.spec.tsx` covers defaults/legacy hashes, strict
configuration, minimal projection/original history, fixed clients, refresh and
answer preservation. The real-MongoDB form-file suite also verifies native REST
appearance publication rejection, draft isolation, stale recovery, original
accepted snapshots and durable receipt replay. Both existing native browser
journeys author all settings and verify production, refresh, history and disabled
draft preview. Full local/Quality/merge evidence is in the main checklist.
Conditional rules and broader forms acceptance remain open.
