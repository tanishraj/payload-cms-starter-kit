# Shadcnblocks Carousel Alignment Design

## Goal

Align the new `Hero Carousel` and `Gallery Coverflow` Payload blocks with their intended shadcnblocks references while preserving the new block identities and the content already authored against their schemas.

- `Hero Carousel` adapts `@shadcnblocks/ecommerce-hero7` as a full-bleed image or video carousel with overlaid marketing copy.
- `Gallery Coverflow` adapts `@shadcnblocks/hero210` as a centered content section with a Swiper coverflow image carousel.

The source blocks are visual and structural references. The final components must use this project's Payload media, CMS links, theme tokens, spacing utilities, and installed shadcn primitives.

## Canonical Identity

These remain two new blocks. They do not replace or alias the existing `Hero Banner` and `Gallery Showcase` blocks.

| Block             | Payload slug       | Interface               | Registry reference              |
| ----------------- | ------------------ | ----------------------- | ------------------------------- |
| Hero Carousel     | `heroCarousel`     | `HeroCarouselBlock`     | `@shadcnblocks/ecommerce-hero7` |
| Gallery Coverflow | `galleryCoverflow` | `GalleryCoverflowBlock` | `@shadcnblocks/hero210`         |

Existing documents using either new slug must remain valid. No data migration or compatibility alias is required.

## Approved Scope

### Hero Carousel

Preserve the existing slide fields:

- optional background image;
- optional direct background video URL, taking precedence over the image;
- optional eyebrow, title, and description;
- up to two shared CMS-style links with a shadcn Button variant.

Preserve block-level overlay, height, autoplay, arrow, and dot controls. The component deliberately omits Ecommerce Hero 7's product card, pricing, badges, rating, and shopping actions. The requested adaptation is the source block's full-bleed carousel and overlaid text treatment, not its ecommerce data model.

At least one valid slide is required at render time. A slide is valid when it resolves either a background image or a non-empty video URL. Invalid slide rows are omitted. The block renders nothing if no valid slides remain.

### Gallery Coverflow

Preserve the existing optional eyebrow, title, description, one shared action, appearance settings, alignment, spacing size, and three-to-twenty image array. Each valid image is resolved through the shared Payload media helper with Media alt text. Invalid image rows are omitted, and the block renders nothing when fewer than three valid images remain.

## Rendering Architecture

Payload adapters remain Server Components. They trim and normalize authored values, resolve media and CMS links, apply defaults, filter invalid rows, and pass small serializable view models into focused Client Components.

`HeroCarouselClient` owns carousel state, autoplay, selection indicators, and navigation. It composes the installed shadcn `Carousel`, `CarouselContent`, and `CarouselItem` primitives rather than creating a second raw Embla wrapper. Autoplay should use the official Embla autoplay plugin used by the registry source. The client receives no Payload document objects.

`GalleryCoverflowClient` owns Swiper and its entrance animation. Swiper-only CSS remains narrowly scoped to a block-specific class. It must not target generic `.swiper-3d` selectors or leak styles into other carousels.

The server/client split keeps Payload relationships and media normalization out of browser code while containing each interactive dependency to the component that needs it.

## Hero Carousel Presentation

Use the visual hierarchy of Ecommerce Hero 7:

1. a full-bleed media layer;
2. a readability overlay;
3. content anchored toward the bottom of the viewport;
4. a large display title, supporting copy, and pill-shaped actions;
5. previous and next controls at the horizontal edges on larger screens;
6. centered slide indicators near the bottom edge.

Each slide uses the configured height:

- Compact: `min-h-[50dvh]`;
- Default: `min-h-[70dvh]`;
- Immersive: `min-h-dvh` with `min-h-[42.5rem]`, matching the source block's practical viewport floor.

For multiple slides, alternate the desktop content placement by slide index, matching the source block's even/odd rhythm. Mobile remains a single readable column. Content stays within the project's `max-w-screen-2xl` container and standard horizontal padding.

Overlay presets remain fixed and deterministic. Text on the media layer uses a consistent inverse treatment so contrast does not depend on the page theme. Buttons keep their authored shadcn variants; layout classes may control size and pill radius but must not replace variant colors.

Use Next.js `Image` for Payload images and native `<video>` for direct videos. Only the first image is prioritized. Videos are muted, looping, autoplaying, and `playsInline`. Background media is non-interactive and does not replace semantic copy or link labels.

Navigation is shown only when the relevant editor toggle is enabled and more than one slide exists. Icon-only Buttons contain accessible labels. Icons rely on Button sizing and use the project's configured Lucide library. Dots expose the selected state and an explicit label for each destination slide.

Autoplay pauses through the carousel plugin's interaction behavior rather than a hand-written timer. Disabling autoplay must prevent the plugin from being attached.

## Gallery Coverflow Presentation

Follow Hero 210's composition:

1. constrained heading content with a readable maximum width;
2. a full-width, horizontally clipped coverflow stage;
3. portrait-oriented slides with large rounded corners and semantic shadow;
4. left and right background fades that visually soften off-center slides;
5. one optional pill action beneath the carousel.

Content Alignment applies consistently to the heading stack and action. The carousel itself remains centered and full-width at every alignment. Appearance is resolved by the shared block appearance utility, and the fade edges derive from the resolved section background so they remain visually coherent for `none`, `primary`, `secondary`, `muted`, and `accent` surfaces.

The Swiper behavior remains source-faithful: `EffectCoverflow`, centered slides, automatic slide width, looping, grab cursor, 1500 ms autoplay, and the source coverflow depth/rotation settings. The stage and slides scale down on narrow viewports without causing page-level horizontal overflow.

Automatic slide width can expose more cards than a small CMS gallery contains on wide viewports, leaving the coverflow empty on one side. Preserve the editor's original image array, but build a presentation-only sequence with at least nine entries by repeating images in source order. Galleries that already contain nine or more valid images remain unchanged. Repeated entries use unique render keys, and this display expansion never changes saved Payload data, image order, or alt text.

Use Next.js `Image` in a relative slide wrapper with `fill` and responsive `sizes`. Avoid a plain `<img>` workaround and ensure the wrapper, rather than the image, owns dimensions and positioning.

Framer Motion only fades in the coverflow stage. Respect reduced-motion preferences by rendering without the entrance transition when motion reduction is requested. Carousel interaction and all content remain available.

## Payload and Admin Alignment

Retain the current field names and defaults so generated types and saved data remain compatible. Add the standard `getBlockThumbnailAdmin` metadata used by the rest of the page block catalog.

Add canonical thumbnail definitions for `heroCarousel` and `galleryCoverflow`. Existing local thumbnail images may be reused initially because their visual subjects match these related variants; no network-hosted thumbnail dependency is introduced.

Both frontend sections expose block-specific data attributes for identity and important configured states. These attributes support tests and preview diagnostics without affecting presentation.

## shadcn Conventions

- Compose the installed Carousel and Button implementations rather than duplicating their behavior.
- Use `cn()` for conditional classes.
- Use `gap-*` layout spacing and `size-*` for equal dimensions.
- Use semantic theme tokens for surfaces, text, borders, and shadows.
- Do not override Button typography or color variants through layout classes.
- Do not manually assign stacking values to Button components; stacking belongs to their surrounding navigation layer.
- Icon-only Buttons include a visually hidden label, and icons do not receive redundant width/height classes.

## Testing and Verification

Focused tests should cover:

- both canonical slugs, interfaces, labels, fields, defaults, and block registration;
- thumbnail metadata for both blocks;
- Hero Carousel media and link normalization, invalid-slide filtering, video precedence, and empty output;
- Hero Carousel shadcn composition, height and overlay states, alternating desktop alignment, optional controls, accessible navigation, and autoplay toggle;
- Gallery Coverflow media normalization, minimum valid image behavior, content alignment, appearance and size state, action resolution, and scoped Swiper structure;
- Gallery Coverflow presentation expansion, including ordered repetition below nine valid images and no expansion at nine or more;
- reduced-motion behavior for the gallery entrance;
- absence of page-level horizontal overflow at mobile widths.

Verification includes Payload type generation, TypeScript, focused tests, ESLint on touched files, formatting, and `git diff --check`. If full-project lint or tests expose unrelated pre-existing failures, report them separately rather than broadening this change.

## Non-Goals

- Replacing or migrating the existing `Hero Banner` or `Gallery Showcase` blocks.
- Adding Ecommerce Hero 7 product cards, catalog relationships, prices, ratings, badges, wishlists, carts, or quick-view behavior.
- Adding per-slide product data or per-image gallery captions.
- Adding arbitrary CSS, freeform colors, transition editors, or coverflow geometry controls to Payload.
- Refactoring unrelated carousel blocks or shared page spacing.
