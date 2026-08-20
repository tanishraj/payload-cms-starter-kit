# Block System

## Registries

[Pages.ts](../../../../src/collections/Pages.ts) registers 51 blocks in this order:

`announcement`, `bannerCta`, `newsGrid`, `newsEventsTabs`, `cta39`, `heroBanner`, `heroCarousel`, `galleryCoverflow`, `featureSpotlight`, `testimonialSpotlight`, `featureMatrix`, `contentHighlights`, `editorialReasons`, `academicProgrammes`, `newsEventsHighlights`, `profileCarousel`, `galleryShowcase`, `eventGallery`, `studyPathways`, `imageMosaic`, `studentExperience`, `statsStrip`, `qaAccordion`, `ratingSpotlight`, `reviewFeed`, `reviewSubmission`, `contact33`, `contact24`, `teamShowcase`, `services21`, `richText`, `videoEmbed`, `mediaCarousel`, `programGrid`, `programMatrix`, `logoStrip`, `pageHeader`, `breadcrumb`, `timeline`, `iconCardShowcase`, `iconGrid`, `quoteBlock`, `tabsContent`, `downloadList`, `numberedSteps`, `bentoGrid`, `testimonialGrid`, `awardsList`, `aboutSection`, `accreditationCards`, `reusableSection`.

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

Event Gallery renders selected Gallery Albums in their resolved manual or latest-event-date order.
Each selected album contributes its first valid image as one cover tile, while the accessible card
button opens every image in that album through the shared full-screen viewer. Enable Album Slideshow
defaults on, including for legacy documents; disabling it retains identical images and overlays on
static, non-focusable tiles. The section title is optional: albums render without any header content,
and the header wrapper and its grid gap are omitted when eyebrow, title, description, and section
actions are all absent. Overlay Display supports Always Visible and Reveal on Hover; Event Gallery
defaults and legacy documents resolve to Always Visible. Hover mode reveals on keyboard focus and
remains visible on touch/coarse-pointer devices, independently of slideshow interaction. The count-aware
rectangular quilt uses one phone, two tablet, three laptop, and four wide-desktop columns, bounded by
the number of rendered albums. The first few tiles span two rows only when required to fill the active
grid exactly, so every album count ends on a straight boundary without horizontal spans, dense
backfilling, or an oversized lead card. Card details are optional. When enabled,
every overlay position stacks the image icon and numeric count, event date, and a clamped text-family
title. Bottom Left aligns the stack left; Bottom Center and Center — Vertical & Horizontal center it.
Missing or disabled metadata rows close naturally. The shared overlay tone, strength, direction, and
coverage fields control the presentation. Disabling Show Album Details Overlay produces image-only
cards and hides its dependent metadata, position, and overlay controls in Admin.

Gallery Album Tabs renders explicitly selected Gallery Albums as a collection-backed image
directory. All is fixed first and initially active; its label is configurable, while every remaining
tab label follows the current album title. Albums use the shared manual/latest-event-date ordering
resolver. All preserves resolved album and image order while de-duplicating repeated Media IDs;
album-specific tabs keep every image. The client reveals 6, 9, or 12 images per action, remembers
visible progress independently per tab, and opens the complete active-tab image set in the shared
slideshow at the selected index. Contained, Pill, and Underline variants share semantic theme tokens;
Underline is the saved default and runtime fallback. Each tab sizes to its label while the rail spans
the block container; the compact single-row rail scrolls horizontally when its intrinsic content
overflows. Tiles use the count-aware rectangular quilt and do
not render captions outside the slideshow. Production loads only selected published albums, while
authenticated Page and News/Event detail previews use their server-provided draft album snapshot.

Image Mosaic supports Manual Images and Gallery Albums sources. Missing or invalid source values
retain the legacy Manual Images behavior, including one-to-eight uploaded images, crop positions,
titles, and independent actions. Gallery Albums mode accepts up to eight explicitly selected albums,
uses the shared manual/latest-event-date ordering utility, and contributes one first-valid-image cover
tile per album. Album overlays share Event Gallery's numeric count, UTC Event Date, sans title, and
Bottom Left, Bottom Center, or Center — Vertical & Horizontal positions while retaining Image Mosaic's
existing overlay resolver and grid geometry. Overlay Display supports Always Visible and Reveal on
Hover for both content sources; Image Mosaic defaults and legacy documents resolve to Reveal on
Hover. Hover mode reveals on keyboard focus and remains visible on touch/coarse-pointer devices.
Album slideshow interaction defaults on and can be
disabled without changing presentation; manual images never open the album viewer. Production loads
only selected published albums. Authenticated Page and News/Event detail previews discover album
dependencies through supported populated Reusable Sections, load draft albums on the server, and use
the client-safe Image Mosaic preview adapter without importing the Payload-backed loader.

News & Events Highlights retains the `newsEventsHighlights` slug and renders one synchronized carousel
from automatically loaded News & Events collection records. It interleaves recent published non-event
entries with current or upcoming Events up to the configured one-to-six item limit. Autoplay, Empty
State Message, semantic section settings, block-wide image-position override, and shared media overlay
controls remain configurable. Missing overlay values preserve Dark/Darker/Bottom-to-Top/Full; missing
or failed images use the centered bundled SNMIH fallback. News Grid retains its legacy grid and optional
feature card. It loads all published classifications in published-date order, retains the
current/upcoming Event predicate, uses canonical classification labels, and preserves the stored
`newsActionLabel` field as the Admin-facing Default Action Label for non-event records. Editors can
place the carousel status and previous/next controls above or below the carousel; Bottom remains the
default and legacy fallback.
From tablet widths, the featured panel and vertical rail share a 36rem height. Three equal supporting
cards, separated by consistent gaps, fill that height; card titles use one line and descriptions use
two lines. Each vertical slide, button, and card surface spans its complete allocated width and
height, so sparse supporting content cannot shrink the visible card. The rail centers card content
vertically and keeps end-card outlines inside the viewport. Phone widths retain the horizontal
supporting-card rail below the feature.
The separate News & Events Tabs block renders Card Grid or Editorial List entries with a mandatory
first All tab and an editor-ordered set of active News & Event Classification relationships. Central
classification titles become visitor tab labels; duplicate, inactive, missing, or unusable selected
records are omitted without disturbing the remaining saved order. When no relationships are selected,
the block intentionally renders only All and loads that group from every active classification. The
block server-renders page one for each tab as a page-aware public group, with 3, 6, 9, or 12 entries
per batch. When more entries exist, the client appends the next batch through the read-only
`/api/news-events-tabs` route. Selected configurations carry their ordered classification scope for
All requests; All-only configurations omit the scope and resolve all active classifications. The
client retains independent progress for each classification ID until refresh. Editors can customize the
Load More label. The block retains shared appearance,
alignment, spacing, header actions, and footer actions, and uses only semantic theme surfaces. Card
Grid is the admin default and legacy runtime fallback; its Cards Per Row control remains 2–4 and is
shown only for that layout under Theme Settings. Editorial List uses full-row detail links with a
date-only first column, classification above the title in the second column, excerpt, and the shared
animated arrow. The title and excerpt use equal-width tracks, the arrow receives a wider trailing
track, and one equal horizontal gutter separates every desktop column. The date and arrow center
vertically while the badge/title and excerpt remain top-aligned, then stack on smaller screens. Both
variants use the theme-scale `text-xl` token for semibold titles and retain the
`text-base` token for normal-weight descriptions with bounded line lengths. News & Events Tabs uses
the same Contained, Pill, and Underline presentation contract as Gallery Album Tabs; Underline is the
saved default and runtime fallback. Tabs size to their labels inside a full-width rail and remain in
configured order on one horizontally scrollable row when their intrinsic content overflows.
The loader resolves ordered active relationship records before querying entries, then uses each
classification ID and Story/Event behavior for filtering and ordering. It rejects unknown, inactive,
out-of-scope, malformed, or oversized pagination scopes before querying entries. Preview snapshots
discover relationship scopes, including the empty All-only scope, through populated Reusable Sections
with cycle/depth guards and key groups by ordered IDs plus item limit, preventing equal-count blocks
with different selections from sharing data.

NewsEventsDetailTemplate is a Page-compatible ordered block layout with one additional global-only
`newsEventsContent` block. That dynamic block is deliberately excluded from Pages and Reusable
Sections. Drafts may contain an incomplete layout; publishing requires exactly one dynamic block.
The renderer preserves saved order, sends standard blocks through the normal Page render path, and
injects the current record only into `newsEventsContent`. The content block renders a configurable
featured-image ratio with classification and title in a fixed bottom-left overlay, followed by the
excerpt and styled Lexical body in the main column. Story metadata and optional sharing use the
right sticky sidebar, which occupies a fixed `30rem` desktop grid column. Overlay Tone, Strength,
Direction, and Coverage reuse the shared media fields and fall back to
Dark/Darker/Bottom-to-Top/Full; missing entry media uses the centered bundled SNMIH image. Automatic
Breadcrumb blocks receive Home, News & Events, and the current entry in production and in the
dedicated client-safe live-preview renderer.

Project-owned Lexical editors reserve H1 for the surrounding page or entry title and expose H2–H6.
`richTextStyles.ts` owns the client-safe shared presentation: Article, News/Event, and Rich Text
content use the long-form preset, while Q&A answers use the compact preset. Both presets style
Payload's semantic paragraph, list, checklist, blockquote, emphasis, link, code, image, and
horizontal-rule output using theme tokens; rich-text headings use the text-family token rather than
the display family. Long-form H2–H6 use a compact descending text-family scale, with H2 capped by the
shared 28px editorial token, plus tuned heading, paragraph, list, quote, code, image, and rule rhythm.
Long-form paragraphs, list items, and blockquotes share the responsive `text-base sm:text-lg`,
`leading-7`, and excerpt-aligned `text-current/80` tone. Lexical H1–H6 use `text-current/90`;
other ordinary long-form and compact content, including blockquotes, uses `text-current/80`. Primary links,
card-surface preformatted blocks, and softer completed/struck states retain their semantic
exceptions. The shared preset suppresses
Payload's empty `<p><br></p>` output. News/Event Story Details keeps regular mono labels while values
use the normal text family; only date values use tabular numerals.

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
