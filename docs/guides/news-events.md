# News & Events Guide

## What This Section Is

`News & Events` is the governed collection for public updates and dated events. Every entry belongs
to exactly one `Entry Classification`: News, Events, Notice, Holiday, Achievements, Announcement, or
Others. Editors compose the public index as a normal Page, while the collection continues to own
individual detail pages and event-only fields appear only when the classification is `Events`.

## When To Use It

Choose the classification that matches the entry's single public tab. Use `Events` only for a
scheduled activity with a start time and location. Use `Articles` for evergreen long-form editorial
content that belongs in article topic and tag archives.

## Required Content And Validation

Every entry requires a title, slug, excerpt, rich-text body, featured image, image position, SEO-safe publication state, and workflow data. An Event additionally requires:

- `Event Start`
- `Event Location`
- an optional `Event End` that cannot be earlier than the start
- an optional registration action

The primary topic is automatically included in additional topics. Tags are optional. Only entries whose Payload status and editorial workflow are both published are exposed publicly.

## How It Connects To The Website

- Create and publish a root Page with the slug `news-events` to own `/news-events`.
- Compose that Page with normal Page blocks. Use `News & Events Highlights` for the featured carousel and `News & Events Tabs` for the classified text-only listing.
- Listing cards remain collection-driven and link to `/news-events/[slug]` detail pages.
- Configure the shared detail layout in `News & Events > Detail Page Template`. It uses the
  same ordered blocks as Pages plus one global-only `News & Events Content` block. Add and arrange
  Page Header, Breadcrumb, and other standard blocks around that dynamic block; drafts may be
  incomplete, but publishing requires exactly one `News & Events Content` block.
- `News & Events Content` automatically binds the current entry. Its main column renders the
  featured image first, places the entry classification and title in a bottom-left image overlay,
  then renders the excerpt and the Lexical body. Its Theme Settings control section appearance,
  spacing, featured-image ratio, sidebar surface/outline, and the shared Overlay Tone, Strength,
  Direction, and Coverage. Missing settings fall back to Dark, Darker, Bottom to Top, and Full;
  missing media uses the bundled SNMIH default image.
- Story Details and the optional Share This card remain in a right-hand sticky sidebar on large
  screens and follow the main article on smaller screens. The shared author defaults to
  `Management, SNMIH` and is configured inside `News & Events Content`. Story Details uses the
  theme mono family for metadata labels and values, with tabular numerals for dates. Card headings
  and Share actions retain their established display and text families.
- The Lexical body shares the same theme-aware long-form typography as Article details and Rich Text
  Page blocks. Q&A Accordion answers use a matching compact preset instead of article-scale spacing.
- Topics and Tags remain editorial metadata; News & Events does not publish taxonomy archive routes.
- `/news-events/[slug]` renders the saved global block order and injects the current record only into
  `News & Events Content`. Event structured data is included when applicable. Non-event entries
  expose the configured shared author as an Organization in NewsArticle structured data.
- `/news-events/feed.xml` publishes the feed.
- `News & Events Highlights` is an automatic Featured Carousel. It interleaves recent published
  non-event entries with current or upcoming Events up to the configured one-to-six item limit.
  Number of Items, Autoplay, and Empty State Message live under Theme Settings. Entries without a
  usable featured image display the bundled SNMIH default image.
- `News Grid` retains its established mixed grid. Editors choose a total of 1–6 cards and 2, 3, or 4
  desktop columns; mobile stays one column and tablet stays two. An optional editor-authored feature
  card occupies the final configured slot rather than adding another card beyond the selected total.
  Entries are ordered by most recently updated, with creation time as the fallback.
- `News & Events Tabs` is the separate text-only directory block. `All` is always first; editors
  can add, remove, rename, and reorder the News, Events, Notice, Holiday, Achievements,
  Announcement, and Others tabs, with each classification used at most once. The block loads 3, 6,
  9, or 12 entries per tab, supports 2–4 desktop columns, and retains the shared section appearance,
  optional header, header actions, footer actions, spacing, action labels, and empty-state controls.
- The root Page owns index copy, layout, appearance, actions, and SEO through the standard Page fields and selected blocks.
- Live preview is available at desktop, tablet, and mobile breakpoints.

Past events remain available at their detail URL and in RSS history, while Highlights, Tabs, and News Grid select current or upcoming events.

The sitemap includes the published `/news-events` Page through the normal Page rules and includes eligible News & Events detail URLs. It does not generate News & Events taxonomy, filter, or pagination URLs.

## Step-By-Step Medical College Example

1. Open `News & Events` in the `News & Events` Admin group.
2. Create `White Coat Ceremony 2026` and set `Entry Classification` to `Events`.
3. In `Content`, write the card excerpt, choose the featured image and image position, add optional Topics & Tags, and complete the body.
4. In `Event Details`, set the start, optional end, venue, and registration action.
5. Complete the SEO fields and use live preview at all three breakpoints.
6. Move the item through the required editorial workflow. Resolve any blocking `Action Queue` item before publishing.
7. Verify the detail page, feed, and the Highlights or Tabs block that should feature it on the manually composed Page.
8. When changing the shared detail presentation, open `News & Events > Detail Page Template`,
   arrange the standard Page blocks, and configure the single `News & Events Content` block before
   publishing the global.

## Best Practices

- keep the excerpt useful as standalone archive and feed copy
- update the shared author in the `News & Events Content` block under `Detail Page Template`;
  the legacy per-entry Byline remains stored but is hidden and is not rendered publicly
- close event registration by editing its action instead of deleting the event history
- set event times in the timezone expected by the deployment and verify the rendered result
- leave Robots at `Default` to inherit the global SEO & Metadata crawler policy; choose `Index` or `No index` only for an intentional entry-level override
- do not expect the `scheduled` workflow state to publish automatically; it records and queues the intended schedule for operator oversight

## Common Mistakes And Recovery

- selecting News for an item that needs event dates and Event JSON-LD
- setting an end time before the start time
- publishing in Payload while leaving the workflow state unpublished
- expecting past events to remain in the Highlights block

If an entry is missing publicly, check both publication states, its slug, and whether an open or blocked approval/publish-issue item remains in `Action Queue`. If `/news-events` itself is missing, confirm the root Page is published with the exact slug `news-events`.

## Related Guides

- [Pages](./pages.md)
- [Topics](./categories.md)
- [Tags](./tags.md)
- [Media](./media.md)
- [Action Queue](./work-queue.md)
- [Page Blocks](./blocks.md)
