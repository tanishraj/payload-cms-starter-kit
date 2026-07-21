# Content Highlights Layout Extensions

## Goal

Extend the existing Content Highlights block with two additional presentation layouts without introducing another Payload block or duplicating its content model.

## Scope

Add these values to the existing `layout` field:

- `simpleGrid`, labeled **Simple Grid**
- `numberedSteps`, labeled **Numbered Steps**

The existing `editorialRow`, `highlightsGrid`, and `splitHighlights` layouts remain available and retain their current rendering behavior.

## Shared content and configuration

Both new layouts reuse the current block fields:

- Eyebrow
- Title
- Description
- Optional section actions
- One to six items
- Item metadata
- Item title
- Item description
- Optional item destination
- Appearance settings
- Action mode
- Size

No migration or backward-compatibility adapter is required because the block slug and all existing layout values remain unchanged.

## Simple Grid

Simple Grid presents concise requirements, services, qualifications, or similar content without cards or item separators.

- One column on mobile.
- Two columns from the medium breakpoint upward.
- Each item uses the shared Content Highlights item typography.
- Item title and description remain the primary content.
- Optional metadata appears above the title when supplied.
- Optional item destinations continue to make the title interactive using the existing link behavior.
- Section-level actions remain below the introduction, consistent with Highlights Grid.

## Numbered Steps

Numbered Steps presents ordered processes in bordered cards.

- Step numbers are generated from array order and formatted as `01`, `02`, and so on.
- One column on mobile.
- Two columns from the medium breakpoint.
- Up to four columns from the large breakpoint.
- Five or six items wrap naturally to another row.
- Cards use theme tokens for border color, text color, background behavior, and radius.
- Each card contains the generated number, optional metadata, title, and optional description.
- Optional item destinations retain the existing linked-title interaction.
- Section-level actions remain below the introduction, consistent with Highlights Grid.

## Styling and responsiveness

- Both layouts use the shared regular-block outer spacing: `py-12 md:py-16`.
- Both remain constrained to the shared website container.
- Typography matches existing regular content blocks.
- Light and dark modes derive colors from the existing block appearance and semantic theme tokens.
- Compact, Default, and Comfortable continue to control internal section gaps only; their outer spacing remains identical.
- Numbered cards use the project theme radius rather than a hard-coded radius.

## Component structure

- Extend `ContentHighlightsLayout` with the two layout values.
- Add layout-specific grid classes to the existing layout map.
- Keep the current shared introduction component.
- Keep the current item component for existing layouts and Simple Grid, with presentation flags where needed.
- Add a focused numbered-item renderer, or a clear numbered presentation branch within the item component, so generated numbering does not leak into other layouts.
- Keep Payload data normalization and link resolution unchanged.

## Validation and fallback behavior

- The existing requirement for a non-empty block title and at least one usable item remains unchanged.
- Invalid or missing item destinations render the item as non-interactive content through the existing normalization behavior.
- Missing descriptions or metadata do not reserve empty space.
- An unknown or null layout continues to fall back to `highlightsGrid`.

## Testing

Integration tests will verify:

- Payload exposes all five layout options.
- Existing layout options and behavior remain unchanged.
- Simple Grid uses the expected one- and two-column responsive contract without cards or separators.
- Numbered Steps renders automatic zero-padded numbering.
- Numbered Steps uses one, two, and four responsive columns and wraps up to six items.
- Numbered cards use semantic border and radius classes.
- Theme appearance, shared outer spacing, optional metadata, item links, and section actions remain functional.
- Empty required display content still returns no block output.

## Out of scope

- Manually editable step numbers.
- Reordering controls beyond Payload's existing array reordering.
- Layout-specific content fields.
- A separate Requirements or Process block.
- Changes to the three existing layouts.
