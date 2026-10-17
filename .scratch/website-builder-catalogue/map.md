# Plan the complete website-builder feature catalogue

Label: wayfinder:map
Status: open
Updated: 2026-10-17 (Asia/Dubai)

## Destination

Find a clear route through all 242 feature groups and 10 dynamic-form proof steps: verified starter reuse, remaining gaps, explicit policies, dependencies, release placement and acceptance evidence. This map prepares decisions for implementation; it does not implement the catalogue.

## Notes

- Implementation belongs to payload-cms-starter-kit. Native Payload administration, blocks and Live Preview remain the editing system.
- The [confirmed planning brief](brief.md) records the user’s charting choices and the observed baseline. The [coverage index](coverage.md) routes every catalogue group without duplicating acceptance requirements.
- [Implementation checklist](../../docs/planning/feature-implementation-checklist.md) owns feature/proof completion and delivery sequence. [Scope reference](../../docs/planning/feature-scope-reference.md) is the historical inventory, not a competing runtime contract.
- Use [local tracker operations](../../docs/agents/issue-tracker.md) to find open, unblocked, unclaimed child tickets; do not maintain an open-ticket list here. Detailed answers belong only to their resolved ticket.
- Consult Wayfinder for sessions, grilling/domain-modeling for human decisions, project-context for local facts, and the repository’s relevant Payload/UI skills when inspecting those areas. Charting resolves no tickets; later sessions resolve at most one non-research ticket.
- Planning mode only. No production migration, dependency exception renewal, provider change, source import or app implementation is authorized by this map.

- Current focus (17 October): organize the catalogue around a usable first-client handoff. The [client delivery proposal](../../docs/planning/client-website-delivery-roadmap.md) separates reuse, bounded gaps and later expansion. The user confirmed team/Admin configuration followed by client Site Manager editing. Core forms remain accepted and advanced forms deferred; the bounded first-client release is now approved. The [short release checklist](../../docs/planning/first-client-release.md) selects active work; remaining catalogue policy tickets are reference planning, not prerequisites to every client task.

## Decisions so far

- [Establish the forms and access baseline](issues/01-forms-access-baseline.md) — Reuse the current generic six-control path and feature-grant safeguards; remaining gaps and fresh-versus-recorded evidence are documented in its linked assessment.

- [Establish the composition and publishing baseline](issues/02-content-publishing-baseline.md) — Native composition, 61 Page choices and current media/catalogue reuse are evidenced; handoff gaps and a complete-domain release proposal are linked from the ticket.

- [Define the first-client handoff release boundary](issues/20-first-client-handoff-boundary.md) — The user approved five working outcomes and keeping the catalogue as reference; demonstrate the existing journey before optional expansion.

## Not yet specified

- Provider-specific transport or storage investigations may emerge after file, delivery and recovery requirements select a concrete boundary; no provider switch is assumed.
- Detailed compatibility/backfill steps depend on the selected identity, scope and publication policies and actual existing records. No production-data access or migration is assumed.
- Follow-on control workflows and later configurable-breakpoint constraints may expose additional questions after initial contracts are settled.

## Out of scope

- A separate visual editor, abandoning Payload-native composition, or restarting Forma implementation.
- SNMIH migration/replica or importing its content/branding; it remains a capability reference.
- A third role type, a two-account limit, or mandatory Admin approval for Managers publishing ordinary pages within scope.
- A full multitenant SaaS platform, marketplace, AI generation, multiplayer editing, atomic multi-document releases, exact site-history replay, arbitrary executable styling/configuration and website import connectors. These remain outside this catalogue effort under the current scope; reopening them requires a changed destination.
- Treating all retained or later features as mandatory for the first release, or declaring planning/source presence to be verified runtime acceptance.
