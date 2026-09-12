# Production database backups

The optional `Production Database Backup` GitHub workflow runs daily at 02:00 UTC and supports manual dispatch. It is skipped until the repository variable `ENABLE_PROD_DB_BACKUPS` is `true`. Shipping this workflow does not enable or run backups.

Create a `production-backup` GitHub environment. Configure `PROD_DB_BACKUP_DATABASE` (explicit MongoDB database name) and `PROD_DB_BACKUP_BUCKET` (dedicated private R2 bucket) as variables. Optional `PROD_DB_BACKUP_PREFIX` defaults to `prod-db-backup/`; optional `PROD_DB_BACKUP_RETENTION_COUNT` defaults to 30 (1–3650 supported). Prefixes must be nonempty scoped paths ending in `/`. Use a distinct prefix per database/site. Keep the bucket private, with no public domain attached.

Environment secrets: `PROD_MONGODB_URI`, `R2_BACKUP_ENDPOINT`, `R2_BACKUP_ACCESS_KEY_ID`, and `R2_BACKUP_SECRET_ACCESS_KEY`. The endpoint must be an HTTPS Cloudflare R2 S3 origin. Use database read/backup credentials and R2 credentials scoped to the dedicated backup bucket. The workflow's database tools match the existing SNMIH workflow; its Node/pnpm and action revisions match starter CI.

`pnpm backup:prod-db` runs the same job locally with explicitly configured environment values (dotenv supported). It requires `mongodump` and the AWS CLI. It creates a gzip archive in a private temporary directory, computes a SHA-256 sidecar, uploads both objects, checks the remote archive length and stored checksum metadata, and only then rotates archives and paired/orphaned checksums within the configured prefix. Temporary files are removed in a finally block. The metadata check confirms upload bookkeeping; restore drills should also download the archive and verify its bytes against the sidecar.

This is a database-only logical dump, not an S3 media backup or a point-in-time/oplog backup. Schedule during a quiet period if cross-collection consistency matters. Media bucket recovery needs its own storage policy.

For restore drills, download a selected archive and its `.sha256` sidecar into a private local directory. Run `shasum -a 256 -c <archive>.sha256` there, then restore to an isolated test database with `mongorestore --uri=<test-uri> --archive=<archive> --gzip --nsFrom='<source-db>.*' --nsTo='<test-db>.*'`. Validate content and references before considering any production restore. Never point a drill at production.
