# Client website delivery roadmap

Updated: 17 October 2026 (Asia/Dubai). **Reference analysis. The approved [first-client release](first-client-release.md)
is now the active work selector.** Analysis is based on the
[composition baseline](composition-publishing-baseline-2026-10-17.md), current source,
[implementation checklist](feature-implementation-checklist.md) and existing
[Wayfinder map](../../.scratch/website-builder-catalogue/map.md).

## Destination and confirmed handoff

Deliver a working client website whose editors can maintain pages without learning
the repository or Payload internals. Your team sets up each deployment as Admin;
client editors normally use Site Manager accounts for assigned sections. This
handoff default was confirmed by the user on 17 October. An authorized owner may
still be made Admin; there are no extra roles or assumed tenant switcher.

The catalogue remains in scope for long-term planning. It is not the first-client
release checklist. The existing checklist owns acceptance; Wayfinder owns unresolved
policy decisions; this document preserves the broader client-focused delivery analysis. The short
first-client checklist takes precedence for current implementation.
No application behavior or feature completion changes through this plan.

## The journey to optimize

| Person | Short working path | What stays out of that person's way |
| --- | --- | --- |
| Developer/operator | Clone → existing quickstart → local Docker Mongo → setup check → first Admin → actual draft preview | Client editors never configure secrets, storage providers, CI or Storybook. Existing local env files are preserved. |
| Team Admin | Set identity/appearance → create section roots → choose homepage/header/footer → create client accounts and grants → verify client access | Production configuration is separate from first draft creation. No compulsory long wizard or automatic publication. |
| Client editor | Sign in → continue assigned work or create a Page → choose starting point → add/edit blocks and media → save → preview → publish | Show permitted work; settings/user administration remain outside the normal job. Admin retains full access. |
| Returning client | Resume accessible work → see saved versus public state → make a change → preview/publish | Do not replay first-run teaching. Existing help can be hidden and reopened. |
| Team before launch | Inspect actual public URLs, navigation, media, access and recovery → launch → hand over a short client guide | A dismissed guide or passing local build is not proof of production launch readiness. |

Keep Pages as URLs, Blocks as page sections, and Forms/Reusable Sections as separate
records selected when needed. Use the existing relationship drawers. Do not expose
new implementation vocabulary to clients. One primary next action per guide is
preferable to another checklist panel on every screen.

## What to reuse now

- Native page editing, Page hierarchy, drafts, Live Preview and explicit publishing.
- Existing purpose-grouped block catalogue and accurate thumbnail/story fixtures.
- Blank/Landing recipes and assigned-section selection; Landing currently adds a
  Page Header and Breadcrumb only. Keep that promise accurate.
- Existing dashboard, site/team/Page/homepage guidance and personal hide/reopen.
- Existing section access for Pages, Forms, Reusable Sections and submissions.
- Accepted dynamic forms and protected submission links. Advanced forms remain deferred.
- Existing themes, metadata, search, redirects, media safeguards and setup diagnostics.

Source presence is reusable foundation, not complete acceptance. Improve these
flows in place; avoid a second admin app, permission engine or onboarding database.

## Proposed implementation order

| Order | Small increment | Why / acceptance gate | Checklist coverage |
| --- | --- | --- | --- |
| 1 | Media ownership and safe selection | Managers upload/use media in their sections; approved shared media is selectable without permission to replace/delete it. Do not leak other sections through pickers, usage labels, counts or deep links. Preserve existing public asset delivery and in-use protection. Decide legacy/shared ownership before migration. | ACCESS-05/06/07/09; MEDIA-01–05/09; ADMINUX-13 |
| 2 | Supported client account handoff | Reuse native Users and team guidance. Establish account activation/password setup, first login, recovery and Admin contact; verify the supported path when outgoing email is disabled. Do not promise invitations before a resend/expiry/revocation policy exists. | ONBOARD-12–15; SEC; ACCESS-08 |
| 3 | Complete one first-page task | Observe a new editor using existing recipe/block/media flows. Fix the specific confusing choices or copy found. Curated suggestions may help, but do not hide authorized native choices or create a second catalogue. Add recipes only for recurring client page needs and only as deliberate drafts. | PAGE-02–04/08/09; BLOCK; ONBOARD-06/07/17/19; ADMINUX-03/04/08/16 |
| 4 | Make saved, preview and live outcomes obvious | Verify actual saved/live state, preview failures, explicit publishing/public link, homepage/menu reachability and recovery. Reuse native controls and existing guides; avoid another approval role. Reuse the merged Page History draft-restoration increment. | PUBLISH-01–05/08/09/11/12; PREVIEW; GLOBAL-02/07–09; ADMINUX-07/09–12 |
| 5 | Launch and client handoff rehearsal | One discoverable checklist distinguishes authoring from launch. Verify chosen domain/storage, applicable email/forms, public pages/navigation, access, backup/restore and operator ownership. Reuse existing scripts/runbooks; report manual checks honestly. | ONBOARD-01–03/18/19; RUN; OPS; SEC; QUALITY; PERF; VERIFY |
| 6 | Client-specific content modules | Assess existing News & Events, Articles, galleries, offices and listings only when needed by that client. Enable existing grants and verify the module; implement a proven gap rather than the entire catalogue. | CONTENT; SITE; SEARCH; relevant GLOBAL/SEO |

The five-goal first-client release has now been accepted. This earlier increment
order remains supporting analysis, not authority to build all six automatically
or postpone demonstrating the existing complete journey. Media is the next concrete
implementation candidate because it closes an access gap in the ordinary Page task.
Account handoff and usability evidence should follow before more catalogue expansion.

## Keep the client surface small

Use existing feature grants to expose only needed destinations. A proposed minimal
Page editor setup is Pages plus its read dependencies, and Media only when the
scoped Media policy is implemented or site-wide authority is deliberately intended.
Grant Forms only for question authoring and Form Submissions separately for inbox
access. Add News/Articles/etc. only for the client's actual publishing duties.
Do not treat this proposal as an implemented permission preset.

The present Media grant is site-wide. Do not grant it while telling a client it is
section-limited. Public images/documents remain public after publication; private
form uploads remain separately protected. Do not try to make public assets private
as a side effect of editor ownership.

Admin setup can use existing Site Identity, Appearance, Layout Defaults, Headers,
Footers and Users. Client editors should normally start from their accessible draft
or section, with no operational settings required to create a Page. Navigation
visibility complements server access and never replaces it.

Advanced controls stay available where authorized, but the ordinary task should
not require selecting providers, configuring responsive breakpoints or understanding
global inheritance. No new mandatory wizard, role, theme system, custom visual
editor, general preset engine or additional tour service is proposed.

## Routing the complete remaining list

These are release lanes, not replacement feature definitions. Every existing
feature group remains in the checklist under its stable ID. “Verify” means assess
current behavior first; an unchecked box does not authorize rebuilding it.

| Existing groups | Proposed first-client lane | Later / conditional work |
| --- | --- | --- |
| CORE-01–08 | Preserve confirmed product/native-editor boundaries | New product/platform scope requires a new decision |
| PAGE-01–10 | Verify create/edit/find/blocks/hierarchy/relationships and clear fields | Optional productivity after observed need |
| BLOCK-01–10 | Verify the blocks used by the pilot, catalogue integrity and preview parity | Add blocks/layout powers for recurring client needs |
| DESIGN-01–12 | Reuse supported props/themes, responsive defaults and semantic styling | Site-configurable breakpoints and advanced design controls |
| ACTION-01–05 | Verify existing Page/custom/media links and downloads | Extend destinations only for a concrete need |
| CONTENT-01–10 | Verify only enabled client collections/listings/detail routes | Additional modules are client-dependent |
| GLOBAL-01–09 | Verify identity, shell selection, reuse and concrete shared-change effects | Broader shared-history guarantees need separate decisions |
| FORM-01–09 | Retain accepted supported dynamic forms and revision handling | Advanced controls/test mode per renewed prioritization |
| SUBMIT-01–12 | Retain accepted intake/inbox/private links and selected email workflow | Outbox/retries/webhooks/advanced mappings remain deferred |
| ACCESS-01–09 | Gate handoff on actual assigned work, safe media and denials | Broader collection ownership assessed when that module is enabled |
| PUBLISH-01–13 | Verify ordinary save/preview/publish/recovery and truthful live result | Scheduling, advanced conflicts/coordinated-release guarantees as needed |
| PREVIEW-01–06 | Verify accessible draft preview and clear failure/retry | Extended preview tooling after the basic task works |
| MEDIA-01–09 | Close section ownership/selection gap; retain file/alt/usage safeguards | Additional asset workflows/derivatives beyond existing support |
| SEO-01–07 | Verify basic metadata, public URLs, redirects and indexability | Advanced schema/custom optimization by client requirement |
| SEARCH-01–05 | Verify existing search/sitemap when used | Advanced search is conditional |
| SITE-01–10 | Configure applicable legal/consent/site experiences | Optional integrations are not authoring prerequisites |
| OPS-01–07 | Verify relevant trash, recovery, retention and operator ownership | Broader portability and batch operations after real need |
| SEC-01–09 | Existing auth/access/private-file/audit gates apply to every increment | Broader security features require separate evidence, not guessed completion |
| QUALITY-01–06 | Keyboard/error/reflow and public quality for the actual journey | Full localization and broader catalogue audit remain separately planned |
| PERF-01–08 | Verify public delivery/cache/failure behavior for chosen pages | Optimize measured bottlenecks; do not introduce infrastructure preemptively |
| DEV-01–10 | Keep source/typed registration/Storybook and project context current | New generators/helpers only when existing patterns become costly |
| VERIFY-01–11 | Required local checks, exact-head CI, compatibility and review per feature | Broader staging/disaster evidence remains an explicit gate where applicable |
| RUN-01–11 | Separate working local setup from production launch/restore ownership | Optional providers are enabled only for selected workflows |
| ONBOARD-01–20 | Reuse shipped guides; prove activation, first Page and handoff | Optional examples and richer learning after observation |
| ADMINUX-01–16 | Apply task clarity, honest states and recovery within the relevant feature | No standalone admin redesign without a demonstrated task problem |

Coverage: 242 feature groups across 25 domains. DF-01–10 are ten separate proof
steps, retained under the accepted/deferred forms direction, not ten extra features.
At the inspected develop commit nine feature boxes and three proof boxes are checked.
The remaining 233 feature boxes are a mixture of reusable, partial and unassessed
capabilities. They are not a release estimate or 233 new implementation tasks.

## First-client evidence and stopping rule

Use a representative site brief and disposable local/staging data with consent.
Do not copy SNMIH, seed live examples or infer client permission from a guide state.
Before calling handoff ready, demonstrate:

1. A team Admin configures identity, a section and a real client account without
   assistance from application code or direct database edits.
2. A client editor creates a Page in the right section, adds heading/content/media,
   saves, previews and explicitly publishes it, then finds its real public URL.
3. The editor revises it and recovers from a save/preview failure without losing
   recoverable work; an unrelated section remains inaccessible through direct URLs.
4. The Admin places the published Page in the intended homepage/navigation setup;
   a visitor can reach it. No automatic publication or menu insertion is assumed.
5. The editor can sign in again, recover account access through the supported path,
   resume work and find help without repeating setup.

Record task completion, elapsed time, errors, assistance and confidence with actual
new users; proposed time budgets are not industry standards or existing evidence.
Automated role, mutation and browser checks remain necessary, but they are not a
substitute for this observation. Fix the largest demonstrated blocker, retest that
task, then stop adding general capabilities to the first-client release.

## Open decisions and next Wayfinder step

The [first-client handoff release boundary](../../.scratch/website-builder-catalogue/issues/20-first-client-handoff-boundary.md) is approved. Remaining policy questions:

- [Define client account activation and recovery](../../.scratch/website-builder-catalogue/issues/21-client-account-handoff.md): choose the supported email-enabled/disabled handoff before building invitations.
- [Define section ownership and resource permissions](../../.scratch/website-builder-catalogue/issues/04-section-resource-policy.md): settle Media legacy/shared ownership and safe replacement/reference visibility before changing data/access.
- [Define onboarding and everyday admin acceptance](../../.scratch/website-builder-catalogue/issues/18-onboarding-acceptance.md): retains broader catalogue UX acceptance; do not make advanced forms/global history prerequisites for deciding a bounded first-client release.

The handoff audience and bounded five-goal first-client release are confirmed.
Detailed Media and account policy decisions remain open; the catalogue analysis
itself does not settle them. The source-baseline task and explicit user release approval are recorded separately;
no guided grilling interview or answer to remaining policy questions is claimed.
