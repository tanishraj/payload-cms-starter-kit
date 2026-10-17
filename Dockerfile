# syntax=docker/dockerfile:1.10

FROM node:22.17.0-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.17.0 --activate

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SERVER_URL
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

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD HOSTNAME="0.0.0.0" node server.js
