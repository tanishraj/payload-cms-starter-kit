# Runtime And Providers

## Supported Contract

| Concern  | Supported values  | Notes                                                    |
| -------- | ----------------- | -------------------------------------------------------- |
| Node.js  | `22.17.0`         | Supported engine range is `>=22.13.0 <23`; CI matches it |
| pnpm     | `11.17.0`         | Corepack uses the exact package-manager pin              |
| Database | MongoDB           | URL must begin with `mongodb://` or `mongodb+srv://`     |
| Email    | `none`, `resend`  | Resend requires API key and from address                 |
| Media    | `localDisk`, `s3` | Vercel production rejects local disk                     |

Payload startup validates the runtime and provider configuration while loading
`src/payload.config.ts` and fails fast on missing or unsupported environment values. The Node and
pnpm toolchain contract is declared by `package.json` and `.nvmrc`, then selected explicitly by
Docker and CI.

Payload's REST API and Admin remain enabled. GraphQL is disabled because a fresh repository scan found
no application query or mutation consumer. That evidence covers this repository only; confirm unknown
external consumers before changing an already deployed application's API contract.

## Environment Variables

| Variable                          | Required           | Purpose                                                                                       |
| --------------------------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| `MONGODB_URI`                     | yes                | MongoDB connection string                                                                     |
| `PAYLOAD_SECRET`                  | yes                | Unique authentication/encryption secret; production requires 32+ non-placeholder characters   |
| `NEXT_PUBLIC_SERVER_URL`          | production         | Canonical HTTPS application origin; local development defaults to `http://localhost:3000`     |
| `ALLOW_FIRST_ADMIN_CREATION`      | no                 | Strict boolean; defaults off in production and on outside production                          |
| `FIRST_ADMIN_EMAIL`               | prod. bootstrap    | Normalized email permitted for the one-time anonymous production bootstrap                    |
| `EMAIL_PROVIDER`                  | no                 | `none` by default, or `resend`                                                                |
| `RESEND_API_KEY`                  | with Resend        | Resend API key                                                                                |
| `RESEND_FROM_EMAIL`               | with Resend        | Default sender address                                                                        |
| `RESEND_FROM_NAME`                | no                 | Sender label; defaults to `Website`                                                           |
| `RESEND_OVERRIDE_TO_EMAIL`        | no                 | Redirect every recipient in staging/QA; blocked in production without the explicit allow flag |
| `ALLOW_PRODUCTION_EMAIL_OVERRIDE` | no                 | Strict boolean acknowledgement required for a production recipient override                   |
| `MEDIA_PROVIDER`                  | no                 | `localDisk` by default, or `s3`                                                               |
| `S3_BUCKET`                       | with S3            | Object-storage bucket                                                                         |
| `S3_ENDPOINT`                     | with S3            | S3-compatible HTTPS endpoint                                                                  |
| `S3_REGION`                       | with S3            | Storage region                                                                                |
| `S3_ACCESS_KEY_ID`                | with S3            | Storage access key                                                                            |
| `S3_SECRET_ACCESS_KEY`            | with S3            | Storage secret                                                                                |
| `S3_PUBLIC_URL`                   | no                 | HTTPS origin for direct public/CDN delivery                                                   |
| `S3_ACL`                          | no                 | `none` default, `public-read`, or `private`                                                   |
| `S3_FORCE_PATH_STYLE`             | no                 | Boolean, defaults to `true`                                                                   |
| `MEDIA_RECONCILE_TOKEN`           | for reconciliation | Secret accepted as Bearer or `x-media-reconcile-token`                                        |
| `SHADCNBLOCKS_API_KEY`            | optional tooling   | Used only by external Shadcn Blocks tooling, not the CMS runtime                              |

Boolean variables accept `true/false`, `1/0`, `yes/no`, or `on/off` case-insensitively.

`src/config/runtime.server.ts` is the server-only, read-once owner of secret-bearing runtime state;
`src/config/runtime.ts` contains only the pure parser and types so validation can be tested without
eager environment reads. Browser-capable URL helpers consume only the canonical public origin from
`src/config/publicOrigin.ts`, which reads no application configuration other than
`NEXT_PUBLIC_SERVER_URL`. Both paths use the same pure origin validator and normalization rules.
Production accepts HTTPS only. Outside production, HTTPS remains valid and HTTP is accepted only for
`localhost`, `127.0.0.1`, or `::1`. Payload uses this one origin for `serverURL`, CORS, CSRF,
live-preview links, and redirect-map loading; an incoming request Host is never used as a server-side
fetch target.

## Local Development

Use `MEDIA_PROVIDER=localDisk` and start the pinned replica with
`docker compose up -d --wait mongo`, or use another reachable MongoDB replica set. A host process
uses `mongodb://127.0.0.1:27017/payload-cms-starter-kit?replicaSet=rs0&directConnection=true`.
The Compose Payload service instead uses
`mongodb://mongo:27017/payload-cms-starter-kit?replicaSet=rs0&directConnection=true`, because the
replica advertises `mongo:27017` inside the Compose network. Compose's
`depends_on`/`service_healthy` condition covers initial startup ordering only; the application must
still handle a later MongoDB outage. Do not leave placeholder S3 credentials active in a copied
`.env`.

### First Admin Bootstrap

Anonymous user creation is permitted only when the Users collection is literally empty, including
trashed records, and `ALLOW_FIRST_ADMIN_CREATION=true`. The runtime default is `true` outside
production and `false` in production, while `.env.example` chooses the safer explicit `false`
value. Production additionally requires `FIRST_ADMIN_EMAIL`; the submitted address must match it
after trimming and case normalization. Payload's unique email index allows only one of two raced
requests for that pinned address to win. Outside production, `FIRST_ADMIN_EMAIL` is ignored and the
bootstrap policy remains flag-only.

For a new environment:

1. Confirm that the target Users collection is empty and that the database is the intended environment.
2. Set `ALLOW_FIRST_ADMIN_CREATION=true`; in production, also set `FIRST_ADMIN_EMAIL` to the exact
   account address. Deploy or restart the application.
3. Create the first account through Payload Admin; it is normalized to the Admin role.
4. Immediately remove `FIRST_ADMIN_EMAIL`, remove the allow flag or set it to `false`, then deploy
   or restart again.
5. Sign in as that Admin and create all later Admin or Site Manager accounts while authenticated.

Never leave the bootstrap flag enabled as an operational convenience. It does not permit anonymous
creation after a user exists, but immediate removal keeps the production policy explicit.

## Production Docker Image

`next.config.ts` enables standalone output, and the supplied Dockerfile packages that traced server
as a non-root production image. Every stage uses Node `22.17.0`; Corepack activates pnpm `11.17.0`,
and dependency installation uses the frozen lockfile. The dependency stage copies
`pnpm-workspace.yaml` so pnpm applies the repository's explicit lifecycle-build allowlist during the
non-interactive install.

Create a temporary owner-readable-only dotenv file outside the build context. It must contain the
server-only values needed while Next.js builds, for example:

```dotenv
MONGODB_URI='mongodb://mongo-or-host:27017/build_test?replicaSet=rs0&directConnection=true'
PAYLOAD_SECRET='replace-with-a-unique-build-only-secret-of-at-least-32-characters'
ALLOW_FIRST_ADMIN_CREATION=false
EMAIL_PROVIDER=none
MEDIA_PROVIDER=localDisk
```

Do not use `.env` as this fixture, commit it, or reuse its build-only secret at runtime. BuildKit
mounts it for the build instruction only; it is not copied into an image layer. Build with:

```bash
DOCKER_BUILDKIT=1 docker build \
  --secret id=payload_build_env,src=/absolute/path/to/payload-build.env \
  --build-arg NEXT_PUBLIC_SERVER_URL=https://www.example.com \
  -t payload-cms-starter-kit .
```

Run the image with a durable MongoDB connection and `MEDIA_PROVIDER=s3` plus the required S3-compatible provider variables. The image intentionally has no persistent local-media volume. `docker-compose.yml` remains a local-development workflow; it is not a production deployment stack.

For repository verification, run `pnpm verify:docker-local` and then
`pnpm verify:docker-image`. Both refuse a pre-existing Compose project named
`payload_hardening_verify` or network named `payload_hardening_verify_default`; image verification
also refuses the pre-existing tag `payload-cms-starter-kit:hardening-verify`. They use only dedicated
`_test` databases, never the default Compose project, `.env`, Atlas, or the developer
`mongo_data_8_0` volume. Normal local use publishes `127.0.0.1:27017`; the verifiers set
`MONGO_HOST_PORT=0` internally so Docker allocates an ephemeral loopback port and an existing local
Mongo listener is never touched. The transaction verifier strictly accepts the discovered binding
only as `127.0.0.1:<port>`. Both disable Compose's automatic default `.env` loading and start only
the Mongo service. Image verification also reserves the Buildx builder
`payload_hardening_verify_builder`, refuses its derived container or state volume if already present,
and connects that current-run builder to the fixed Compose network so the build resolves
`mongo:27017`. The builder grants only `network.host`, and the matching build request uses that
namespace; for this fixed docker-container builder, “host” is its isolated container network, not the
developer host or default Docker network. Cleanup is limited to resources created by the current run,
including removal of that builder before its network.

## S3-Compatible Storage

The Payload S3 plugin attaches only to `media`. Verify endpoint, credentials, optional ACL, path
style, and public/private delivery behavior with the actual provider. Blank `S3_ACL` and
`S3_ACL=none` both omit the ACL request field for providers such as Cloudflare R2. Explicit
`public-read` and `private` values remain available for compatible providers.

The `media` collection is a public-marketing-asset trust class. It accepts only AVIF, GIF, JPEG,
PNG, WebP, and PDF files whose filename extension, declared MIME type, and detected file signature
agree. This format validation rejects disguised or unsupported file types before persistence, but
it is not antivirus or malware scanning. Do not accept arbitrary or private documents through this
collection. Private submissions require a separate collection and private bucket path, with an
external malware-scanning and quarantine workflow in place before document intake is enabled.

When `S3_PUBLIC_URL` is absent, Payload retains its normal file-handler URL behavior. When it is
present, it must be an HTTPS origin without credentials, a path, query, or fragment. Payload emits
encoded file URLs from that origin, and Next.js allows images only from that exact host. Direct
delivery bypasses Payload file access checks: every object in that bucket is public to anyone who
knows its URL, even when the corresponding Payload document is a draft. Never place private or
restricted documents in a public-delivery bucket.

Media uploads are server-only so extension, MIME, and signature validation runs before Payload
generates file data, deletes a replaced local file, writes database state, or invokes storage
adapters. `S3_CLIENT_UPLOADS=true` is rejected during runtime configuration and the S3 plugin never
enables browser PUTs. Payload retains its aborting 10 MiB application limit, with 12 MiB reserved for
server-action multipart overhead. On Vercel, an upstream request-body limit may be lower and rejects
the request before this application cap; deployments needing larger uploads must use an application
hosting path that supports the required server request size, not direct-to-bucket uploads.

Run storage reconciliation after migrations, restores, or suspected bucket drift. See [Media](../guides/media.md).

### Cloudflare R2 Setup

Create one R2 bucket for public website media and a bucket-scoped token with only the object
read/write permissions Payload needs. Configure the application with non-secret values shaped like:

```dotenv
MEDIA_PROVIDER=s3
S3_BUCKET=snmih-media
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_PUBLIC_URL=https://assets.snmih.tanish.im
S3_ACL=none
S3_FORCE_PATH_STYLE=true
```

Set `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` only in `.env` or the deployment environment.
Never paste either secret into documentation, source, browser-visible variables, or support logs.

Before moving `tanish.im` nameservers, inventory all existing DNS records and reproduce their values
in Cloudflare. After the zone is active, connect `assets.snmih.tanish.im` to the R2 bucket, verify its
certificate, and disable the public `r2.dev` development URL.

Create a cache rule scoped only to `assets.snmih.tanish.im` with a 30-day edge TTL and a one-day
browser TTL for eligible successful static responses. Prefer a new filename when replacing an
asset. If an existing object key is overwritten, purge that exact custom-domain URL after the
upload so Cloudflare does not serve the stale object.

Before a production deployment, verify that the deployment environment contains exactly
`S3_PUBLIC_URL=https://assets.snmih.tanish.im`. Changing this value requires a new deployment
because `next.config.ts` reads the public media origin at build time. Next.js image variants use a
one-day minimum optimizer TTL (`86400` seconds).

Accept the rollout only after testing a direct object URL containing encoded spaces, its optimized
`/_next/image` URL, and a repeated request that demonstrates cache reuse. Reject the rollout if any
rendered media URL still resolves through `/api/media/file/**`.

### R2 Migration And Rollback

1. Build the required object manifest from Payload media records, including originals, generated
   sizes, prefixes, and MIME types.
2. Copy all readable objects from the former provider. Use the local recovery image folder only for
   missing objects, preserving exact keys and content types.
3. Compare the R2 object list with the Payload manifest and resolve every required missing object.
4. Verify representative custom-domain URLs, including filenames with spaces or punctuation, and
   confirm a repeated request is cached.
5. Change deployment environment variables and redeploy, then test an authenticated Admin upload,
   public rendering, deletion, and media reconciliation.
6. Crawl every sitemap page and confirm all images load from the custom domain before considering
   the cutover complete.

Do not delete former-provider objects or the local recovery folder during migration. If Admin
uploads, CDN delivery, or the site crawl fails, restore the previous storage environment values and
redeploy. DNS may remain on Cloudflare while the media provider configuration is rolled back.

## Email

`EMAIL_PROVIDER=none` keeps form storage and workflows active without sending email. Resend configuration creates Payload's email adapter. `RESEND_OVERRIDE_TO_EMAIL` is useful for staging but dangerous in production because it reroutes every recipient. Production refuses to start when an override is present unless `ALLOW_PRODUCTION_EMAIL_OVERRIDE=true`; remove both values immediately after the controlled test.

## Deployment Notes

- set a unique high-entropy `PAYLOAD_SECRET` per environment; production rejects missing,
  placeholder, and shorter-than-32-character values
- use durable MongoDB and object storage for hosted production
- set `NEXT_PUBLIC_SERVER_URL` to the externally reachable HTTPS origin
- keep `ALLOW_FIRST_ADMIN_CREATION` unset or `false` and remove `FIRST_ADMIN_EMAIL` after bootstrap
- keep `ALLOW_PRODUCTION_EMAIL_OVERRIDE=false` unless a controlled production delivery test is active
- never expose reconciliation or provider secrets to client-side variables
- keep database archives in approved encrypted external storage, never in Git or Docker contexts
- GitHub Actions uses a frozen dependency installation, requires `pnpm audit:prod` to report zero
  unexcepted high or critical production advisories, and verifies generated Payload type drift,
  TypeScript, lint, integration tests, and the production build
- `pnpm project-context:update` and `pnpm project-context:check` remain local repository-maintenance
  checks and do not run in GitHub Actions

## Verification

```bash
pnpm test:int
pnpm build
pnpm verify:docker-local
pnpm verify:docker-image
```

Then sign in, upload an image, publish a Page, submit a Form, and inspect the public route in the target environment.
