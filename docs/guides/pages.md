# Pages Guide

## What This Section Is

`Pages` is the main place where standard website pages are created and managed. Use it for public-facing pages such as Home, About, Admissions, Programs, Faculty, Research, and Contact for North Valley Medical College.

## When To Use It

Use `Pages` when you need a normal website page with its own URL and layout.

Do not use it for:

- system-only experiences like 404 or maintenance pages
- long-form newsroom content that belongs in `Articles`

## How It Connects To The Website

Pages define real frontend routes. A published page can become the homepage through `Site Defaults`, can appear in navigation through `Links`, and can rely on `Headers`, `Footers`, and `Media`.

This collection also supports parent-child hierarchy, public URL preview, reusable layout blocks, SEO fields, and editorial workflow states. If a page slug or hierarchy changes, related navigation and redirects may also need attention.

## Step-By-Step Medical College Example

Create an `Admissions Overview` page for North Valley Medical College:

1. Open `Pages`.
2. Click `Create New`.
3. Enter the title `Admissions Overview`.
4. Add the page content blocks needed for the page.
5. Set the slug to `admissions`.
6. Review the public URL preview.
7. Add SEO details that describe the admissions page.
8. Move the workflow to the correct state and publish when ready.

Expected website result:

- the public site has a page at `/admissions`
- the page can later be linked from the header or footer

## Best Practices

- keep titles clear and institution-facing
- confirm the public URL before publishing
- use pages for stable evergreen sections of the site
- use live preview before publishing major layout changes
- add a short change summary when the page update affects structure or messaging

## Common Mistakes And Recovery

- creating an article when the content should really be a page
- changing a slug without checking related links
- publishing before reviewing the page URL and SEO settings
- selecting a parent page that creates a confusing hierarchy

If a URL changes unexpectedly, review `Redirects` and related `Links`.

## Related Guides

- [Links](./links.md)
- [Headers](./headers.md)
- [Footers](./footers.md)
- [Site Defaults](./site-defaults.md)
