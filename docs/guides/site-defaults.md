# Site Defaults Guide

## What This Section Is

`Site Defaults` is where you choose the global website defaults that control the real homepage, the active header, and the active footer.

In North Valley Medical College, this is the section that decides:

- which published page opens at `/`
- which header appears across the site
- which footer appears across the site

## When To Use It

Use `Site Defaults` when you need to:

- change the real homepage of the website
- switch the live site to a different saved header preset
- switch the live site to a different saved footer preset

Do not use this section to edit the page content itself. Edit the source page, header, or footer in its own section first, then select it here when it is ready to go live site-wide.

## How It Connects To The Website

This global is directly connected to the frontend layout and routing:

- `Front Page` decides which published page renders at `/`
- `Active Header` decides which header preset renders across the site
- `Active Footer` decides which footer preset renders across the site

This section has immediate site-wide importance. A wrong homepage selection changes the root route for the whole website. A wrong header or footer changes global navigation and trust content across nearly every page.

## Step-By-Step Medical College Example

Make `Admissions Overview` the homepage for North Valley Medical College:

1. Confirm the `Admissions Overview` page is published in `Pages`.
2. Open `Site Defaults`.
3. Open the `Front Page` tab.
4. Select `Admissions Overview` in the `Front Page` field.
5. Open the `Header` tab and choose the intended live header preset.
6. Open the `Footer` tab and choose the intended live footer preset.
7. Save the global.
8. Verify the public website homepage at `/`.

Expected website result:

- the root URL now renders the selected published page
- the selected header and footer appear across the public site

## Best Practices

- only point the homepage to a page that is fully reviewed and already published
- treat header and footer switches as site-wide releases
- verify the homepage route after every homepage change
- coordinate homepage changes with navigation, SEO, and campaign traffic

## Common Mistakes And Recovery

- selecting a draft page as the homepage candidate
- changing the homepage without checking the live route afterward
- switching header or footer presets before they were fully reviewed
- assuming this section changes page content instead of just selecting the active preset

If the homepage looks wrong, verify the selected page here first, then inspect the source page in `Pages`. If the site shell looks wrong, check the selected header and footer presets.

## Related Guides

- [Pages](./pages.md)
- [Headers](./headers.md)
- [Footers](./footers.md)
- [SEO Settings](./seo-settings.md)
