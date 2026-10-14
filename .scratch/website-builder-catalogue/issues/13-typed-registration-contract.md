# Define explicit component and control registration contracts

Parent: [Plan the complete website-builder feature catalogue](../map.md)
Type: grilling
Label: wayfinder:grilling
Mode: HITL
Status: open
Assignee: unassigned
Blocked by: 06, 12

Dependencies: [Define supported controls, layout and conditions](06-control-layout-contract.md); [Define theme, supported props and responsive rollout](12-themes-props-responsive.md)

## Question

What minimal explicit registration contract should keep Payload configuration, production props, validation, Storybook controls and schema evolution aligned?

## Boundaries and expected evidence

Retain typed registrations and small helpers/generators, as confirmed. Define required artifacts, server/client import boundaries, unknown-control publish failures, migration/version checks, source/licensing traceability and canonical story ownership. Do not introduce a separate schema-definition language or duplicate story sections.

Coverage: CORE-02/03; BLOCK; FORM-08; DEV; VERIFY. Acceptance remains in the [implementation checklist](../../../docs/planning/feature-implementation-checklist.md).
Consult the [confirmed planning brief](../brief.md). Grilling sessions use the Wayfinder, grilling and domain-modeling skills; baseline tasks use the repository project-context skill.

## Comments

Charted on 2026-10-14. No decision resolution or implementation acceptance is recorded.
