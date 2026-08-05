# News & Events Guide

## What This Section Is

`News & Events` is the governed collection for public news stories and dated events. Both types share one archive and detail-page system, while event-only fields appear when `Entry Type` is `Event`.

## When To Use It

Use a `News` entry for announcements, achievements, notices, and newsroom stories. Use an `Event` entry for a scheduled activity with a start time and location. Use `Articles` for evergreen long-form editorial content that belongs in article topic and tag archives.

## Required Content And Validation

Every entry requires a title, slug, excerpt, rich-text body, featured image, image position, SEO-safe publication state, and workflow data. An Event additionally requires:

- `Event Start`
- `Event Location`
- an optional `Event End` that cannot be earlier than the start
- an optional registration action

The primary topic is automatically included in additional topics. Tags are optional. Only entries whose Payload status and editorial workflow are both published are exposed publicly.

## How It Connects To The Website

- `/news-events` is the server-rendered archive.
- `/news-events/[slug]` renders a detail page and Event structured data when applicable.
- `/news-events/feed.xml` publishes the feed.
- `News & Events Highlights` can surface recent news and current/upcoming events on Pages.
- `News & Events Settings` controls archive copy, filters, page size, appearance, empty states, and SEO.
- Live preview is available at desktop, tablet, and mobile breakpoints.

Past events remain available in the archive and at their detail URL, but Highlights only selects current or upcoming events.

## Step-By-Step Medical College Example

1. Open `News & Events` in `Content`.
2. Create `White Coat Ceremony 2026` and select `Event`.
3. Write the card excerpt and complete event description.
4. Set the start, optional end, venue, registration action, featured image, and primary topic.
5. Complete the SEO fields and use live preview at all three breakpoints.
6. Move the item through the required editorial workflow. Resolve any blocking `Action Queue` item before publishing.
7. Verify the detail page, archive filter, feed, and any Highlights block that should feature it.

## Best Practices

- keep the excerpt useful as standalone archive and feed copy
- use the byline for a real public attribution, not internal notes
- close event registration by editing its action instead of deleting the event history
- set event times in the timezone expected by the deployment and verify the rendered result
- do not expect the `scheduled` workflow state to publish automatically; it records and queues the intended schedule for operator oversight

## Common Mistakes And Recovery

- selecting News for an item that needs event dates and Event JSON-LD
- setting an end time before the start time
- publishing in Payload while leaving the workflow state unpublished
- expecting past events to remain in the Highlights block

If an entry is missing publicly, check both publication states, its slug, and whether an open or blocked approval/publish-issue item remains in `Action Queue`.

## Related Guides

- [News & Events Settings](./news-events-settings.md)
- [Topics](./categories.md)
- [Tags](./tags.md)
- [Media](./media.md)
- [Action Queue](./work-queue.md)
- [Page Blocks](./blocks.md)
