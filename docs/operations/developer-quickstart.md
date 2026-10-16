# Developer quickstart

Use this path for local authoring with Payload's native admin and Live Preview.
The application has two roles: Admin and Site Manager. Developer is a setup
responsibility, not another CMS role. No examples are seeded or published by setup.

## 1. Select the toolchain and install

From this repository's root, use Node **22.17.0** (the `.nvmrc`, Docker and CI pin)
and pnpm **11.17.0**. The supported Node range is `>=22.13.0 <23` in `package.json`.
Docker Desktop or Docker Engine with Compose is needed only if you use the supplied
local MongoDB. An existing reachable replica set can be used instead.

```sh
nvm install
nvm use
corepack enable
corepack prepare pnpm@11.17.0 --activate
pnpm install --frozen-lockfile
```

If nvm is not installed, select the pinned Node version with your existing version
manager. If pnpm refuses an unsupported engine, fix Node before installing or running
checks; do not disable the engine guard. Installation does not require email credentials.

## 2. Prepare your local environment without replacing it

Create `.env` only if it does not already exist. This command uses an exclusive
filesystem copy and preserves existing files, including under concurrent runs:

```sh
node -e 'const fs = require("node:fs"); try { fs.copyFileSync(".env.example", ".env", fs.constants.COPYFILE_EXCL); console.log("Created .env; edit local values before starting.") } catch (error) { if (error.code !== "EEXIST") throw error; console.log("Existing .env preserved.") }'
```

Edit `.env` in your editor. Keep secrets out of Git, screenshots and shared logs.
Generate a unique random `PAYLOAD_SECRET` using your password manager (at least
32 characters is a useful default locally and required in production). Replace the
placeholder before creating an account. Never reuse a production secret locally.

| Setting | Local authoring | Production difference |
| --- | --- | --- |
| `MONGODB_URI` | Use the template's loopback `rs0` URI with `directConnection=true` for host-run Next.js. | Use the intended durable replica-set database; never a developer/test database. |
| `PAYLOAD_SECRET` | Replace the placeholder with a unique secret. | At least 32 non-placeholder characters. |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000`; use this same origin in the browser. | Canonical HTTPS origin, also used for cookies, CSRF and preview. |
| `ALLOW_FIRST_ADMIN_CREATION` | Temporarily `true` only for the empty-database bootstrap below. Template is `false`. | Also requires the exact permitted `FIRST_ADMIN_EMAIL`. Disable again after bootstrap. |
| `EMAIL_PROVIDER` | `none`; draft editing needs no email service. | Enable Resend only for workflows that need delivery; configure and test it then. |
| `MEDIA_PROVIDER` | `localDisk`; application process needs directory access. | Vercel and the supplied production image require durable S3 media. |
| `FORM_ATTACHMENTS_PROVIDER` | `localDisk` for local file controls, or `disabled` if unused. | `s3` with a separate private bucket, or `disabled`; localDisk is rejected. |

The complete provider table is in [Runtime and providers](runtime-and-providers.md)
and `.env.example`. Analytics, a public domain, Shadcnblocks tooling credentials
and notification recipients are not required to create a local draft. A selected
but incomplete provider still fails the application's existing configuration checks.
Do not work around that by silently ignoring configuration errors.

Next.js environment precedence applies: exported process values, `.env.development.local`,
`.env.local`, `.env.development`, then `.env` for local development. Production uses
its corresponding production files. Existing higher-priority values can override
what you just edited. `.env.atlas.local` is not loaded; use `MONGODB_URI` and local Docker.

## 3. Start MongoDB and check prerequisites

```sh
docker compose up -d --wait mongo
pnpm setup:check
```

If the only failure is **First Admin**, follow step 4 to enable the temporary
bootstrap flag, create the account and close bootstrap. Do not reset the database.

Compose waits for a writable `rs0` primary. It binds MongoDB to loopback port 27017
and keeps its data in the existing version-specific volume. Do not delete volumes
to fix setup. If MongoDB is already running in the project's Docker container, reuse
it. For an existing replica set, configure `MONGODB_URI` and skip the Docker command.
If you run the application itself inside Compose, use its configured container URI;
the host-run quickstart above uses the template's loopback URI.

`setup:check` is an operator-only CLI, not a public endpoint or an automatic setup
wizard. It does not start Docker, initialize a replica set, create directories,
write files, load Payload, create indexes/accounts/content, or send email.
It uses Next's environment loader and the same pure runtime/provider validators
as startup. It reads MongoDB `hello` and a Users `_id` only; no account details are
printed. Network operations have bounded driver timeouts and the client closes.

- **PASS** means the named check succeeded: supported toolchain, configuration,
  reachable replica-set primary/session capability, or filesystem access metadata.
- **FAIL** identifies a failed prerequisite, its affected task and a concrete next
  step. Correct it and rerun. Runtime validation reports its first failure;
  database/storage checks are not attempted until configuration is valid.
- **MANUAL** means unverified work, not success. Sign-in, authenticated preview,
  real upload operations, remote bucket permissions and launch remain manual.

Exit code **0** means no checked prerequisite failed; **1** means failure or an
incomplete check execution; **2** means unsupported arguments. Manual items do not
change the exit code. The check never prints configured values or raw validator,
filesystem, dotenv or driver errors. Filesystem checks inspect the directory or
nearest existing parent, without a probe write; they cannot prove quotas, free
space, races or actual upload success. MongoDB capability is not a transaction
write/commit test or proof of all application database permissions.

## 4. Create the first Admin, then close bootstrap

On a genuinely new database, temporarily set `ALLOW_FIRST_ADMIN_CREATION=true`.
Then:

```sh
pnpm dev
```

Open **http://localhost:3000/admin** (or your configured canonical origin plus
`/admin`). Create the first account through Payload's first-account screen. It
becomes an Admin. The Users collection must be literally empty, including Trash;
setup never deletes accounts to force bootstrap. With existing accounts, sign in
instead. Account recovery belongs to the existing Admin workflow.

After creation, stop the dev server, set `ALLOW_FIRST_ADMIN_CREATION=false` and
restart with `pnpm dev`. Sign in again. Admins create all later Admins and Site
Managers through Users. A Site Manager needs feature grants and applicable section
assignments; onboarding never grants access. Production bootstrap additionally
pins one normalized email; follow the [exact bootstrap runbook](runtime-and-providers.md#first-admin-bootstrap).

## 5. Save and preview one draft

From the dashboard's optional Getting started guide or **Content → Pages**, choose
**Create a page**, enter a unique title and select **Blank page** or the available
landing recipe. Continue into the native editor. Add or edit a supported block,
enter required content and choose **Save Draft**. Wait for the actual saved state.

Open the page's **Live Preview** and confirm that the saved heading appears while
signed in at the configured origin. Check desktop and mobile widths. A blank page
needs a content block before there is content to inspect. Keep the draft unpublished
until you deliberately want it public. Preview is authenticated; opening its URL
without the required session/access must not expose a draft. Creating a page does
not automatically select it as the public homepage. See
[getting started](admin-getting-started.md) and [Pages](../guides/pages.md) for the
ordinary editing and homepage flow. No production domain or email test is needed
for this local draft milestone.

## Troubleshooting

| Symptom | Affected task and concrete fix |
| --- | --- |
| Engine mismatch before checks start | Install/use `.nvmrc` Node and the `packageManager` pin; reinstall with the frozen lockfile. |
| MongoDB connection/read fails | Run `docker compose ps mongo`; confirm the local container is healthy and your intended URI/database/permissions. Host clients need the loopback URI, not `mongo:27017`. Never paste a credential-bearing URI into an issue. |
| MongoDB reachable without replica capability | Wait for Compose health or configure a proper replica set. Standalone MongoDB cannot support Payload's transaction workflow. Do not reset an existing data volume. |
| Empty Users and bootstrap disabled | Enable the flag temporarily, restart and create the first Admin; disable and restart immediately afterward. Existing or trashed accounts require sign-in/recovery instead. |
| Configuration changes seem ignored | Check exported values and Next's higher-priority local environment files, then restart. No Atlas-specific variable is needed. |
| Media/attachment access fails | Check ownership and permissions of `media/`, `.private/form-attachments/` and their parents for the application user. Text drafting can remain independent; real uploads need a working provider. |
| Preview missing, rejected or stale | Confirm the dev server is running at the canonical origin, sign in there, verify page/section access, save required fields and reload preview. Check browser/server diagnostics locally without sharing secrets. |
| Port 3000 already occupied | Identify the existing process; reuse or stop it deliberately. Keep browser origin and `NEXT_PUBLIC_SERVER_URL` consistent if you choose another port. |

## Production launch is a separate milestone

`pnpm setup:check --production` loads Next's production environment and applies
production runtime/provider validation without starting the app or weakening it.
Use it only against the intended environment: it makes the same read-only database
requests there. It is a configuration/capability check, not deployment approval.
Do not fix a production check by switching its runtime to development.

Before launch, use the [clone checklist](starter-clone-checklist.md),
[runtime/provider runbook](runtime-and-providers.md) and
[MongoDB deployment guide](mongodb-deployment.md). Verify canonical HTTPS,
durable media, private attachment access if enabled, bootstrap disabled, intended
homepage/navigation/identity, applicable SEO/legal/consent, actual notification
delivery if enabled, backups/restore and deployment verification. No checkbox in
this guide automatically publishes content or certifies those operations.
