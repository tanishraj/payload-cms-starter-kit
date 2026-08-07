# News & Events Settings Guide

## What This Section Is

`News & Events Settings` is the `Configuration` global for the dedicated `/news-events` archive. It does not create entries; it controls how the route presents and describes them.

## What It Controls

- eyebrow, title, description, and All/News/Events filter labels
- Upcoming Events, Past Events, and Read More labels
- empty-state title and description
- `Entries Per Page`, validated as a whole number from 3 through 24
- archive appearance, spacing, and compact/default/comfortable size
- archive SEO and social metadata

Changes are versioned, written to the Audit Log, and revalidated for the frontend.

## Step-By-Step Medical College Example

1. Open `News & Events Settings` in `Configuration`.
2. Set the archive title to `College News & Events` and add a short introduction.
3. Confirm the filter and timeframe labels.
4. Choose an entries-per-page value between 3 and 24.
5. Set the archive appearance and SEO fields.
6. Save, then check `/news-events` with All, News, Events, upcoming, past, and pagination views.

## Best Practices

- keep filter labels short enough for mobile layouts
- use the empty state to explain how visitors can recover from a narrow filter
- leave Robots at `Default` to inherit the global SEO & Metadata crawler policy; explicit `Index` or `No index` values override it for the archive
- review canonical and robots settings before intentionally excluding the archive
- coordinate page-size changes with content-card density

## Related Guides

- [News & Events](./news-events.md)
- [SEO & Metadata](./seo-settings.md)
- [Appearance](./theme-settings.md)
