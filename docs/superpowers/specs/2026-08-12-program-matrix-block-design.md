# Program Matrix Block Design

## Goal

Add an independent Program Matrix page block that presents academic programmes in a seamless,
theme-aware matrix matching the supplied reference while supporting optional per-item Button or
Link Text actions.

Program Grid remains unchanged.

## Block Identity and Availability

- Admin label: **Program Matrix**
- Payload slug: `programMatrix`
- Generated interface: `ProgramMatrixBlock`
- Available in normal Pages and Reusable Sections
- Supported by production rendering and page live preview
- Included in the block-thumbnail definition and fixture catalogs
- Documented in the feature inventory

This is an additive schema change and requires no content migration.

## CMS Schema

The block uses the standard **Content** and **Layout & Theme** tabs.

### Content

Section fields:

- `eyebrow`: optional short text
- `title`: required text
- `description`: optional textarea
- `actions`: up to two optional section actions using the shared action field

`items` is a required array with one to twenty-four rows. Each row contains:

- `icon`: optional Lucide icon name
- `title`: required text
- `metadata`: optional short text such as “4.5 Years + 1 Year Internship”
- `description`: optional textarea
- `linkType`: None, Page, or Custom URL
- `page`: conditionally shown Page relationship
- `url`: conditionally shown custom URL
- `openInNewTab`: conditionally shown checkbox

Rows without a non-empty title are omitted defensively at render time. A valid title is sufficient
to render a row; icon, metadata, description, and action are optional.

### Layout & Theme

- Shared block appearance controls
- `actionMode`: Button or Link Text, using the shared action-mode field and applying to section
  and programme actions
- `actionVariant`: Primary, Secondary, or Outline for programme buttons; shown for Button mode
- `itemActionLabel`: shared visible label for linked programme items, defaulting to “Learn More”
- `contentAlignment`: Left or Center, defaulting to Left; applies only to the section introduction
  and section actions
- `size`: None, Compact, Default, or Comfortable using the shared regular-block spacing scale

Programme cell copy remains left-aligned for scanability regardless of section alignment.

## Action Behavior

Each programme row owns only its destination. Presentation is configured once at block level:

- **Button** renders the shared Button component with the selected variant.
- **Link Text** renders a text link with an Arrow Right icon and semantic primary color.
- Rows with Link set to None render no item action.
- Section actions remain independent of item actions.
- Page and custom links use the existing CMS link resolution rules.
- External links receive `target="_blank"` only when configured and include safe `rel` values.

Actions are visible controls inside the cell. The complete cell is not made clickable, avoiding
nested-link conflicts and preserving an explicit action affordance.

## Icon Resolution

Program Matrix accepts Lucide names in common authoring formats:

- `hospital`
- `Hospital`
- `graduation-cap`
- `GraduationCap`
- names containing spaces or underscores after trimming

A server-side resolver normalizes case and separators, then returns the Lucide component object
before rendering. This preserves the component-object rendering contract and does not send an
all-icons lookup to the browser.

Missing or invalid icon names render no icon container. They never silently substitute Star or
another misleading symbol. Icons are decorative and use `aria-hidden="true"`.

The resolver is implemented as a focused shared utility so other CMS icon consumers can adopt it
later, but updating existing Icon Grid, Bento Grid, Media Carousel, and About Section behavior is
outside this block implementation.

## Visual Design

The section uses the standard regular block container and selected block spacing.

The introduction is a restrained editorial stack:

- optional mono uppercase eyebrow in semantic primary
- serif section title using the existing block heading scale
- readable supporting description in semantic muted foreground
- optional section actions below the description

The programme matrix uses:

- one semantic outer border
- the active theme radius on the outer clipping frame
- no gaps between cells
- one column below the tablet breakpoint
- two equal columns from the tablet breakpoint upward
- semantic internal dividers without doubled borders
- equal-height cells within each desktop row
- generous but responsive cell padding
- optional primary-colored Lucide icon
- serif programme title
- mono uppercase metadata
- readable supporting description
- action anchored after the content without forcing empty space when absent

The matrix supports any valid item count. Odd final items preserve the outer frame and correct
divider treatment without spanning two columns.

All colors use `background`, `card`, `foreground`, `muted-foreground`, `primary`,
`primary-foreground`, and `border` tokens. No raw light/dark colors or manual dark-mode
exceptions are added.

## Responsive Behavior

- Mobile: one column with horizontal dividers and reduced cell padding
- Tablet and desktop: two columns with vertical and horizontal internal dividers
- Section heading alignment follows the configured Left or Center value at every breakpoint
- Programme content remains left-aligned
- Programme Button and Link Text actions remain intrinsic-width, align to the start of the cell,
  and wrap only when the available cell width requires it
- Long titles, metadata, and descriptions wrap naturally without fixed heights or truncation

## Rendering and Data Flow

`ProgramMatrixBlockComponent` is a server component.

It:

1. trims and validates section and item content;
2. resolves page/custom destinations through existing link helpers;
3. resolves optional icons into Lucide component objects;
4. resolves shared block appearance and spacing classes;
5. renders the editorial introduction and matrix directly.

No client state, filtering, animation, or browser APIs are required.

## Registration and Preview

Implementation registers Program Matrix in:

- `src/collections/Pages.ts`
- `src/collections/ReusableSections.ts`
- `src/blocks/renderPageBlocks.tsx`
- `src/blocks/renderLivePreviewPageBlocks.tsx`
- `src/block-thumbnails/definitions.ts`
- `src/block-thumbnails/fixtures.tsx`

The thumbnail fixture uses four medically relevant programme examples and produces a dedicated
Program Matrix preview asset through the existing thumbnail workflow.

Generated Payload types are refreshed after schema registration.

## Accessibility

- The section uses a heading hierarchy with one section `h2` and item `h3` headings.
- Decorative icons are hidden from assistive technology.
- Buttons and links retain visible focus styles from shared components and link conventions.
- Action text is descriptive and supplied by the editor.
- No interaction depends on hover.
- Matrix reading order follows DOM order from top-left to bottom-right.

## Testing

Integration coverage verifies:

- Payload slug, labels, tabs, defaults, field conditions, row limits, and required fields
- registration in Pages and Reusable Sections
- production and live-preview renderer parity
- block-thumbnail definition and fixture parity
- valid-item filtering and empty-block behavior
- flexible Lucide name normalization and invalid-icon omission
- section introduction and content alignment
- one-column mobile and two-column tablet/desktop matrix classes
- internal divider behavior for even and odd item counts
- Button, Link Text, no-link, internal-link, and external-link behavior
- semantic appearance, radius, spacing, typography, and color classes
- generated Payload type presence

Run focused tests, targeted ESLint, TypeScript checking, type generation, and the production build
in proportion to the schema and registration changes.

## Documentation

Update the feature inventory to include Program Matrix in the normal Page and Reusable Section
block catalogs and describe its matrix layout, icon input, and optional action modes.

## Out of Scope

- Changing or migrating Program Grid
- Filtering, search, pagination, or carousel behavior
- Programme images, badges, intake filtering, or database-backed programme collections
- Updating icon resolution in existing Icon Grid, Bento Grid, Media Carousel, or About Section
- Data migrations for existing pages
