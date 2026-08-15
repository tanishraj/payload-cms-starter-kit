# Shared White Button Variants Design

## Goal

Add two predictable, fixed-white button variants to the shared CMS action system so editors can use them in any block that consumes the shared button options.

## Scope

The feature adds two shared variants:

- `white`, labeled **White Filled**
- `whiteOutline`, labeled **White Outline**

Both variants remain white regardless of the active site theme or surrounding section surface. They are intended primarily for brand, dark, gradient-brand, and image-overlay surfaces. The admin description will state this constraint because either variant may have insufficient contrast on a white or similarly light background.

No existing variant, default selection, or surface-specific behavior changes.

## Presentation

### White Filled

- White background and border
- Black text for strong, theme-independent contrast
- Slightly dimmed white background on hover
- White focus border and translucent white focus ring

### White Outline

- Transparent background
- White border and text
- Subtle translucent white background on hover
- White focus border and translucent white focus ring

The variants will be defined directly in the shared button component. Existing global surface selectors target only current variant names, so they must not alter either new variant.

## CMS and Data Contract

The central shared Payload option list will expose both variants. Any block that imports that list will receive them automatically, including shared content actions and specialized block action fields.

The shared CMS action TypeScript union will accept both values. Payload types will be regenerated after the schema changes.

Stored values use `white` and `whiteOutline`. Existing content remains valid and retains its current rendering.

## Verification

Automated coverage will verify:

- Both labels and values appear in the central shared option list and all consumers continue to preserve their existing defaults.
- Action resolution preserves both values.
- The shared button renderer emits the correct variant hooks and fixed-white classes.
- Existing brand and overlay CSS does not capture or override the new variants.
- Generated Payload types include both values.
- TypeScript, lint, focused integration tests, and the full relevant integration suite pass.

Visual verification will cover filled and outlined buttons on a dark or brand surface, including hover/focus intent and mobile sizing.
