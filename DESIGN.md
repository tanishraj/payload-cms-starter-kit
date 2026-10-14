---
name: "Revamp Workshop — Official Neutral / Radix Luma"
description: "Source-backed presentation vocabulary for the Storybook revamp catalogue only."
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  primary: "oklch(0.205 0 0)"
  primary-foreground: "oklch(0.985 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  input: "oklch(0.922 0 0)"
  ring: "oklch(0.708 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0.145 0 0)"
  accent: "oklch(0.97 0 0)"
  accent-foreground: "oklch(0.205 0 0)"
  dark-background: "oklch(0.145 0 0)"
  dark-foreground: "oklch(0.985 0 0)"
  dark-primary: "oklch(0.922 0 0)"
  dark-primary-foreground: "oklch(0.205 0 0)"
  dark-muted-foreground: "oklch(0.708 0 0)"
  dark-input: "oklch(1 0 0 / 15%)"
  dark-ring: "oklch(0.556 0 0)"
  dark-destructive: "oklch(0.704 0.191 22.216)"
  dark-popover: "oklch(0.205 0 0)"
  dark-popover-foreground: "oklch(0.985 0 0)"
  dark-accent: "oklch(0.269 0 0)"
  dark-accent-foreground: "oklch(0.985 0 0)"
typography:
  title:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "2rem"
  body:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  label:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.375"
rounded:
  2xl: "1.125rem"
  3xl: "1.375rem"
  4xl: "1.625rem"
spacing:
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  7: "1.75rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.4xl}"
    padding: "0 0.75rem"
    height: "2.25rem"
  button-primary-dark:
    backgroundColor: "{colors.dark-primary}"
    textColor: "{colors.dark-primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.4xl}"
    padding: "0 0.75rem"
    height: "2.25rem"
  form-input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.3xl}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
    width: "100%"
  form-textarea:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.2xl}"
    padding: "0.75rem"
    width: "100%"
  form-select:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.3xl}"
    padding: "0.5rem 0.75rem"
    height: "2.25rem"
    width: "100%"
---

# Design System: Revamp Workshop

## Overview

**Creative North Star: "Official Neutral / Radix Luma"**

This document describes the existing `.storybook` and `src/components/revamp` workshop only. The workshop inherits official shadcn Neutral in light and dark modes, fresh Radix Luma presentation dependencies, Lucide icons and system sans-serif typography. Its character is calm, readable and rounded, with semantic color roles and restrained interaction feedback.

The shipped Generic Form preserves authenticated Shadcnblocks composition while connecting typed questions and submission states. This is a record of the workshop source, not a replacement identity for the existing SNMIH production website. At workshop approval, production integration was still future work; the native adapter added below now uses the existing website theme. The finish-review disposition is **ship for the workshop**, with no material fixes and an empty detector result reported by the reviewer; this does not establish browser/CMS/native-admin acceptance or production launch readiness.

**Key Characteristics:**

- Official Neutral light/dark semantics with state-specific error color.
- System sans-serif hierarchy and Lucide pictograms inherited from upstream.
- Rounded Luma controls and flat form surfaces.
- Preserved upstream compositions with caller-owned data and persistence.

Source authority: `.storybook/neutral.css`, `.storybook/preview.css`, `.storybook/preview.ts`, fresh components under `src/components/revamp/ui`, `src/components/revamp/generic-form.tsx` and its stories. Semantic CSS remains the implementation source of truth; frontmatter records the observed subset used by this artifact. Dark-prefixed color entries are the corresponding `.dark` values, not an additional palette.

## Colors

Achromatic surfaces and text keep questions central; the destructive role adds red only for invalid or error states.

### Primary

- **Neutral Ink / Light Neutral:** primary and its contrasting foreground fill the submit action and selected checkbox; the light/dark roles exchange luminance through the official theme.
- **Error Red:** destructive colors identify invalid controls, field messages and submission alerts, alongside text and semantic attributes.

### Neutral

- **Canvas / Reading Text:** background and foreground own the form surface and main content.
- **Supporting Neutral:** muted foreground owns descriptions, placeholders, required-field guidance and pending/success messages.
- **Control Neutral:** input provides the unchecked checkbox fill and primitive defaults. Generic Form intentionally overrides text, select and textarea fills to background, sharing the canvas surface.
- **Focus Neutral:** ring identifies keyboard focus with a border and translucent outer ring.
- **Floating Neutral:** popover and its foreground separate the opened select menu; accent roles mark its focused option.

**The Semantic Theme Rule.** Use the workshop's existing semantic roles and official light/dark values; preserve the production theme boundary.

## Typography

**Title and Body Font:** the inherited Tailwind system sans-serif stack. There is no custom display font or mono role in this workshop artifact.

### Hierarchy

- **Title:** a bold second-level heading introduces the form using the title token.
- **Body:** descriptions, required guidance and errors use the body role; FieldDescription uses normal line height while the introductory description uses the standard small-text line height.
- **Label:** medium-weight control labels use snug line height so wrapped questions remain readable. Buttons use small medium text with the standard small-text line height.
- **Entered answers:** text inputs and textarea use a base size (1rem) below the medium breakpoint and small text (0.875rem) from that breakpoint onward. Select triggers remain small text.

## Layout

The workshop supports responsive reflow with Storybook's theme and viewport toolbars. Component-specific composition belongs in a surface brief. Generic Form is fluid to its container, capped at the inherited medium maximum width (28rem), with a vertical form stack and full-width submit action. It does not expose a column-count, density or alternative-layout prop.

The reused rhythm is half-rem heading spacing, three-quarter-rem field spacing, one-rem form spacing and one-and-three-quarter-rem FieldGroup spacing. Checkbox labels stay beside the checkbox and wrap. The Field vertical orientation makes controls fill available width.

**The Upstream Composition Rule.** Preserve selected source structure and default presentation; typed integration props configure supported content and behavior.

## Elevation & Depth

The form is flat: it has no card wrapper or decorative resting shadow. The opened select menu inherits a soft large shadow and a fine foreground ring. Focus and error rings belong to interaction feedback, not surface elevation. Button press movement and inherited select animations are described in the sidecar; no new motion grammar is introduced.

## Shapes

The workshop's base radius is inherited from Neutral, with the larger scaled radii recorded above. Text/select controls use the third large radius, textarea uses the second, and buttons use the fourth. The checkbox retains its upstream small curved-square silhouette (5px corners). Controls use transparent borders at rest, with visible focus and invalid borders/rings when needed.

## Components

### Buttons

The shipped form uses the default primary button with the default height, medium small text and full available width. Hover reduces primary fill opacity. Keyboard focus shows a ring; a direct press shifts it slightly downward. Disabled and pending states prevent interaction and reduce opacity. Other upstream Button variants remain available in the dependency; they are not exposed as Generic Form configuration.

### Inputs / Fields

Text, email and telephone inputs, textarea and select preserve their fresh upstream shape, focus and invalid treatments. Their background matching the canvas is intentional in the authenticated form composition. Do not treat the lack of a contrasting resting fill as permission to restyle the selected source. Focus uses a three-pixel neutral ring at 30% opacity. Invalid controls use destructive borders and a three-pixel ring at 20% opacity in light mode and 40% in dark mode, with the inherited dark border adjustment.

Each visible question has a custom name and label, with optional placeholder, required state and contact-role metadata. Labels associate to per-instance IDs; invalid messages associate to their controls. Required questions show an asterisk plus a shared explanation. Field-level errors and the submission summary use alerts; pending/success use a status region. The first invalid question receives focus and success moves focus to the confirmation. Disabled/pending controls reduce opacity; answers remain available after an unconfirmed submission for retry.

### Checkbox and Select

The checkbox uses the primary fill and inline Lucide checkmark when selected; its label wraps within a horizontal field. The select uses Radix behavior, a Lucide chevron, a floating menu and focused-option accent treatment. These are inherited components, not bespoke alternatives.

### Generic Form

The form accepts the six existing control types: text, email, phone, textarea, select and checkbox. Its typed props are `fields`, `heading`, `description`, `submitButtonLabel`, `pendingLabel`, `disabled` and asynchronous `onSubmit`. The field schema controls supported questions and select options. Invalid or empty definitions render an unavailable alert. Replacing the schema resets removed answers and status. Caller code owns transport, form identity, fetching and persistence; workshop callbacks and sample answers are synthetic.

Surface details, source provenance and story controls: [Generic Form brief](.impeccable/surfaces/src-components-revamp-generic-form-tsx.md). Review evidence belongs in [the workshop review](docs/planning/generic-form-workshop-review.md).

## Do's and Don'ts

### Do:

- **Do** use the official workshop semantic roles in both theme modes.
- **Do** preserve authenticated upstream structure, styling and interactions.
- **Do** expose supported content and behavior through typed props and labelled Storybook controls.
- **Do** pair invalid color with field messages, associated descriptions and focus recovery.
- **Do** keep transport and persistence with the caller and demonstration data synthetic.

### Don't:

- **Don't** apply this workshop identity to the existing SNMIH production themes or public site without a separate integration decision.
- **Don't** replace the inherited shared-surface controls with a custom visual alternative.
- **Don't** invent layout or style variants that the selected source and component API do not support.
- **Don't** describe workshop review as completed CMS, native-admin or production acceptance.

Integration update, 6 October 2026: the native Generic Form adapter inherits shared
website shadcn theme tokens. The user explicitly rejected a form-specific stylesheet;
no Neutral palette override is shipped on public pages. The Neutral workshop remains
the source-review environment. Reusable Forms own the questions; form blocks own the
selected upstream layout. Contact6 is the next sourced layout, with dynamic questions.

### Configured question increment — 14 October 2026

Generic Form and Contact6 retain sourced Field/FieldDescription composition. Optional per-question help sits below the control (below the horizontal checkbox row); aria-describedby includes both help and any error. Initial answers and Text/Textarea limits configure behavior without adding visual variants or a new palette. Desktop, 390px mobile and existing Neutral dark previews retain wrapping and primary-action hierarchy. Configured Validation’s browser play reaches confirmation after rejecting a short answer. Finish review disposition: ship this bounded configuration presentation; no restyling required. This does not close wider forms/editor accessibility acceptance or change the earlier workshop contrast qualification.

### URL and Number increment — 14 October 2026

The existing sourced Input/Field composition now supports complete URL questions and decimal-number questions. Number uses text Input with decimal input mode to retain invalid or precise decimal entries for correction; its range/increment settings use shared validation and existing inline errors. Desktop, 390px and Neutral dark retain the current hierarchy and wrapping. URL And Number Validation reaches confirmation after rejected URL/step answers and first-error focus. Finish disposition: ship the bounded behavior extension without changing primitives, structure or theme; broader accessibility and the earlier contrast qualification remain open.

### Choice controls increment — 14 October 2026

Authenticated RadioGroup form rows, Field checkbox groups and count-trigger searchable multi-select extend the pinned form world. Unique control/legend/help/error IDs, generated cmdk search labels, selected-option announcements and a theme-contained named dialog connect the sourced interactions to dynamic questions. Optional Radio answers can be cleared. The picker prefers above-trigger placement through the supported Popover side API to avoid a bottom consent bar; Radix collision handling remains enabled and layer styling is unchanged. Shared validation retains selections for correction; recovery explains removed selections separately from cleared answers. Canonical choice validation and recovery plays reach confirmation; desktop, 390px and Neutral dark retain wrapping and primary-action hierarchy. Finish disposition: ship the bounded sourced choice presentation without palette or form stylesheet changes. Full admin accessibility and the earlier contrast qualification remain open.

### Switch, Date and Time increment — 14 October 2026

The pinned form world extends through authenticated labelled Switch and native date/time Input examples. Decorative icon position/padding and upstream Switch shape remain intact; icons do not intercept input actions. Browser-native picker chrome follows the existing light/dark scheme through scoped utilities, correcting invisible dark picker icons without introducing a palette or stylesheet. Visitor help describes permitted values, and errors focus native inputs/switches. Validation and changed-rule recovery plays reach confirmation with deliberate correction/resubmission. Desktop, 390px and Neutral dark reviewed. Finish disposition: ship this bounded sourced presentation; native platform appearance, full browser/admin accessibility and the prior contrast qualification remain open.

### Private file increment — 14 October 2026

Authenticated Input Special 1 preserves the native picker, bordered metadata rows and remove action; Direct Upload Special 7 supplies progress composition with the exact Radix Luma Progress dependency. Integration adds real progress, explicit retry, abort/removal and send blocking, with existing Field labels/help/errors. Native admin download integration uses the existing administration styling boundary; no frontend palette is loaded into Payload. The file list keeps long names within its row, labels removal/retry and explains private-upload versus final response capture. Canonical workshop upload/removal/retry/submission states and desktop/390px Neutral dark are reviewed. Finish disposition: ship this bounded sourced behavior; full admin accessibility, hosted storage/scanning acceptance and the earlier workshop contrast qualification remain open.
