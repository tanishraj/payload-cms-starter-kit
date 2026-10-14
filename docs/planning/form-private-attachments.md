# Private form attachments

Bounded forms milestone 4, on `feat/form-private-attachments`. The user approved private storage, a submission-linked email notification and authorized downloads. Actual email attachments are not included.

## Authoring and visitor flow

Add a **File** question in the reusable native Form; choose its label/name, required state, formats, maximum count and size. Both Generic Form and Contact Cards & Form render the same control. The initial catalogue now has fifteen question controls; the existing submit button remains separate configuration.

- Formats: PDF, DOCX, PNG and JPEG. Unset/empty format selection means this supported default set; selecting a subset restricts it. The native selector starts with all four selected. Arbitrary executable/archive formats are not accepted.
- Whole-number limits: 1–3 MB per file, 1–5 files per question. Defaults: 3 MB and one file. A response accepts at most ten files across questions.
- Files upload automatically after selection, with actual byte-transfer progress followed by server verification. Failed/in-flight uploads block sending; retry or remove them. Removal aborts transport and ignores late confirmations. No image/document inline previews execute untrusted content.
- Upload retries reuse one upload ID and response key, so a lost confirmation cannot create duplicate metadata. Twenty durable staging slots per response allow replacements while bounding storage; reaching that limit exposes **Start a new response**, preserving ordinary answers and clearing files tied to the old key.
- Changed questions return the existing sanitized refresh protocol. Unique unchanged field ID/type and currently valid file metadata preserve compatible files, including rename/relabel. Removed/invalid files are explained and cleared. Visitors review and submit again; defaults never refill answers.
- Authenticated Live Preview and workshop callbacks do not accept real submissions. Canonical `Blocks/Generic Form` includes Private Files; `Components/Form File Control` demonstrates the control, not a duplicate block.

## Transport, history and access

`POST /api/forms/[slug]/attachments` accepts one byte-bounded octet-stream file and explicit revision, response key, field ID, upload ID and encoded filename headers. It loads only the published General/Lead Form, validates the current question, checks extension/content/size and uses distinct internal `form-attachments` metadata. Client MIME, labels, tokens and arbitrary public URLs do not confer storage or read authority. Server-side byte signatures use the existing bounded `file-type` dependency; this is format detection, **not malware scanning or full document validation**.

The metadata collection is not a Payload upload collection. All direct create/read/update/delete APIs are denied, including Admin. Storage keys are random UUIDs; filenames never become paths. No public Media relation, CDN URL, presigned visitor download, object ACL or browser S3 credentials are created. Production uses a separate private bucket and credentials; local development uses owner-only files in ignored `.private/form-attachments`.

Submission JSON contains token arrays under authored field names. A MongoDB transaction validates each token against its response key, Form ID, stable question ID, current format/size/count and pending expiry, claims it and creates the durable receipt together. Capture failure rolls back claims for a deliberate retry. Accepted-attempt replay runs before current revision/upload checks and does not send another notification. Durable uniqueness indexes must be installed before upload service becomes available. Transactional reads disable parallel pagination counting.

Immutable submission attachments and original answer rows retain original question/file names, sizes/types and raw token meaning. File questions named `email`, `phone` or other contact aliases remain ordinary answers. Notification emails show escaped filenames and a canonical Admin submission link; they contain neither file bytes nor direct file tokens/URLs. Recipients need separate inbox access to download.

`GET /api/form-submissions/[id]/attachments/[token]` authenticates the current user, requires the full `formSubmissions` feature (placement/dependency access is insufficient), reads the exact submission with `overrideAccess: false`, checks its immutable attachment linkage and internal receipt, and verifies stored byte length/hash. It forces binary attachment download with no-store/nosniff/sandbox headers. Unknown, unauthorized, corrupted or unavailable files return the same unavailable response. Original files remain downloadable after the current reusable Form is permanently removed. Trashed submissions retain files and require restoration before ordinary downloads.

Current inbox access remains the repository's feature-wide policy. This increment enforces that policy for files; future section/record row constraints will be enforced by the same access-checked submission read. It does not claim the broader ACCESS-02/05/06 scoped-resource milestone is complete.

## Lifecycle and production configuration

Unsubmitted/removed/failed uploads expire after 24 hours. `pnpm cleanup:form-attachments` processes at most 100 candidates per invocation, transactionally excludes referenced accepted files (including trash), marks deletion before external storage I/O and retries failed deletions on the next run. Accepted files follow the submission lifetime; permanent deletion requeues them, and periodic reference checks recover failed hook scheduling. A failed upload leaves tracked metadata for cleanup rather than an untracked object.

Schedule cleanup hourly with the same trusted application runtime/secrets, repeat bounded runs when the returned scan count is 100, monitor nonzero `failed` and account for retained/deleting objects in backup/restore. Production setup is documented in [private attachment operations](../operations/private-form-attachments.md) and `.env.example`. No deployment credentials, live email send or real private-bucket policy acceptance is performed by local tests.

## Source and evidence

Authenticated source: `@shadcnblocks/input-input-special-1`; direct-upload progress composition from `@shadcnblocks/file-upload-file-upload-special-7`; exact Radix Luma Progress dependency retrieved through shadcn CLI. Existing Input/Button/Field components and theme are reused. No new package, palette or form stylesheet.

Tests: `form-files.int.spec.ts`, `form-files-presentation.int.spec.tsx`, `form-files-storage.int.spec.ts`, `form-files-database.int.spec.ts`, existing form/history/recovery/intake suites, canonical workshop plays and both expanded `generic-form.e2e.spec.ts` journeys. The native run exposed Payload's empty-selection normalization; a real persistence regression now covers it. An early transaction run exposed parallel pagination reads on the same session; transaction queries now use serial reads. Release/merge evidence is recorded in the implementation checklist; larger forms/provider/scope acceptance remains open.
