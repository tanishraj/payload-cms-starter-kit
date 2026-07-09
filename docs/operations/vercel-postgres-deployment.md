# Vercel Postgres Deployment

## Supported Profile

- local development: `SQLite`
- Vercel preview: `Postgres`
- Vercel production: `Postgres`

## Required Environment Variables

- `DATABASE_PROVIDER=postgres`
- `POSTGRES_URL`
- `PAYLOAD_SECRET`

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

## Media Limitation

This starter's database contract supports Vercel deployments, but its default `media` collection still writes to local disk. That is acceptable for local development and test runs. It is not a durable production upload strategy on Vercel.

The current starter contract rejects Vercel production boot until a durable media adapter is added. That fail-fast behavior is intentional.

## Verification

1. Create or attach a Postgres database in Vercel.
2. Set `DATABASE_PROVIDER=postgres`.
3. Set `POSTGRES_URL`.
4. Set `PAYLOAD_SECRET`.
5. If email is required, set the Resend variables.
6. Add and verify a durable media adapter before allowing editor-managed uploads.
7. Deploy and verify the app boots without runtime configuration errors.
