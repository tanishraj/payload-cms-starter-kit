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

## Continue in the Page editor

The Page Content tab now reuses the same sourced guide presentation with current
native form facts, a safe saved-preview link and its own optional account visibility.
See [Page editing guide](page-editing-guide.md). Hiding one guide does not hide the
other. The developer quickstart and safe preflight shipped separately in PR #35.

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

The first PR #34 Quality run passed integration but failed the Manager Page
redirect assertion. The captured retry returned HTTP 400 for a duplicate slug;
the test had registered created Pages for cleanup only after a five-second URL
assertion. The journey now verifies the native multipart create response and
its saved draft, registers the returned ID immediately, and waits for the exact
editor navigation before readback. A fresh local Next run passed both journeys
(1.1m); the response-aware run passed both (46.8s). No production access, slug,
validation or timeout policy was relaxed. The first attempt had no trace, so its
exact save timing is not inferred from the retry. Final CI remains a merge gate.

The second CI run passed integration. Its retry trace confirms the scoped Page
create response was HTTP 201 and the editor opened, then the combined access plus
onboarding journey exhausted its existing three-minute budget at a later login.
Other attempts stalled in fixture startup before UI; timeout cleanup then depended
on an already-closed browser and left section fixtures for the next retry.

Access administration, optional onboarding and Review moderation now run as three
independent native journeys, with the same timeout and assertions. A preload-only experiment also stalled locally and was discarded. Governance
fixture setup/cleanup now runs in a short-lived standalone Node process, with
explicit loader flags, structured IPC and a 90-second failure deadline below the
unchanged three-minute browser budget. Parent and child both enforce the existing
loopback test-database guard. Payload closes before a successful result; raw driver
errors and environment values are not forwarded to logs. Test Page IDs are registered immediately and cleaned
through the existing database-guarded Local API, independently of browser cookies,
children before roots. Real Mongo tests prove that an unrelated Page survives.
The exact runtime cause of the intermittent import stall is not claimed beyond
this observed boundary; repeated local and exact-head CI results remain required.

Final local fixture-boundary check: all three native journeys passed twice without
retries (6 passes, 1.5m). An earlier repetition passed five cases but exposed an IPC
cleanup exit. The child now retains its disconnect listener throughout async work,
exits if its parent disappears, and the parent waits for process close and a result.
Safe exit code/signal diagnostics preserve failure visibility. The full integration
suite passed 2,783 tests/one existing skip; final context/type/lint and exact-head CI
remain release gates. Browser timeouts and production behavior are unchanged.

The third CI run passed integration, access administration and Review moderation.
The onboarding UI completed; its teardown stalled inside fixture cleanup and left
Pages that collided on retry. The child now imports and initializes the canonical
Payload config before importing fixture helpers (which also import app hooks),
with separate config-import/database-init stages. Ten real seed/cleanup cycles
passed locally (20 isolated processes). Native repeat and current-head Quality
are required before merge; this is a test boot-order correction, not an application
policy or timeout change.

Canonical-boot native recheck: all three journeys pass twice without retries
(6 passes, 1.6m), after the ten successful seed/cleanup cycles. Required final
regression and current-head GitHub Quality still govern merge.


### Fixture resolver correction during first-draft verification

PR #36's first CI run passed the new Page journey but reproduced config-import
stalls in Review setup. A local repeat also stalled before the Page UI. The bounded
process alone was therefore insufficient. `lexicalFixtureLoader.mjs` adapts
[Payload's upstream CLI resolver](https://github.com/payloadcms/payload/pull/18398)
for the installed Lexical 0.50 dependency: select its equivalent static build
before importing Payload configuration. It preserves explicit environment
conditions and all unrelated package resolution, including React's server
condition. The application and dependency versions are unchanged. Retain the
90-second process deadline and exact-ID cleanup. The dynamic-form account seed now
uses this process too, rather than initializing Payload inside Playwright.

This is confined to the standalone test worker. Upgrading Payload alone does not
remove the need: the upstream fix applies to its CLI, whereas this worker imports
configuration directly. Reassess removal when its Lexical Node exports no longer
use the asynchronous wrappers, or when fixtures run through the fixed CLI. Verify
both governance and forms without retries before removing it. The cancelled run
and subsequent verification remain recorded in the implementation checklist.
