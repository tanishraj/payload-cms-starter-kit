# Storybook-first component and block catalogue

Run `pnpm storybook` and open http://localhost:6006. Source changes reload live. `pnpm build-storybook` generates the standalone catalogue in ignored `storybook-static/`.

## Current foundation

The selected foundation is official shadcn **Neutral**, light/dark, **Radix Luma**, Lucide icons, and system sans-serif typography. `.storybook/neutral.css` stores unmodified official tokens from https://ui.shadcn.com/r/colors/neutral.json (retrieved 2026-09-12). `.storybook/preview.css` supplies the official semantic Tailwind mappings and baseline styles. Revamp component stories keep this isolated foundation. Existing website block stories conditionally load their actual production stylesheet through the decorator described below. The production adapter inherits the existing website theme; the workshop remains independently Neutral.

The catalogue starts with a freshly installed `@shadcn/button` in `src/components/revamp/ui/button.tsx`. Its Docs and Default playground expose upstream variants and sizes, label, disabled state, type, accessible label, and sample icon compositions. Additional stories cover variants, icons and link composition. Button source is installed directly through the official CLI and retains upstream styling.

`components.json` now directs UI installation to `src/components/revamp/ui`, other components to `src/components/revamp`, and CSS changes to `.storybook/preview.css`. Review CLI dry runs before installing. Do not overwrite legacy files or copy their custom styling into the new catalogue.

## Generic form workshop

Open [Blocks / Generic Form](http://localhost:6006/?path=/story/blocks-generic-form--default)
or its Docs page. `src/components/revamp/generic-form.tsx` adapts authenticated
`@shadcnblocks/form-form-patterns-4` and the binary control composition from
`@shadcnblocks/checkbox-checkbox-standard-1`, retrieved 6 October 2026. Fresh
Radix Luma Field, Input, Select, Textarea, Checkbox, Label and Separator dependencies
retain upstream styling. The original max-w-md vertical layout, typography and
full-width button are preserved; there is no invented visual variant. The form's
upstream `bg-background` input treatment is intentionally retained.

Each installed form primitive also has its own Docs and Default playground under Components / Forms, with labelled supported props and meaningful alternate states. Checkbox and Select update their controls during interaction.

The Questions control accepts the eight currently supported Payload types: Text,
Email, Phone, URL, Number, Textarea, Select and Checkbox. Edit machine names, labels, options,
placeholders, help text, initial answers, text character limits, required state and contact roles. Other controls configure heading,
description, submit/pending labels and disabled state. The theme and viewport
toolbars cover supported appearance and responsive shape. Changing the schema
resets the demonstration so removed answers cannot carry into another form.

Default, Text Only, Disabled, Unavailable, Long Labels and Two Forms exercise
configuration and composition. Validation Errors, Successful Submission, Pending,
Network Failure and Server Field Error run interactions. The examples use synthetic
answers and local callbacks only; they do not contact the submission API or save
records. The production-ready presentation takes a typed asynchronous `onSubmit`
callback, keeping transport and CMS loading outside the workshop.

Client validation shares `validateFormSubmission` with server intake. Errors link
to controls; validation and server field rejection focus the first invalid control.
Pending disables controls and blocks repeated submission events. A successful
confirmation replaces the controls and receives focus. An unconfirmed network
result preserves answers and allows deliberate retry; it does not claim the
server failed to store the request. Generic clients now use durable accepted-attempt retry protection; the demonstration callbacks remain synthetic.

Changed Questions demonstrates published-revision recovery in this same catalogue
entry. It preserves a renamed field by stable ID, clears a changed-type answer,
focuses an explanation and waits for deliberate resubmission. It uses synthetic
callbacks, not the API. See [revision recovery](../planning/form-revision-recovery.md)
for the production protocol and legacy-client boundary.

Conditional Question demonstrates stable-ID rules that show a follow-up only when
all conditions match. It proves that hiding a question clears its answer, reopening
starts empty, conditional requiredness blocks an incomplete response, and only
active answers reach the synthetic callback. The Payload Admin authoring and public
intake contract is in [conditional form questions](../planning/form-conditional-rules.md).


The native Generic Form block now uses this presentation with the website's shared
theme. Its publication/submission/draft-isolation/disabled-preview journey passed on
an isolated test database. CMS preview and unavailable adapter states are included
in this same catalogue entry; production readiness remains subject to the broader
feature checklist and deployment gates.

## Workflow

1. Select a block from Shadcnblocks and fetch original source through its authenticated registry. Install needed fresh shadcn components first.
2. Develop presentation and typed configuration in Storybook with synthetic data. Preserve the upstream default appearance. Expose text, images, icons, links, optional content, and supported visual/layout variants as props.
3. Add `src/stories/revamp/<Name>.stories.tsx`, importing the real new component. Every item requires autodocs, a Default story, clear controls/descriptions/defaults, a source registry ID and URL, and meaningful alternate/edge states.
4. Map configuration to text, boolean, number, select, or object controls as appropriate. Layout choices should be defined supported options. Use semantic theme tokens instead of arbitrary palette controls.
5. Review the component/block in desktop/mobile and light/dark previews. Add interaction checks for important behavior; accessibility results remain advisory until reviewed.
6. Once the Storybook version is agreed, add Payload fields/adapters matching the same configuration. Use Payload Live Preview for actual content, access, uploads and page composition. Do not maintain duplicate presentation implementations.

## Existing block catalogue

All 68 current block entries appear once under **Blocks**: 61 Page blocks,
three header/footer choices, three system choices and the template-only News & Events
Content block.
The 67 picker definitions plus the template-only block define the coverage check.
`src/stories/blocks/*.stories.tsx` imports the production component or its existing
browser-safe presentation; it reuses `src/block-thumbnails/fixtures.tsx` sample
props through `support/fixtureArgs.ts`. Default is the editable playground;
Docs and supported padding/long-content examples accompany each entry where relevant.
The existing Generic Form entry remains in `src/stories/revamp`, with its richer
interactive and CMS states. No second Revamp or Existing Blocks catalogue is enabled.

Reusable Section demonstrates the real `PageBlockStack` with shared production
fixtures; Storybook does not resolve its CMS relationship. News & Events Content
uses the real detail component and one synthetic article. Forms and data-driven
blocks use local definitions/snapshots. Storybook intercepts same-origin `/api/`
fetches with an explicit unavailable response: submissions, downloads and additional
CMS pages/months cannot load or persist records. Use Payload Live Preview for those
integration journeys. Existing unsupported combinations are not new builder features.

`websiteBlock: true` opts an existing block into `.storybook/WebsiteBlockDecorator.tsx`.
It mounts the production CSS once while website stories are visible, selects the
existing SNMIH Blue preset, and restores the Neutral workshop after the last website
story unmounts. Light/dark and viewport toolbars still work. Next layout font
variables use their system fallbacks here; no remote font loading is needed.
The stylesheet is compiled from production sources, without copying palettes or
restyling blocks. Neutral revamp stories do not mount it.

Old foundation-only `src/stories/Button`, `Accordion` and `Logos20` files remain
outside the globs; Logo Marquee has its one canonical block entry in the new catalogue.
New/replacement presentations still follow the authenticated upstream revamp workflow.

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

### Native generic form adapter

`Blocks/Generic Form` is the single catalogue entry for this block. Its CMS preview
story documents the production adapter’s heading, description,
questions and padding, plus disabled preview and unavailable states.
Validation, submission and unavailable states live in that same entry; all workshop
submissions use synthetic callbacks or are disabled in CMS preview.
The native public adapter owns transport and server-projected published definitions;
the client-safe Live Preview adapter disables submission. Production inherits the
website’s shared shadcn tokens rather than shipping a separate Neutral form palette.
The public import/radius guard admits only this reviewed adapter into the revamp
presentation. Select portals remain within the form’s inherited theme context.

## Contact6

[Blocks / Contact Cards & Form](http://localhost:6006/?path=/story/blocks-contact-cards-form--default) is the single canonical entry for the authenticated upstream layout and native adapter. Questions, labels/names, supported control types, options, required state, contact cards, footer content and button/pending text have controls. Icon choices serialize as email/chat/phone/location in stories and native CMS; the presentation receives typed Lucide objects. Callbacks stay separate from object controls. Default, one question, long content, validation, confirmation, pending, network failure, unavailable and disabled CMS states use synthetic data. Website CMS Preview mounts the real website theme with submissions disabled; all other workshop states use upstream Neutral.

Browser review: custom-name submission and confirmation, validation focus, disabled preview, 390px wrapping, dark mode and website-theme preview. WCAG A/AA axe scans report no violations for website preview or Neutral dark. Upstream Neutral light muted text on muted surfaces/Select reports a contrast violation; the shared official palette is preserved, so that workshop state is not certified as WCAG AA. Production must be checked with the chosen website theme.

Lost Confirmation and Different Response demonstrate durable retry UX in the same Generic Form entry using synthetic callbacks. See [submission retry protection](../planning/form-submission-retries.md) for production behavior and the database index prerequisite.

Configured Questions provides the help/default/character-limit playground; Configured Validation checks initial answers, associated helper/error text, invalid-answer blocking and corrected confirmation. These settings use the shared intake validator in both Generic Form and Contact6. See [question configuration](../planning/form-field-configuration.md) for native authoring, legacy and revision behavior.

URL And Number is the playground for complete HTTP(S) references and decimal quantities. URL And Number Validation checks rejected URL/step values, preserved input, first-error focus and corrected confirmation. Number reuses Input with decimal input mode; optional min/max/increment rules run through the shared validator. The same controls work in Contact6. See [URL/Number contract](../planning/form-url-number-controls.md) for native configuration, decimal-string intake and history/recovery.


## Dynamic form layout entries

Blocks/Generic Form → **Layout Preview** shows the sourced groups and dividers;
**Layout Entries** exercises validation, answering and confirmation. The Ordered
layout entries control configures headings, descriptions, separators and labelled
groups with question names in exactly their declared order. Questions remain in
the Questions and controls contract; display entries never collect answers.
Production adapters derive this projection from the single ordered native Form
array. Sources: @shadcnblocks/field-field-advanced-4,
@shadcnblocks/form-form-multi-field-6 and @shadcnblocks/field-field-advanced-5.
Website themes are inherited; no separate form stylesheet is added.


## Supported dynamic-form appearance

Use **Blocks/Generic Form → Appearance Preview** for the wide/two-column/compact
playground and **Narrow Appearance** for a dense form. **Appearance** exercises
validation using the real presentation; Contact Cards & Form → Appearance reviews
the shared settings inside its original card. The appearance object control lists
the exact supported values. Defaults retain each source block. Source references,
fixed 32rem form-width breakpoint, native settings and compatibility live in the
[appearance contract](../planning/form-appearance-controls.md).

Reviewed before Payload integration: 1280px light and 390px dark, 12px gaps,
two/one columns without overflow, labelled groups and actual first-error focus;
the new play finishes. Contact6 retains its outer card composition and wraps on
mobile. Dark WCAG A/AA axe reports zero violations. Neutral light still reports
the previously documented muted-surface contrast issue; no AA certification or
palette override is claimed. Production inherits its existing website theme.


## Submission export action

**Admin / Form export** imports the production `FormExportAction`, using the
existing Button dependency of authenticated `@shadcnblocks/input-input-special-1`.
Default has a callback play; Preparing and No Results expose native disabled/busy
states. No service or real submission data is used. The native Payload list adapter
owns filtering, permissions, download and toasts. See the
[export contract](../planning/form-revision-exports.md).

## Admin getting started

**Admin / Getting started** imports the production OnboardingPanel from authenticated
`@shadcnblocks/empty-empty-actions-2`. Default/Docs expose task copy, destination,
visibility, dismissibility, pending and failure controls. Continue Draft, Assigned
Sections, No Sections, Unavailable, Hidden, Saving, Preference Failure, Long Content
Starting and Hide And Reopen use synthetic data. No account or service calls occur.
Desktop light and 390px dark were reviewed before Payload integration; the native
account preference and scope contracts live in the [guide](admin-getting-started.md).

Getting started was also checked in light Default and 390px dark Long Content
with scoped axe: zero WCAG A/AA violations and zero incomplete checks. The Native
Payload adapter verifies keyboard/persistence separately. This scope does not
certify the rest of the admin or measure novice usability.

## Page editing guidance

**Admin / Getting started** reuses its production sourced panel for Page first-draft,
empty layout, unsaved changes, saving, saved draft and public-version examples. The
Action control supports a safe new-tab target and a genuinely disabled pending
action. Story interactions verify target/rel and that saving has no clickable link.
See [Page editing guide](page-editing-guide.md); there is no second presentation entry.
