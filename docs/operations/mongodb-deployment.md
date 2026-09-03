# MongoDB Deployment

For the complete environment matrix, email/media providers, and deployment boundaries, see [Runtime And Providers](./runtime-and-providers.md).

## Supported Profile

- local development: `MongoDB`
- Vercel preview: `MongoDB`
- Vercel production: `MongoDB`

## Required Environment Variables

- `MONGODB_URI`
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

## Local Development

1. Copy `.env.example` to `.env`.
2. Start MongoDB with `docker compose up -d --wait mongo`.
3. Keep
   `MONGODB_URI=mongodb://127.0.0.1:27017/payload-cms-starter-kit?replicaSet=rs0&directConnection=true`
   when running the app from your host machine.
4. Inside Compose, use
   `mongodb://mongo:27017/payload-cms-starter-kit?replicaSet=rs0&directConnection=true`.

Docker Compose pins local MongoDB 8.0.29 and uses the version-specific
`mongo_data_8_0` volume. Keep the local server on the same MongoDB release as the hosted source
during dump and restore workflows. Atlas snapshots from the `test` database must be restored into
`payload-cms-starter-kit` so the existing local `MONGODB_URI` remains valid. Compose initializes a
single `rs0` member advertising `mongo:27017`, then reports healthy only when it is writable PRIMARY.
Host clients therefore need `directConnection=true` even though they connect through the published
loopback port. The Payload service's healthy dependency controls initial ordering, not recovery from
a later MongoDB outage.

Diagnose local health without rendering environment configuration:

```bash
docker compose ps mongo
docker compose exec -T mongo mongosh --quiet --host mongo:27017 --eval 'const ok = db.adminCommand({ ping: 1 }).ok === 1 && rs.status().myState === 1; quit(ok ? 0 : 1)'
```

MongoDB is published only on `127.0.0.1:27017`; it is not exposed on external host interfaces.

## Hosted Deployment Notes

- Use a durable hosted MongoDB cluster for preview and production.
- Keep preview and production on separate databases unless your workflow explicitly requires shared content.
- Do not deploy this starter to Vercel with `MEDIA_PROVIDER=localDisk` if editors will upload assets.
- Use `MEDIA_PROVIDER=s3` with a durable S3-compatible provider before enabling production uploads.
- Media uploads remain server-side so format policy runs before persistence. Vercel's upstream
  request-body limit can therefore be lower than the application's 10 MiB upload cap and will win;
  use a deployment path that supports the required server request size rather than browser-to-bucket
  PUTs.

## Verification

1. Confirm the hosted MongoDB cluster is reachable from the deployment environment.
2. Set `MONGODB_URI`.
3. Set `PAYLOAD_SECRET`.
4. Set `MEDIA_PROVIDER=s3`.
5. Set the S3-compatible storage variables for your bucket.
6. If email is required, set the Resend variables.
7. Deploy and verify the app boots without runtime configuration errors.
8. Upload a test image in Payload admin and confirm the object appears in the bucket.
