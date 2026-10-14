# Operating private form attachments

Forms may ask for PDF, DOCX, PNG or JPEG files. These files use separate private storage and are available only through an access-enforced submission download. Public Media storage is never reused.

## Configure storage

Development defaults to `localDisk` in `.private/form-attachments`; files and directory use owner-only permissions. The directory is ignored and is not served by Next.js. Local disk is rejected for production attachments. Production defaults to `disabled`, so existing non-file forms continue working until uploads are configured. File Form publication is blocked without an enabled provider; disabling it after deployment makes public file Forms unavailable.

Production requires `FORM_ATTACHMENTS_PROVIDER=s3` and all five required `FORM_ATTACHMENTS_S3_*` values documented in `.env.example`: bucket, endpoint, region, access key ID and secret access key. `FORM_ATTACHMENTS_S3_FORCE_PATH_STYLE` is optional and defaults to true. Use HTTPS. For Cloudflare R2, use its private S3 endpoint, `auto` region and a dedicated private bucket. No public URL/ACL environment option exists.

Keep bucket public access/CDN access disabled; grant application credentials only the read/write/delete permissions needed for this private bucket. The application rejects a bucket name shared with configured Media, does not set public object ACLs and never creates public download URLs. Deployment operators must verify the actual bucket policy directly: storage configuration alone cannot prove that a separately administered bucket is private.

Keep production `EMAIL_PROVIDER`/Resend configured to send notifications. The notification links to `/admin/collections/form-submissions/<id>` and lists filenames. It sends no email attachments. Email recipients who need downloads must have Admin or explicitly granted Form Submissions access. A Pages/Forms grant or read-only dependency is insufficient.

## Cleanup and retention

Schedule `pnpm cleanup:form-attachments` hourly in a trusted Node 22 application runtime with access to the same MongoDB and private storage. It is a maintenance CLI, not a public cleanup endpoint. It checks references, processes up to 100 candidates and prints only counts. Run again when scanned reaches 100; alert on a nonzero failure count/exit code. MongoDB transactions and installed unique attachment/receipt indexes are required.

Abandoned, removed and failed files expire after 24 hours. Capture failure retains a valid pending upload for retry; accepted files stay for the submission lifetime, including trash. Permanent deletion queues file removal. Failed external deletions retain a deleting record and retry on a later invocation. Accepted reference checks are revisited daily so a failed deletion-hook update cannot leave permanent orphans. Do not apply a bucket-wide 24-hour lifecycle policy: that would also delete accepted files.

Back up private objects and submission/attachment metadata together. Restoring database records without their corresponding objects produces unavailable downloads; hash/size mismatches also fail closed. UUID storage keys, original names and ownership metadata must stay consistent.

## Verification boundary

Local evidence uses disposable MongoDB, owner-only disk and synthetic S3 command/stream tests. Both real browser journeys verify file authoring, upload, changed-question preservation, idempotent capture, anonymous denial, authenticated binary download and disabled preview. Actual hosted private-bucket policy, deployed WAF/upload limits, production scheduling and live email delivery remain deployment acceptance tasks.

Content signature checks are not malware scanning. No antivirus/quarantine integration is provided by this bounded increment; files are untrusted downloads and are never rendered inline. Applications that require scanned documents need an explicit scanning/quarantine integration before claiming that guarantee. In-memory upload throttling is defense in depth for one process; coordinated production enforcement belongs in the existing deployment abuse-control milestone.
