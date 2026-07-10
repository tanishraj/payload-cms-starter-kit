# Vercel Postgres Deployment

## Supported Profile

- local development: `SQLite`
- Vercel preview: `Postgres`
- Vercel production: `Postgres`

## Required Environment Variables

- `DATABASE_PROVIDER=postgres`
- `POSTGRES_URL`
- `PAYLOAD_SECRET`
- `MEDIA_PROVIDER=s3`
- `S3_BUCKET`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

## Optional Email Variables

- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `RESEND_OVERRIDE_TO_EMAIL`

## Deployment Notes

- Do not deploy this starter to Vercel with `DATABASE_PROVIDER=sqlite`.
- Local clones should keep `DATABASE_PROVIDER=sqlite` unless they are being prepared for hosted deployment.
- Preview and production should both use the same Postgres-backed provider mode.

## Media Contract

This starter supports Vercel production only when `media` is moved off local disk. The shipped integration path is `MEDIA_PROVIDER=s3`, which works for IDrive e2 and other S3-compatible object storage providers.

If `MEDIA_PROVIDER=localDisk` is left enabled for Vercel production, the starter rejects boot intentionally.

If you expect uploads larger than Vercel's server upload limit, set `S3_CLIENT_UPLOADS=true` and allow `PUT` CORS for your site origin on the bucket.

## Verification

1. Create or attach a Postgres database in Vercel.
2. Set `DATABASE_PROVIDER=postgres`.
3. Set `POSTGRES_URL`.
4. Set `PAYLOAD_SECRET`.
5. Set `MEDIA_PROVIDER=s3`.
6. Set the S3-compatible storage variables for your bucket.
7. If email is required, set the Resend variables.
8. Deploy and verify the app boots without runtime configuration errors.
9. Upload a test image in Payload admin and confirm the object appears in the bucket.
