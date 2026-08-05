# Page Blocks Guide

## How The Block System Works

Pages use an ordered block layout. Editors can collapse, reorder, duplicate, and remove blocks; most visual sections share appearance and responsive spacing controls. A block error boundary isolates a failing block so the remainder of the Page can still render. Use live preview before publishing and inspect desktop, tablet, and mobile sizes.

`Reusable Section` references a shared block stack. Reusable Sections intentionally cannot contain another Reusable Section, Hero Carousel, Gallery Coverflow, Testimonial Grid, Awards List, or About Section.

## Block Catalog

| Block | Use it for | Important dependency or behavior |
| --- | --- | --- |
| Announcement | In-page notices | Separate from the site-wide announcement in Layout Defaults |
| Call to Action | Prominent conversion prompt | Supports section actions |
| Hero Banner | Single lead story | Media, overlay, alignment, and height controls |
| Hero Carousel | Rotating hero slides | Client carousel behavior |
| Gallery Coverflow | Coverflow media presentation | Client carousel behavior |
| Feature Spotlight | One highlighted feature | Image/content arrangements |
| Feature Matrix | Feature comparison grid | Repeating feature rows |
| Content Highlights | Curated content cards | Manual highlight content |
| News & Events Highlights | Recent news/upcoming events | Reads published News & Events |
| Profile Carousel | People/profile cards | Client carousel behavior |
| Gallery Showcase | Layered image showcase | Interactive presentation |
| Event Gallery | Album cards and full-screen viewer | Requires selected Gallery Albums |
| Image Mosaic | Multi-image composition | Uses Media images |
| Stats Strip | Animated metrics | Numeric values and labels |
| Q&A Accordion | Expandable questions | Accessible accordion interaction |
| Rating Spotlight | Aggregate rating summary | Reads published Reviews |
| Review Feed | Paginated review list | Uses `/api/review-feed` after the initial render |
| Review Submission | Public review form | Requires a Form with review intent |
| Contact Form | General or lead form | Requires a Form definition |
| Regional Offices | Office/map cards | Reads Office Locations |
| Team Showcase | Team member grid | Structured profile fields |
| Services | Service cards | Repeating service items |
| Rich Text | General formatted copy | Lexical rich text |
| Video Embed | External video | Valid provider/embed URL |
| Media Carousel | Scrollable media slides | Client carousel behavior |
| Program Grid | Programs or offerings | Repeating program cards |
| Logo Strip | Partner/accreditation logos | Optional marquee behavior |
| Page Header | Inner-page heading | Eyebrow/title/description/actions |
| Timeline | Chronological milestones | Ordered timeline items |
| Icon Grid | Icon-led benefits | Uses the shared icon selector |
| Quote Block | Quotation or pull quote | Quote and attribution |
| Tabs Content | Grouped tab panels | Client tab interaction |
| Download List | Files and resources | Uses Media documents/links |
| Numbered Steps | Ordered process | Repeating numbered steps |
| Bento Grid | Mixed-size feature cards | Grid layout controls |
| Testimonial Grid | Curated testimonials | Manually entered testimonial cards |
| Awards List | Awards and recognition | Repeating award rows |
| About Section | Editorial about layout | Media and actions |
| Reusable Section | Shared block group | Reads one published Reusable Section |

Headers use the `Header Navbar 12` block, Footers use `Footer 56`, and System Pages use exactly one matching `System 404`, `System Maintenance`, or `System Coming Soon` block. Those structural blocks are not selectable in normal Page layouts.

## Choosing Data-Owned Blocks

Prefer the data-backed blocks when the same records need governance or reuse:

- News & Events Highlights instead of manually copying news cards
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
