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

| Block                    | Use it for                                  | Important dependency or behavior                                                                                                                          |
| ------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Announcement             | In-page notices                             | Separate from the site-wide announcement in Layout Defaults                                                                                               |
| Banner CTA               | Image-backed conversion banner              | Media overlay, alignment, height, and section actions                                                                                                     |
| Call to Action           | Prominent conversion prompt                 | Supports section actions                                                                                                                                  |
| Hero Banner              | Single lead story                           | Media, overlay, alignment, and height controls                                                                                                            |
| Hero Carousel            | Rotating hero slides                        | Client carousel behavior                                                                                                                                  |
| Gallery Coverflow        | Coverflow media presentation                | Client carousel behavior                                                                                                                                  |
| Feature Spotlight        | One highlighted feature                     | Image/content arrangements                                                                                                                                |
| Feature Matrix           | Feature comparison grid                     | Repeating feature cards with independent semantic backgrounds                                                                                             |
| Content Highlights       | Curated content cards                       | Per-item backgrounds apply to Numbered Steps                                                                                                              |
| Editorial Reasons        | Institutional strengths                     | Four proportion presets, aligned section content, left/right placement, optional sticky introduction, and a responsive one-to-four-column numbered grid   |
| Academic Programmes      | Programme cards and pathways                | Responsive columns, section actions, and independent card backgrounds                                                                                     |
| News & Events Highlights | Recent news/upcoming events                 | Reads published News & Events                                                                                                                             |
| News Grid                | Editorial news-and-event grid               | Automatically mixes published News and current/upcoming Events, supports 2–4 desktop columns, and can reserve the final slot for an optional feature card |
| Profile Carousel         | People/profile cards                        | Client carousel behavior and independent card backgrounds                                                                                                 |
| Gallery Showcase         | Layered image showcase                      | Interactive presentation                                                                                                                                  |
| Event Gallery            | Album cards and full-screen viewer          | Requires selected Gallery Albums                                                                                                                          |
| Study Pathways           | Two-to-four image-led pathway cards         | Configurable split proportions, overlays, links, and card heights                                                                                         |
| Image Mosaic             | Multi-image composition                     | Uses Media images                                                                                                                                         |
| Student Experience       | Asymmetric image-led experience mosaic      | Uses up to five Media images; first card spans both rows in the desktop composition                                                                       |
| Stats Strip              | Animated metrics                            | Numeric values and labels                                                                                                                                 |
| Q&A Accordion            | Expandable questions                        | Accessible accordion interaction                                                                                                                          |
| Rating Spotlight         | Aggregate rating summary                    | Reads published Reviews                                                                                                                                   |
| Review Feed              | Paginated review list                       | Uses `/api/review-feed` after the initial render                                                                                                          |
| Review Submission        | Public review form                          | Requires a Form with review intent                                                                                                                        |
| Contact Form             | General or lead form                        | Requires a Form definition                                                                                                                                |
| Regional Offices         | Office/map cards                            | Reads Office Locations                                                                                                                                    |
| Team Showcase            | Team member grid                            | Structured profile fields and independent card backgrounds                                                                                                |
| Services                 | Service cards                               | Repeating service items                                                                                                                                   |
| Rich Text                | General formatted copy                      | Lexical rich text                                                                                                                                         |
| Video Embed              | External video                              | Valid provider/embed URL                                                                                                                                  |
| Media Carousel           | Scrollable media slides                     | Client carousel behavior and independent slide-card backgrounds                                                                                           |
| Program Grid             | Programs or offerings                       | Repeating program cards with independent semantic backgrounds                                                                                             |
| Program Matrix           | Academic programmes or structured offerings | Seamless one/two-column matrix with flexible Lucide icons, independent semantic card backgrounds, and optional Button or Link Text actions                |
| Logo Strip               | Partner/accreditation logos                 | Optional marquee behavior                                                                                                                                 |
| Page Header              | Inner-page heading                          | Eyebrow/title/description/actions                                                                                                                         |
| Breadcrumb               | Standalone page trail                       | Uses automatic hierarchy or editor-authored breadcrumb items                                                                                              |
| Timeline                 | Chronological milestones                    | Ordered timeline items                                                                                                                                    |
| Icon Card Showcase       | Icon-led cards and values                   | Cards per Row supports 2–4 desktop columns; cards collapse responsively and support semantic backgrounds and actions                                      |
| Icon Grid                | Icon-led benefits and responsibilities      | Card, Contact Cards, Minimal, Icon Top, or Ruled Columns; ruled items use continuous responsive dividers and inherit the section surface                  |
| Quote Block              | Quotation or pull quote                     | Quote and attribution                                                                                                                                     |
| Tabs Content             | Grouped tab panels                          | Client tab interaction                                                                                                                                    |
| Download List            | Files and resources                         | Uses Media documents/links; backgrounds apply to Cards                                                                                                    |
| Numbered Steps           | Ordered process                             | Backgrounds apply to numbered Cards, not connected/alternating layouts                                                                                    |
| Bento Grid               | Mixed-size feature cards                    | Grid layout and semantic background controls                                                                                                              |
| Testimonial Grid         | Curated testimonials                        | Backgrounds apply to Grid and Featured cards                                                                                                              |
| Awards List              | Awards and recognition                      | Backgrounds apply to Cards, not table/row presentations                                                                                                   |
| About Section            | Editorial about layout                      | Media and actions                                                                                                                                         |
| Accreditation Cards      | Accreditation and certification summary     | Two-to-four columns with shared semantic card and icon treatments                                                                                         |
| Reusable Section         | Shared block group                          | Reads one published Reusable Section                                                                                                                      |

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

Headers use the `Header Navbar 12` block, Footers use `Footer 56`, and System Pages use exactly one matching `System 404`, `System Maintenance`, or `System Coming Soon` block. Those structural blocks are not selectable in normal Page layouts.

## Choosing Data-Owned Blocks

Prefer the data-backed blocks when the same records need governance or reuse:

- News & Events Highlights or News Grid instead of manually copying news cards
- Event Gallery instead of rebuilding an album from loose images
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
