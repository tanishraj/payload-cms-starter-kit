# First-client release

**Active scope, approved by the user on 17 October 2026.**

Deliver one working client website. Your team configures it as Admin; client
editors normally work as Site Managers in assigned sections. Retain Payload's
native Page/block editing and Live Preview. There are only two roles.

The [full feature catalogue](feature-implementation-checklist.md) is a reference
backlog, not 242 things to build. [Source assessment](composition-publishing-baseline-2026-10-17.md)
and [catalogue routing](client-website-delivery-roadmap.md) explain existing reuse.
This short checklist determines current work. Its boxes mean demonstrated outcome,
not source presence, passing docs tests or a completed planning decision.

## Five release goals

- [ ] **Team setup works.** The team configures branding, homepage/navigation,
  section roots and client access using the supported admin. It can create another
  Admin or Site Manager. Clients do not configure secrets/providers or require
  direct database edits.
- [ ] **Page building works.** A client editor creates a Page in the assigned
  section, adds/edits existing blocks, selects or uploads permitted media, and uses
  an existing reusable Form when needed. Other sections and shared originals stay
  protected. Existing blocks are sufficient unless the brief proves otherwise.
- [ ] **Publishing and recovery work.** Save a draft, preview it, explicitly publish,
  inspect the real public URL, revise it and recover safely. Distinguish unsaved,
  saved and live states. Restoring history must not silently publish a Page.
- [ ] **Client handoff works.** The editor establishes credentials, signs in,
  resumes assigned work, recovers access through the supported deployment path,
  and finds help. Guidance is optional/reopenable. Prove the selected path with
  the actual email configuration; do not assume an invitation service exists.
- [ ] **Launch essentials work.** Public pages/navigation/media, scoped/private
  access and applicable forms/email are verified. The operator owns production
  configuration, durable storage and a demonstrated backup/restore procedure.
  A passing local build is not production launch approval.

## Current evidence and gaps

| Goal | Existing foundation | Evidence still needed / blocker |
| --- | --- | --- |
| Team setup | Native Users, two roles, grant/section validation, site/team/homepage guides and automated Admin/Manager journeys | Full client-site setup rehearsal and actual client task observation |
| Page building | 61 Page blocks, Blank/Landing recipes, assigned-section Page creation, accepted forms and native editing | Media mutation remains site-wide; close the ownership/selection gap before claiming section-limited client upload. Investigate the blank-Page browser case that needed retries in CI. |
| Publishing/recovery | Native save/preview/publish and public routes; Page restore-as-draft merged in the [Page History feature](https://github.com/tanishraj/payload-cms-starter-kit/pull/41) | Observe an unfamiliar editor completing the flow, verify the chosen site's public navigation and recoverable failure states |
| Handoff | Team guide and native account/security foundation | Decide and demonstrate credential activation/recovery, including the supported email-disabled operator path; no invitation feature is assumed |
| Launch | Existing provider validation, setup checks, deployment/backup/security runbooks and CI | Site-specific production rehearsal and restore proof; no production system was accessed in this scope change |

The merged Page-history commit was tested by exact-head CI: 2,923 integration
passes/one existing skip; the new History case and six other governance cases
passed first attempt, the existing blank-Page case passed after one retry, both
form journeys passed first attempt, and the production artifact excluded private
uploads. That is useful engineering evidence, not a client usability study.

## Local rehearsal — 17 October 2026

All eight existing Admin/Manager/Page/governance browser journeys pass without
retries (2.0m) against application source identical to merged develop `53fea53e`,
on the isolated local test database and port 3001. This includes the blank-Page
flow, saved preview, native History restoration, explicit publication, site
setup, homepage guidance and permission changes. All 46 focused documentation,
catalogue, onboarding and project-context checks pass.

This rehearsal did not create a client-specific three-page site, validate scoped
Media upload, demonstrate client credential delivery or observe a new human user.
The five outcome boxes therefore remain open. The CI-only blank-Page failure has
not been diagnosed or fixed merely because this local repeat passed.

## Work next

1. **Demonstrate the complete existing journey.** Use a representative three-page
   site (Home, Information, Contact) in disposable local/staging data. Reuse current
   blocks/forms and account flows. Record missing capability separately from
   confusing copy, a test timing problem or an operational setup error.
2. **Fix the first demonstrated blocker.** Known candidates are scoped Media,
   account activation/recovery and the intermittent blank-Page browser journey.
   Diagnose before choosing a fix; do not merely increase waits or add more guides.
3. **Repeat the affected task and hand off to a real client editor.** Record
   completion, assistance, errors and elapsed time. An agent rehearsal does not
   replace observation of a new user. Actual client identity/content/access details
   will be requested when needed; do not invent them or use production records.
4. **Launch only with the applicable checks evidenced.** Stop expanding the release
   once these five outcomes work. A new task must name its affected outcome and
   demonstrated blocker or explicit client need.

Keep one feature/fix per branch and PR, test locally, merge passing work into
`develop`, and delete only confirmed-merged branches. Do not delete `develop`.
Independent work may use isolated worktrees; dependencies must be merged in order.

## Outside this release unless a client demonstrates a need

Advanced forms/outbox/webhooks/test mode; additional blocks or generic template
libraries; configurable breakpoints; advanced workflow/scheduling/localization;
new providers, tenant switching, a separate visual editor or a replacement admin.
Existing optional content modules may be enabled for a real need after verification;
none is deleted. Existing security/privacy constraints remain required throughout.
