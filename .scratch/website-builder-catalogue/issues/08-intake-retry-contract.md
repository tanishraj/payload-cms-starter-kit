# Define submission receipts, duplicates and notification retries

Parent: [Plan the complete website-builder feature catalogue](../map.md)
Type: grilling
Label: wayfinder:grilling
Mode: HITL
Status: open
Assignee: unassigned
Blocked by: 05

Dependencies: [Define form revisions and compatible-answer recovery](05-form-revisions-recovery.md)

## Question

What should visitors and operators observe when intake, delivery, retries or double-clicks fail partway through?

## Boundaries and expected evidence

Decide server idempotency scope/lifetime, receipt semantics, persist-before-notify behavior, email/provider failure recovery, distributed abuse protection, timeout ambiguity and safe test submissions. A client pending lock is not server duplicate protection. Preserve compatible answers across recoverable failures.

Coverage: DF-04/05/09; SUBMIT-03–07/09–12; ADMINUX-15/16. Acceptance remains in the [implementation checklist](../../../docs/planning/feature-implementation-checklist.md).
Consult the [confirmed planning brief](../brief.md). Grilling sessions use the Wayfinder, grilling and domain-modeling skills; baseline tasks use the repository project-context skill.

## Comments

Charted on 2026-10-14. No decision resolution or implementation acceptance is recorded.

2026-10-14: User approved durable attempt keys for the submission lifetime, matching-retry receipt replay and explicit new responses on changed answers. The bounded implementation is on `feat/form-submission-idempotency`; see `docs/planning/form-submission-retries.md`. This does not resolve the broader ticket, its dependency or remaining delivery/abuse/test-mode decisions.
