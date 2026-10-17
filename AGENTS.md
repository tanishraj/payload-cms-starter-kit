# Agents

Use `.agents/skills/project-context/SKILL.md` for every implementation, review, diagnosis, or architecture task in this repository. Complete its update/check loop after every implementation.

For Payload CMS work, also use `.agents/skills/payload/SKILL.md` and load only the relevant file from `.agents/skills/payload/reference/`.

## Active first-client release

The user approved a bounded first-client release on October 17, 2026. Read
`docs/planning/first-client-release.md` before selecting work. Its five outcomes
(team setup, Page building, publishing/recovery, client handoff and launch essentials)
are the active scope. The 242-group catalogue is a reference backlog, not a delivery
mandate. Demonstrate the existing end-to-end journey, fix demonstrated blockers,
and require an explicit client need before adding optional capabilities. Preserve
security/privacy and the accepted core forms; do not equate source/tests with an
unaided client pilot or production readiness. Team Admins configure sites; client
editors normally use section-scoped Site Manager accounts.

## Current enhancement scope and tracking

The user moved implementation from Forma to this repository on October 6, 2026.
Read `docs/planning/feature-implementation-checklist.md` for the current priorities,
acceptance checklist and work log; `feature-scope-reference.md` beside it preserves
all carried-forward requirements and deferrals. Use Payload's native editing and
Live Preview; do not implement a separate visual editor. The user accepted the core forms implementation on October 16, 2026 and selected
section-scoped Site Manager access next, followed by onboarding. Do not continue
advanced forms, notification outbox/retries, webhooks or test mode without renewed
prioritization. Secure email links must require authorized submission access; never
make attachments public. The only roles remain Admin and Site Manager.
Read `docs/operations/section-scoped-access.md` for the bounded first rollout
(Pages, Forms, Reusable Sections, submissions and related operational rows); other
feature grants remain site-wide and are explicitly labelled. Preserve and verify existing
functionality before replacing it. Update affected checklist entries with actual
source/test evidence and commit/PR status in each implementation. Native feature
presence alone is not completion of the broader requirement.

Read `docs/planning/admin-onboarding-ux.md` for developer/Admin/Site Manager
journeys and ONBOARD/ADMINUX acceptance. Apply contextual help, honest empty/error
and save/publication states, accessibility and recovery to relevant feature work.
Keep onboarding skippable/resumable and reuse the existing dashboard/page recipes;
never treat onboarding state as access authority or automatically publish examples.
Distinguish local build readiness from production launch requirements. UX plans
require implementation and real task evidence before their boxes are checked.

Keep this starter's MongoDB/provider/runtime baseline unless a later explicit
decision changes it. Every introduced environment variable belongs in `.env.example`
with its purpose and production requirement; never overwrite existing local secret
files or expose values. Existing UI sourcing and Storybook-first rules below apply
to new/replacement presentations; historical Forma package paths do not override
this repository's conventions.

## UI source requirements

Use `.agents/skills/shadcn/SKILL.md` for UI work. Source blocks directly from Shadcnblocks and components directly from shadcn/ui or Shadcnblocks through their verified registries and CLI/MCP tools. Preserve the selected upstream design, styling, structure, and interactions; do not recreate approximate versions or introduce custom visual alternatives.

Adapt source only as needed to connect Payload fields, data, access, routing, and project imports. Keep those integrations separate from the upstream presentation where practical. Record the source registry item for each new block or component.

Source themes and presets from official shadcn/ui sources (`ui.shadcn.com`, including its create tool and official registry). Do not substitute third-party themes or invented palettes without explicit user direction.

If source access is unavailable, report the missing access instead of recreating the component. These requirements apply to website UI and custom admin UI; preserve Payload's authentication, access control, and field behavior during integration.

Every replacement block must include a Storybook story importing its production presentation component, with its source registry reference, sample data, and meaningful states. Follow `docs/operations/storybook.md`; use Payload Live Preview for CMS integration checks.

## Storybook-first revamp

Build the new catalogue from fresh upstream source under `src/components/revamp`, with stories under `src/stories/revamp`. Ignore legacy components and blocks when building new UI. Finish and review components/blocks in Storybook before starting Payload integration. The selected foundation is official shadcn Neutral (light/dark), Radix Luma, Lucide icons, and system sans-serif typography.

Every new component and block must have Docs and Default, with labelled playground controls for supported content, visual options, layout, and interactions. Preserve upstream defaults; make text, images, icons, links, optional elements and supported layout choices configurable through typed props. Later Payload fields must map to that same configuration; keep persistence and data fetching outside presentation components.

## Shadcnblocks source priority

All new user-facing components and blocks must be selected from Shadcnblocks, using the user's Pro access. shadcn/ui primitives are allowed as dependencies of those selections, not as independently selected replacements. Themes remain sourced from official shadcn/ui per the earlier requirement. Verify authenticated source retrieval before implementation; never recreate unavailable Pro source from screenshots or memory.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
