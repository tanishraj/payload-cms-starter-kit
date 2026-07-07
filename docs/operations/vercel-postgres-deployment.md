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

## Verification

1. Create or attach a Postgres database in Vercel.
2. Set `DATABASE_PROVIDER=postgres`.
3. Set `POSTGRES_URL`.
4. Set `PAYLOAD_SECRET`.
5. If email is required, set the Resend variables.
6. Deploy and verify the app boots without runtime configuration errors.
