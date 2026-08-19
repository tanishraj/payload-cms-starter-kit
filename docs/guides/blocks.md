# Page Blocks Guide

## How The Block System Works

Pages use an ordered block layout. Editors can collapse, reorder, duplicate, and remove blocks; most visual sections share appearance and responsive spacing controls. A block error boundary isolates a failing block so the remainder of the Page can still render. Live preview uses the production renderer for every Page block, including blocks reached through Reusable Sections; inspect desktop, tablet, and mobile sizes before publishing.

`Reusable Section` references a shared block stack. Reusable Sections intentionally cannot contain another Reusable Section, Hero Carousel, Gallery Coverflow, Testimonial Grid, Awards List, or About Section.

## Content And Theme Settings

Every configurable visual block uses the same two top-level tabs:

- `Content` contains the text, media, links, and repeating content rows.
- `Theme Settings` contains appearance, alignment, spacing, and presentation controls.

Genuine card rows use the same nested tabs. Their `Theme Settings` tab offers `Default Card`, `Primary`, `Secondary`, `Muted`, and `Accent` backgrounds. These are semantic theme surfaces rather than fixed colors: foreground text, supporting copy, icons, borders, links, and matching filled buttons automatically use readable colors in both light and dark mode.

The setting follows the selected presentation. Content Highlights applies it to Numbered Steps; Testimonial Grid applies it to Grid and Featured; Awards List, Download List, and Numbered Steps apply it to their Cards presentation. Minimal, list, table, row, connector, gallery, logo, menu, and other utility presentations intentionally keep their established geometry instead of becoming artificial cards. Bento Grid keeps its existing `Background` field but uses the same semantic surface values.

## Block Catalog

| Block                    | Use it for                                  | Important dependency or behavior                                                                                                                                                             |
| ------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Announcement             | In-page notices                             | Separate from the site-wide announcement in Layout Defaults                                                                                                                                  |
| Banner CTA               | Image-backed conversion banner              | Media overlay, alignment, height, and section actions                                                                                                                                        |
| Call to Action           | Prominent conversion prompt                 | Supports section actions                                                                                                                                                                     |
| Hero Banner              | Single lead story                           | Media, overlay, alignment, and height controls                                                                                                                                               |
| Hero Carousel            | Rotating hero slides                        | Client carousel behavior                                                                                                                                                                     |
| Gallery Coverflow        | Coverflow media presentation                | Client carousel behavior                                                                                                                                                                     |
| Feature Spotlight        | One highlighted feature                     | Image/content arrangements                                                                                                                                                                   |
| Testimonial Spotlight    | One image-led leadership message            | Optional aligned section header/actions and centered footer actions; one person; image side, crop, fill, section appearance, spacing, inner alignment, semantic container background/outline |
| Feature Matrix           | Feature comparison grid                     | Repeating feature cards with independent semantic backgrounds                                                                                                                                |
| Content Highlights       | Curated content cards                       | Per-item backgrounds apply to Numbered Steps                                                                                                                                                 |
| Editorial Reasons        | Institutional strengths                     | Four proportion presets, aligned section content, left/right placement, optional sticky introduction, and a responsive one-to-four-column numbered grid                                      |
| Academic Programmes      | Programme cards and pathways                | Responsive columns, section actions, and independent card backgrounds                                                                                                                        |
| News & Events Highlights | Automatic News & Events carousel            | One synchronized featured carousel with automatic collection data, configurable top/bottom controls, shared image/overlay settings, and the bundled SNMIH image fallback                     |
| News Grid                | Editorial News & Events grid                | Shows every published classification in newest-published order while excluding expired Events; supports 2–4 desktop columns and an optional final feature card                               |
| News & Events Tabs       | Filterable News & Events directory          | Card Grid or full-row Editorial List under configurable classification tabs; All stays first and both layouts share Load More and section settings                                           |
| Profile Carousel         | People/profile cards                        | Client carousel behavior and independent card backgrounds                                                                                                                                    |
| Gallery Showcase         | Layered image showcase                      | Interactive presentation                                                                                                                                                                     |
| Event Gallery            | Rectangular album quilt and optional viewer | Uses one first-image cover per selected Gallery Album; count-aware 1–4 column spans close every grid cleanly, with a positionable details stack, shared overlays, and optional slideshow     |
| Study Pathways           | Two-to-four image-led pathway cards         | Configurable split proportions, overlays, links, and card heights                                                                                                                            |
| Image Mosaic             | Manual or album-backed image composition    | Uses up to eight manual Media images or explicitly selected Gallery Albums; album tiles can open the shared slideshow                                                                        |
| Student Experience       | Asymmetric image-led experience mosaic      | Uses up to five Media images; first card spans both rows in the desktop composition                                                                                                          |
| Stats Strip              | Animated metrics                            | Numeric values and labels                                                                                                                                                                    |
| Q&A Accordion            | Expandable questions                        | Accessible accordion interaction                                                                                                                                                             |
| Rating Spotlight         | Aggregate rating summary                    | Reads published Reviews                                                                                                                                                                      |
| Review Feed              | Paginated review list                       | Uses `/api/review-feed` after the initial render                                                                                                                                             |
| Review Submission        | Public review form                          | Requires a Form with review intent                                                                                                                                                           |
| Contact Form             | General or lead form                        | Requires a Form definition                                                                                                                                                                   |
| Regional Offices         | Office/map cards                            | Reads Office Locations                                                                                                                                                                       |
| Team Showcase            | Team member grid                            | Structured profile fields and independent card backgrounds                                                                                                                                   |
| Services                 | Service cards                               | Repeating service items                                                                                                                                                                      |
| Rich Text                | General formatted copy                      | Shared long-form Lexical typography with configurable reading width                                                                                                                          |
| Video Embed              | External video                              | Valid provider/embed URL                                                                                                                                                                     |
| Media Carousel           | Scrollable media slides                     | Client carousel behavior and independent slide-card backgrounds                                                                                                                              |
| Program Grid             | Programs or offerings                       | Repeating program cards with independent semantic backgrounds                                                                                                                                |
| Program Matrix           | Academic programmes or structured offerings | Seamless one/two-column matrix with flexible Lucide icons, independent semantic card backgrounds, and optional Button or Link Text actions                                                   |
| Logo Strip               | Partner/accreditation logos                 | Optional marquee behavior                                                                                                                                                                    |
| Page Header              | Inner-page heading                          | Eyebrow/title/description/actions                                                                                                                                                            |
| Breadcrumb               | Standalone page trail                       | Uses automatic hierarchy or editor-authored breadcrumb items                                                                                                                                 |
| Timeline                 | Chronological milestones                    | Ordered timeline items                                                                                                                                                                       |
| Icon Card Showcase       | Icon-led cards and values                   | Cards per Row supports 2–4 desktop columns; cards collapse responsively and support semantic backgrounds and actions                                                                         |
| Icon Grid                | Icon-led benefits and responsibilities      | Card, Contact Cards, Minimal, Icon Top, or Ruled Columns; ruled items use continuous responsive dividers and inherit the section surface                                                     |
| Quote Block              | Quotation or pull quote                     | Quote and attribution                                                                                                                                                                        |
| Tabs Content             | Grouped tab panels                          | Client tab interaction                                                                                                                                                                       |
| Download List            | Files and resources                         | Uses Media documents/links; backgrounds apply to Cards                                                                                                                                       |
| Numbered Steps           | Ordered process                             | Backgrounds apply to numbered Cards, not connected/alternating layouts                                                                                                                       |
| Bento Grid               | Mixed-size feature cards                    | Grid layout and semantic background controls                                                                                                                                                 |
| Testimonial Grid         | Curated testimonials                        | Backgrounds apply to Grid and Featured cards                                                                                                                                                 |
| Awards List              | Awards and recognition                      | Backgrounds apply to Cards, not table/row presentations                                                                                                                                      |
| About Section            | Editorial about layout                      | Media and actions                                                                                                                                                                            |
| Accreditation Cards      | Accreditation and certification summary     | Two-to-four columns with shared semantic card and icon treatments                                                                                                                            |
| Reusable Section         | Shared block group                          | Reads one published Reusable Section                                                                                                                                                         |

Editorial Reasons uses Full Width to place its introduction above a container-wide list. Its
List Focus, Balanced, and Introduction Focus proportions apply on large screens and stack the
introduction before the list on smaller viewports. Section Content Alignment moves its eyebrow,
heading, description, and actions together. List Columns selects an explicit one-, two-, three-, or
four-column desktop composition; multi-column layouts collapse responsively on smaller screens.
List Border Style can leave only internal dividers (`Open`), retain the top and bottom rules
(`Ruled`), or wrap the entire list (`Framed`). Dividers inherit the active surface foreground at
low opacity, matching Stats Strip on light, dark, and Primary backgrounds.
Number Layout offers Stacked, Inline, and Three Columns. Three Columns places each generated
number, title, and description in separate desktop columns, then moves the description beneath the
title on smaller screens. It always uses one outer list column; choose List Focus, List Position
Right, Introduction Alignment Top, and Ruled borders to reproduce the reference-style composition.

Event Gallery uses the first valid image from every selected Gallery Album as the album cover and
can open the complete album in its full-screen viewer. Disable **Enable Album Slideshow** to retain
the same image and overlay presentation as a static, non-focusable tile. The section title is optional;
when all header fields and Section Actions are empty, the album quilt renders without a header or an
empty header gap. **Overlay Display** offers Always Visible and Reveal on Hover; existing Event
Gallery blocks remain Always Visible. Hover mode also reveals on keyboard focus and remains visible
on touch devices. This choice does not change slideshow interaction. Every overlay position stacks the image icon and
numeric count, event date, and text-family title in that order. Bottom Left aligns the stack left;
Bottom Center and Center — Vertical & Horizontal center it. Disabled or unavailable metadata closes
naturally without leaving an empty row.

Image Mosaic defaults to **Manual Images**, including saved blocks created before the Content Source
field existed. Manual mode preserves its one-to-eight uploaded images, per-image crop position,
optional title, and action; manual images never open an album slideshow. **Gallery Albums** mode
accepts up to eight explicitly selected albums and renders one first-image cover per album. Editors
choose Manual order or Latest Event Date, can hide the date/count rows, place the overlay Bottom Left,
Bottom Center, or fully centered, and can disable album slideshow interaction without hiding the
tiles. **Overlay Display** offers Always Visible and Reveal on Hover for both Manual Images and
Gallery Albums; existing Image Mosaic blocks retain Reveal on Hover. Keyboard focus reveals hover
content, while touch devices keep it visible. Production loads only selected published albums. Authenticated live preview receives the
selected draft album snapshot from the server and performs no browser-side Payload query.

News & Events Highlights keeps the internal `newsEventsHighlights` block identity and automatically
interleaves recent published non-event entries with current or upcoming Events up to the configured
one-to-six item limit. Editors configure Number of Items, Autoplay, and the Empty State Message; slide
content remains owned by the News & Events collection. Carousel Controls Position places the status
and previous/next controls above or below the carousel. Bottom remains the default and legacy fallback.

Image Position Override can retain each item setting or force Center, Top, Bottom, Left, or Right
across the block. Overlay Tone, Strength, Direction, and Coverage use the shared semantic media
controls. Existing blocks without the new settings render with the legacy Dark, Darker,
Bottom-to-Top, Full overlay. Missing or failed media uses the bundled SNMIH image centered as
decorative content. The large story and responsive rail stay synchronized; optional autoplay pauses
on interaction and respects reduced-motion preferences. From tablet widths, the featured panel and
vertical rail share a 36rem height. Three equal supporting cards fill that height; card titles use one
line and descriptions use two lines. Phone widths retain the horizontal supporting-card rail.

News Grid automatically shows all published News & Events classifications in newest-published order
while excluding expired Events. It retains its established grid, feature-card option, and title
requirement, supports 2–4 desktop columns, and can reserve the final slot for an optional feature
card. **Default Action Label** applies to non-event records; **Event Action Label** applies only to
Events. Use the separate News & Events Tabs block for a configurable directory. All always renders first; editors
can add, remove, rename, and reorder the seven supported classification tabs without changing the
classification assigned to each entry. Editors choose 3, 6, 9, or 12 entries per tab. Under **Theme
Settings**, **Layout** selects Card Grid (the default and legacy fallback) or Editorial List; **Cards
Per Row** appears only for Card Grid and retains the existing 2, 3, or 4 desktop-column choices.
**Items Per Tab** controls the initial number of entries and each later Load More batch. **Load More
Label** customizes the button shown only when the active tab has another page. Loaded entries remain
available when visitors switch tabs; refreshing the page returns to the initial batch. The section
header is optional; shared appearance, header actions, footer actions, alignment, spacing,
empty-state, and action-label controls remain available. Card Grid keeps its text-only semantic card
surfaces. Editorial List renders each entry as a responsive full-row link with a date column, a
badge-above-title column, excerpt, and the shared animated arrow. Both layouts use theme-scale
`text-xl` semibold titles and `text-base` normal-weight descriptions with bounded line lengths. In
Editorial List, the title and description use equal-width tracks, the arrow has a wider trailing
track, and the date and arrow center vertically while one equal desktop gutter separates every
column. The tab pills wrap in configured order when the available width is insufficient, keeping
every tab visible without a horizontal scrolling region.

`News & Events Content` is a global-only dynamic block for `Configuration > News & Events Detail
Page`; it is intentionally absent from Pages and Reusable Sections. The global accepts the same
ordered block catalog as Pages and requires exactly one dynamic content block when published. That
block binds the current News & Events entry automatically and renders its image, classification/title
overlay, excerpt, Lexical body, Story Details, and optional Share This card. Editors can configure
section appearance, spacing, featured-image ratio, sidebar card surface/outline, and the shared
overlay controls. Missing overlay settings use Dark, Darker, Bottom to Top, and Full, while a missing
featured image uses the bundled SNMIH fallback. Standard Page blocks before and after it retain their
saved order, and automatic Breadcrumb blocks receive the current entry trail in production and live
preview. On desktop, the main story shares the row with a fixed `30rem` right sidebar column.

Project-owned Lexical editors reserve H1 for the surrounding page or entry title and expose H2–H6.
Article, News/Event, and Rich Text content use the shared long-form presentation; Q&A answers use the
compact presentation. Both presets style Payload's semantic paragraph, list, checklist, blockquote,
emphasis, link, code, image, and horizontal-rule output. Rich-text headings use the text-family token
rather than the display family. Long-form H2–H6 use a compact descending text-family scale, with H2
capped by the shared 28px editorial token, plus tuned heading, paragraph, list, quote, code, image,
and rule rhythm. The shared preset suppresses Payload's empty `<p><br></p>` output. Story Details
keeps regular mono labels while values use the normal text family; only date values use tabular
numerals.

Headers use the `Header Navbar 12` block, Footers use `Footer 56`, and System Pages use exactly one matching `System 404`, `System Maintenance`, or `System Coming Soon` block. Those structural blocks are not selectable in normal Page layouts.

## Choosing Data-Owned Blocks

Prefer the data-backed blocks when the same records need governance or reuse:

- News & Events Highlights, News Grid, or News & Events Tabs when records should remain collection-owned
- Event Gallery or album-backed Image Mosaic instead of rebuilding an album from loose images
- Rating Spotlight or Review Feed instead of copying public reviews
- Contact Form or Review Submission instead of embedding an unmanaged form
- Regional Offices instead of repeating addresses on each Page

## Developer Thumbnail Workflow

The admin picker uses generated previews in `public/block-thumbnails`. The preview route exists only in development. See [Developer Workflows](../operations/developer-workflows.md) before regenerating all or one thumbnail.

## Related Guides

- [Pages](./pages.md)
- [Reusable Sections](./reusable-sections.md)
- [Gallery Albums](./gallery-albums.md)
- [Office Locations](./office-locations.md)
- [News & Events](./news-events.md)
