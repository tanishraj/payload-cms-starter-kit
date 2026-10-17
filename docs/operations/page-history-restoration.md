# Page History restores drafts

Page History keeps Payload's native version list, comparison screen and confirmation.
Restoring either a draft or a published Page version creates a new saved draft.
The current public Page, owned navigation, redirects and shared content remain
unchanged until an authorized editor explicitly publishes the restored Page.
An unpublished Page is not published by restoration.

## Editor workflow

1. Open the Page's native Versions/History view and compare a retained version.
2. Choose **Restore this version** and confirm. The existing **Restore as draft**
   submenu has the same safe outcome for Pages.
3. Read the confirmation: **Version restored as a draft. Review it, then publish
   when ready.** Native editing opens with the restored values.
4. Review page-owned title, layout, SEO, slug and parent/reference selections.
   Inspect the saved draft or Live Preview, then use Publish deliberately.

Page-owned values/reference IDs come from the selected version. A referenced
Reusable Section or global keeps its current content; restoring a Page does not
restore those separate records. Native version retention and deletion behavior
remain unchanged; a missing version fails rather than restoring a different one.

Admins and Site Managers use the same workflow. Managers retain current Page/root,
read-version and update constraints; a historical parent cannot move a Page across
an unauthorized section. Admins retain their existing full scope. Normal publication
validation, blockers, explicit unpublish protection and all unrelated writes stay
unchanged. Restoration itself does not require an additional approval role.

## API and transaction contract

The Page collection declares `POST /versions/:id` before Payload's default endpoint.
The native URL and response shape remain intact. Missing/false/true `draft` query
values all restore a draft; a successful response is not publication. The handler
requires authentication, retains native CORS and query depth/population parsing,
and uses access-enforced source-version reads plus the native restoration operation.
No generated Next route is edited.

Payload 3.90.2's native operation supports `draft: true`, but its Local API wrapper
does not forward that option. The application helper uses the publicly exported
`restoreVersionOperation`, with access enforcement, the current request/user,
native transactions, hooks and version storage. Raw Page restoration without the
safe frame is rejected, including trusted Local API calls, so it cannot accidentally
republish a retained version. Programmatic callers use:

```ts
import { createLocalReq } from 'payload'
import { restorePageVersionAsDraft } from '@/lib/pageDraftRestoration'

const req = await createLocalReq({ user: authorizedUser }, payload)
await restorePageVersionAsDraft({ req, versionID, depth: 0 })
```

An isolated native request proxy carries a private, non-JSON-forgeable restoration
marker and separate query settings, while retaining the native transaction. Hooks
normalize incoming status before publication checks, permit this private draft
without treating it as unpublishing a referenced live Page, and avoid changing
public owned-navigation records. Normal reference/unpublish checks still apply.
Caller context values are preserved; Payload may maintain its ordinary authorized-read
caches. The restoration marker does not leak to the caller or sibling requests.

Exactly one `restore_version_as_draft` Audit Log event records the Page, actor and
source version ID. The ordinary generic update event is suppressed for this
operation. The source audit is in the same native transaction: audit failure rolls
back the restored draft/version rather than leaving an unaudited restoration.
No page content, answers or secret values are added to audit summaries.

## Boundary and evidence

This increment applies to **Pages only**. Other collection/global restoration keeps
its existing Payload behavior and is not certified as draft-only by this work.
The broader PUBLISH-11/global-history requirement remains open. There is no new
editor, history store, persisted field, migration, dependency, environment variable
or provider change. Native UI is reused; no new visual component/story is needed.

Real Payload/Mongo tests verify old draft/published recovery, public/navigation
isolation, source audit, all REST draft query choices, missing/anonymous/cross-scope
and raw-call denials, shared-content isolation, normal unpublish protection and
transaction rollback on audit failure. Operation tests verify the private request
boundary. The native History journey uses the primary button's `draft=false`
request, verifies the resulting saved draft and unchanged public Page, then proves
explicit Publish changes the public result. Release/CI evidence belongs to the
implementation checklist and feature PR; this is not complete global history or
novice-user acceptance.
