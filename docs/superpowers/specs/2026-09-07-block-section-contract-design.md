# Block Section Contract Design

## Status

Awaiting written-spec review. The user approved the compatibility-first direction described in the
block consistency audit on 2026-09-07.

## Objective

Give every page-builder block a deliberate, testable section contract so equivalent fields and
actions behave the same in Payload Admin and on the public website. Preserve existing content and
block-specific layouts while removing accidental differences in field naming, field order,
alignment, padding, action capabilities, typography, and validation.

## Scope

This work covers the 57 blocks registered in the Page block catalog, their production and live
preview render paths, their shared field and presentation utilities, generated Payload types, block
contract tests, and the maintained block-system documentation.

It does not redesign individual card, table, calendar, gallery, form, or carousel bodies. Section
content alignment controls the section introduction and its action groups; it does not implicitly
change the alignment or geometry of block-specific body content.

## Chosen Approach: Compatibility-First Contract Profiles

Introduce explicit block profiles and reusable schema/presentation primitives, then migrate blocks
in focused batches. Shared contracts define common behavior, while a small profile registry records
intentional exceptions. Existing stored field names remain readable through typed normalization
adapters until a reversible migration is appropriate.

The profiles are:

1. **Standard Section** — an optional introduction, block-specific body, optional footer actions,
   shared appearance, shared padding, and Left/Center/Right introduction alignment.
2. **Hero Section** — image/video overlay content and hero-specific geometry, but actions use the
   same destination and presentation semantics as other CMS actions.
3. **Content-Only Section** — Rich Text, Stats Strip, and Quote retain specialized content-first
   anatomy and opt into only the common settings they can render meaningfully.
4. **Structural or Utility Section** — Reusable Section, Breadcrumb, and Announcement retain their
   structural roles and are explicitly exempt from irrelevant introduction fields.

This avoids both extremes: duplicating the current contracts block by block, and forcing decorative
or structural fields into blocks where they have no visitor-facing meaning.

## Standard Section Anatomy

Standard sections expose and render content in this order:

1. optional eyebrow;
2. title, required only when the renderer cannot function without one;
3. optional accent title;
4. optional description;
5. optional introduction actions;
6. block-specific content;
7. optional footer actions.

Payload Admin follows the same order. The public DOM follows the same semantic order, except a
block-specific responsive layout may place elements visually without changing document order.

The canonical storage names for new standard contracts are `eyebrow`, `title`, `accentTitle`,
`description`, `actions`, `footerActions`, `appearance`, `contentAlignment`, and `size`.

Existing exceptions remain readable:

- Page Header maps `subtitle` to the canonical description presentation.
- About Section keeps `body` as its long-form body rather than pretending it is short supporting
  copy.
- Testimonial Spotlight keeps its `sectionEyebrow`, `sectionTitle`, and `sectionDescription` fields
  separate from the inner testimonial content, and normalizes `sectionContentAlignment`.
- Media Carousel reads legacy `sectionActions` while new authoring uses the canonical action field.
- Breadcrumb keeps its content-size setting distinct from section padding.

No compatibility field is deleted as part of this implementation.

## Shared Schema Primitives

Add focused factories rather than one monolithic block builder:

- a section introduction field factory for eyebrow, title, accent title, description, and actions;
- a footer-actions field factory or documented wrapper around the existing action factory;
- a section alignment field factory with Left, Center, and Right;
- a section padding field factory with None, Compact, Default, and Comfortable;
- a section theme field composer containing appearance, alignment, and padding; and
- block-profile metadata used by catalog-derived contract tests.

Factories allow labels, maximum action rows, title requiredness, and deliberate profile restrictions
without changing the stored shape of existing fields.

The Theme Settings tab remains the single home for appearance, section padding, content alignment,
and block-specific visual options. The Content tab remains the home for visitor-visible copy,
relationships, media, actions, and block data.

## Shared Presentation Primitives

Add a composable section shell and introduction renderer:

- the shell applies semantic appearance, responsive section padding, and the standard container;
- the introduction renderer owns eyebrow, heading, description, introduction actions, spacing,
  content measure, and Left/Center/Right alignment;
- the existing `ContentActions` remains the canonical action renderer; and
- `BlockFooterActions` receives an explicit resolved alignment instead of silently centering.

The primitives remain server-capable and add no client boundary. Interactive blocks keep their
existing client components below the server-rendered introduction.

The shared introduction must omit empty markup. Accent-only titles remain valid where an existing
block already supports them. Heading levels remain context-aware and do not introduce multiple page
level-one headings.

## Action Contract

General introduction, footer, card, and item actions use the existing shared action factory and
resolver. They retain:

- Page, Custom URL, and File destinations;
- File View and Download behavior;
- independent Link or Button presentation;
- semantic button variants;
- optional navigation arrows;
- configurable download indicators; and
- destination-specific new-tab behavior.

Hero Banner and Hero Carousel move from private button schemas to a configured shared action schema.
Legacy `buttons` data remains readable. The hero presentation may restrict the default variants, but
it must not reimplement destination resolution or silently lose supported action data.

Domain-specific controls may use a restricted action profile when the interaction has fixed
semantics. Calendar PDF download and Download List document View/Download controls remain explicit
examples. Restrictions must be expressed through a shared factory or a documented specialized
factory rather than a one-off partial link schema.

Introduction and footer actions inherit the resolved section content alignment. A block may expose a
separate footer alignment only if it has a documented visual requirement; none is added by default.

## Targeted Gap Resolution

- Add the missing standard eyebrow capability to Q&A Accordion and Team Showcase.
- Expose Editorial Reasons footer actions that its renderer already accepts.
- Add standard footer actions to Logo Strip.
- Move every standard block's footer-actions field after its body fields in Payload Admin.
- Normalize Media Carousel action naming without breaking `sectionActions` content.
- Normalize Testimonial Spotlight section alignment without conflating its outer and inner headings.
- Give every standard section Left, Center, and Right introduction alignment.
- Make section alignment and padding required selects with defaults for standard sections.
- Align schema requiredness with runtime visibility. If a missing title makes a block return `null`,
  require the title; otherwise update the renderer to support a title-less introduction.
- Replace duplicated section heading, description, spacing, and action layout where the shared
  presentation can represent the existing output without erasing a deliberate layout variant.

## Compatibility and Data Integrity

Schema reordering changes only Admin presentation and does not alter stored paths. Adding optional
fields is non-destructive. Renamed concepts use legacy read fallbacks, generated-type unions, or
reversible migrations as required by Payload's stored shape.

The implementation must not bulk rewrite production data, remove hidden compatibility fields, alter
block slugs, change block IDs, or silently discard values. Production and live preview renderers must
accept the same normalized inputs. Reusable Sections retain recursion, cycle, anchor, and preload
behavior.

## Admin UX

Use unambiguous labels:

- `Introduction Actions` for actions immediately following the description; and
- `Footer Actions` for actions after the block-specific body.

Maximum row counts remain design constraints: two for most sections, one for intentionally focused
presentations, and three for Page Header and Banner CTA. Different row limits are not behavioral
drift as long as every row has the same supported action capabilities for its profile.

Field descriptions state that Section Content Alignment affects the introduction and both section
action groups, not card/table/body alignment. Hidden legacy fields remain clearly marked and are not
offered for new authoring.

## Accessibility and Responsive Behavior

- Preserve semantic links and buttons, download attributes, accessible names, focus indicators, and
  new-tab behavior from the existing shared action renderer.
- Keep heading order valid when introductions are absent.
- Preserve natural document order on compact screens.
- Action groups wrap vertically on small screens and align according to the resolved section
  alignment from the first breakpoint upward.
- Right alignment affects text and action positioning without reversing action order.
- No body content receives forced text alignment from the section introduction setting.

## Verification

Add catalog-derived contract tests that classify every registered Page block and fail when an
unclassified block is introduced. Tests cover:

- required Content and Theme Settings tab structure;
- standard introduction field names and ordering;
- footer actions following body content;
- complete general-action capabilities;
- documented restricted action profiles;
- shared appearance, alignment, and padding options;
- alignment propagation to introduction and footer actions;
- schema requiredness matching renderer behavior;
- production and live-preview renderer parity; and
- explicit exceptions for Hero, Content-Only, Structural, and Utility profiles.

Regenerate Payload types after schema changes. Run focused block, action, theme, live-preview, and
spacing tests while iterating, followed by the full integration suite, TypeScript, lint, and a
production build. Finish with the project-context update/check loop and update `block-system.md`
because the shared block architecture and authoring contract change.

## Alternatives Considered

### Big-bang field rename and universal block shape

Renaming every field and adding every introduction control to every block would look uniform in the
schema but would risk existing content, create meaningless settings for utility blocks, and require a
large data migration. It is rejected.

### Presentation-only normalization

Passing alignment consistently and sharing heading classes would fix visible drift quickly, but Admin
field order, names, validation, hero action capabilities, and future enforcement would remain
inconsistent. It is insufficient.

### Tests without shared primitives

Catalog-wide tests could freeze the desired behavior while leaving each block independently
implemented. This would detect drift but preserve duplication and make every contract adjustment
expensive. Tests are required, but they support rather than replace shared primitives.

