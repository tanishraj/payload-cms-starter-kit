# Storybook-first Revamp Implementation Plan

**Goal:** Start the replacement catalogue from fresh upstream components, then integrate Payload in a later phase.

**Architecture:** Route registry installation to `src/components/revamp`; scope Storybook stories and CSS to the new catalogue. Existing production components remain separate. Use official shadcn Neutral tokens, Radix Luma components, and standard sans-serif typography.

**Constraints:** Preserve upstream default visuals. All new components/blocks have Docs, Default, editable supported configuration and meaningful states. CMS data adapters are deferred. Record source provenance. Never overwrite legacy UI as part of this setup.

- [x] Set registry component/UI aliases to the revamp directory and CSS target to the isolated Storybook stylesheet.
- [x] Install and inspect fresh official Button source with the shadcn CLI.
- [x] Create isolated Tailwind/theme CSS; show only new stories.
- [x] Add Button Docs/Default, full supported variant/size controls, disabled and icon/link examples.
- [x] Update working agreements, authoring docs and project context; validate build, types, lint, and live preview.
