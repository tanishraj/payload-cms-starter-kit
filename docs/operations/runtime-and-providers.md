# Runtime And Providers

## Supported Contract

| Concern  | Supported values  | Notes                                                |
| -------- | ----------------- | ---------------------------------------------------- |
| Database | MongoDB           | URL must begin with `mongodb://` or `mongodb+srv://` |
| Email    | `none`, `resend`  | Resend requires API key and from address             |
| Media    | `localDisk`, `s3` | Vercel production rejects local disk                 |

The application validates this contract while loading `src/payload.config.ts` and fails fast on missing or unsupported configuration.

## Environment Variables

| Variable                   | Required           | Purpose                                                            |
| -------------------------- | ------------------ | ------------------------------------------------------------------ |
| `MONGODB_URI`              | yes                | MongoDB connection string                                          |
| `PAYLOAD_SECRET`           | yes                | Unique authentication/encryption secret; production requires 32+ non-placeholder characters |
| `NEXT_PUBLIC_SERVER_URL`   | production/preview | Absolute site URL used by metadata and live-preview links          |
| `EMAIL_PROVIDER`           | no                 | `none` by default, or `resend`                                     |
| `RESEND_API_KEY`           | with Resend        | Resend API key                                                     |
| `RESEND_FROM_EMAIL`        | with Resend        | Default sender address                                             |
| `RESEND_FROM_NAME`         | no                 | Sender label; defaults to `Website`                                |
| `RESEND_OVERRIDE_TO_EMAIL` | no                 | Redirect every recipient in staging/QA                             |
| `MEDIA_PROVIDER`           | no                 | `localDisk` by default, or `s3`                                    |
| `S3_BUCKET`                | with S3            | Object-storage bucket                                              |
| `S3_ENDPOINT`              | with S3            | S3-compatible HTTPS endpoint                                       |
| `S3_REGION`                | with S3            | Storage region                                                     |
| `S3_ACCESS_KEY_ID`         | with S3            | Storage access key                                                 |
| `S3_SECRET_ACCESS_KEY`     | with S3            | Storage secret                                                     |
| `S3_ACL`                   | no                 | `public-read` default or `private`                                 |
| `S3_FORCE_PATH_STYLE`      | no                 | Boolean, defaults to `true`                                        |
| `S3_CLIENT_UPLOADS`        | no                 | Boolean, defaults to `false`; requires bucket CORS for browser PUT |
| `MEDIA_RECONCILE_TOKEN`    | for reconciliation | Secret accepted as Bearer or `x-media-reconcile-token`             |
| `SHADCNBLOCKS_API_KEY`     | optional tooling   | Used only by external Shadcn Blocks tooling, not the CMS runtime   |

Boolean variables accept `true/false`, `1/0`, `yes/no`, or `on/off` case-insensitively.

## Local Development

Use `MEDIA_PROVIDER=localDisk` and either `docker compose up -d mongo` or another reachable MongoDB. Do not leave the placeholder S3 credentials active in a copied `.env`.

## Production Docker Image

`next.config.ts` enables standalone output, and the supplied Dockerfile packages that traced server as a non-root production image. Build it with:

```bash
docker build -t payload-cms-starter-kit .
```

Run the image with a durable MongoDB connection and `MEDIA_PROVIDER=s3` plus the required S3-compatible provider variables. The image intentionally has no persistent local-media volume. `docker-compose.yml` remains a local-development workflow; it is not a production deployment stack.

## S3-Compatible Storage

The Payload S3 plugin attaches only to `media`. Verify endpoint, credentials, bucket ACL, path style, and public/private delivery behavior with the actual provider. Enable client uploads only after adding PUT CORS for the site origin.

Run storage reconciliation after migrations, restores, or suspected bucket drift. See [Media](../guides/media.md).

## Email

`EMAIL_PROVIDER=none` keeps form storage and workflows active without sending email. Resend configuration creates Payload's email adapter. `RESEND_OVERRIDE_TO_EMAIL` is useful for staging but dangerous in production if forgotten because it reroutes all recipients.

## Deployment Notes

- set a unique high-entropy `PAYLOAD_SECRET` per environment; production rejects missing,
  placeholder, and shorter-than-32-character values
- use durable MongoDB and object storage for hosted production
- set `NEXT_PUBLIC_SERVER_URL` to the externally reachable HTTPS origin
- never expose reconciliation or provider secrets to client-side variables
- keep database archives in approved encrypted external storage, never in Git or Docker contexts
- GitHub Actions verifies project context, generated types, TypeScript, lint, integration tests,
  and the production build

## Verification

```bash
pnpm test:int
pnpm build
```

Then sign in, upload an image, publish a Page, submit a Form, and inspect the public route in the target environment.
