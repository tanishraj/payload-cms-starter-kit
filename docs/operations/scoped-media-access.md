# Section-owned Media

Admins manage the whole Media library. A Site Manager needs the Media feature and
an active assigned root Page to upload or edit assets in that section. Pages-only
editors can select permitted published shared assets without Media authoring access.

## Editor workflow

1. Open Media, choose Create New and upload a supported public website asset.
2. Enter descriptive alt text for images and a useful title.
3. Choose Website section. With exactly one assigned section, leaving it blank
   assigns that section when saved. With several sections, choose one explicitly.
4. Save a draft or publish through Payload's existing controls. In a Page upload
   field, use Choose from existing to reuse an allowed asset.

Published assets without a Website section are Admin-managed shared resources.
Managers can select them but cannot change them or restore their history. Existing
unassigned records stay shared; reading a record never assigns ownership. Admins
review legacy ownership deliberately. Only Admins can reassign an existing asset.

## Safe changes and privacy

Managers can edit ordinary metadata on their own assets. File replacement and
trash operations check existing supported usage sources, including references
outside the manager's section. When an asset is in use, upload a separate file and
change the permitted Page reference, or ask an Admin to review replacement. Native
Media history restores ordinary metadata while retaining the current upload file;
it does not recover a deleted historical binary. Permanent deletion remains Admin-only.

Detailed usage records are Admin-only. Managers receive a generic explanation
without other sections' titles or locations. Internal notes and governance fields
on shared assets are hidden; presentation fields remain available for selection.
Action Queue and Audit Log source rows follow current Media ownership and existing
feature grants. Request-local ownership lookups are invalidated after Media writes
so native document permission checks can see newly created assets.

Media holds **public website files**. Published file bytes remain publicly served,
including when a visitor has an editor cookie; section access restricts authoring
and metadata selection. Do not put confidential documents here. Form Attachments
remain a separate private store with authenticated submission-scoped downloads.
Public S3 storage retains its existing public storage contract.

## Rollout and limits

No environment variable, data backfill or guessed ownership migration is added.
Review manager feature/root grants and existing assets before client handoff.
The existing 5,000-resource access bound fails closed. Usage detection retains its
existing supported sources and query bounds; it is not a complete graph of all
historical or arbitrary block references. Review Admin usage and the actual site
before replacing a critical shared asset. See [section access](section-scoped-access.md)
and the [Media guide](../guides/media.md).
