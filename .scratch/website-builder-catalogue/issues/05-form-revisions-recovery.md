# Define form revisions and compatible-answer recovery

Parent: [Plan the complete website-builder feature catalogue](../map.md)
Type: grilling
Label: wayfinder:grilling
Mode: HITL
Status: open
Assignee: unassigned
Blocked by: 01

Dependencies: [Establish the forms and access baseline](01-forms-access-baseline.md)

## Question

How should published revision identity, stable field/option identity and compatibility checks make the accepted refresh-and-preserve flow precise?

## Boundaries and expected evidence

Decide behavior for relabel/reorder/rename, type or option changes, removals and published-versus-draft definitions. Specify the stale-response contract, preserved/reset answer rules, visible explanations and historical export semantics. Existing fingerprints/snapshots are evidence, not proof of complete client revision negotiation.

Coverage: DF-02/06; FORM-05/06; SUBMIT-01/02/08. Acceptance remains in the [implementation checklist](../../../docs/planning/feature-implementation-checklist.md).
Consult the [confirmed planning brief](../brief.md). Grilling sessions use the Wayfinder, grilling and domain-modeling skills; baseline tasks use the repository project-context skill.

## Comments

Charted on 2026-10-14. No decision resolution or implementation acceptance is recorded.

### Confirmed recovery direction — 2026-10-14

The user authorized implementing stale-form recovery: preserve answers only for unchanged field IDs/control types when still valid; keep selected options only while their values exist; explain cleared incompatible answers; require review and a new deliberate submission. This settles the recovery increment, not the complete revision/option lifecycle ticket. Implementation may proceed on a fresh feature branch without treating all remaining identity/export policy as resolved.

### Implementation checkpoint — 2026-10-14

The authorized [published-revision recovery increment](../../../docs/planning/form-revision-recovery.md) is implemented and locally verified for both generic layouts. Full regression, native database/browser journeys and production/Storybook builds pass; the dependency audit blocks merge. This ticket remains open for the broader field/option identity, lifecycle and historical export policies; no second Wayfinder ticket is resolved by this session.
