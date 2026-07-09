# Links Guide

## What This Section Is

`Links` stores reusable destinations for menus, calls to action, utility links, and legal links. In North Valley Medical College, this is where you can manage destinations such as `Apply Now`, `Download Prospectus`, and `Book Campus Visit`.

## When To Use It

Use `Links` when the same destination may appear in multiple places across the website and should be managed centrally.

Do not use it for:

- full page content, which belongs in `Pages`
- redirect rules, which belong in `Redirects`

## How It Connects To The Website

Links are used by structural elements such as headers, footers, and other navigation-driven areas. They can point to internal pages or custom URLs, and some links may be automatically synced from pages rather than manually managed.

If a reusable link points to the wrong page or URL, multiple parts of the frontend can break at once.

## Step-By-Step Medical College Example

Create reusable links for North Valley Medical College:

1. Open `Links`.
2. Click `Create New`.
3. Create a link titled `Apply Now`.
4. Choose whether it points to a page or a custom URL.
5. If it points to a page, select the correct admissions-related page.
6. Save the link.
7. Repeat the process for `Download Prospectus`.
8. Repeat the process for `Book Campus Visit`.
9. Review whether any of these links should open in a new tab.

Expected website result:

- the same key destinations can be reused safely across header, footer, and CTA areas
- updating the link once updates all places that reference it

## Best Practices

- use short action-oriented titles
- prefer reusable links for repeated destinations
- use custom URLs only when the destination is not a managed page
- avoid editing page-synced links unless you understand how they were created

## Common Mistakes And Recovery

- creating duplicate links for the same destination
- selecting the wrong page target
- using a custom URL where a page relationship would be safer
- forgetting that a reusable link may affect multiple frontend locations

If a destination changes, update the reusable link first and then spot-check the header, footer, and affected CTAs.

## Related Guides

- [Pages](./pages.md)
- [Headers](./headers.md)
- [Footers](./footers.md)
- [Redirects](./redirects.md)
