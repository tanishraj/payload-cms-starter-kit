# Composition and publishing baseline — 17 October 2026

Source inspected: `19761fcee6e131bdb8efd93b9f3890eaff9e5d58` (`develop`).
This is a source assessment, not certification of every feature or a usability study.
Page History subsequently merged at `53fea53e`; its passing CI and remaining
blank-Page browser reliability gap are recorded in the active first-client checklist.
The separate Page-history branch is identified explicitly below.

## What is already reusable

| Area / checklist domain | Source evidence | Reuse / remaining evidence |
| --- | --- | --- |
| Product boundary / CORE | `PRODUCT.md`, `src/payload.config.ts` | One client per deployment; native Payload + Next.js, two roles. No tenant-switching product is needed for client handoff. |
| Pages / PAGE | `src/collections/Pages.ts`, `src/components/admin/PageCreateView.tsx`, `src/endpoints/createPageFromRecipe.ts` | Title, hierarchy, native block editing, scoped draft creation, SEO and preview exist. Assess actual novice task completion before expanding editing UI. |
| Blocks / BLOCK | `src/blocks/blockCatalog.ts`, inventory, both Page renderers | 61 Page registrations, 60 non-recursive reusable registrations, production/preview parity. Existing purpose groups include Start, Explain, Explore, Prove, Convert and Advanced Library. Improve discoverability only against an observed problem; do not create a second registry or mandatory picker. |
| Design / DESIGN | shared section contract, `src/styles/globals.css`, `.storybook/neutral.css` | Section Content/Theme Settings conventions and semantic appearance exist. Public website styling and the Neutral workshop are distinct surfaces. No theme rewrite is implied by onboarding. |
| Actions / ACTION | shared action fields, `src/lib/cmsLinks.ts`, `ContentActions.tsx` | Page/custom/media destinations and Link/Button presentation exist. Verify relevant client tasks; do not rebuild links/downloads from the unchecked catalogue. |
| Structured content / CONTENT | collections in `src/payload.config.ts`, listing blocks and route loaders | Articles, News & Events, Reviews, galleries and institutional content exist. Grant only the destinations the client needs; each enabled module needs acceptance, not every optional module in every deployment. |
| Shared content / GLOBAL | `ReusableSections.ts`, Headers/Footers, nine registered globals | Shared records and shell/default selection exist. Shared ownership and publication need clear explanations; changing a global is not the same as editing a Page. Broader global history remains unverified. |
| Publishing / PUBLISH | Page hooks, native versions, publication policy, navigation/redirect hooks | Native drafts, explicit publishing, reference protection and redirect handling exist. Do not infer complete autosave/conflict/cache/recovery guarantees from this. Page-only restore-as-draft is in the separate [Page History feature PR](https://github.com/tanishraj/payload-cms-starter-kit/pull/41), commit `31949e05`; it is not in this assessed develop tree. |
| Preview / PREVIEW | Page live-preview configuration, `/preview/page/[id]`, native guide | Authenticated draft preview and viewport configuration exist. Saved-page preview and unsaved Live Preview are deliberately different. Verify expired/no-access/missing preview recovery in the handoff journey. |
| Media / MEDIA | `Media.ts`, `mediaUsage.ts`, upload/deletion hooks | Upload validation, alt text, asset types, usage and in-use deletion protection exist. Mutation uses site-wide media grants; section ownership is a real gap. Usage inspection uses trusted cross-collection/global reads, so adding a section field alone would not safely scope all exposed references. Public website assets and private Form Attachments must remain separate. |
| URLs / SEO | Page hierarchy, SEO fields, metadata loaders, redirects | Existing hierarchy, metadata and redirects are reusable. Launch checks should inspect the chosen homepage and actual public URLs rather than add another SEO framework. |
| Discovery / SEARCH | search settings, `/search`, `/api/search`, sitemap/robots/feed routes | Existing public discovery exists. Per-client verification is required; advanced search/localization is not automatically a first-client blocker. |
| Developer catalogue / DEV | `.storybook/main.ts`, block-story contract test | 68 unique block story entries cover 67 thumbnail-backed blocks plus template-only content. This is broader than the 61 Page choices. Generic Form and Contact6 have their canonical Blocks stories; the two source directories do not prove duplicate menu entries. Storybook is developer tooling, not a client onboarding prerequisite. |

The maintained inventory also reports 23 collections, nine globals and 68 total block
definitions. These are registration counts, not numbers of client-facing navigation
items or features newly needed. Hidden security collections are not client modules.

## Observed UX risks

- The full catalogue is much larger than the first client's task. Existing grants
  and purpose-based block groups should carry the simplification before any new UI.
- Only Blank and Landing recipes exist. Landing currently means Page Header plus
  Breadcrumb, not a complete multi-section marketing page. Its description is
  accurate; promising complete page templates would be inaccurate.
- Native Users creation and the team-selection preview exist; a dedicated invite /
  activation / resend journey is not established by that source. The supported
  email-disabled handoff and password recovery path still needs a decision and proof.
- Optional dashboard, Page, site, structure and team guides already exist. Do not
  add a separate tour or require all guides before an editor can work.
- Native browser automation demonstrates contracts; it does not demonstrate that
  an unfamiliar client can finish unaided. No new-user pilot is claimed here.

## Documentation reconciliation

The onboarding plan's checkpoint still described section-aware recipes as awaiting
merge; the scoped-recipes feature is merged on the assessed develop commit. Update
that checkpoint. Older baseline paragraphs are historical inspection and need a
current-evidence pointer rather than being interpreted as today's absence of scope.
The October 14 Wayfinder brief is historical; append current direction rather than
rewrite its original forms-first decision. PRODUCT's October 6 enhancement paragraph
also predates implemented section access; use current source/runbooks and record
that discrepancy without redesigning unrelated product/design artifacts.

The catalogue has 242 feature groups: nine checked, 233 unchecked, plus ten separate
DF proof steps (three checked). Unchecked includes partial implementation and
unassessed existing behavior; it is not 233 missing features. This review changes
no acceptance checkbox.

## Verification boundary

Fresh focused checks pass: 31 catalogue, recipe, onboarding and documentation tests.
The routing check covers all 242 groups exactly once, acceptance boxes are unchanged,
and new-document local links exist. Final project-context evidence belongs to the
planning PR/work log.
Previously recorded local/CI evidence remains in the checklist and feature PRs.
No application build, live site pilot, production configuration, migration, upload,
email delivery or new UX study was performed by reading source. Page-history tests
belong to its feature commit, not this develop baseline. The [client delivery
roadmap](client-website-delivery-roadmap.md) is a release proposal, not a resolved
full-catalogue policy or new implementation acceptance.
