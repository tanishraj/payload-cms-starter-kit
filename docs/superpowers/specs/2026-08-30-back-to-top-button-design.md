# Back to Top Button Design

## Objective

Add a globally available Back to Top control to the public website. The control should improve navigation on long pages while remaining visually quiet, accessible, theme-aware, and isolated from Payload Admin.

## Scope

- Render once in the public frontend layout.
- Enable it on every public page without an editor-facing setting.
- Do not render it in Payload Admin or development-only block thumbnail routes.
- Reuse the shared Button primitive and semantic theme tokens.

## Interaction

- Keep the control hidden while the visitor is near the top of the page.
- Reveal it after the visitor has scrolled at least one viewport height.
- Clicking it scrolls the document to the top.
- Use smooth scrolling when motion is allowed.
- Use immediate scrolling when `prefers-reduced-motion: reduce` is active.
- Recalculate visibility on resize so the viewport-based threshold stays accurate.

## Presentation

- Use a compact icon-only button with the Lucide `ArrowUp` icon.
- Position it at the bottom-right of the viewport with responsive spacing and mobile safe-area support.
- Use the shared primary Button treatment, including the theme-defined control radius, light/dark colors, hover state, and focus ring.
- Reveal and hide it with opacity and vertical translation without moving page content.
- Keep it below cookie consent, dialogs, galleries, and other modal layers.

## Accessibility

- Use a native button with `type="button"`.
- Provide `aria-label="Back to top"` and a matching tooltip through `title`.
- Remove the hidden control from pointer and keyboard interaction.
- Preserve the visible shared focus treatment.
- Mark the arrow icon as decorative.
- Do not move keyboard focus automatically after activation.

## Technical Design

- Add a focused client component under `src/components/global`.
- Track only the derived visible/hidden state, not the raw scroll position.
- Register the scroll listener as passive and coalesce measurements with `requestAnimationFrame` to avoid excessive React updates.
- Clean up scroll and resize listeners and any scheduled animation frame on unmount.
- Mount the component alongside the other global public controls in `src/app/(frontend)/layout.tsx`.
- Keep the component independent of Payload data and avoid adding a schema, migration, or generated-type change.

## Verification

- Add a focused integration contract covering global layout placement, visibility threshold behavior, accessible labeling, reduced-motion scrolling, safe-area positioning, and shared Button usage.
- Run the focused test, TypeScript validation, and lint for the affected files.
- Complete the project-context update/check loop.

## Out of Scope

- Editor configuration.
- Per-page overrides.
- Scroll-progress indicators.
- Automatic focus movement to the header or main content.
