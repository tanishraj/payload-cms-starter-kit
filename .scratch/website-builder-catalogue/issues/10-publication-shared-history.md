# Define publication, shared changes and history recovery

Parent: [Plan the complete website-builder feature catalogue](../map.md)
Type: grilling
Label: wayfinder:grilling
Mode: HITL
Status: open
Assignee: unassigned
Blocked by: 02, 04, 05

Dependencies: [Establish the composition and publishing baseline](02-content-publishing-baseline.md); [Define section ownership and resource permissions](04-section-resource-policy.md); [Define form revisions and compatible-answer recovery](05-form-revisions-recovery.md)

## Question

What consistent native-Payload behavior should editors expect for autosave/conflicts, shared drafts, scheduled changes and restore-as-draft?

## Boundaries and expected evidence

Decide shared resource reference/live-update semantics, impact warnings, safe history restoration and permission checks, collision recovery and publish/unpublish failure states. Preserve separate document transactions unless atomic releases are explicitly brought into scope. Form publication must obey the revision contract.

Coverage: PAGE; GLOBAL; PUBLISH; PREVIEW; ACCESS; OPS; ADMINUX-04–11. Acceptance remains in the [implementation checklist](../../../docs/planning/feature-implementation-checklist.md).
Consult the [confirmed planning brief](../brief.md). Grilling sessions use the Wayfinder, grilling and domain-modeling skills; baseline tasks use the repository project-context skill.

## Comments

Charted on 2026-10-14. No decision resolution or implementation acceptance is recorded.
