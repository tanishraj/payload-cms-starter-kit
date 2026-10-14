# Forms completion plan

Direction confirmed by the user on 14 October 2026: finish the forms milestone before moving to other website-builder items. Broader scoped page access and onboarding follow forms. Necessary form/inbox/attachment permission prerequisites are part of secure forms acceptance.

This is the delivery sequence for the existing [implementation checklist](feature-implementation-checklist.md), not a second set of completion boxes. That checklist owns status and verification; the full catalogue is retained. Existing working behavior should be verified and reused before replacement. Each bounded increment is tested, committed and merged into develop before the next branch starts.

## Implemented foundation

Reusable Payload Forms selected by native page blocks; six shared controls with custom labels/names; generic intake and readable original answers; draft isolation; changed-question recovery; durable accepted-attempt duplicate protection; canonical Storybook presentations. These increments have test and merge evidence, but do not complete every broad FORM/SUBMIT acceptance group.

## Remaining delivery sequence

| Order | Milestone | Existing acceptance IDs | Exit evidence |
| --- | --- | --- | --- |
| 1 — Merged | Owner-activity correction | SUBMIT-10, DF-05, ADMINUX-15 | Owner-only assignment/reassignment/removal stamps activity; unchanged owner does not; real authorized storage and denied mutation verified. |
| 2 | Field identity, configuration and authoring clarity | FORM-01/05/06, DF-02/06 | Stable field/choice identity, help/default/constraints, safe names, relabel/reorder/rename/remove compatibility and understandable editing warnings verified. |
| 3 | Complete initial control catalogue and extensibility | FORM-03/08, DF-07 | URL, number, multi-select, radio, checkbox group, switch, date and time added through explicit typed contracts, with shared validation, formatting, Storybook and native Payload evidence. Existing six controls retain compatibility. File transport follows milestone 4. |
| 4 | Private file controls and their permissions/lifecycle | SUBMIT-05, applicable FORM-03/05 | Private storage, type/size limits, authorized reads, scope/lifecycle cleanup and failed-submission behavior verified; public Media is not used as the private attachment boundary. |
| 5 | Layout entries, appearance and conditional rules | FORM-04/07, DF-08, SUBMIT-03/07 | Supported groups/headings/descriptions/separators/layout props, stable-ID declarative show/require rules and matching client/server behavior. Inactive answers excluded; accessible focus/error recovery verified. |
| 6 | Revision/history acceptance and exports | SUBMIT-01/02/04/11, DF-02/06 | Published/draft isolation and full change matrix; readable historical meaning and authorized revision-aware export/mappings survive rename/remove/type changes. |
| 7 | Operational inbox and notification reliability | SUBMIT-06/08/09/10, DF-05 | Remaining inbox permissions/workflow/follow-up, controlled reply-to/title/recipients, persistent delivery state and safe deduplicated retries; abuse controls assessed across intended deployment. |
| 8 | Safe testing and complete editor/visitor journeys | SUBMIT-12, DF-09, ADMINUX-14/15/16 | Authorized labelled test submissions stay out of ordinary inbox/export/notification paths; native create/edit/preview/publish/submit/manage/export/recovery journeys and accessibility verified. |
| 9 | Close forms acceptance and handoff | DF-10; applicable FORM/SUBMIT groups | Required tests/build/security gates pass, operator/developer documentation matches shipped behavior, accepted decisions and remaining explicit deferrals are recorded. |

Each milestone can contain several small PRs. A small fix is not completion of the whole milestone. Controls are sourced from verified upstream components, demonstrated in Storybook before Payload integration, and use the same production contract. No separate visual editor is introduced.

## Existing later scope

FORM-09 remains explicitly later: rating, range/date-range, repeaters and multi-step flows. Password/payment capture requires separate domain integrations. This follows the existing catalogue's deferral, not a new deletion of requirements. Delivery/attachment/provider choices need concrete design and acceptance before implementation; no generic claim of completion replaces them.

## Current checkpoint

Owner activity merged in [PR #23](https://github.com/tanishraj/payload-cms-starter-kit/pull/23) as `8495a4a7` after [Quality](https://github.com/tanishraj/payload-cms-starter-kit/actions/runs/38535686556) passed. All 55 local focused tests and 2,386 CI integration tests pass (one Docker-dependent skip), both native form journeys and production build pass. The Admin grant/revoke governance journey passed on retry after the existing conditional-field readiness timeout; broader usability/repeatability remains open.

Milestone 2’s bounded [question-configuration increment](form-field-configuration.md) is implemented on `feat/form-field-configuration`: help/defaults, current text limits, identity collision checks, shared public/intake projection and editing guidance. Local full regression has 2,410 passing tests and one Docker-dependent skip; both native journeys pass without retry, production/Storybook builds and required local gates pass. GitHub Quality/merge remains pending. Full FORM-05 range/file constraints and complete history/export acceptance remain open.

After this increment passes current-head Quality and merges, create a fresh branch for milestone 3’s initial control catalogue/extensibility. Forms remain first. The full inbox/section-scope/export capability is not declared complete by these bounded increments.
