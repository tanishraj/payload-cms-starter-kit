# Editorial Reasons Block Design

## Goal

Add an independent **Editorial Reasons** page block based on the `WHY SNMIH` prototype section. The
block pairs an editorial introduction with a numbered, ruled list of reasons while remaining
reusable across sites, themes, and content domains.

This is a new block rather than a Content Highlights variant. Its sticky introduction, single-column
list, and restrained numbered rows are the defining composition, not optional presentation settings.

## Block identity and availability

- Admin label: **Editorial Reasons**
- Payload slug: `editorialReasons`
- Generated interface: `EditorialReasonsBlock`
- Available in Pages and Reusable Sections
- Supported by production rendering and page live preview
- Included in the thumbnail definition and fixture catalogs
- Documented in the block guide and feature inventory

This is an additive schema change and requires no content migration.

## CMS schema

The block follows the project's standard **Content** and **Theme Settings** tabs.

### Content

Section fields:

- `eyebrow`: optional short label
- `title`: required primary heading text
- `accentTitle`: optional second heading line rendered with restrained emphasis
- `description`: optional supporting textarea
- `actions`: up to two optional section actions using the shared action field

`reasons` is a required array with one to eight rows. Each row contains:

- `title`: required reason title
- `description`: optional supporting textarea
- `linkType`: None, Page, or Custom URL
- `page`: conditionally shown Page relationship
- `url`: conditionally shown custom URL
- `openInNewTab`: conditionally shown checkbox

Reason numbers are generated from array order as `01`, `02`, and so on. Editors cannot enter a
separate number because reordering must keep the visible sequence accurate. Rows without a
non-empty title are omitted defensively at render time.

### Theme Settings

- Shared block appearance controls
- Shared action mode: Link Text or Button
- `introVerticalAlignment`: Top, Center, or Bottom; defaults to Top
- `stickyIntro`: checkbox; defaults to enabled and only affects large screens
- Shared section padding: None, Compact, Default, or Comfortable

The reasons themselves do not expose card backgrounds, icons, badges, columns, or connector
controls. These would weaken the block's editorial list identity and duplicate other blocks.

## Visual design

The desktop composition uses the shared regular-block container and an asymmetric two-column grid:

```text
┌────────────────────────────┬──────────────────────────────────────────┐
│ EYEBROW                    │ 01   Reason title                        │
│ Primary heading            │      Supporting description             │
│ Emphasized heading line    ├──────────────────────────────────────────┤
│ Supporting description     │ 02   Reason title                        │
│ Optional actions           │      Supporting description             │
│                            ├──────────────────────────────────────────┤
│                            │ 03   Reason title                        │
└────────────────────────────┴──────────────────────────────────────────┘
```

- The desktop ratio uses the established Content Highlights split of `1fr / 2fr` with its shared-system gap.
- The introduction is left-aligned and constrained to a readable measure.
- When enabled, the introduction becomes sticky below the site header on large screens.
- `introVerticalAlignment` controls its initial position relative to the list without changing the
  sticky offset.
- The optional accent title is a separate semantic line inside the same `h2`; it inherits the
  shared section-heading display family, size, weight, and `currentColor`, adding only italic
  emphasis. The shared contract declares `var(--font-display)` explicitly so global selector order
  cannot change the result.
- The reasons form one vertical list with a subtle top rule and a bottom rule for every row.
- Each row uses a compact number column and a flexible content column.
- Generated numbers use the shared metadata typography and supporting-text color.
- Reason titles use the regular item-heading scale; descriptions use semantic secondary text.
- Linked titles retain visible keyboard focus, underline on hover, and safe external-link
  attributes.
- Section actions use the shared Content Actions implementation and selected action mode.

No shadows, detached cards, decorative icons, or one-off color values are introduced. The asymmetric
sticky composition is the block's distinctive element.

## Theme behavior

The block uses only existing semantic systems:

- `resolveBlockAppearanceClasses` for section background, foreground, and configured borders
- shared `contentStyles` contracts for introduction, heading, description, item, metadata, and link
  typography shared with Content Highlights
- `SectionEyebrow` for surface-aware eyebrow color
- `border-border` for the same semantic divider color as Content Highlights
- `text-current` and `text-current/70` for titles and supporting text
- shared Content Actions for theme-aware links and buttons

The prototype's blue-to-mint wash is represented through the selected semantic block background,
not embedded into this reusable component. SNMIH and other themes therefore determine the final
surface and dark-mode palette automatically.

## Responsive behavior

- Below the large breakpoint, the columns stack with the introduction first.
- Sticky positioning is disabled when stacked.
- Mobile retains the ruled list and generated numbers.
- The number column narrows on small screens while preserving two-digit alignment.
- Section padding follows the shared regular-block scale.
- Long headings and descriptions wrap naturally without truncation or fixed heights.
- Actions wrap through the existing shared action layout.

## Rendering and data flow

`EditorialReasonsBlockComponent` is a server component. It:

1. trims and validates the section content;
2. filters unusable reason rows;
3. resolves Page and custom destinations with the existing CMS link helpers;
4. resolves shared actions, appearance, and spacing;
5. renders the introduction and numbered list directly.

The component returns `null` when the primary title is empty or no usable reasons remain. Missing
accent title, description, actions, item description, or item link reserves no empty space.

No client state, animation dependency, browser API, or database migration is required.

## Registration and documentation

Implementation registers Editorial Reasons in:

- `src/collections/Pages.ts`
- `src/collections/ReusableSections.ts`
- `src/blocks/renderPageBlocks.tsx`
- `src/blocks/renderLivePreviewPageBlocks.tsx`
- `src/block-thumbnails/definitions.ts`
- `src/block-thumbnails/fixtures.tsx`

Generated Payload types are refreshed after registration. The block guide and feature inventory are
updated, including the normal Page and Reusable Section block counts.

## Accessibility

- The section has one `h2`; each reason uses an `h3`.
- Generated numbers are decorative ordering cues and are hidden from assistive technology because
  DOM order already conveys the sequence.
- Links and actions retain visible keyboard focus.
- No content or action depends on sticky positioning or hover.
- Reading and tab order follow introduction, section actions, then reasons in array order.

## Testing and verification

Automated coverage verifies:

- the Payload schema, tabs, field requirements, limits, defaults, and link conditions;
- registration in Pages, Reusable Sections, production rendering, and live preview;
- generated two-digit numbering and filtering of invalid rows;
- optional accent title, descriptions, actions, and reason links;
- sticky and non-sticky introduction behavior;
- top, center, and bottom desktop alignment mappings;
- one-column mobile and asymmetric desktop layout classes;
- semantic appearance, divider, typography, and spacing hooks;
- safe custom and Page-link resolution;
- thumbnail definition and fixture coverage;
- generated Payload type coverage and documentation counts.

Validation includes focused Vitest coverage, Payload type generation, TypeScript, scoped ESLint,
format/diff checks, and one bounded desktop/mobile visual inspection under light and dark themes.

## Out of scope

- Adding a presentation variant to Content Highlights
- Manually editable reason numbers
- Per-reason icons, images, backgrounds, or buttons
- Reversing the intro/list column order
- Scroll-triggered animation
- Hard-coded SNMIH colors or typography
