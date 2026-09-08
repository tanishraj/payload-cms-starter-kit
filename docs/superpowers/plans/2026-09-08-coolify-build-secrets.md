# Coolify Build Secrets Implementation Plan

> **For agentic workers:** Use executing-plans for inline execution; independently review Coolify compatibility.

**Goal:** Build the existing standalone image with either a mounted dotenv secret or Coolify-injected BuildKit secret environment variables.

**Architecture:** Keep the existing image stages and public build argument. Source `payload_build_env` when mounted, otherwise explicitly mount the individual secrets supplied by Coolify using frontend 1.10. Fail before Next.js starts when either database URI or Payload secret is missing; retain application validation for all provider settings.

**Tech Stack:** Docker BuildKit, POSIX shell, Node 22.17.0, pnpm 11.17.0, Vitest.

## Global Constraints

- Do not copy secrets into the build context, add secret ARG/ENV instructions, or print credential values.
- Preserve the existing file-secret build and non-root standalone runner.
- Keep preview resources scoped to test data; public PR deployments remain disabled.

### Task 1: Support both build-secret sources

**Files:** `Dockerfile`, `tests/int/docker-standalone.int.spec.ts`, `docs/operations/runtime-and-providers.md`, `.agents/skills/project-context/references/architecture.md`.

**Interface:** `/run/secrets/payload_build_env` supplies shell-compatible dotenv values when present; otherwise `MONGODB_URI` and `PAYLOAD_SECRET` must already exist in the build process environment.

- [x] Exercise the actual build shell with temporary non-secret fixtures for file, environment, absent URI, and absent Payload secret cases.
- [x] Replace the required mount and unconditional source with:

```dockerfile
RUN --mount=type=secret,id=payload_build_env \
  --mount=type=secret,id=MONGODB_URI,env=MONGODB_URI \
  --mount=type=secret,id=PAYLOAD_SECRET,env=PAYLOAD_SECRET \
  --mount=type=secret,id=NEXT_PUBLIC_SERVER_URL,env=PAYLOAD_BUILD_SERVER_URL \
  --mount=type=secret,id=MEDIA_PROVIDER,env=MEDIA_PROVIDER \
  --mount=type=secret,id=S3_BUCKET,env=S3_BUCKET \
  --mount=type=secret,id=S3_ENDPOINT,env=S3_ENDPOINT \
  --mount=type=secret,id=S3_REGION,env=S3_REGION \
  --mount=type=secret,id=S3_ACCESS_KEY_ID,env=S3_ACCESS_KEY_ID \
  --mount=type=secret,id=S3_SECRET_ACCESS_KEY,env=S3_SECRET_ACCESS_KEY \
  --mount=type=secret,id=S3_PUBLIC_URL,env=S3_PUBLIC_URL \
  --mount=type=secret,id=S3_ACL,env=S3_ACL \
  --mount=type=secret,id=S3_FORCE_PATH_STYLE,env=S3_FORCE_PATH_STYLE \
  --mount=type=secret,id=S3_CLIENT_UPLOADS,env=S3_CLIENT_UPLOADS \
  --mount=type=secret,id=EMAIL_PROVIDER,env=EMAIL_PROVIDER \
  --mount=type=secret,id=RESEND_API_KEY,env=RESEND_API_KEY \
  --mount=type=secret,id=RESEND_FROM_EMAIL,env=RESEND_FROM_EMAIL \
  --mount=type=secret,id=RESEND_FROM_NAME,env=RESEND_FROM_NAME \
  --mount=type=secret,id=RESEND_OVERRIDE_TO_EMAIL,env=RESEND_OVERRIDE_TO_EMAIL \
  --mount=type=secret,id=ALLOW_PRODUCTION_EMAIL_OVERRIDE,env=ALLOW_PRODUCTION_EMAIL_OVERRIDE \
  --mount=type=secret,id=ALLOW_FIRST_ADMIN_CREATION,env=ALLOW_FIRST_ADMIN_CREATION \
  --mount=type=secret,id=FIRST_ADMIN_EMAIL,env=FIRST_ADMIN_EMAIL \
  --mount=type=secret,id=MEDIA_RECONCILE_TOKEN,env=MEDIA_RECONCILE_TOKEN \
  set -eu; \
  export NEXT_PUBLIC_SERVER_URL="${PAYLOAD_BUILD_SERVER_URL:-${NEXT_PUBLIC_SERVER_URL:-}}"; \
  if [ -f /run/secrets/payload_build_env ]; then \
    set -a; . /run/secrets/payload_build_env; set +a; \
  fi; \
  : "${MONGODB_URI:?MONGODB_URI build secret is required}"; \
  : "${PAYLOAD_SECRET:?PAYLOAD_SECRET build secret is required}"; \
  export NEXT_PUBLIC_SERVER_URL && \
  pnpm run build
```

- [x] Run `pnpm exec vitest run tests/int/docker-standalone.int.spec.ts tests/int/toolchain-contract.int.spec.ts` and require all cases to pass.
- [x] Document the Coolify Dockerfile build pack, BuildKit secrets setting, build/runtime flags, HTTPS origin and separate preview origin.
- [ ] Run `pnpm project-context:update`, inspect the diff and change-impact map, then `pnpm project-context:check`.
- [ ] Run `pnpm lint`, `pnpm exec tsc --noEmit`, and the isolated `pnpm verify:docker-image` build where Docker is available.
- [ ] Publish the reviewed change to a branch, select that branch in the test application if needed, and verify a Coolify deployment before reporting it live.
