# Payload Model

## Registered Collections

Registration order in [payload.config.ts](../../../../src/payload.config.ts) is intentional:

1. Editorial collections: Pages and Articles under Content; NewsEvents and NewsEventClassifications under News & Events; Reviews and ReusableSections under Content.
2. Taxonomy: Categories (Topics), Tags.
3. Navigation and structure: NavigationLinks, Headers, Footers, OfficeLocations, Redirects, SystemPages.
4. Media: Media, GalleryAlbums.
5. Intake: Forms, FormSubmissions.
6. Administration: WorkQueue (Action Queue), OperationalAuditEvents (Audit Log), Users.

Exact symbols and files are generated in [project-inventory.json](project-inventory.json). Collections receive Trash through [withTrash.ts](../../../../src/plugins/withTrash.ts), except NewsEventClassifications: classification deletion remains a guarded hard delete so referenced records must be archived instead. Content and structural presets opt into drafts/versions in their own configs; operational records and users are not public content.

## Registered Globals

Nine globals are registered:

1. SiteSettings — identity, contact, address, legal Pages, social destinations.
2. ThemeSettings — preset and system/light/dark scheme.
3. SEOSettings — default titles, metadata, image, robots, verification.
4. AnalyticsSettings — GTM or GA4 configuration.
5. CookieConsentSettings — banner enablement, variants, placement, copy.
6. PageSettings — homepage, header/footer presets, announcement, Page defaults.
7. NewsEventsDetailTemplate — ordered Page-compatible News/Event detail layout plus one global-only dynamic content block, presented with the News & Events Admin group.
8. SearchSettings — up to 12 operator-managed suggested search terms, governed by the Site Settings
   capability with draft/version recovery.
9. SystemModeSettings — off, maintenance, or coming-soon behavior and referenced presets.

## Ownership and Relationships

- Pages own hierarchical public routes and composed layouts, including the Page-backed `/news-events` index. Parent validation prevents cycles; hooks populate URL previews, synchronize links, create redirects after path changes, and revalidate caches.
- Articles, NewsEvents, and Reviews own their detail content, taxonomy, SEO, editorial state, and preview behavior. NewsEvents, NewsEventClassifications, and NewsEventsDetailTemplate share the `News & Events` Admin group. The entry editor keeps Content, Event Details, SEO, and Workflow as its four primary tabs; Content also owns featured-image controls and a collapsed Topics & Tags group without changing their top-level stored paths. NewsEventClassifications provides centrally managed, public classification records with Story/Event behavior and archive-in-place lifecycle controls. Seeded records retain a hidden immutable legacy value; referenced records cannot be deleted or change behavior. NewsEvents entries require one classification relationship; request-aware validation resolves its behavior, keeps Event fields visible, validates dates and location for Event behavior, and clears Event-only data for Story behavior. The hidden optional `contentType` field and an original-document fallback remain only for unmigrated entry updates during the compatibility release. Public News/Event adapters expose the resolved classification and behavior while retaining the classification slug as deprecated `contentType`. Public list loaders query canonical relationship IDs and also match a seeded legacy value only when an entry has no classification relationship, so unmigrated records remain visible without allowing stale compatibility data to override migrated behavior. NewsEventsDetailTemplate owns the shared ordered Page-block composition. Its global-only `newsEventsContent` block binds the current entry and owns article/sidebar appearance, image ratio and shared overlay settings, share visibility, and public author label. Published templates require exactly one dynamic block; drafts may remain incomplete. The retained legacy entry Byline is hidden and ignored publicly.
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
- [projectSlugField.ts](../../../../src/fields/projectSlugField.ts) wraps Payload's generated slug field for all slug-based collections. It collapses separators and assigns the first available `-copy`, `-copy-2`, and later suffix while preserving existing stored slugs.

Anonymous reads of draft-enabled public collections are constrained to published documents at the
Payload access layer. Governed editorial collections additionally require the published workflow
state, and internal Form/Media fields require authentication. Payload Local API calls bypass access
by default. Use `overrideAccess: false` when acting for a user. Pass `req` into nested operations so
they share transactions. Use request context flags when a hook writes data that could trigger itself.
Run `pnpm generate:types` after schema changes and keep
[payload-types.ts](../../../../src/payload-types.ts) synchronized.
