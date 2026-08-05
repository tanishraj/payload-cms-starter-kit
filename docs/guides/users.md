# Users Guide

## What This Section Is

`Users` is where administrators manage who can sign in to the CMS and what level of access each person receives. This project uses a role-first model with capability checkboxes for non-admin exceptions.

The current roles are:

- `Admin`
- `Site Manager`
- `Content Manager`

In North Valley Medical College, this is how you would decide who can manage site structure, who can publish content, and who should only work in approved editorial areas.

## When To Use It

Use `Users` when you need to:

- create a new CMS login
- assign a base role to a staff member
- adjust capability checkboxes for a trusted non-admin user
- review whether someone should have publishing or operations access

Only `Admin` users can open and manage this section.

Do not use this section for day-to-day content editing decisions. Use it only when access boundaries themselves need to change.

## How It Connects To The Website

Users do not appear publicly on the website, but their access model controls who is allowed to change live website content and settings.

The current role model works like this:

- `Admin` always receives full access
- `Site Manager` receives the broader trusted operator preset, including site structure, settings, forms, queue, and audit access
- `Content Manager` receives the focused editorial preset for pages, articles, reviews, media, and related publishing

For non-admin users, the `Capabilities` checkboxes are visible and can be adjusted after the role default is applied. This lets an administrator keep the base role simple while allowing explicit exceptions.

## Step-By-Step Medical College Example

Create a trusted non-admin site operator for North Valley Medical College:

1. Open `Users`.
2. Click `Create New`.
3. Enter the user email and required authentication details.
4. Set the role to `Site Manager`.
5. Save the user once so the role default capabilities are applied.
6. Review the `Capabilities` group.
7. Keep the defaults if this user should manage structure, settings, forms, queue work, and publishing.
8. Adjust individual checkboxes only if this person needs a specific exception.
9. Save the updated user.

Expected website result:

- the new operator can sign in and access the intended admin sections
- they can manage only the CMS areas allowed by their role and capabilities

## Best Practices

- keep `Admin` reserved for the smallest possible set of trusted technical owners
- use `Site Manager` for the broader website operator who needs structure and system access
- use `Content Manager` for editorial users focused on content production and publishing
- change individual capabilities only for clear, documented exceptions
- review access whenever responsibilities change

## Common Mistakes And Recovery

- giving `Admin` when `Site Manager` would be enough
- changing capability checkboxes without understanding the role default underneath
- expecting a non-admin user to see admin-only sections such as user management
- forgetting that changing the role resets the non-admin capability preset to that role default

If someone cannot access an expected area, confirm the role first, then review the capability checkboxes for that user. If access expanded too far, remove the extra capability rather than promoting the user to `Admin`.

## Related Guides

- [Audit Log](./operational-audit-events.md)
- [Work Queue](./work-queue.md)
- [Forms](./forms.md)
- [Layout Defaults](./site-defaults.md)
