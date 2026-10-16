# Admin onboarding and everyday UX plan

Updated: 16 October 2026 (Asia/Dubai). Status: broad acceptance plan; bounded dashboard increment under verification.

## Current checkpoint

Core forms are accepted by the user; advanced forms work is deferred. Section
access merged in PR #33. The next selected increment is optional, account-owned
dashboard guidance with current scope/draft facts and no-assignment recovery.
See [getting started contract](../operations/admin-getting-started.md). Historical
forms-first sequencing below is superseded. No broad onboarding box or usability
study target is complete merely because the guide exists.

## Outcome and boundaries

A developer can boot the starter and diagnose a missing prerequisite without
reading the entire codebase. An Admin or Site Manager can create a useful draft,
add a block, save and inspect its preview without knowing Payload internals.
Publishing remains an explicit action with a clear public result.

Use the existing Payload admin, page recipes, native document editing and Live
Preview. Extend the current dashboard and task flows rather than adding another
admin application. Two roles remain: Admin and Site Manager. Developers are a
setup audience, not a third application role. Admins retain full access; Site
Managers may create, save and publish pages within assigned access. No mandatory
Admin approval is added for their ordinary page publication.

The [implementation checklist](feature-implementation-checklist.md) owns status,
owners, evidence and dependencies. Its ONBOARD and ADMINUX groups are new additions
to the historical scope, not evidence that these experiences already exist.
Where they overlap PAGE, ACCESS, FORM, PUBLISH, DEV or VERIFY, implement one shared
solution and record acceptance against both IDs. Dynamic forms remains first.

## Baseline inspected

| Existing source | Reuse and remaining acceptance |
| --- | --- |
| [DashboardView](../../src/components/admin/DashboardView.tsx) and [DashboardOverview](../../src/components/admin/DashboardOverview.tsx) | Already provide access-filtered actions, recent work and attention counts. A no-grant Manager message exists. Assess first-run guidance, scoped next actions, recovery and empty/error distinctions. |
| [PageCreateView](../../src/components/admin/PageCreateView.tsx) and [PageRecipeSetup](../../src/components/admin/PageRecipeSetup.tsx) | Full-page creation offers a title and recipe, creates a draft and opens native editing. Preserve blank-page choice, normal editing and drawer behavior. Extend in-context guidance, previews and appropriate scope defaults. |
| [FirstAdminNotice](../../src/components/admin/FirstAdminNotice.tsx) | Currently explains only that the first account is the administrator; comprehensive onboarding is unverified. |
| [First Boot](../../README.md#first-boot) and [clone checklist](../operations/starter-clone-checklist.md) | Developer instructions and operator checks exist. Improve discoverability and diagnostics before adding competing setup machinery. |
| [Users guide](../guides/users.md) | Two roles and feature grants exist. Page-root/record scope is a retained enhancement; invitations and account activation must be assessed before being promised. |

These are source findings, not usability-study or end-to-end completion claims.

## Recommended journeys

### Developer: clone to working admin

1. Open one quickstart with the supported Node/package-manager versions, an
   environment-variable table and local transaction-capable MongoDB instructions.
   Copy the template only if a local environment file is absent.
2. Run the documented install/start path. A non-mutating preflight reports which
   prerequisite failed, its impact and one concrete fix. Never display secret
   values or raw credential-bearing connection strings.
3. Create the first Admin through the supported bootstrap flow and open the
   dashboard. Inspect a first draft and verify preview with the current runtime.
4. Keep production setup in a separate readiness checklist. Local draft authoring
   does not require email delivery, analytics or a production domain. Existing
   production fail-fast/provider constraints continue to apply.

Do not invent a new setup CLI until the existing commands and docs are assessed.
Optional examples require explicit selection, create drafts, avoid overwriting
existing content and have a documented cleanup path.

### First Admin: dashboard to first useful draft

1. Show a short, skippable “Get started” area with the next relevant action.
   Site identity/theme settings use safe existing defaults; production-only work
   stays available under “Prepare for launch.” Editing can start immediately once
   the actual authoring prerequisites are healthy.
2. Choose “Create a page,” enter its title and select a blank page or a recipe
   with a plain explanation of its sections. Use the existing recipe flow.
3. Open native editing. Guide the actual task: edit a heading, add a block, save
   a draft and inspect Live Preview. Explain Draft versus Published beside the
   relevant controls, not in a disconnected tour.
4. Offer “Continue editing,” “Create another page” and, where appropriate,
   “Publish.” Publishing is never automatic because onboarding is complete.

The Admin can then set homepage/navigation, configure branding, create another
Admin or Site Manager, and grant access. These are contextual next tasks, not a
long prerequisite form before making a page. Present full Admin access accurately;
organizing navigation must not remove that access.

### Site Manager: sign in to assigned work

1. Show the account's allowed features and, once implemented, assigned sections.
   Explain what can be created, edited and published there. Hide irrelevant
   operational setup and unavailable actions.
2. Offer “Continue editing” or “Create a page” within the assigned location.
   Infer a permitted parent only when unambiguous; otherwise require a clear
   selection. Validate the choice on the server.
3. Follow the same native draft → preview → explicit publish journey. Shared
   read-only content explains how it is used without implying edit permission.
4. With no assignments, explain that the account is active, provide a configured
   way to contact the Admin and a retry/refresh action. No dead create links,
   leaked records or automatic access escalation.

If invitations are added, use expiring, single-use activation and a deliberate
resend path. Keep a safe alternative for deployments without outgoing email.
Onboarding state must never grant permission, and grant revocation applies to
cached/dashboard/deep-link operations as well as navigation.

### Returning user: resume useful work

Show recent accessible drafts, actual saved/published states and relevant work
that needs attention. Do not replay first-run guidance on every login. “Help &
getting started” remains reachable; dismissed guidance can be reopened. Resume
links recheck access and handle deleted or moved records gracefully.

## Two readiness levels

| Level | Required checks | Behavior |
| --- | --- | --- |
| Ready to build | Supported runtime, database, application secret, account/access, applicable writable media and authenticated preview | Explain each real failure and its effect. Allow independent work where possible; do not falsely mark a failed check healthy. |
| Ready to launch | Canonical URL/domain, durable production storage, public identity/navigation/homepage, applicable SEO/legal/consent, email-dependent flows, backup/restore and deployment checks | Show missing requirements and affected functions. Enforce existing hard constraints. Optional features may be marked not used with a recorded reason. |

Readiness comes from current server facts where measurable. A user's “done” or
“skip” preference is not proof of healthy infrastructure. Sensitive checks remain
Admin/operator-only and do not become public diagnostics. Production validation
does not silently rewrite configuration, publish content or seed a database.

## Everyday interaction rules

- Use consistent labels: Page is a URL with sections; Block is a section on that
  page; Collection owns reusable records; Shared content affects its references.
  Keep help short and link to examples at the point of use.
- Organize accessible navigation around tasks, preserve native collection routes,
  and distinguish settings from content. Keep advanced field groups collapsible
  and expose their configured state; do not hide required errors inside them.
- Make block choice recognizable through accurate preview, purpose and category.
  Search/filter if supported by the installed picker; keyboard selection and an
  explicit empty result are required. Native field/access behavior stays intact.
- Distinguish first-use emptiness, no search results, no access, archived/cleared
  content and loading/failure. Each state has a relevant next action. A failed
  query must not masquerade as “You have no pages.”
- Show saving, saved, unsaved, publishing and failed states accurately. Errors
  preserve entered values when possible, identify the field, and explain a fix.
  Network retries must not create duplicate pages or submissions.
- Preview indicates draft context and screen size. A missing preview names the
  cause and next step. Publish reports the actual outcome and offers the public
  URL when available; delivery/cache failures must not be reported as success.
- Warn about concrete effects of deleting, bulk changing or editing shared
  content. Reuse native validation and recoverable drafts/history. Routine saves
  do not need extra confirmation dialogs.
- Provide keyboard navigation, visible focus, associated labels and error
  messages, announced status, zoom/reflow and touch-usable controls. Essential
  help never relies on hover alone. Keep long forms usable on narrow screens.

### Dynamic form journey in the first implementation

Create form → name it → add a control → set label and name → configure required,
options and type-specific validation → inspect preview/test → attach it to a page
→ publish deliberately → open readable submissions.

Start with common controls and reveal advanced validation, conditions and layout
when requested. Suggest a valid field name while permitting edits; explain
duplicates and the distinction between stable field identity and mutable labels.
Use generic answer previews so a custom field is as readable as a contact field.
Changing a published schema explains its effect on new versus historical answers.
Test submissions must be unmistakably identified and excluded from normal inbox,
exports and notifications by default; test routes still enforce their own access,
validation, file restrictions and rate limits.

## Implementation order

1. During DF-01–10, apply ADMINUX-01/03/07–10/14–16 to the form journey. Ship the
   relevant empty states, field guidance, preview, generic inbox and recovery with
   the feature, rather than adding a large tour afterward.
2. Assess and improve developer quickstart/preflight and dashboard/PageRecipeSetup
   onboarding using existing integrations. Deliver the first useful draft path
   before client handoff. Do not require all 36 groups to land in one change.
3. Connect Manager onboarding and grant assignment to ACCESS implementation;
   page-root scope is not a current capability until server acceptance passes.
4. Add the broader launch checklist, advanced discovery/help and ongoing usability
   improvements through focused changes with evidence.

Custom UI follows repository source/Storybook requirements. Check installed
Payload APIs before selecting extension points; current online docs can describe
newer APIs. Preserve native authentication, access enforcement and field behavior.
No third-party tour service, analytics vendor or invitation provider is selected
by this plan. New environment settings need `.env.example` documentation.

## Acceptance and observation

Automation should verify real contracts: role/scope checks, readiness facts,
draft-only example creation, resumable state, idempotent retries and inaccessible
deep links. Browser checks cover actual create/save/preview/publish flows with
keyboard use and network failures. Documentation checks cannot certify these.

| Scenario | Required evidence before calling the flow complete |
| --- | --- |
| Clean clone | Follow only the quickstart on the supported runtime; boot admin, create a draft and preview. Record elapsed time, manual fixes and documentation gaps. |
| Empty and populated sites | Guidance chooses the appropriate task, skips/resumes, does not overwrite records and does not reappear on every login. |
| Admin | Create first draft from blank and recipe, add a block, save/preview; publish only through an explicit action and inspect the public result. |
| Manager | Allowed page actions work; no-grant and revoked-scope states are clear; direct URLs and APIs fail safely outside access. |
| Failure | Unavailable database/media/preview/email and network interruption yield honest states, preserve recoverable work and offer a valid next action. |
| Form | A custom label/name/control works end to end; field validation, marked test submission, live submission, schema change and historical answer reading are understandable. |
| Accessibility | Keyboard/focus/errors/status announcements, zoom, narrow viewport and long labels preserve task completion. |

Proposed usability gate for the first handoff: observe five representative novice
editors and two developers unfamiliar with the repository. Aim for at least four
of five editors to create/save/preview a first page without moderator assistance
within ten minutes, with no unintended publication; aim for both developers to
boot/preview using only the quickstart within thirty minutes after dependencies
are available. These are planning targets, not measured claims or an industry
benchmark. Record assistance, errors, abandonment and confidence as well as time;
adjust the targets after the pilot and fix serious blockers before handoff.

Start with consented observation and issue logs. Do not collect page text, form
answers, credentials or visitor data as onboarding telemetry. Any later product
measurement needs a separate minimal-data design and clear operational ownership.

## Recommendation basis

Contextual, dismissible and replayable guidance follows the research direction in
[NN/g: Onboarding Tutorials vs. Contextual Help](https://www.nngroup.com/articles/onboarding-tutorials/).
Keeping advanced configuration secondary follows
[NN/g: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/).
The concrete journeys, readiness levels and study targets here are project
recommendations inferred from that guidance and the inspected starter, not claims
that research prescribes these exact steps or timing.

Payload provides documented
[admin extension points](https://payloadcms.com/docs/custom-components/root-components).
Use those alongside the repository's existing dashboard/recipe integration, with
version verification before implementation. Preserve the native administration
chosen by the user.
