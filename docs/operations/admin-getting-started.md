# Dashboard getting started

The dashboard offers one useful next action using current server facts. Guidance
is optional and can be hidden with **Hide guide**, then reopened with **Getting
started**. The preference belongs to the signed-in account and follows that account
across dashboard loads; it does not mark setup complete or grant access.

## Admin

Admins retain full access. When an accessible Page draft exists, **Continue draft**
opens its latest saved version. Otherwise **Create a page** opens the existing
Blank/Landing recipe flow. Native editing, blocks, Save Draft, Live Preview and
explicit publication remain unchanged. Guidance creates or publishes nothing.

## Site Manager

The guide checks assigned features and valid current root Pages. It names at most
three assigned sections and the number of additional sections. A current accessible
draft takes precedence; otherwise it offers a permitted authoring task or an
assigned destination. A Page creator still chooses a permitted Parent in the native
editor. Shared published resources remain Admin-managed; inbox permission stays
separate. Other feature grants remain site-wide under the existing section rollout.

No features and no valid sections have different recovery messages. Ask the Admin
who created the account to assign features or root Pages, then use **Check access
again**. Guidance does not invent an administrator email address. Operational-only
grants need a usable source feature. Missing-access recovery cannot be dismissed,
even if the optional guide was hidden earlier. No dead scoped creation links or
out-of-scope draft titles are shown. Every destination rechecks access normally.

An unavailable scope/draft query is distinct from a new empty site. Failed optional
preference reads do not stop authoring. Failed writes keep the current guide visible
and offer recovery; visibility changes only after the server confirms the saved
value. Hide/reopen preserves keyboard focus. Disclosure controls stay disabled until
their handlers hydrate; ordinary task links work without that interaction. The dashboard's recent work uses the
latest saved drafts, retaining its explicit Draft/Published labels.

## Implementation boundary

`adminOnboarding.ts` is a server-only loader. Access-enforced Page reads validate
scope and provide labels; minimal draft queries and the account's native
`payload-preferences` lookup run alongside other dashboard work. Only a versioned
visibility key is stored; there is no new collection, custom persistence endpoint,
third role, environment variable, dependency or migration.

The browser adapter posts visibility to Payload's existing authenticated preference
endpoint. Payload derives preference ownership from the session. Onboarding state
never proves database/storage/email/preview health or launch readiness.

Presentation is sourced from authenticated `@shadcnblocks/empty-empty-actions-2`,
with its upstream Empty dependency and the existing Button. **Admin / Getting
started** is the single Storybook entry with Docs, controls, task/blocked/failure/
pending/long-content states and hide/reopen interaction. Scoped Tailwind/preflight
styles affect only the guide; semantic colors inherit Payload's existing palette,
and the workshop retains its official Neutral foundation. Public site styling is
unchanged. Source design and button/Empty composition are preserved.

This is a first dashboard onboarding increment. Developer preflight, launch
readiness, a configured support contact, invitations, a task-based help index and
novice-user studies remain separate checklist work. There is no mandatory tour,
example seed, telemetry or assertion that broad ONBOARD acceptance is complete.

Verification and exact-head CI/merge status are recorded in the main implementation
checklist and feature PR. Native browser checks cover account persistence,
keyboard use, scoped draft resume, missing assignments and normal editor entry;
real Mongo/REST tests verify preference ownership and current permission changes.

## Local checkpoint — 16 October 2026

Native onboarding/governance journeys pass (43.0 seconds), including persisted
hide/reopen, keyboard focus, scoped draft resume and explicit missing-section
recovery. The first run stalled in fixture setup before UI; a subsequent run
exposed an early keyboard/hydration race, now fixed with actual disabled-before-
hydration controls. The missing-scope fixture now explicitly removes its prior
Reviews grant because Payload merges partial group updates. No timeout/assertion
was weakened. Both earlier failures remain in the work log.

Desktop/light and narrow/dark workshop review preceded integration; native Admin
desktop and Manager mobile screenshots are reviewed. Scoped axe WCAG A/AA scans
report zero violations and zero incomplete checks for the light Default and dark
Long Content guide. This is not certification of the entire admin or a novice-user
study. Final release gates and exact-head CI/merge status belong to the feature PR.

Final local release: 2,778 integration tests pass/one existing Docker-dependent
skip; both native governance/onboarding journeys pass (43.0s), and both existing
form journeys pass (3.2m). Fresh production build passes with 73 traces and no
private uploads; final Storybook, generators, TypeScript, full lint (one existing
warning), dependency policy and context pass. Exact-head CI and merge remain
governed by the feature PR; broad onboarding acceptance is not inferred.
