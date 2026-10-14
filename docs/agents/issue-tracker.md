# Local Markdown issue tracker

Wayfinder defaults to local Markdown because no repository tracker configuration was supplied for this effort. These files are versioned planning records; no GitHub issues were created.

## Wayfinding operations

- An effort lives under `.scratch/<effort>/`. Its canonical named map is `map.md`, labelled `wayfinder:map`; children live under `issues/NN-<slug>.md` and link their parent.
- Child metadata records Type, Mode, Status, Assignee and `Blocked by: NN, NN` (`none` when unblocked). Numbers wire identities; human-facing references use linked titles.
- Frontier: children with `Status: open`, `Assignee: unassigned`, whose blockers all have `Status: resolved` or `closed`. Query child metadata rather than maintaining an open list in the map. Order by numeric filename. The current effort provides [a frontier query](../../.scratch/website-builder-catalogue/frontier.py).
- Claim before work: save `Status: claimed` and the driving developer’s name in Assignee. Restore open/unassigned only if deliberately releasing an unfinished claim.
- Resolve: append the actual resolution under `## Comments` as `### Answer`, set `Status: resolved`, and append one title-linked gist to the map’s Decisions so far. Detail lives in the ticket, not duplicated in the map.
- Mis-scoped tickets close with the reason and a pointer from the map’s Out of scope, not Decisions so far. Never delete an existing claim or answer to replace it with a new question.
- Create named children first; wire dependency metadata and title links second. Validate missing IDs and cycles. Keep assets linked, not pasted into the map.
- Charting creates open tickets and resolves none. Later sessions claim one frontier decision and resolve at most one non-research ticket. Research uses the skill’s delegated workflow when required; this chart contains no research tickets.
