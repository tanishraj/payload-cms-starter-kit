# Forms completion plan

> Superseded sequencing, 16 October 2026: the user accepts the core forms
> implementation and protected email links. Move to section-scoped Site Manager
> access, then onboarding. Advanced notification/outbox/retry/webhook/test-mode
> work is deferred, not required before that move. Historical milestones below
> remain as evidence; unchecked broad catalogue acceptance stays open.
> PR #32 merged as `76e3dba2` after exact-head Quality run `38873878285` passed:
> 2,745 integration tests/one existing Docker skip, both governance and native
> form journeys passed. Generic Form passed on retry after its initial public-page
> navigation timed out before export; production private-artifact guard passed.


Direction confirmed by the user on 14 October 2026: finish the forms milestone before moving to other website-builder items. Broader scoped page access and onboarding follow forms. Necessary form/inbox/attachment permission prerequisites are part of secure forms acceptance.

This is the delivery sequence for the existing [implementation checklist](feature-implementation-checklist.md), not a second set of completion boxes. That checklist owns status and verification; the full catalogue is retained. Existing working behavior should be verified and reused before replacement. Each bounded increment is tested, committed and merged into develop before the next branch starts.

## Implemented foundation

Reusable Payload Forms selected by native page blocks; fifteen shared controls with custom labels/names; generic intake and readable original answers; draft isolation; changed-question recovery; durable accepted-attempt duplicate protection; canonical Storybook presentations. These increments have test and merge evidence, but do not complete every broad FORM/SUBMIT acceptance group.

## Remaining delivery sequence

| Order | Milestone | Existing acceptance IDs | Exit evidence |
| --- | --- | --- | --- |
| 1 — Merged | Owner-activity correction | SUBMIT-10, DF-05, ADMINUX-15 | Owner-only assignment/reassignment/removal stamps activity; unchanged owner does not; real authorized storage and denied mutation verified. |
| 2 | Field identity, configuration and authoring clarity | FORM-01/05/06, DF-02/06 | Stable field/choice identity, help/default/constraints, safe names, relabel/reorder/rename/remove compatibility and understandable editing warnings verified. |
| 3 — Merged initial catalogue | Complete initial control catalogue and extensibility | FORM-03/08, DF-07 | URL, number, multi-select, radio, checkbox group, switch, date and time added through explicit typed contracts, with shared validation, formatting, Storybook and native Payload evidence. Existing six controls retain compatibility. File transport follows milestone 4. |
| 4 | Private file controls and their permissions/lifecycle | SUBMIT-05, applicable FORM-03/05 | Private storage, type/size limits, authorized reads, scope/lifecycle cleanup and failed-submission behavior verified; public Media is not used as the private attachment boundary. |
| 5 — Merged supported contract | Layout entries, appearance and conditional rules | FORM-04/07, DF-08, SUBMIT-03/07 | Supported groups/headings/descriptions/separators/layout props, stable-ID declarative show/require rules and matching client/server behavior. Inactive answers excluded; accessible focus/error recovery verified. |
| 6 — In progress | Revision/history acceptance and exports | SUBMIT-01/02/04/11, DF-02/06 | Published/draft isolation and full change matrix; readable historical meaning and authorized revision-aware export/mappings survive rename/remove/type changes. |
| 7 | Operational inbox and notification reliability | SUBMIT-06/08/09/10, DF-05 | Remaining inbox permissions/workflow/follow-up, controlled reply-to/title/recipients, persistent delivery state and safe deduplicated retries; abuse controls assessed across intended deployment. |
| 8 | Safe testing and complete editor/visitor journeys | SUBMIT-12, DF-09, ADMINUX-14/15/16 | Authorized labelled test submissions stay out of ordinary inbox/export/notification paths; native create/edit/preview/publish/submit/manage/export/recovery journeys and accessibility verified. |
| 9 | Close forms acceptance and handoff | DF-10; applicable FORM/SUBMIT groups | Required tests/build/security gates pass, operator/developer documentation matches shipped behavior, accepted decisions and remaining explicit deferrals are recorded. |

Each milestone can contain several small PRs. A small fix is not completion of the whole milestone. Controls are sourced from verified upstream components, demonstrated in Storybook before Payload integration, and use the same production contract. No separate visual editor is introduced.

## Existing later scope

FORM-09 remains explicitly later: rating, range/date-range, repeaters and multi-step flows. Password/payment capture requires separate domain integrations. This follows the existing catalogue's deferral, not a new deletion of requirements. Delivery/attachment/provider choices need concrete design and acceptance before implementation; no generic claim of completion replaces them.

## Current checkpoint

Owner activity merged in [PR #23](https://github.com/tanishraj/payload-cms-starter-kit/pull/23) as `8495a4a7` after [Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38535686556) passed. All 55 local focused tests and 2,386 CI integration tests pass (one Docker-dependent skip), both native form journeys and production build pass. The Admin grant/revoke governance journey passed on retry after the existing conditional-field readiness timeout; broader usability/repeatability remains open.

Milestone 2’s bounded [question-configuration increment](form-field-configuration.md) is implemented on `feat/form-field-configuration`: help/defaults, current text limits, identity collision checks, shared public/intake projection and editing guidance. Local full regression has 2,411 passing tests and one Docker-dependent skip; both native journeys pass without retry, production/Storybook builds and required local gates pass. [PR #24](https://github.com/tanishraj/payload-cms-starter-kit/pull/24) merged as `1b347b89` after [current-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38541507234) passed on `bf9e7b21`. CI integration: 2,411 pass/one Docker-dependent skip; both native form journeys and production build pass. Governance has one first-attempt pass and one pass on retry after the existing Content-grants checkbox readiness timeout; repeatability remains an open VERIFY/ADMINUX follow-up. Full FORM-05 range/file constraints and complete history/export acceptance remain open.

Milestone 3 starts on fresh `feat/form-url-number-controls`, created from merged develop `1b347b89` before implementation. URL and Number are its first bounded control increment, followed by the remaining initial catalogue and private-file milestone. Forms remain first. The full inbox/section-scope/export capability is not declared complete by these bounded increments.

URL/Number is implemented on `feat/form-url-number-controls` with eight total controls. Local full regression: 2,476 pass/one Docker-dependent skip; both native journeys pass without retry, including invalid/unknown publication rejection and changed-increment recovery. Production/Storybook builds and local release gates pass. [PR #25](https://github.com/tanishraj/payload-cms-starter-kit/pull/25) merged as `0414bb15` after [current-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38550735278) passed on `5bed362b`. CI integration: 2,476 pass/one Docker-dependent skip; native form journeys and fresh production build pass. Both governance journeys and both native form journeys pass on the first attempt; generated-output cleanup and fresh production compiler pass. Earlier CI failure is retained in the work log as a diagnosed generated-dev-artifact incident. Continue on fresh `feat/form-choice-controls`, created from merged develop `0414bb15` before implementation; full FORM-03/DF-07 acceptance remains open.

PR #25’s initial CI production build exposed malformed generated dev route types. The feature’s final local release check now includes CI-only generated-output cleanup after browser teardown: a tainted declaration reproduces TS1128, while exact cleanup followed by full regression and fresh production build passes. The production source/type gate remains unchanged; current-head GitHub Quality passed before merge.

Choice controls are implemented on `feat/form-choice-controls` with eleven total controls. See [choice contract](form-choice-controls.md). Radio/checkbox-group/multi-select share validation, original-label capture and partial changed-choice recovery. Local release verification passes before commit/push: 2,509 integration tests/one Docker-dependent skip, both native journeys without retries, production/Storybook builds and required context/type/lint/audit gates. [PR #26](https://github.com/tanishraj/payload-cms-starter-kit/pull/26) merged as `d00ca7e7` after [current-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38558813736) passed on `460017ea`. CI: 2,509 integration tests/one Docker-dependent skip; both governance and both native form journeys pass on the first attempt; fresh production build passes. Switch, date and time follow on fresh `feat/form-switch-date-time-controls`, created from verified merged develop `d00ca7e7` before new implementation; private attachments remain the following milestone.

Switch/Date/Time is implemented on `feat/form-switch-date-time-controls` with fourteen controls. See [contract](form-switch-date-time-controls.md). Native authoring maps to the reviewed production presentation; calendar days/local times retain exact meaning without timezone conversion. Local release verification passes: 2,583 integration tests/one Docker-dependent skip, both native journeys without retries, production/Storybook builds and required local gates. [PR #27](https://github.com/tanishraj/payload-cms-starter-kit/pull/27) merged as `5b6d81a9` after [current-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38565943611) passed on `247c468b`. CI: 2,583 integration tests/one Docker-dependent skip; both native form journeys pass on the first attempt; fresh production build passes. Governance has one first-attempt pass and one pass on retry after the previously recorded Content-grants checkbox readiness timeout; broader VERIFY/AdminUX repeatability remains open. Private attachments are next, including their permissions and lifecycle; the larger initial catalogue and full forms milestone remain open.

The verified merged Switch/Date/Time branch is deleted locally/remotely. Private attachments start on fresh `feat/form-private-attachments`, created from merged develop `5b6d81a9` before new implementation. Complete the private storage/access/lifecycle boundary before declaring file controls working; broad forms acceptance remains open.

Private attachments are implemented on `feat/form-private-attachments` as the next bounded milestone. Fifteen question controls now include server-verified private File transport, authorized binary downloads, original attachment history/email submission links, durable upload retry and transaction-protected cleanup. See [contract](form-private-attachments.md). Source/Storybook-first review and focused tests are complete; full release/merge evidence is recorded in the main checklist. Deployed private-bucket policy, production scheduling/email and broader section-scoped access remain separate acceptance.

The private-file increment passes local release checks before commit/push: 2,630 integration tests/one Docker-dependent skip, both final native upload journeys without retries, production/Storybook builds, 47 focused upload tests and all 15 context tests, generators/type/lint/audit. The new private collection updates the deterministic inventory's explicit count from 22 to 23; original digest checking remains intact. Current-head GitHub Quality and merge are the next gate. Hosted private-bucket policy and full section scopes remain outside this bounded proof.

Final private-upload release adds mandatory production artifact exclusion/inspection after a synthetic file reproduced Next.js standalone inclusion. The fixed fresh build reports no private uploads across 79 traces. Final local source: 2,637 integration tests/one Docker-dependent skip, both native journeys without retries, production/Storybook builds and required gates. New-response recovery explicitly clears old file rows while retaining other answers. An occupied disposable Mongo test port required a clean repeat; no fixtures/checks were skipped. PR #28 must pass Quality on its final updated head before merge.

[PR #28](https://github.com/tanishraj/payload-cms-starter-kit/pull/28) merged as `083082d6` after [final-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38587383727) passed on `1b4ba8a8`. CI: 2,637 integration tests/one Docker-dependent skip, both native form journeys and gated production build/private-artifact inspection pass. Governance passed first attempt. Contact6 passed first attempt; Generic Form passed on retry after the initial public-page navigation exceeded 20 seconds before upload interaction. Broader VERIFY/AdminUX repeatability remains open; no assertion or warning was suppressed. FORM-03's initial fifteen-control catalogue plus submit is verified; broad SUBMIT-05 section/provider acceptance and the remaining forms milestones stay open. The verified feature branch is deleted. Continue on fresh `feat/form-layout-entries`, created from merged develop before new implementation; layout/display entries and then conditions are next.


## Ordered layout increment

On `feat/form-layout-entries`: sourced Storybook presentation is reviewed, and
native ordered headings/descriptions/separators/groups are implemented with one
shared question schema and unchanged legacy paths/identities. Display rows stay
outside answers; optional published layout participates in revision/history.
See [contract](form-layout-entries.md). Focused contracts and actual MongoDB
publication/draft/grouped-upload checks pass. Both expanded native journeys pass without retries. Complete local regression: 2,664 integration tests/one Docker-dependent skip, production/Storybook builds and context/type/lint/audit gates pass; CI/merge evidence is pending. FORM-04/DF-07 remain open
for supported appearance and complete acceptance. Conditions follow separately.


Native form API ownership correction is under final verification. The shared
Payload REST router owns submit/upload/private-download URLs and preserves
unread bounded streams, publication/revision/retry and access/transaction checks.
Direct real-MongoDB routing tests exercise rejection, accepted receipt replay,
private downloads and trash retention. Failed Quality on `f9930e9` remains part
of the record; the final exact-head gate must pass before merge.


2026-10-15: Canonical native REST correction passes final local release gates:
2,665 integration tests/one Docker-dependent skip, both governance journeys
(52.3s) followed by both native form journeys (2.9m), all without retries or
diagnostic preloading. Fixture imports load Payload before its dependent config;
all assertions remain. Actual REST tests retain JSON/upload bounds, accepted
receipt replay, authorized/private downloads, unrelated-token rejection, original
files after Form deletion and trash retention. Fresh production build inspects
73 traces with no private uploads. Types, lint (one existing warning), Payload
generators, context checks/tests and unchanged approved-exception audit pass.
Exact-head Quality/merge evidence remains pending.

## Latest handoff — 2026-10-15

[PR #29](https://github.com/tanishraj/payload-cms-starter-kit/pull/29) merged
into develop as `2d18b58a` after [exact-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38630786542)
passed on `c32cca69`. CI: 2,665 integration tests pass/one Docker-dependent skip;
Generic Form and Contact6 native journeys both pass first attempt (7.2m).
Production/private-artifact check passes (73 traces, no private uploads).
Governance: Review approval passes first attempt; Admin feature-grant journey
passes on retry after the Pages grant did not become visible within five seconds
inside the Content group. Broader VERIFY/AdminUX repeatability remains open;
no assertion or warning was suppressed. The earlier failed upload-route run is
retained in this document. No new environment/dependency/database migration/style.

Ordered layout/display entries and one-level question groups are merged, including
canonical Payload ownership of submit/upload/private-download APIs. See the
[layout contract](form-layout-entries.md). The verified feature branch is removed;
continue on fresh `feat/form-appearance-controls`. Build supported appearance
settings next, then conditions as a separate bounded increment. The appearance
increment passed local focused/full integration, native browser, Storybook, type,
lint and production artifact checks. Exact-head Quality and merge remain pending.
Full forms acceptance and broad scope/provider/UX reliability work remain tracked.


## Appearance increment — 15 October 2026

On `feat/form-appearance-controls`, sourced supported width/spacing/columns and
submit variant/size/shape/width map to one reusable native Form appearance group.
Defaults preserve legacy output/hashes. Active settings participate in original
revision/history and explicit stale recovery without changing answer semantics.
Storybook-first review/play and local focused/full release checks passed:
2,693 integration tests passed with one Docker-dependent skip; both native form
journeys passed; the build verified 73 traces and no private uploads. Exact-head
[Quality passed](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38641309862)
and [PR #30 merged](https://github.com/tanishraj/payload-cms-starter-kit/pull/30)
as `9c6f148a`. The hosted Generic Form browser case was marked flaky after a
420-second timeout and retry navigation timeout before the overall run passed;
broader repeatability remains tracked. The next clean branch is
`feat/form-conditional-rules`; conditional visibility has been implemented and is
under review. Broader forms acceptance stays open. See
[contract](form-appearance-controls.md).

## Conditional visibility increment — 15 October 2026

Implementation is underway on the fresh `feat/form-conditional-rules` branch.
Editors choose stable-ID conditions against earlier questions; all rules must
match. The shared public/intake contract supports answered/unanswered and typed
exact comparisons, conditional requiredness, answer/file-token clearing, and
server-side rejection of nonempty hidden values. Rules are captured in the
published revision. See [condition contract](form-conditional-rules.md).

Focused form suite: 86 tests pass, TypeScript and changed-file ESLint pass, and the
full integration suite passes (2,701 passed, 1 skipped). The Storybook production
build passes. Local native E2E could not reach the feature
journeys: first the pinned Playwright Chromium was absent and its installer made
no progress; using installed Chrome exposed the existing local MongoDB endpoint as
standalone (transactions unavailable). No user database service was modified.
Native Admin authoring/public journeys and exact-head CI remain required before
merge; DF-08 stays unchecked.

## Current delivery checkpoint — 16 October 2026

[PR #31](https://github.com/tanishraj/payload-cms-starter-kit/pull/31) is merged as
`e18690eb` after [exact-head Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38861826953)
passed on `311fec42`. Both governance and both native form journeys passed first
attempt; integration, generated outputs and production/private-artifact gates
passed. This supersedes the earlier pending local-browser/CI checkpoint. Supported
conditions/appearance are verified; the feature branch is deleted.

Continue milestone 6 on fresh `feat/form-revision-exports`, created from merged
develop. [Historical CSV exports](form-revision-exports.md) use the native inbox
filters/search and captured labels/names/typed values, with explicit legacy rows,
private-file omission and enforced access/size limits. Focused and real native
Payload/MongoDB tests pass. Final local release: 2,745 integration tests pass/one
existing Docker-dependent skip; both native form download journeys and both
governance journeys pass first attempt. Production build inspects 73 traces/no
private uploads; Storybook and required gates pass. Exact-head GitHub Quality is
the merge gate; status/evidence is on the
[feature PR](https://github.com/tanishraj/payload-cms-starter-kit/pulls?q=is%3Apr+head%3Afeat%2Fform-revision-exports).
Webhook authoring, notification reliability, safe test mode and final
forms acceptance remain in the sequence.
