# Block System

## Registries

[Pages.ts](../../../../src/collections/Pages.ts) registers 50 blocks in this order:

`announcement`, `bannerCta`, `newsGrid`, `cta39`, `heroBanner`, `heroCarousel`, `galleryCoverflow`, `featureSpotlight`, `testimonialSpotlight`, `featureMatrix`, `contentHighlights`, `editorialReasons`, `academicProgrammes`, `newsEventsHighlights`, `profileCarousel`, `galleryShowcase`, `eventGallery`, `studyPathways`, `imageMosaic`, `studentExperience`, `statsStrip`, `qaAccordion`, `ratingSpotlight`, `reviewFeed`, `reviewSubmission`, `contact33`, `contact24`, `teamShowcase`, `services21`, `richText`, `videoEmbed`, `mediaCarousel`, `programGrid`, `programMatrix`, `logoStrip`, `pageHeader`, `breadcrumb`, `timeline`, `iconCardShowcase`, `iconGrid`, `quoteBlock`, `tabsContent`, `downloadList`, `numberedSteps`, `bentoGrid`, `testimonialGrid`, `awardsList`, `aboutSection`, `accreditationCards`, `reusableSection`.

[ReusableSections.ts](../../../../src/collections/ReusableSections.ts) exposes the same order except `reusableSection`, preventing direct recursion.

Restricted shell/system registries are separate:

- Headers: `headerNavbar12`.
- Footers: `footer56`, `footerMinimal`.
- System Pages: `system404`, `systemMaintenance`, `systemComingSoon`; exactly one block must match the selected system-page type.

Use [project-inventory.json](project-inventory.json) for generated paths, interfaces, files, and coverage rather than manually counting.

## Complete Block Change Contract

A Page block normally touches all of these surfaces:

1. `src/blocks/<Block>/config.ts` with a unique slug and explicit interface name.
2. `src/blocks/<Block>/Component.tsx`, plus optional client/presentation/preview modules.
3. Pages and Reusable Sections registration when the block is reusable.
4. [renderPageBlocks.tsx](../../../../src/blocks/renderPageBlocks.tsx).
5. [renderLivePreviewPageBlocks.tsx](../../../../src/blocks/renderLivePreviewPageBlocks.tsx).
6. Thumbnail definition, production-component fixture, and 1600×900 JPEG.
7. Generated Payload types.
8. Focused schema/rendering tests plus registration, preview, thumbnail, theme, and documentation contracts.
9. The maintained [block operator guide](../../../../docs/guides/blocks.md) and [feature inventory](../../../../docs/architecture/feature-inventory.md).

Production Page blocks are wrapped in `BlockErrorBoundary`, so one broken block does not crash the remaining layout. Reusable Section rendering stops after depth 10. Keep production/live-preview case coverage equal.

## Shared Configuration and Presentation

- `blockAppearanceFields.ts` and `blockAppearance.ts`: page/subtle/brand surfaces, gradients, borders, legacy normalization, and foreground resolution.
- `blockSpacing.ts`: regular container and responsive vertical spacing contracts.
- `cardThemeFields.ts` and `cardSurface.ts`: Default/Primary/Secondary/Muted/Accent card semantics.
- `contentActionsFields.ts` and `BlockFooterActions.tsx`: per-action links/buttons, variants, arrows, and footer actions.
- `contentStyles.ts`: shared section/card typography and link classes.
- `iconField.ts` and `resolveLucideIcon.ts`: icon authoring and safe runtime resolution.
- `mediaOverlayFields.ts` and `mediaOverlayPresentation.ts`: tone, strength, direction, coverage, and text contrast.
- `breadcrumbFields.ts`: manual/automatic breadcrumb authoring.
- `bannerCtaFields.ts` and `bannerCtaPresentation.ts`: banner layout controls and class resolution.
- `siteSocialLinks.ts`: normalized CMS social destinations.

Editorial Reasons supports Stacked, Inline, and Three Columns number layouts. Three Columns uses one
outer reasons column so each row can place its generated number, title, and description in separate
large-screen columns; compact screens place the description beneath the title. Selecting it hides
the outer List Columns control without deleting that stored value.

Testimonial Spotlight keeps section appearance independent from its complete image-and-content
container. The inner container supports Match Section/Primary/Secondary/Muted/Accent semantic
surfaces and an optional divider-colored outline; missing legacy values render as Match Section with
no outline. Testimonial copy is optional: present copy uses the existing sans-serif family at a
responsive 18–20px size with one normalized pair of curly double quotation marks and semantic quote
markup, while absent copy leaves the image, title, description, and attribution visible without empty
quotation elements. The person name and designation retain distinct body and metadata sizes.
An optional outer section layer adds prefixed eyebrow/title/description fields, shared section and
footer actions, and Left/Center header alignment without renaming the existing inner message fields.
The outer eyebrow follows the section appearance; the existing inner eyebrow follows the container
surface. Documents without valid outer content retain the legacy render branch.

The generated inventory contains every current export under [src/blocks/shared](../../../../src/blocks/shared).

## Required Commands

After block schema or Admin changes, run the applicable generators:

```bash
pnpm generate:types
pnpm generate:importmap
pnpm generate:block-thumbnails
```

Run focused block tests, then the Page block, live preview, thumbnail, and theme contracts. Finish with:

```bash
pnpm project-context:update
pnpm project-context:check
```
