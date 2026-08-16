# Payload Model

## Registered Collections

Registration order in [payload.config.ts](../../../../src/payload.config.ts) is intentional:

1. Content: Pages, Articles, NewsEvents, Reviews, ReusableSections.
2. Taxonomy: Categories (Topics), Tags.
3. Navigation and structure: NavigationLinks, Headers, Footers, OfficeLocations, Redirects, SystemPages.
4. Media: Media, GalleryAlbums.
5. Intake: Forms, FormSubmissions.
6. Administration: WorkQueue (Action Queue), OperationalAuditEvents (Audit Log), Users.

Exact symbols and files are generated in [project-inventory.json](project-inventory.json). All collections receive Trash through [withTrash.ts](../../../../src/plugins/withTrash.ts). Content and structural presets opt into drafts/versions in their own configs; operational records and users are not public content.

## Registered Globals

Nine globals are registered:

1. SiteSettings — identity, contact, address, legal Pages, social destinations.
2. ThemeSettings — preset and system/light/dark scheme.
3. SEOSettings — default titles, metadata, image, robots, verification.
4. AnalyticsSettings — GTM or GA4 configuration.
5. CookieConsentSettings — banner enablement, variants, placement, copy.
6. PageSettings — homepage, header/footer presets, announcement, Page defaults.
7. NewsEventsSettings — archive content, pagination, appearance, empty state, SEO.
8. SearchSettings — up to 12 operator-managed suggested search terms.
9. SystemModeSettings — off, maintenance, or coming-soon behavior and referenced presets.

## Ownership and Relationships

- Pages own hierarchical public routes and composed layouts. Parent validation prevents cycles; hooks populate URL previews, synchronize links, create redirects after path changes, and revalidate caches.
- Articles, NewsEvents, and Reviews own their detail content, taxonomy, SEO, editorial state, and preview behavior.
- ReusableSections own shared block stacks. Direct recursive selection is excluded; renderers stop nesting after depth 10.
- NavigationLinks provide reusable destinations and page-synchronized records. Headers and Footers provide versioned shell presets.
- SystemPages pair one type with its matching block and are referenced from system modes.
- Media owns governed uploads, alt requirements, usage detection, deletion guards, storage health, queue sync, and audit events. GalleryAlbums own ordered reusable image sets.
- Forms define general, lead, and review-intent inputs and notifications. FormSubmissions own immutable submitted data plus operational state, activity, assignment, and optional Review promotion.
- WorkQueue stores deduplicated actionable conditions. OperationalAuditEvents stores selected immutable operational history. Users own authentication, roles, capabilities, and overrides.

## Editorial Governance

Roles are Admin, Site Manager, and Content Manager. Capabilities control visibility, management, publication, settings, queue/audit access, and workflow enforcement.

Governed content uses `draft`, `in_review`, `scheduled`, `published`, and `reverted`. Scheduled state records intent but does not run an automatic publisher. Open or blocked approval/publish-issue queue items prevent publishing; in-progress items do not. Publishing stamps actor and time metadata.

Read [adminCapabilities.ts](../../../../src/access/adminCapabilities.ts), [editorialRoles.ts](../../../../src/access/editorialRoles.ts), [enforceEditorialWorkflow.ts](../../../../src/hooks/enforceEditorialWorkflow.ts), [syncWorkflowStateToWorkQueue.ts](../../../../src/hooks/syncWorkflowStateToWorkQueue.ts), and the [editorial governance runbook](../../../../docs/operations/editorial-governance.md) together before changing this model.

## Shared Fields and Hook Safety

- [bodyEditorConfig.ts](../../../../src/fields/bodyEditorConfig.ts) defines the writing-focused Lexical editor for Article and News/Event bodies.
- [buildSEOFields.ts](../../../../src/fields/buildSEOFields.ts) defines reusable route SEO controls.
- [cmsLinkFields.ts](../../../../src/fields/cmsLinkFields.ts) defines reusable Navigation Link relationships.

Payload Local API calls bypass access by default. Use `overrideAccess: false` when acting for a user. Pass `req` into nested operations so they share transactions. Use request context flags when a hook writes data that could trigger itself. Run `pnpm generate:types` after schema changes and keep [payload-types.ts](../../../../src/payload-types.ts) synchronized.
