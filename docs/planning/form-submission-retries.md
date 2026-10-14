# Durable submission retry protection

Approved by the user on 14 October 2026. This is a bounded dynamic-forms increment, not completion of the notification/reliability catalogue.

## Visitor contract

Generic Form and Contact6 create a random UUID v4 per mounted form attempt. A pending lock prevents double-clicks. A lost response keeps answers and the same key so the visitor can retry deliberately. There is no automatic submission retry. Changed questions retain that key during compatible-answer recovery, preventing an ambiguous earlier request from becoming a second accepted response.

An accepted key with the same answers and submitted revision returns the original saved confirmation. An accepted key with different answers/revision returns a conflict; the visitor must explicitly choose **Start a new response**, review retained answers, and submit using a new key. Keys are not answer fingerprints: separate visitors and deliberate new responses can send identical answers.

The browser keeps the key only in memory. Reloading or remounting starts a new attempt; it cannot recover an abandoned page's key. No answers or keys are persisted in browser storage. Legacy Contact33/Review clients without keys retain their existing protocol and do not gain duplicate protection in this increment.

## Storage and receipt contract

`form-submissions` has optional immutable hidden `submissionKeyHash`, `submissionRequestHash` and `submissionConfirmation` fields, inaccessible through ordinary field reads. The raw key is never stored. SHA-256 key hashes are scoped by endpoint slug; request hashes cover sorted scalar answers and submitted revision. Tracking metadata is excluded; first accepted tracking metadata is retained.

Receipt lookup precedes current publication/revision checks, rate limiting, writes and notifications. Only the winning create executes review promotion, events and email. Replays expose only the saved public confirmation, never original answers, record IDs, internal notes or recipients. A racing create failure rechecks committed storage; if the winner has not committed, it remains unconfirmed (503) and keeps the client key for a later deliberate retry.

Protection lasts for the submission document's lifetime, including Trash. Do not clear receipt fields during archival or introduce a TTL index. Permanent deletion ends the guarantee. This is storage duplicate protection, not an email outbox: a process failure after commit can leave delivery unfinished, and replay does not resend mail. Notification recovery and distributed abuse protection remain separate planned work.

## Deployment prerequisite

The MongoDB collection must contain a **single-field unique sparse** ascending index on `submissionKeyHash`, with no partial filter. Optional legacy records must omit the key field (do not backfill null or empty keys). The Payload Mongo adapter generates this index from the optional `unique: true` text field. Verify it is installed before enabling public intake after deploy; production index settings/permissions may require an operator-controlled index build. The endpoint checks the actual database index and fails closed for new keyed requests if it is missing; it never creates an index in public intake.

Use the deployed Payload model's `collection.collectionName` to identify the actual collection; inspect existing index definitions and key-field data before using MongoDB `createIndex({ submissionKeyHash: 1 }, { unique: true, sparse: true })` in the intended database. Do not run `syncIndexes` to remove unrelated indexes. Test in staging and verify index readiness plus a lost-response replay before production launch. No data migration, live index mutation, new dependency or environment variable is part of this implementation.

## Evidence

`tests/int/forms-submission.int.spec.ts` verifies replay before side effects, conflict privacy and missing-index refusal. `tests/int/form-idempotency-database.int.spec.ts` uses a disposable MongoDB replica and the real Payload route to verify concurrent attempts, delayed replays after publication changes, conflicts, new responses and keyless legacy rows. `tests/int/generic-form.int.spec.tsx` covers retained keys, explicit new attempts and preserved answers. Both native authoring journeys in `tests/e2e/generic-form.e2e.spec.ts` drop a successful server response and verify the visitor's retry returns the original confirmation with one stored response.

The canonical `Blocks/Generic Form` Storybook entry includes Lost Confirmation and Different Response demonstrations. Broad DF/SUBMIT acceptance stays open; this increment does not implement all field controls, identity lifecycle, notification retries, uploads, exports or scoped ownership.
