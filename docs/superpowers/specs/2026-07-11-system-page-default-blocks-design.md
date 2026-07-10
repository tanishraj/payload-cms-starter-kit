# System Page Default Blocks Design

## Objective

Replace the current one-size-fits-all system page hero with three distinct default system page layouts:

- `404`
- `Maintenance`
- `Coming Soon`

The result should feel:

- simple
- responsive
- premium but reusable
- theme-aware through the existing Payload theme system
- safer for operators than a broad flexible block system

## Current Problem

The CMS already supports typed `System Pages`, but the current implementation treats them too similarly.

Today:

- `System Pages` correctly separates `404`, `Maintenance`, and `Coming Soon`
- the collection already restricts each type to its matching block
- the block configs currently share one field factory
- the frontend currently relies on one shared hero-style renderer for the fallback experience

That means the operational behavior is correct, but the visual and editorial experience is too generic. These are different page types with different jobs:

- `404` should help visitors recover
- `Maintenance` should explain temporary unavailability clearly
- `Coming Soon` should hold attention and build anticipation

## Design Goals

1. Give each system page type a distinct layout and tone.
2. Keep editing simple and predictable inside Payload.
3. Use the existing site theme tokens rather than hardcoded per-page palettes.
4. Stay responsive across mobile and desktop.
5. Reuse shadcn primitives wherever they fit naturally.
6. Preserve the current `System Pages` workflow and `Website Modes` behavior.
7. Avoid turning these operational pages into a generic landing-page builder.

## Recommended Approach

Keep the existing `System Pages` collection structure, but stop treating the three block types as visually interchangeable.

The system should move to:

- one curated layout for `404`
- one curated layout for `Maintenance`
- one curated layout for `Coming Soon`

Each block type remains strongly typed in the CMS, but each gets:

- its own focused block config
- its own frontend presentation component
- its own layout logic

This is preferred over:

- one shared hero with light visual variations, which remains too generic
- multiple preset options per type, which adds operational complexity without strong value for this starter

## Layout Direction

### 404

Purpose:

- help the visitor recover quickly
- turn a dead-end into a guided next step

Layout:

- asymmetric two-column frame on desktop
- stacked single-column layout on mobile
- left side is the main recovery message
- right side is a compact help panel with suggested destinations

Primary content:

- status code or badge
- heading
- short explanation
- primary action
- optional secondary action

Supporting content:

- small recovery links panel
- optional image or visual placeholder

Tone:

- calm
- navigational
- not alarming

### Maintenance

Purpose:

- communicate temporary unavailability with confidence
- reassure visitors that the interruption is intentional and temporary

Layout:

- centered status shell with narrower reading width
- optional lower information strip for practical details or actions
- more symmetrical than the `404` layout

Primary content:

- status badge
- heading
- service message
- supporting note
- primary and optional secondary actions

Supporting content:

- optional expected return time
- optional visual or icon-led status panel

Tone:

- operational
- trustworthy
- controlled

### Coming Soon

Purpose:

- hold attention during pre-launch
- feel optimistic and polished without reading like a marketing homepage

Layout:

- strong centered headline area
- larger breathing room than the other two types
- optional media surface below or beside the main content depending on viewport

Primary content:

- eyebrow or badge
- heading
- description
- CTA area

Supporting content:

- optional signup note or launch message
- optional image

Tone:

- anticipatory
- polished
- more expressive than `404` or `Maintenance`, but still restrained

## Shared Visual Rules

These layouts should feel related, but not identical.

Shared rules:

- use existing semantic theme tokens such as `background`, `foreground`, `muted`, `border`, `primary`, and `accent`
- respect the current `Theme Settings` presets: `default`, `blue`, and `sera`
- respect current color-scheme behavior: `system`, `light`, and `dark`
- use shadcn primitives such as `Button`, `Badge`, `Separator`, and `Card` when they naturally fit
- avoid hardcoded brand palettes inside the page-type components
- avoid making any layout dependent on one specific image being present

Typography direction:

- keep the current project font stack and theme inheritance
- use stronger spacing, framing, and layout hierarchy rather than introducing a new type system only for system pages

## Content Model

The CMS should stay simple.

### Shared Core Fields

All three block types should continue to support a familiar core:

- `badge`
- `heading`
- `description`
- `supportingNote`
- `primaryAction`
- `secondaryAction`
- `image`

### Type-Specific Fields

#### 404

- `helpLinks`
  - a short list of recovery destinations
  - examples: homepage, admissions, contact, articles

#### Maintenance

- `serviceMessage`
  - a concise operational message that can differ from the main description
- `expectedBackAt`
  - optional short text field for human-readable return timing such as `Expected back by 6:00 PM GST`

#### Coming Soon

- `eyebrow`
  - a lightweight launch label above the main heading
- `signupNote`
  - optional short note for launch interest, contact, or next-step context

### Editorial Constraint

This should not become a flexible multi-section block system.

Reasoning:

- these pages are operational surfaces
- they are edited under pressure
- predictability is more valuable than design freedom

## Rendering Architecture

The frontend should move from one shared hero renderer to a type-aware rendering path.

Recommended structure:

- keep one high-level `System Page` rendering entry point
- map each system block type to its own dedicated presentational component
- keep shared helper logic for action links and optional media handling where useful

Expected rendering split:

- `System404` renderer
- `SystemMaintenance` renderer
- `SystemComingSoon` renderer

These components should:

- accept only the data shape for their own block
- gracefully handle missing optional fields
- still look complete when image, secondary action, or extra fields are absent

## Responsive Behavior

All three pages must be mobile-first.

### 404

- stack into a single column on mobile
- recovery actions remain near the main message
- help panel moves below the primary content

### Maintenance

- remain centered and readable on narrow screens
- supporting strip collapses into a simple vertical stack

### Coming Soon

- preserve the headline-first hierarchy on mobile
- media drops below the text when horizontal space is limited

## Fallback Behavior

Current fallback behavior should stay intact.

That means:

- if `Website Modes` references a published `System Page`, that page renders
- if no custom `System Page` is selected for `404`, `Maintenance`, or `Coming Soon`, the built-in fallback UI still renders
- mode routing behavior must remain unchanged except for the homepage fallback fix already introduced separately

The new block system improves the custom managed `System Pages`. It must not remove the safe built-in fallback screens.

## shadcn Usage Strategy

Use existing project primitives first.

Preferred primitives:

- `Button`
- `Badge`
- `Separator`
- `Card` if needed for framed content surfaces

If a new shadcn primitive is needed, it should be introduced because it directly improves the layout structure, not because the page needs more ornament.

Use shadcnblocks only if:

- a block provides a clean, minimal structural pattern worth adapting
- it can be brought into the current theme/token system without fighting the codebase

The default preference is:

- native repo composition
- then shadcn primitives
- only then selective shadcnblocks borrowing

## Non-Goals

This pass should not include:

- a multi-layout preset picker per system page type
- a generic block-builder for system pages
- custom theming rules per system page type
- animation-heavy presentation
- signup backend flows for coming soon pages
- major changes to `Website Modes` logic

## Testing Strategy

### Automated

- verify block schemas expose the expected shared and type-specific fields
- verify `System Pages` still only allow the matching block type per system page type
- verify each renderer handles missing optional fields cleanly
- verify mode-based rendering still works for `404`, `Maintenance`, and `Coming Soon`

### Manual

- create one example page for each type in Payload
- preview each on desktop
- preview each on mobile
- verify the active theme preset changes the page naturally
- verify dark/light behavior stays correct
- verify built-in fallback screens still work when no custom page is selected

## Recommended Outcome

After this pass, the starter should ship with:

- distinct and purposeful system page designs
- a simpler operator editing experience than a flexible block system
- theme-aware layouts that feel integrated with the rest of the site
- safe fallback behavior even when editors have not configured custom system pages
