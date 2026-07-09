# System Pages Guide

## What This Section Is

`System Pages` is where you create branded fallback experiences for special website states such as `404`, `maintenance`, and `coming soon`. These are not normal content pages. They exist to protect the public experience when a route is missing or when the whole North Valley Medical College website is intentionally overridden by a system mode.

## When To Use It

Use `System Pages` when you need to:

- create a branded `404` page for missing routes
- prepare a maintenance page before planned site work
- prepare a coming-soon experience before a launch

Do not use `System Pages` for normal marketing or editorial content. Use `Pages` for standard public routes.

## How It Connects To The Website

System pages have site-wide impact. A `404` page is shown when a visitor requests a route that does not exist. Maintenance and coming-soon pages are tied to `System Modes`, which can override the normal frontend for all public routes.

This section depends on correct page type selection, matching system blocks, and the related selections in `Site Defaults` and `System Modes`. If a system page is misconfigured, visitors may see the wrong fallback, missing branding, or no clear path back to key areas such as Admissions or Contact.

## Step-By-Step Medical College Example

Create branded `404` and maintenance experiences for North Valley Medical College:

1. Open `System Pages`.
2. Click `Create New`.
3. Enter the title `College 404 Page`.
4. Set the type to `404`.
5. Add the matching `404` system block and include helpful recovery content such as links back to `Admissions`, `Programs`, and `Contact`.
6. Save and publish the page.
7. Create another system page called `Scheduled Maintenance Page`.
8. Set the type to `maintenance`.
9. Add the matching maintenance block and explain that the college website is temporarily unavailable during planned updates.
10. Save and publish the maintenance page.
11. Open `Site Defaults` and select the `404` page in the system-page defaults area.
12. Open `System Modes` and choose the maintenance page so it is ready if the site needs to be placed into maintenance mode.

Expected website result:

- missing routes show the branded `404` experience
- if maintenance mode is enabled later, the frontend switches to the maintenance experience site-wide

## Best Practices

- always match the selected page type with the correct system block
- include recovery links so users can still reach important destinations
- publish and verify system pages before enabling a mode that depends on them
- keep system messaging short, calm, and operationally accurate
- treat changes here as high-risk because they influence site-wide fallback behavior

## Common Mistakes And Recovery

- using the wrong block for the selected page type
- forgetting to connect the system page in `Site Defaults` or `System Modes`
- publishing weak fallback content with no route back to key sections
- editing a referenced system page without checking how it behaves on the frontend

If a fallback experience looks wrong, verify the page type, confirm the selected block matches it, and check the related system-page selections in defaults and modes.

## Related Guides

- [Pages](./pages.md)
- [Site Defaults](./site-defaults.md)
- [System Modes](./system-modes.md)
- [SEO Settings](./seo-settings.md)
