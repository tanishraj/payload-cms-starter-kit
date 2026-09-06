# Local Media Same-Origin Normalization Design

## Problem

Payload is configured with the canonical application `serverURL`, so populated local-disk Media
relationships can expose an absolute URL such as
`http://localhost:3000/api/media/file/Logo.avif`. Next.js then treats that URL as remote, while the
image configuration intentionally allows local Payload media through `localPatterns` and reserves
`remotePatterns` for the configured public S3 origin.

The reference SNMIH project avoids the failure because its populated local Media URLs remain
root-relative. Removing this repository's canonical `serverURL` would weaken the existing runtime,
preview, CORS, and CSRF contract.

## Design

Keep the current Payload and Next.js configuration. At the shared Media URL boundary,
`getMediaAbsoluteUrl` will recognize an absolute HTTP(S) URL whose origin matches the configured
application origin and whose path is under `/api/media/file/`. It will return the equivalent
root-relative path, preserving its query string and fragment.

All other behavior remains unchanged:

- existing root-relative Media paths remain root-relative;
- R2 and other external HTTP(S) Media URLs remain absolute;
- non-HTTP relative values continue to resolve against the application origin;
- image dimensions, alternative-text fallback, and external-media version parameters remain
  unchanged.

This normalization belongs in `src/lib/media.ts` because every image consumer, including
`SiteLogo`, already passes through that helper. Adding a logo-only exception or a development-only
`localhost` remote pattern would duplicate policy and make Next.js fetch its own application as a
remote image.

## Validation

Extend the focused Media URL integration tests to prove:

1. an absolute same-origin Payload Media URL becomes `/api/media/file/...`;
2. its query string and fragment are preserved;
3. an absolute same-origin URL outside the Payload Media endpoint is not rewritten;
4. external CDN/R2 URLs remain absolute;
5. existing root-relative and versioning contracts still pass.

Run the focused Media URL and Next image configuration tests, TypeScript validation, and the
project-context update/check loop. No database migration, generated Payload type update, or Admin
import-map update is required.
