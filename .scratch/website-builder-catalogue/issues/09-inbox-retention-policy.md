# Define inbox access, generic exports and retention

Parent: [Plan the complete website-builder feature catalogue](../map.md)
Type: grilling
Label: wayfinder:grilling
Mode: HITL
Status: open
Assignee: unassigned
Blocked by: 04, 08

Dependencies: [Define section ownership and resource permissions](04-section-resource-policy.md); [Define submission receipts, duplicates and notification retries](08-intake-retry-contract.md)

## Question

How should authorized users find, understand, export and retire generic submissions without exposing other sections or losing historical meaning?

## Boundaries and expected evidence

Set inbox/filter/status and custom-answer formatting expectations, independent grants, test-entry defaults, attachment access, notification recipient authority, export safety and retention/deletion boundaries. Define optional contact metadata mappings without requiring fixed field names.

Coverage: DF-05/06; SUBMIT; ACCESS-06; OPS; SEC; ADMINUX-15. Acceptance remains in the [implementation checklist](../../../docs/planning/feature-implementation-checklist.md).
Consult the [confirmed planning brief](../brief.md). Grilling sessions use the Wayfinder, grilling and domain-modeling skills; baseline tasks use the repository project-context skill.

## Comments

Charted on 2026-10-14. No decision resolution or implementation acceptance is recorded.

### Baseline defect — 2026-10-14

The [forms/access baseline](../../../docs/planning/forms-access-baseline.md#reproduced-inbox-defect) reproduces missing activity timestamps on string-ID owner changes. Include regression coverage and correction in the inbox increment; not fixed by the baseline task.
