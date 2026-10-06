# Storybook-first component and block catalogue

Run `pnpm storybook` and open http://localhost:6006. Source changes reload live. `pnpm build-storybook` generates the standalone catalogue in ignored `storybook-static/`.

## Current foundation

The selected foundation is official shadcn **Neutral**, light/dark, **Radix Luma**, Lucide icons, and system sans-serif typography. `.storybook/neutral.css` stores unmodified official tokens from https://ui.shadcn.com/r/colors/neutral.json (retrieved 2026-09-12). `.storybook/preview.css` supplies the official semantic Tailwind mappings and baseline styles. No legacy website CSS is imported. Production's current theme is unchanged until integration.

The catalogue starts with a freshly installed `@shadcn/button` in `src/components/revamp/ui/button.tsx`. Its Docs and Default playground expose upstream variants and sizes, label, disabled state, type, accessible label, and sample icon compositions. Additional stories cover variants, icons and link composition. Button source is installed directly through the official CLI and retains upstream styling.

`components.json` now directs UI installation to `src/components/revamp/ui`, other components to `src/components/revamp`, and CSS changes to `.storybook/preview.css`. Review CLI dry runs before installing. Do not overwrite legacy files or copy their custom styling into the new catalogue.

## Workflow

1. Select a block from Shadcnblocks and fetch original source through its authenticated registry. Install needed fresh shadcn components first.
2. Develop presentation and typed configuration in Storybook with synthetic data. Preserve the upstream default appearance. Expose text, images, icons, links, optional content, and supported visual/layout variants as props.
3. Add `src/stories/revamp/<Name>.stories.tsx`, importing the real new component. Every item requires autodocs, a Default story, clear controls/descriptions/defaults, a source registry ID and URL, and meaningful alternate/edge states.
4. Map configuration to text, boolean, number, select, or object controls as appropriate. Layout choices should be defined supported options. Use semantic theme tokens instead of arbitrary palette controls.
5. Review the component/block in desktop/mobile and light/dark previews. Add interaction checks for important behavior; accessibility results remain advisory until reviewed.
6. Once the Storybook version is agreed, add Payload fields/adapters matching the same configuration. Use Payload Live Preview for actual content, access, uploads and page composition. Do not maintain duplicate presentation implementations.

Legacy setup stories remain outside the catalogue glob; they are not a dependency of the revamp. Storybook currently shows the new Button, not all old blocks.

## Runtime boundary

`.storybook/main.ts` uses `@storybook/nextjs-vite` with an isolated Next configuration. It does not import Payload configuration. Storybook needs no database or CMS login. Keep credentials, real user data, database clients, and server loaders out of stories. Controls edit only sample props and never save CMS content. Dependencies remain development-only except the upstream components' runtime dependencies.

The Docs addon can expose source code in a published catalogue. Review upstream licensing and public assets before external publication.

## Quality boundaries

The generated `storybook-static/` bundle is ignored by Git and ESLint; lint still
covers authored stories, workshop configuration and components. The public-site
semantic radius check excludes the isolated Neutral workshop and separately
rejects public imports of its revamp catalogue. When integrating that catalogue,
review/update the public theme contract and this boundary test in the same change.
Do not silently exempt publicly rendered components.
