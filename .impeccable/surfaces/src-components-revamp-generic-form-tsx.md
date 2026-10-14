---
version: 1
slug: "src-components-revamp-generic-form-tsx"
primary_target: "src/components/revamp/generic-form.tsx"
related_targets: ["src/stories/revamp/GenericForm.stories.tsx", ".storybook/neutral.css", ".storybook/preview.css", "docs/planning/generic-form-workshop-review.md"]
---

# Generic Form workshop surface

## Direction contract

- **THESIS:** Published questions become a usable form without fixed contact names.
- **OWN-WORLD:** Inherit official Neutral light/dark, Radix Luma, Lucide and system sans.
- **STORY:** Read the questions, enter answers, correct errors, receive confirmation.
- **FIRST VIEWPORT:** Original max-w-md stacked FieldGroup with full-width submit.
- **FORM:** Pinned authenticated upstream structure; preserve its presentation.

## Scope and provenance

This brief applies only to `.storybook` and `src/components/revamp`. It records the shipped presentation and supported controls; production integration is future work. Existing SNMIH production identity remains governed by its existing source. Workshop ship disposition is not browser/CMS/native-admin acceptance.

Authenticated source: `@shadcnblocks/form-form-patterns-4`, with checkbox composition from `@shadcnblocks/checkbox-checkbox-standard-1`, retrieved 6 October 2026. Fresh dependencies are under `src/components/revamp/ui`; official Neutral is recorded in `.storybook/neutral.css`. Source category links: [form](https://www.shadcnblocks.com/components/form), [checkbox](https://www.shadcnblocks.com/components/checkbox).

## Composition

Fluid width capped at 28rem; original vertical stack, h2, optional muted description, required-field guidance, stacked FieldGroup and full-width submit. Checkbox labels use the sourced horizontal composition. Input/select/textarea backgrounds intentionally match the canvas; labels, focus borders/rings and invalid messages carry the cues. No alternative layout, theme, spacing or button-variant prop exists.

## Supported controls

| Prop / control | Supported configuration |
| --- | --- |
| `fields` / Questions and controls | Existing text, email, phone, textarea, select and checkbox types; custom names, labels, placeholders, required state, select options and supported contact roles. |
| `heading` / Heading | Optional h2 text; empty text omits the heading. |
| `description` / Description | Optional introductory text. |
| `submitButtonLabel` / Submit label | Button text outside the pending state. |
| `pendingLabel` / Pending label | Button text and status while awaiting submission. |
| `disabled` / Disabled | Disables editing and submission. |
| `onSubmit` | Caller-owned async callback returning `{ success, message, errors? }`; no editable playground control. |

The `fields` object control configures questions, not a fixed contact-form contract. `onSubmit` accepts names mapped to string/boolean answers plus the hidden honeypot field. Field definition validation controls availability; replacing the schema resets local answers/errors/status.

## Interaction and states

Client validation uses the shared form helpers; server field errors focus the first invalid question. IDs are unique per instance, labels associate to controls and invalid descriptions reference their messages. Pending disables controls/submission and marks the form busy. Success replaces questions with a focused status confirmation. An exception reports an unconfirmed submission and preserves answers for retry, without claiming whether storage occurred. Duplicate submission is guarded while awaiting the result and after success. Invalid/empty schema shows an unavailable alert.

## Story evidence

Docs and Default expose labelled controls. Additional stories cover TextOnly, Disabled, Unavailable, LongLabels, TwoForms, ValidationErrors, SuccessfulSubmission, Pending, NetworkFailure and ServerFieldError. Stories use synthetic questions, answers and local demonstration callbacks only; no CMS reads/writes or network requests. Theme/viewport toolbars cover supported appearance and responsive shape; they do not expand the component API.

## Review disposition

The finish reviewer reported **ship**, no material fixes and an empty detector result. Captures are available under `/private/tmp/payload-generic-form-review`; the maintained review destination is `docs/planning/generic-form-workshop-review.md`. This document records that supplied disposition and current source behavior, without adding unperformed checks. Payload rendering, CMS configuration, submission persistence, native-admin journeys and production integration remain subsequent work.


## Current appearance extension — 15 October 2026

This supersedes the initial workshop-only API limitations above. Generic Form is
now integrated with native Payload and shares fifteen question controls and optional
ordered display/groups with Contact6. Typed `appearance` exposes source-supported
maximum width, spacing, columns and submit variant/size/shape/width; canonical
Storybook entries have working object controls. Defaults preserve the original.
The fixed 32rem available form-width breakpoint stacks narrow forms. Production
inherits its website theme; no new visual world or palette.

Authenticated form-form-layouts-3/-6, button-button-standard-1/-4,
button-button-outline-1/secondary-1/sizes-1/-2 are recorded in the
[appearance contract](../../docs/planning/form-appearance-controls.md). Desktop
light/mobile dark, groups, no overflow and first-error focus were reviewed;
new interaction play finishes. Dark axe has zero WCAG A/AA violations; known
Neutral light muted-surface contrast stays open. Verdict: bounded presentation
ready, with native/release/CI acceptance tracked separately in the checklist.
