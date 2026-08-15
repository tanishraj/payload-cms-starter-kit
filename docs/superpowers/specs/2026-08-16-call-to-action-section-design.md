# Call to Action Section Design

## Problem

The Call to Action block currently renders a nested `bg-background` panel with its own optional border. That panel overrides the selected section surface and produces a large white rectangle inside tinted sections. The description can also span too widely, reducing readability. Its admin schema lacks the standard eyebrow field and does not offer the stacked/split header compositions available in comparable section blocks.

## Content Model

The Content tab will contain:

- `eyebrow`: optional small section label;
- `title`: required primary heading;
- `accentTitle`: optional italic second heading line;
- `description`: optional supporting text;
- `actions`: up to two shared section actions;
- `footerActions`: up to two shared footer actions.

The Theme Settings tab will contain:

- shared section `appearance` background and border controls;
- `headerLayout`: `stacked` or `split`, defaulting to `stacked`;
- `contentAlignment`: `left`, `center`, or `right`, controlling the grouped content alignment;
- `splitContentAlignment`: `top`, `center`, or `bottom`, shown only for the split layout and defaulting to `center`;
- shared `size` section-padding options.

The existing `borderStyle` field will be removed. Previously stored values require no migration because the renderer will no longer consume the field.

## Rendering

The outer `<section>` is the only visual surface. It receives the shared appearance background, foreground, and section-border classes. The inner content will not add a background, border, radius, or boxed padding.

Both layouts use the shared section eyebrow, heading, and description typography:

- The content area is constrained to a readable maximum width rather than spanning the entire container.
- The description is constrained more tightly than the heading and uses balanced wrapping.
- Alignment-aware width and margin classes place left, centered, and right content consistently.
- Actions remain directly associated with their supporting content.

### Stacked Layout

Eyebrow, title, accent title, description, and actions form one vertical group. The group respects the selected content alignment and remains compact enough to read as a single conversion prompt.

### Split Layout

On large screens, the eyebrow and heading occupy the lead column while the description and actions occupy a narrower supporting column. `splitContentAlignment` vertically aligns the supporting column to the top, center, or bottom of the heading column. On smaller screens the columns collapse into the same semantic DOM order: heading first, supporting content second.

Footer actions remain outside the main CTA composition and continue using the shared footer-action renderer.

## Compatibility And Error Handling

- Existing blocks without `headerLayout` render as `stacked`.
- Existing blocks without `splitContentAlignment` use `center` when switched to split.
- Invalid or stale layout, alignment, and size values fall back to their documented defaults.
- A missing or blank title continues to render no block; the required admin field prevents new incomplete records.
- Empty or invalid actions are filtered by the existing shared action resolver.

## Verification

Focused tests will cover:

- the standard Content and Theme Settings field contracts;
- removal of `borderStyle` from the schema and generated type;
- required title and the new eyebrow field;
- stacked and split layout classes;
- top, center, and bottom split alignment;
- left, center, and right content alignment;
- inherited `none`, subtle, and brand section surfaces with no nested `bg-background` panel;
- constrained description width and shared typography;
- actions, footer actions, blank-title handling, and stale-value fallbacks;
- registration in public and live-preview renderers.

Payload types and the Call to Action admin thumbnail will be regenerated after the schema and component changes. TypeScript, focused integration tests, lint, and thumbnail metadata checks must pass.

## Scope

This change does not add media, animation, new action variants, custom card surfaces, or change other blocks. It preserves the existing theme tokens and shared action behavior.
