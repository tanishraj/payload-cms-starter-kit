# Website Modes Guide

## What This Section Is

`Website Modes` is where you prepare and activate site-wide fallback modes such as `Maintenance` and `Coming Soon`. It also stores the selected branded `404` page used when a public route does not exist.

In North Valley Medical College, this is the safety control for moments when the site needs a temporary override without rebuilding the normal content structure.

## When To Use It

Use `Website Modes` when you need to:

- select the branded `404` page
- prepare a maintenance override before planned technical work
- prepare a coming-soon override before launch
- temporarily replace the normal public website with a system page

Do not use this section for normal marketing or editorial publishing. Use `Pages` and `System Pages` for the actual content, then use `Website Modes` only to select or activate the override behavior.

## How It Connects To The Website

This global can override the normal frontend behavior:

- the selected `404 Page` is used for missing routes
- `Maintenance` mode can replace the public website with the selected maintenance page
- `Coming Soon` mode can replace the public website with the selected coming-soon page
- `Bypass For Logged In Admins` lets admins continue seeing the normal site while the public sees the override

Only published system pages of the correct type should be selected here. Because this section can affect all public routes, it is one of the highest-impact operational controls in the CMS.

## Step-By-Step Medical College Example

Prepare North Valley Medical College for a scheduled maintenance window:

1. Open `System Pages` and confirm a published maintenance page already exists.
2. Open `Website Modes`.
3. Select the correct `404 Page`.
4. Select the published maintenance page in `Maintenance Page`.
5. Leave `Bypass For Logged In Admins` enabled so trusted admins can still inspect the normal site.
6. Keep `Site Mode` set to `Off` until the maintenance window begins.
7. When the window starts, change `Site Mode` to `Maintenance`.
8. Save the global.
9. Verify the public website in a logged-out browser session.

Expected website result:

- public visitors see the maintenance page across the site
- logged-in admins can still inspect the normal frontend when bypass is enabled

## Best Practices

- prepare and publish system pages before activating any mode
- test in a logged-out browser when checking public behavior
- keep maintenance and coming-soon messaging short, accurate, and operationally safe
- use this control sparingly because it can override the entire public site

## Common Mistakes And Recovery

- activating a mode before the related system page is published
- selecting the wrong type of system page
- forgetting that the mode affects all public routes, not just the homepage
- testing only while logged in and missing the real public experience

If the public site shows the wrong override, check `Site Mode` first, then verify the selected system pages and their published state.

## Related Guides

- [System Pages](./system-pages.md)
- [Website Defaults](./site-defaults.md)
- [Activity Log](./operational-audit-events.md)
- [Users](./users.md)
