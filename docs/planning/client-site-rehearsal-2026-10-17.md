# Three-page client-site rehearsal — 17 October 2026

Baseline: merged `develop` at `f8ce4922`. The fictional Harbor Learning site was
created through native UI in a fresh, loopback-only Docker Mongo test database on
port 3002. No real environment file, main application data, client account or
production system was used. PRs #43–#45 were not included. This is an agent task
rehearsal, not an unaided novice study; tool waits and development compilation
make elapsed time unsuitable as a usability measurement.

## Observed journey

| Task | Observed result |
| --- | --- |
| Empty-site onboarding | Created the first Admin in native bootstrap UI and signed in; no account/fixture seeding or direct database edits. |
| Team configuration | Published fictional Site Identity, a Landing-recipe Home Page and its Layout Defaults homepage selection. |
| Client handoff | Admin created a Site Manager with Pages only and Harbor Learning assigned. Separate browser login showed Pages and assigned work, with no Admin cookies. |
| Page creation | Single section inferred correctly. Client created Information and Contact with Landing recipes; added/authored/saved a Rich Text block and opened authenticated saved preview. |
| Public/draft separation | Anonymous Information URL showed 404 before explicit publication and rendered the authored content afterwards. |
| Reusable Form | Admin published Workshop enquiries with required custom name `workshop_question` and label Your workshop question. Client selected it in Generic Form and published Contact. Anonymous synthetic submission received the expected confirmation. Email was disabled; delivery was not tested. |
| Supporting access | Direct client navigation to the shared Form editor displayed Nothing found; selecting a Form did not grant editing authority. |
| Navigation | Admin published existing Header Navbar with Home, Information and Contact Page-target items and assigned it in Layout Defaults. Public navigation rendered and Information/Contact links resolved. |
| Revision blocker | Native Save Draft returned 400 after the published Information Page was referenced by navigation. Reproduced three times; server message incorrectly described draft-saving as unpublishing. Live content stayed intact. |
| Focused fix retry | Operation-scoped draft intent enabled the native retry (200), leaving a saved draft and unchanged live content/navigation. Final automated regression results are recorded below. |

## Retained screenshots

Only fictional local UI is included; cookies, network dumps, credentials and
browser state are excluded.

- [Three-page public navigation](evidence/client-site-rehearsal-2026-10-17/home-navigation.png)
- [Public enquiry confirmation](evidence/client-site-rehearsal-2026-10-17/form-confirmation.png)
- [Shared Form edit denial](evidence/client-site-rehearsal-2026-10-17/shared-form-denied.png)
- [Linked draft saved, still awaiting publication](evidence/client-site-rehearsal-2026-10-17/linked-draft-saved.png)
- [Users-list placeholder columns](evidence/client-site-rehearsal-2026-10-17/users-list-columns.png)

## Findings and priority

**High: linked published Pages could not save draft revisions.** Edit the
Information Page after publishing its Header link, then click Save Draft. The
response was `This page cannot be unpublished because it is still used by Links
-> Information. Remove these references first.` Removing navigation is not an
acceptable prerequisite for preparing a private revision. The bounded fix and
regression contracts are documented in [linked Page draft saving](../operations/linked-page-draft-saving.md).

**Low: initial Users columns expose presentation widgets.** Fresh Users lists
show Team Setup Guide, Two Factor Settings and First Admin Notice with empty
`<No …>` placeholders. Account creation works, but these do not help the Admin
review roles/access. Reproduced on return to Users. Defer sensible account-column
polish to a separate feature; no source fix is claimed in this branch.

Header setup requires editing nested rows and then publishing the Header and its
Layout Defaults assignment. The existing guide explains both. Observe this task
with a new user before adding another workflow or replacing the native editor.
Browser reference/URL-wait failures were distinguished from product defects.
A recording attempt failed because the CLI could not finalize video; no valid
reproduction video is claimed. Screenshots and the public HTTP result provide
the retained evidence; private request diagnostics are excluded.

## Verification and remaining evidence

The two new real-database role cases fail against baseline and pass with the fix;
22 focused database/history/intent checks pass. Full integration passes 2,931 tests
with one existing opt-in skip (91.46s). All eight governance journeys pass without
retries (2.8m), including the extended native draft-save/history recovery flow.
Production build passes with 73 traces/private uploads excluded; TypeScript, lint
(one existing warning), approved production audit, deterministic generators and
project-context checks pass, with no generated artifact drift. Architecture/block
presentation contracts remain current; Payload model/inventory record this fix.
Native manual retry returns 200 and shows the saved revision. Both existing form
journeys pass without retries (3.1m). Exact-head CI remains required before merge.

The five first-client outcome boxes remain open. Still required: actual client
observation, real configured sender/credential recovery, scoped Media after its
pending PR is merged, cross-section task rehearsal, mobile navigation review,
site-specific production storage/configuration and backup/restore proof. Manual
history recovery was paused at the draft-save blocker; the automated native
History journey verifies the fixed sequence. No production launch approval.
