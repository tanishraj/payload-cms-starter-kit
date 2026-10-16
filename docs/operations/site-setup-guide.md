# Native site setup guide

Admins can choose **Review site settings** in Dashboard quick actions. It opens
Payload's existing **Site Identity** global. The optional **Site setup** guide
explains Brand (name/logo), Regional (timezone) and the native draft/publication
controls, then links to **Appearance**. Appearance keeps the existing presets and
System/Light/Dark choices and returns to Dashboard for page authoring.

This is contextual help in two existing screens, not a second settings form or a
mandatory wizard. There is no automatic setting change, reset, seed or publication.
The stored field paths, defaults, supported timezone list, theme normalization,
version history, global access and public rendering remain authoritative. No new
environment variable or migration is required. Domain, storage, email and launch
readiness remain in the [developer quickstart](developer-quickstart.md).

## Access and saved state

The Dashboard shortcut is an Admin orientation action. Site Managers keep their
existing assigned-feature navigation. When a Manager can update Site Identity or
Appearance, that native screen may show the same help. Identity-only access offers
Return to Dashboard rather than an unavailable Appearance destination. Dependency
read access alone does not show the guide or grant update access. Native routes and
saves always recheck the current account's permissions.

A non-persisted UI field is explicitly registered on both owning globals through
`siteSetupGuideField`. Its server component validates the owning feature and reads
only the signed-in account's preference with `overrideAccess: false` and the current
request. It sends primitive visibility/capability props to the native-form adapter;
it does not query, copy or write global settings.

The adapter observes native dirty, processing, public-version and lock state. It
withholds its forward link during unsaved edits or a pending save and directs the
user to Save Draft or Publish above. It never reports completion from a click,
valid defaults, a hidden guide or a pending response. Read-only, drawer, trashed,
unrelated-global and other-editor lock contexts omit the guide. An author's own
lock keeps the help available.

Save Draft stages settings; the public frontend continues to read published
globals or its established fallbacks. Publish remains a separate explicit native
action. The guide is not a production-readiness certificate.

## Personal help and presentation

`forma-site-setup-guide-v1` stores only `{ dismissed: boolean }` in Payload's
account-owned preferences. Both settings screens share this visibility preference;
Dashboard and Page guidance keep their independent keys. Hide/reopen waits for a
confirmed save and restores focus. Failed preference writes leave the current
help visible and explain recovery without changing native form data.

The presentation reuses authenticated `@shadcnblocks/empty-empty-actions-2`
([source category](https://www.shadcnblocks.com/components/empty)), reverified on
16 October 2026. It retains the existing Empty composition, paired actions,
Lucide icons and native Payload palette integration. The optional `guideLabel`
prop names the region and reopen button. Site states extend the existing
**Admin / Getting started** Storybook entry; there is no duplicate catalogue.

## Verification

Seventeen focused setup checks cover permissions, update/dirty states, independent
preference ownership, current request threading, confirmed writes, failure and
native exclusion/lock rules. Together with existing dashboard/Page guidance,
60 focused tests pass. Storybook builds and desktop/light/mobile/dark reviews pass.

The native journey passed first attempt in 20.5 seconds on the guarded local
Docker test database: Dashboard → Site Identity → name/timezone edit → Save Draft
→ Appearance → preset edit → Save Draft → hide/reopen across globals. It proves
public values remain unchanged after each draft save, records native screenshots,
and reports zero scoped WCAG A/AA violations or incomplete checks in light/dark.
It restores only touched test-global fields, using bounded cleanup independent of
the browser context. This is engineering evidence, not a novice-user study or
proof of production deployment readiness. Full local integration passes (2,842 tests, one existing opt-in Docker skip), all
five governance/onboarding journeys pass without retries, and production build
plus private-artifact checks pass (73 traces, private uploads excluded). Generators,
TypeScript, lint (one existing warning), approved audit and deterministic context
pass. Exact-head CI/merge evidence is recorded in the checklist and feature PR.


The final strengthened native case also inspects the saved Appearance response
for the exact selected preset and `draft` status; it passed without retries in
16.8 seconds. [PR #37](https://github.com/tanishraj/payload-cms-starter-kit/pull/37)
owns final exact-head CI and merge evidence.
