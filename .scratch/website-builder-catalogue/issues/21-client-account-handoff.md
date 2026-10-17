# Define client account activation and recovery

Parent: [Plan the complete website-builder feature catalogue](../map.md)
Type: grilling
Label: wayfinder:grilling
Mode: HITL
Status: open
Assignee: unassigned
Blocked by: 20

Dependencies: [Define the first-client handoff release boundary](20-first-client-handoff-boundary.md)

## Question

How does a team-created client account securely establish credentials, sign in,
recover access and ask an Admin for help, with and without configured outgoing email?

## Boundaries and expected evidence

Reuse native Users, existing authentication/security and team guidance. Assess the
current supported path before adding an invitation system. If invitations are
selected, decide expiry, single use, resend, revocation and failure recovery; do not
send plaintext passwords or introduce a third role. Confirm operator ownership and
an honest alternative when email is disabled. Scope is ONBOARD-15 and its SEC/ACCESS
dependencies, not a new identity provider or deployment migration.

## Comments

Charted on 17 October 2026. No activation or invitation implementation is promised.

17 October 2026: the bounded `feat/client-account-recovery` increment verifies
native token/password behavior with capture-only email and adds honest disabled/
recipient-overridden email help. See [handoff contract](../../../docs/operations/client-account-handoff.md).
Keep this issue open: actual sender delivery, native HTTP-error confirmation and
client task evidence remain. No invitation system was introduced.
