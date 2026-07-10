# Headers Guide

## What This Section Is

`Headers` is where you create reusable top-of-site header presets. A header controls the main navigation and the most visible global calls to action across the North Valley Medical College website.

## When To Use It

Use `Headers` when you need to:

- build or update the primary top navigation
- change global utility links or calls to action
- prepare a new header design before making it active site-wide

Do not use it for individual page content. Headers are structural and belong to the site shell rather than one page.

## How It Connects To The Website

Headers influence site-wide behavior because the active header is rendered across the public website layout. The currently active header is chosen in `Website Defaults`, and it usually depends on reusable `Navigation Links`, brand assets from `Media`, and correct page destinations.

If a header is misconfigured, users can lose access to important navigation paths such as `About`, `Programs`, `Admissions`, `Research`, or `Contact`. A broken or incomplete header affects the frontend on nearly every public page, not just one route.

## Step-By-Step Medical College Example

Create the main North Valley Medical College top navigation:

1. Open `Headers`.
2. Click `Create New`.
3. Enter the title `Main College Header`.
4. Open the available header layout block.
5. Add or select the navigation items for `About`, `Programs`, `Admissions`, `Research`, and `Contact`.
6. Add the primary admissions call to action, such as `Apply Now`, if the block supports it.
7. Save the header preset.
8. After review, publish it.
9. Open `Website Defaults` and set this header as the active header if it should appear on the live website.

Expected website result:

- the chosen header appears across the public frontend
- users can reach the college’s key sections from the top navigation

## Best Practices

- keep the header focused on the most important routes
- use reusable `Navigation Links` so destinations stay consistent across the site
- preview the header after major navigation changes
- treat header updates as high-impact because they affect site-wide navigation
- confirm that the admissions and contact paths still lead to the intended pages

## Common Mistakes And Recovery

- publishing a header but forgetting to make it active in `Website Defaults`
- linking to draft or incorrect destinations
- overcrowding the header with too many equal-priority items
- changing header navigation without checking the footer and redirect strategy

If visitors cannot reach key sections, review the active header selection, inspect the linked pages, and confirm the frontend renders the expected navigation items.

## Related Guides

- [Navigation Links](./links.md)
- [Pages](./pages.md)
- [Footers](./footers.md)
- [Website Defaults](./site-defaults.md)
