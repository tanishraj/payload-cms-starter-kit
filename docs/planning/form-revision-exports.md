# Historical submission CSV exports

This bounded SUBMIT-02/11 and ADMINUX-15 increment builds on immutable intake
snapshots. It does not replace Payload's inbox or introduce a visual editor.

## Editor flow

Open **Forms → Form Submissions**, apply native filters (for example Form,
status or submitted date) and search, then choose **Export answers (CSV)**.
The export covers matching records across all pages; row selection, visible
columns, pagination and sort do not restrict it. Empty and Trash lists disable
the action. Preparing CSV prevents repeat clicks. Errors stay in the inbox and
explain recovery; oversized exports ask the operator to narrow filters. Success
announces the number of submissions, not the number of answer rows.

The CSV uses **one row per answer**. This avoids conflating reused question names
and an unbounded set of columns as published definitions change. Filter/group by
`submission_id` to reconstruct a response. The fixed columns are:

- `submission_id`, `submitted_at`, `status`, `form_id`;
- `form_title`, `form_slug`, `form_revision`, `history_source`;
- `field_id`, `field_name`, `field_label`, `field_type`;
- `answer` (original readable value), `answer_json` (original typed JSON value).

Original title/slug/labels/names/options/values come from the captured submission,
never today's Form. The revision is the captured content fingerprint, not a
Payload version ID. Rename/reorder/remove/type/option changes and reused keys do
not rewrite old answers. Files export captured original filenames in `answer`;
`answer_json` is empty for File questions. Tokens, storage paths, direct file URLs,
bytes, hidden receipt fields and internal staff notes are excluded. Download
private files from their original submission, with a fresh authorization check.

Pre-snapshot records use `history_source=legacy_raw`, their submitted data keys
and JSON values; labels/types/revision are left empty rather than inferred from a
current Form. Empty responses retain one metadata-only row. No historical backfill
or database migration occurs. Retained history also works after Form deletion.

## Transport and access

`GET /api/form-submissions/export` is registered on the native collection REST
router. `filter` is bounded JSON for a native Payload `where`; `search` uses the
same configured searchable fields and Payload search merger as the inbox.
Authentication and full `formSubmissions` permission are mandatory. Form placement
and Reviews dependency reads are insufficient. Every batch passes the same `req`
and user with `overrideAccess: false`, depth zero and explicit field selection,
so collection row access remains authoritative. Ordinary exports exclude Trash.
No new permission grant is added; future section scopes must constrain collection
reads and will also constrain exports. No scope completion is claimed here.

The synchronous export caps at **1,000 submissions and 8 MiB encoded UTF-8 CSV**.
It reads batches of 100 with a stable ID cursor and a start-time creation cutoff.
Crossing either limit returns 413 JSON without a partial download. Invalid filters
return 400; storage/query failures never return database details or partial CSV.
This is a best-effort operational export: answers retain captured meaning, but
workflow updates/deletions during traversal may affect membership/status. It is
not an atomic database backup. Larger asynchronous exports remain future scope.

Every response is private/no-store. Downloads use CSV attachment headers, UTF-8
BOM, quoted cells, doubled quotes and CRLF rows. Spreadsheet formula prefixes,
including whitespace/control-prefixed ones, are neutralized with an apostrophe.
That safety prefix is intentional CSV presentation, not a mutation of stored data.
Treat downloads as private data. Webhook configuration/mapping authoring, test-mode
exclusion, scheduled delivery and broader inbox operations remain separate tracked
acceptance; introducing test submissions must also update this export boundary.

## Implementation and verification

- `formSubmissionExport.ts`: pure historical row serialization and CSV escaping.
- `exportSubmissions.ts`: bounded access-enforced native endpoint.
- `FormSubmissionExport.tsx`: native list-query/download/toast integration.
- `form-export-action.tsx`: existing sourced Button dependency from authenticated
  `@shadcnblocks/input-input-special-1`; no new presentation styles.
- **Admin / Form export**: Default, Preparing and No Results stories import the
  production presentation. Default's play and 390px pending state were reviewed;
  WCAG A/AA axe reported zero violations in the isolated Default canvas.
- `form-export*.int.spec.*`: history, typed values, private files, legacy records,
  formula/Unicode/quote handling, permission/query/limit failures, actual native
  cookie authentication, Mongo persistence, row constraints, Form deletion, Trash,
  disabled/pending/error/success download behavior.
- Both native Generic Form/Contact6 journeys exercise filtered CSV downloads after
  real file intake, including original revision/filename and token exclusion.

Full release verification and merge evidence are recorded in the main checklist.
No environment variable, runtime dependency, new stylesheet or provider change.
