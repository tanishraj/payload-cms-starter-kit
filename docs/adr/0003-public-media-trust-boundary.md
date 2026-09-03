# ADR 0003: Public Media Trust Boundary

- Status: Accepted
- Date: 2026-09-03

## Context

When `S3_PUBLIC_URL` is configured, Media objects are delivered directly from a public
S3-compatible origin such as Cloudflare R2. Those requests bypass Payload field and collection
access. Filename extensions and browser-declared MIME types are also untrusted and cannot establish
the uploaded format on their own.

## Decision

The Media collection is for public-safe marketing assets only. It accepts AVIF, GIF, JPEG, PNG,
WebP, and PDF. Server-side uploads validate a non-empty binary before Payload file generation or
replacement cleanup and require the normalized extension, declared MIME type, and detected content
signature to agree. PDF detection requires the `%PDF-` signature. S3 browser uploads are disabled so
the collection hook cannot be bypassed.

Direct public-origin delivery is permitted for this trust class. Private submissions or arbitrary
documents require a separate collection and private bucket path. Format validation is not malware
scanning; deployments that accept arbitrary documents must add external scanning and quarantine
before release.

Rejected alternatives were treating the shared Media collection or bucket as private, relying on
extension or declared MIME alone, enabling direct browser-to-S3 uploads, accepting active formats
such as SVG/HTML/XML/JavaScript or macro-enabled documents, and describing signature checks as
antivirus protection.

## Consequences

Editors can upload only the approved formats through Payload, and invalid create or replacement
files fail before storage side effects. Metadata-only updates do not re-read an existing binary.
Public R2 URLs remain suitable only for assets whose contents and metadata may be disclosed to
anyone who knows the object URL.

## Verification

- `tests/int/media-upload-policy.int.spec.ts` covers valid signatures and rejects empty, disguised,
  mismatched, and unsupported files without exposing bytes in errors.
- `tests/int/media.int.spec.ts` proves create and replacement validation occurs before Payload file
  handling while metadata-only updates remain allowed.
- `tests/int/media-storage.int.spec.ts`, `tests/int/provider-selection.int.spec.ts`, and
  `tests/int/runtime-config.int.spec.ts` cover direct public-origin URLs, R2/S3 provider policy, and
  the prohibition on browser uploads.
