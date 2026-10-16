# Optional Page editing guide

Pages keep Payload's native editor, block picker, Save Draft, Live Preview and
Publish controls. The Content tab adds a short optional guide immediately before
Layout. Its **Go to page blocks** link stays in the editor. **Preview saved page**
opens the existing authenticated preview in a new tab, preserving the current
editor and any unsaved inputs. The link and accessible name announce the new tab.

## What the guide knows

| Native state | Guidance |
| --- | --- |
| No saved Page ID | Name the page, choose an assigned Parent for a Site Manager, add blocks and use Save Draft before previewing. |
| Page update processing | Wait for Payload's result; the guide's primary action is a disabled button. Pending is never called saved. |
| Unsaved changes | Use Save Draft and wait for confirmation. The saved-preview link explicitly excludes unsaved edits; native Live Preview can show current edits. |
| Saved, empty Layout | Add the first block. Blank Pages do not contain visible block content yet. |
| Saved content, no public version | Check the saved draft and native responsive Live Preview. Publication is deliberate and does not select the homepage. |
| A public version exists | Save Draft keeps changes separate from that public version. Publish is explicit. |

These are current editor facts, not an onboarding progress counter or proof that a
request will succeed. Preview authorization, section access and publication policy
remain enforced by the existing server routes and native operations. A failed save
uses Payload's errors and retained inputs; the guide does not invent a success state.

**Hide guide** and **Getting started** save/reopen this account's page-guide
visibility through native Payload preferences. This key is separate from the
dashboard guide. A hidden guide is not completion, readiness or permission. Failed
preference reads leave guidance available; failed writes retain its current state
and report recovery. The shared adapter confirms the returned saved value before
changing visibility. Keyboard focus follows hide/reopen as on the dashboard.

The guide is absent in relationship drawers and when the document is read-only,
trashed or locked by another editor. Native fields and controls remain usable
independently of optional guidance. Admin recipe creation is unchanged; Site
Managers still create through the native section-aware form. Only Admin and Site
Manager roles exist. No examples or Pages are seeded or published by this guide.

## Source and ownership

The presentation reuses authenticated `@shadcnblocks/empty-empty-actions-2` and its
existing Empty/Button dependencies. Authenticated source was reverified on
16 October 2026. New-tab routing and a genuinely disabled pending action are
supported integration props; upstream composition and theme remain intact. A scoped native-admin bridge keeps
these sourced button links opaque when focused, overriding Payload's text-link fade.
There is one Storybook entry, **Admin / Getting started**, with Page first-draft,
empty-layout, unsaved, saving, saved-draft and public-version states alongside the
dashboard examples. There is no duplicate Page guide presentation/catalogue.

`PageEditingGuideField` reads only the signed-in account's visibility preference
with request-threaded, access-enforced Local API reads. `PageEditingGuide` observes
native form/document hooks and selects the small pure `getPageEditingTask` model.
`AccountGettingStartedGuide` owns the shared confirmed-preference write behavior;
the dashboard adapter reuses it. `pageEditingGuide` is a non-persisted Payload UI
field. No new environment variable, role, schema data, migration, service or tour
library is required.

The preserved preview endpoint reads the latest saved draft. It does not send
unsaved form values to a new tab. The editor's native Live Preview remains the
place for inspecting unsaved edits and desktop/tablet/mobile breakpoints.

## Verification boundary

Focused tests cover native state transitions, empty/new/scoped guidance, actual
disabled actions, new-tab attributes, read-only/drawer/locked exclusions, account
ownership/request threading and independent confirmed preferences. The native
browser journey creates a blank draft through the real recipe UI, adds a block,
saves its heading, verifies that unsaved edits stay in the editor and are excluded
from authenticated saved preview, denies anonymous preview,
checks draft status and verifies hide/reopen persistence. Scoped native light/dark
axe checks require zero WCAG A/AA violations and incomplete results. The pinned
axe-core test dependency was already in the lock graph; runtime dependencies are unchanged. It runs with the other
governance cases on the isolated local test database. Evidence and exact-head
release status belong to the feature checklist and PR. This is task-based engineer
verification; a novice-user study and broader ONBOARD/ADMINUX acceptance remain open.
