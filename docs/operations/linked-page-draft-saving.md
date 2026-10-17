# Saving revisions of linked Pages

A published Page can remain in a Header, homepage selection or redirect while an
editor prepares its next revision. Native **Save Draft** must preserve the live
Page and shared navigation; **Publish changes** deliberately makes the revision
public. Actual unpublishing of a referenced Page remains blocked.

The first-client rehearsal exposed a guard that treated native draft-saving as
unpublishing. Pages now derive a private write-intent marker from Payload's
`beforeOperation` arguments, using an isolated request context that retains the
native transaction. The marker is cleared/recomputed for nested writes, never
inferred from query text or accepted as a client flag. Before-change reference
checks exempt only actual draft saves; after-change navigation synchronization
waits for publication. The ordinary unpublish check reads the main document when
the latest version is a draft, keeping public references protected.

History restoration retains its existing separate draft-only boundary. No role,
permission, provider, schema, migration or environment setting is added. This
change does not authorize unpublishing referenced content or bypass normal
collection access. Other collection draft policies are outside this increment.

Verification covers Admin and section-scoped Site Manager REST/Local API draft
saves, unchanged public Page/navigation, explicit publication, rejection of real
unpublishing after draft saves, and forged/nested request intent. The existing
native History browser journey also saves a linked Page revision before restoring
and explicitly publishing history. See the
[three-page rehearsal](../planning/client-site-rehearsal-2026-10-17.md) for observed
UI results and remaining client/production evidence.
