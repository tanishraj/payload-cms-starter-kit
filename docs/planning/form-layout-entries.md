# Ordered form layout entries

This increment adds display entries and one level of question groups to reusable
General/Lead Forms. It retains Payload's native administration and native page
blocks. Conditions and additional appearance controls are later bounded increments;
FORM-04/DF-07 remain open for their complete acceptance.

## Editor workflow

Open Forms → Fields → Add Entry. Choose Question (the default), Heading,
Description, Separator or Question group. The ordered native rows define the
visitor's reading order. Heading/group label supports 200 characters;
descriptions support 2,000. Plain text only. A group has its own label, optional
description and an ordered Group questions array using the same fifteen controls
and rules as ordinary questions. Groups cannot contain another group.

A form supports 100 questions total across all groups and up to 200 top-level
entries. At least one question is required. Names/contact roles and row IDs must
be unique across the whole form, including grouped questions. Empty groups,
unknown entries/controls and invalid question/display configuration cannot publish
as working forms. Inline native parent-array validation supplies actionable errors.

Edit/reorder existing rows to keep question IDs. Deleting/recreating a question
creates a new identity. Native reorder works within each array; this increment
does not add drag-and-drop transfer between arrays. API/import callers may move
a question while retaining its existing unique ID. Changing a row from Question
to a display entry stops collecting that question; dormant question settings are
ignored until it becomes a Question again.

Select the published Form from Generic Form or Contact Cards & Form. Preview uses
the same ordered presentation with disabled submission/upload controls. Fixed
Contact 33 and Review Submission cannot render these entries; relationship/schema
validation rejects that configuration rather than hiding required questions. A previously selected Contact33 Form that later gains layout entries becomes unavailable, and revisionless layout intake is rejected before storage/email.

## Contract and compatibility

- `fields` retains the existing array and ordinary question paths/IDs. Missing/null
  `entryType` and explicit `question` are equivalent; no migration is required.
- `formQuestionFields.ts` owns one explicit typed native question schema, reused
  in group rows. The boundary flattens questions into the existing validation,
  initial-value, recovery, upload, answer, notification and contact-role contracts.
- `entries` is a minimal, ordered public presentation projection with derived
  question names. It is not independently authored references and cannot omit,
  duplicate or reorder questions relative to the flattened contract. Display rows
  have no answer keys. Private operational settings never enter this projection.
- Existing question-only snapshots/revision hashes stay byte-compatible. When
  layout is present, the exact canonical public layout is captured as optional
  `formSnapshot.entries` and contributes to the revision. Display/group changes
  trigger explicit refresh/review; compatible stable-ID/type answers remain.
- Display entries never enter stored answer rows or notification answer lists.
  Original question labels, names/options and raw answers retain their meaning.
- Grouped file controls use the same private provider, token claim and download
  boundary. Unconfigured private uploads prevent publication even inside groups.
- Explicit layouts render as upstream stacked sections. The legacy Contact6
  first-two-short-question split remains the default for question-only Forms.
  No custom breakpoint/width/size/theme controls, stylesheet, dependency or
  environment variable are introduced here.

## Presentation sources and review

Authenticated registry retrieval: `@shadcnblocks/field-field-advanced-4`,
`@shadcnblocks/form-form-multi-field-6` and
`@shadcnblocks/field-field-advanced-5`. These supply semantic FieldSet/Legend,
FieldDescription/Group and FieldSeparator compositions. Existing Radix Luma
primitives are reused. Supported adaptations are typed content, plain-text
wrapping, question slots and heading hierarchy (h3 in Generic Form, h4 under
Contact6's card title). Existing website tokens remain authoritative.

Canonical Blocks/Generic Form includes Layout Preview and Layout Entries with
editable ordered entries. Desktop light/mobile dark review confirms the source
geometry and readable group hierarchy without horizontal overflow. Storybook play
checks validation feedback, answering and confirmation. First-error focus is
verified separately by component tests and actual browser click; the Storybook
synthetic click's inactive document does not provide reliable focus evidence.

Local verification: 2,664 integration tests pass with one Docker-dependent skip; both expanded native Generic Form/Contact6 journeys pass without retries. Production build/private-artifact inspection, Storybook build/play, types, lint, context and unchanged approved-exception audit pass. CI/merge evidence is recorded in the checklist work log when available. Broader
accessibility/theme, section scopes, appearance and conditional-rule acceptance
remain open.


Local verification also exposed a disposable-checkout sync mismatch and an
existing frontend toolbar test checking an effect before it completed. The
checkout was synchronized with tracked source/Git state. The toolbar test retains
its exact offset/cleanup assertions and waits for the post-render effect; no
application behavior or assertion was removed.
