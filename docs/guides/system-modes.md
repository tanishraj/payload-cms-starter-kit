# Maintenance & Modes Guide

## What This Section Is

`Maintenance & Modes` selects published System Page presets for 404, maintenance, and coming-soon behavior, then activates `Off`, `Maintenance`, or `Coming Soon` mode.

## Configuration Rules

- each relationship only accepts a published System Page of the matching type
- activating Maintenance requires a Maintenance preset
- activating Coming Soon requires a Coming Soon preset
- Admin requests can bypass the temporary mode for recovery and verification
- changes are versioned and written to the Audit Log

Current mode overrides apply to `/` and catch-all CMS Page routes. Dedicated article, review, News & Events, search, feed, Admin, and API routes are not replaced by the mode.

## Step-By-Step Medical College Example

1. Create and publish matching 404, Maintenance, and Coming Soon records in `System Pages`.
2. Open `Maintenance & Modes` in `Configuration` and select each preset.
3. Save while `Site Mode` is `Off` and verify each preset.
4. Select `Maintenance` only when the CMS Page surface should show the maintenance experience.
5. Test as a signed-out visitor and as an Admin.
6. Return the mode to `Off` after the operational window.

## Best Practices

- preconfigure and review all three presets before an incident
- do not assume the mode blocks every dedicated route or API
- coordinate mode changes with operational communications and cache verification
- use the Audit Log to confirm who changed the mode

## Related Guides

- [System Pages](./system-pages.md)
- [Layout Defaults](./site-defaults.md)
- [Audit Log](./operational-audit-events.md)
