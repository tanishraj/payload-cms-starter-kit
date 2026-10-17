# Section-scoped Site Manager access

Admins retain full access. Site Managers need both the relevant feature grant and
an assigned website section. There are two role types, with any number of accounts.

## Assign access

1. As Admin, create the root Page for each section; a draft root is valid.
2. Open a Site Manager in Users, choose **Manageable website sections**, and grant
   the required destinations. Saving changed sections or feature grants signs the
   manager out of existing sessions; have them sign in again.
3. For page building, grant Pages. The manager can choose Blank/Landing and an
   assigned Website section, then open the new draft in Payload's native editor.
   **Use the native Page editor** remains available for a deeper Parent immediately;
   both paths enforce the same section policy. Add blocks, save and publish under
   the existing rules. See [section-aware recipes](scoped-page-recipes.md).
4. Grant Forms or Reusable Sections for authoring those resources. A manager must
   choose an assigned Website section at creation. Leaving ownership empty creates
   an Admin-managed shared resource; managers may select its published definition
   through existing dependencies but cannot edit it or view private Form settings.
5. Grant Form Submissions separately for the inbox, CSV and file downloads. Placing
   a Form block or editing its questions does not grant access to responses.

No section selection means no scoped Page or inbox access. A slug change cannot
expand a grant. New descendants inherit access through the current latest-draft
parent hierarchy. Managers may edit assigned root content, but only an Admin may
create roots, move/trash roots, move Pages between roots (even when both are
assigned), or reassign owned resources. Same-section Page moves are allowed.

## Private submissions and email links

Intake copies the published Form's Website section into the submission. Moving the
Form later does not reassign older answers or files. Shared/unassigned Forms produce
Admin-only unassigned submissions. An Admin may explicitly reassign a submission
when that is intended. Existing submissions are not automatically backfilled.

Notification emails link to the protected submission; files are not email
attachments. The recipient must authenticate as Admin or a Site Manager with both
inbox permission and the submission's section. Knowing or forwarding a URL/token
does not grant access. Downloads enforce the same submission access check and
remain private/no-store; anonymous users, unrelated managers and managers who only
place Forms are denied. The project does not promise that only one person can
access a file: all authorized Admins and granted managers can access it.

## Rollout boundary

Section constraints currently cover Pages, Forms, Reusable Sections, Media,
Form Submissions, their history/restore operations and related Action Queue/Audit
Log rows. The existing feature filters still apply to operational rows. Own-role,
feature and section metadata is readable by the account itself for client UI;
only Admins can change grants. Other users' assignment labels remain sanitized.

**Other destinations remain governed by site-wide feature grants.** These include
Articles, News & Events, navigation, shell presets and globals. Grant them
only when site-wide access is intended. The Users field help labels this explicitly.
Section-owned Media follows the [native Media workflow](scoped-media-access.md); broader cross-feature ownership is later work;
this release is not complete multi-tenant isolation. Public published website
content stays public; scoped authorization protects editing and private records.

Legacy/unassigned Forms, Reusable Sections and Media become Admin-managed shared
resources. Legacy/unassigned submissions become Admin-only. Before rollout,
Admins should review existing managers and assign roots and intended resources.
There is no guessed ownership, database migration, automatic publication or change
to local MongoDB/provider/environment configuration.

## Enforcement and bounds

`sectionAccess.ts` resolves current ownership with trusted minimal-field queries,
then applies constraints through Payload access. User-acting calls continue to use
`overrideAccess: false`; nested operations retain `req`. Permission results are
memoized only in the current request. Latest ownership controls history access;
restoring an old version cannot move content back across a scope boundary.
GraphQL remains disabled. Native relationships and recipe creation use the same
collection policies. No extra visual editor or custom authorization endpoint exists.

A user may have at most 50 active root grants. Traversal supports at most 5,000
Pages and 100 hierarchy levels per effective scope; Forms/Reusable Sections/Media and
operational source-ID joins are bounded to 5,000 records. Exceeding a bound fails
closed with 503 rather than returning partial access. The inbox itself uses a
section query, while its Action Queue/Audit Log source joins have that 5,000 bound.
Large installations need an indexed ownership projection before exceeding these
limits. No persistent cross-request permission cache is introduced.

## Evidence

`section-access-database.int.spec.ts` exercises real Payload/MongoDB policies,
current-parent and latest-version changes, direct REST cookie authentication,
intake ownership, independent inbox/CSV permissions, operational rows, Trash and
grant revocation. `form-files-database.int.spec.ts` verifies private downloads
for an authorized manager and denial for a manager in another section.
`governance.e2e.spec.ts` exercises native section assignment, manager Page creation,
cross-section denial and session revocation. Existing native form journeys remain
release regressions. The implementation checklist records final release/PR status.

Local release verification: 2,757 integration tests pass with one existing
Docker-dependent skip. Both governance journeys pass (39.1 seconds); the final
source-frozen Generic Form/Contact6 journeys pass (3.0 minutes). The earlier
Contact6 authoring timeout overlapped server source edits; no assertion was
weakened. Production build passes with 73 traces and no private uploads included.
Final access/context contracts, generators, TypeScript, lint (one existing
warning), dependency policy and project context pass. Exact-head CI and merge
status are authoritative on the feature PR.


Page version restoration now uses the native History UI with a draft-only server
policy. Current read-version/update scope still applies, and restored historical
parents cannot bypass section movement rules. The current public Page/navigation
and shared records remain unchanged until explicit publication. See
[Page history](page-history-restoration.md). Other collection/global restore
behavior is unchanged by this Page-only increment.
