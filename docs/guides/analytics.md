# Analytics & Tracking Guide

## What This Section Is

`Analytics & Tracking` is where you connect the website to Google Tag Manager or Google Analytics 4. Analytics are held back until a visitor explicitly accepts cookies. This provides consent gating but does not, by itself, guarantee compliance with any privacy law.

## When To Use It

Use `Analytics & Tracking` when you need to:

- start measuring page views, events, or conversions on the public website
- connect a Google Tag Manager container that manages third-party scripts
- add Google Analytics 4 directly without a tag manager
- change or update a tracking ID without touching the codebase

Do not paste tracking scripts into page content or HTML embeds. All analytics belong here so the consent system can gate them correctly.

## How It Connects To The Website

The website layout reads this global on every page load. If a visitor has accepted the cookie consent notice, the configured GTM container or GA4 script is injected into the page. If the visitor has not yet decided or has rejected cookies, no analytics scripts load at all.

When `Cookie Consent Banner` is enabled, it appears if the visitor has no decision cookie. **Accept all** refreshes the route and allows analytics to load; **Reject non-essential** stores denial without loading analytics.

Changing settings here takes effect on the next page load for visitors who have already consented.

## Step-By-Step Medical College Example

Add Google Tag Manager to North Valley Medical College:

1. Open `Analytics & Tracking` in the admin under `Settings`.
2. On the **Google Tag Manager** tab, turn on `Enable Google Tag Manager`.
3. Enter the GTM container ID in the format `GTM-XXXXXXX`.
4. Save the global.

Expected website result:

- visitors who accept cookies will trigger the GTM container on every page
- the admissions team can now configure events inside GTM without CMS changes
- visitors who reject cookies receive no tracking scripts

## Choosing Between GTM And GA4 Direct

Use **Google Tag Manager** if:
- you need more than GA4, such as ad pixels, heatmap tools, or custom events
- the marketing team manages tags independently in the GTM interface
- you already have an existing GTM container set up

Use **GA4 Direct** if:
- you only need basic analytics and want a simpler setup
- you do not have a GTM account
- `Enable Google Tag Manager` is turned off and `Enable GA4` is turned on instead

Do not enable both GTM and GA4 direct at the same time. If GTM is enabled, the GA4 direct script is automatically suppressed because GA4 should be configured inside GTM instead.

## Cookie Consent And Privacy

When enabled, the consent banner:

- links to the Privacy Policy page configured in `Site Identity`
- stores the visitor's choice in a browser cookie for one year
- does not load any analytics until the visitor has accepted

If a visitor later clears their cookies, the banner will show again on their next session.

The Privacy Policy page link comes from `Site Identity → Legal`. If it is empty, the banner still works without the link. Configure the banner's style and copy separately in `Cookie Consent Banner`.

## Best Practices

- always use a GTM container rather than GA4 direct on sites that may need additional third-party tools later
- confirm that the GTM container ID is correct before saving — an incorrect ID will silently produce no data
- verify consent behavior by visiting the site in a private browser window and checking that no analytics requests are made until you click **Accept all**
- keep the Privacy Policy page up to date with an accurate description of cookie usage

## Common Mistakes And Recovery

- entering the wrong ID format — GTM IDs start with `GTM-`, GA4 IDs start with `G-`
- enabling GTM and GA4 direct at the same time — the GA4 direct script will not load when GTM is enabled
- expecting analytics to fire before the visitor has accepted — this is correct behavior, not a bug
- not having a Privacy Policy Page selected in Site Identity

If analytics data is not appearing after saving, check the consent banner in a private browsing window, verify the ID format, and confirm the global has been saved.

## Related Guides

- [Site Identity](./site-settings.md)
- [SEO & Metadata](./seo-settings.md)
- [Cookie Consent Banner](./cookie-consent.md)
