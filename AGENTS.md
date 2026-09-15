# Agents

Use `.agents/skills/project-context/SKILL.md` for every implementation, review, diagnosis, or architecture task in this repository. Complete its update/check loop after every implementation.

For Payload CMS work, also use `.agents/skills/payload/SKILL.md` and load only the relevant file from `.agents/skills/payload/reference/`.

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
