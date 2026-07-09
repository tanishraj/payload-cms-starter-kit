# Footers Guide

## What This Section Is

`Footers` is where you create reusable footer presets for the bottom of the website. A footer usually carries persistent trust and utility information such as address details, accreditation references, quick links, and admissions calls to action for North Valley Medical College.

## When To Use It

Use `Footers` when you need to:

- update institution-wide contact information in the site footer
- add quick links to major sections
- include accreditation or compliance references
- place a repeated admissions CTA at the bottom of the site

Do not use it for page-specific content that belongs inside a page layout block.

## How It Connects To The Website

Footers affect site-wide behavior because the active footer is rendered in the frontend layout across the public website. The active footer is selected in `Site Defaults`, and the footer often depends on `Links`, `Media`, and correct site contact details from settings.

If it is misconfigured, the public website can show outdated address information, broken quick links, or missing trust signals on every page. A footer problem is rarely isolated to one page because the same footer preset is reused globally.

## Step-By-Step Medical College Example

Create a footer for North Valley Medical College with address, accreditation, quick links, and an admissions CTA:

1. Open `Footers`.
2. Click `Create New`.
3. Enter the title `Primary College Footer`.
4. Open the footer layout block.
5. Add the college address and contact details used in the footer presentation.
6. Add quick links such as `Programs`, `Admissions`, `Campus Life`, and `Contact`.
7. Add an accreditation or institutional trust section if the block supports it.
8. Add an admissions CTA such as `Request Prospectus`.
9. Save and publish the footer preset.
10. Open `Site Defaults` and choose this footer as the active footer if it should appear on the live website.

Expected website result:

- the footer appears across the frontend with college contact and trust information
- visitors can reach important utility pages from the bottom of the site

## Best Practices

- keep footer links practical and stable
- make sure address, phone, and email details match `Site Settings`
- use the footer for secondary navigation, not as a duplicate of every header item
- review footer links after structural page changes
- treat footer edits as site-wide changes that deserve a quick smoke test

## Common Mistakes And Recovery

- publishing a footer but not making it active
- showing outdated contact or accreditation information
- adding links that point to unpublished or removed pages
- forgetting that a footer change affects the frontend everywhere

If the live footer looks wrong, confirm the active footer in `Site Defaults`, review the configured links, and compare the footer content against the latest institutional details.

## Related Guides

- [Links](./links.md)
- [Media](./media.md)
- [Site Settings](./site-settings.md)
- [Site Defaults](./site-defaults.md)
