# Work Queue Design

## Summary

This spec adds the first real operator-facing queue to the CMS starter.

The goal is not to build a second admin interface or a CRM. The goal is to give operators one shared place to see what needs attention across inbound submissions, moderated reviews, and editorial article work.

The starter already has:

- `form-submissions` with operational status and ownership
- `reviews` with editorial workflow and moderation fields
- `articles` with editorial workflow
- role and capability-based admin access

What is missing is a shared operational surface that turns those separate systems into one daily queue.

## Why This Direction

Three approaches were considered.

### 1. Thin Aggregator

Add a top-level page that reads from several collections and renders a simple list with minimal logic.

This is fast to ship, but queue semantics become fragile because urgency rules and record mapping are likely to sprawl across the page layer.

### 2. Recommended: Queue Service Over Existing Collections

Add one explicit queue domain layer that reads from `form-submissions`, `reviews`, and `articles`, normalizes them into a shared item model, computes urgency, and exposes only light actions.

This keeps the queue logic centralized, testable, and reusable without inventing a new persisted workflow system.

### 3. Dedicated Queue Collection

Create a real queue or projection collection and synchronize it from source collection hooks.

This is more powerful later, but it is too heavy for v1 and introduces synchronization complexity before the queue rules are proven.

### Decision

Use a queue service over the existing collections.

## Product Contract

After this work:

- the admin has a top-level `Work Queue` screen
- the queue is shared across `form-submissions`, `reviews`, and `articles`
- the default view is urgency-first, not collection-first
- queue visibility follows existing admin capabilities
- v1 supports only light actions from the queue
- heavier actions such as full editing and publishing still happen in the underlying record view

This remains an operator surface, not a second workflow engine.

## Scope

### In Scope

- one top-level `Work Queue` admin screen
- one shared queue service and shared queue item model
- source coverage for `form-submissions`, `reviews`, and `articles`
- urgency-based grouping
- filters for assignee, type, status, and `needs attention`
- light queue actions
- capability-aligned visibility and mutation rules
- focused integration tests for queue logic and access

### Out Of Scope

- pages in the queue
- system pages in the queue
- publish, unpublish, or delete actions directly from the queue
- a persisted queue collection or event log
- manual `needs attention` flags
- dashboards or admin homepage widgets

## Queue Location

The queue should live as a top-level admin navigation item named `Work Queue`.

It should not be hidden inside any single collection and it should not be only a dashboard widget. The queue is intended to be an operational destination, not a passive summary panel.

The admin homepage can later link into this queue, but v1 should treat the queue as its own primary surface.

## Queue Shape

The default queue view should group items by urgency:

- `Needs attention`
- `Assigned / active`
- `Waiting`
- `Done recently`

This is a deliberate choice. The queue should first answer what needs action now, not merely what type of record exists.

Work type still matters, but it should be expressed through filters and badges:

- `Lead intake`
- `Reviews`
- `Articles`

## Included Record Types

The first version should include:

- `form-submissions`
- `reviews`
- `articles`

It should not include `pages` yet.

This keeps the queue broad enough to be a real shared operator surface without turning it into a catch-all for every possible CMS record too early.

## Access Model

The queue should reuse the existing capability system.

Rules:

- admins see the full queue
- non-admin users only see queue items for record types they already have access to
- queue actions are allowed only when the underlying collection update would already be allowed

This means:

- `manage_form_submissions` controls submission queue visibility and light actions for submissions
- `manage_reviews` controls review queue visibility and light actions for reviews
- `manage_articles` controls article queue visibility and light actions for articles

The queue should not create a second permission system.

## Shared Queue Item Model

The queue service should normalize source records into one explicit item shape.

Each queue item should include:

- `id`
- `sourceType`
  - `form_submission`
  - `review`
  - `article`
- `sourceID`
- `title`
- `subtitle`
- `status`
- `owner`
- `section`
  - `needs_attention`
  - `assigned_active`
  - `waiting`
  - `done_recently`
- `attentionReasons`
- `updatedAt`
- `recordURL`
- `availableActions`

This item shape is the public contract between the queue service and the admin view.

## Required Workflow And Schema Adjustments

The queue needs a small amount of additional operational structure to be credible.

### Form Submissions

`form-submissions` already has most of the required operator fields:

- `status`
- `owner`
- `submittedAt`
- `lastActionAt`

V1 should add:

- `followUpState`
  - `none`
  - `needed`
  - `scheduled`
  - `completed`
- `followUpAt`
  - optional date

This gives the queue a real way to represent follow-up work and overdue follow-up, instead of guessing from notes.

### Reviews And Articles

`reviews` and `articles` need an explicit operator owner field so the queue can support assign and reassign actions.

Both collections should add:

- `owner`
  - relationship to `users`

They should also evolve the editorial workflow to support one explicit ready-but-unpublished state:

- `draft`
- `in_review`
- `approved`
- `scheduled`
- `published`
- `reverted`

Without `approved`, the queue cannot honestly represent editorial work that is ready for publication but intentionally not published yet.

This workflow enrichment should be treated as a small enabling change for the queue, not as a separate workflow redesign project.

## Needs Attention Rules

V1 `Needs attention` should be driven by status plus age. No manual flag exists in this phase.

### Form Submissions

A submission belongs in `Needs attention` when any of these are true:

- `status = new` and `owner` is empty
- `status = in_review` and `lastActionAt` is older than 2 days
- `followUpState = needed`
- `followUpState = scheduled` and `followUpAt` is in the past

### Reviews

A review belongs in `Needs attention` when any of these are true:

- `workflowState = draft` and `updatedAt` is older than 7 days
- `workflowState = in_review` and `updatedAt` is older than 3 days
- `workflowState = approved` and `updatedAt` is older than 3 days
- `workflowState = scheduled` and `scheduledPublishAt` is in the past

### Articles

An article belongs in `Needs attention` when any of these are true:

- `workflowState = draft` and `updatedAt` is older than 7 days
- `workflowState = in_review` and `updatedAt` is older than 3 days
- `workflowState = approved` and `updatedAt` is older than 3 days
- `workflowState = scheduled` and `scheduledPublishAt` is in the past

These thresholds should be explicit constants in the queue service, not hidden inline logic.

## Other Queue Sections

### Assigned / Active

This section should contain items actively owned and moving, but not currently stale enough for `Needs attention`.

Examples:

- submissions in `in_review` with a current owner and recent activity
- reviews or articles in `draft`, `in_review`, or `approved` with a current owner and recent updates

### Waiting

This section should contain items that are waiting on time or a later step rather than operator intervention right now.

Examples:

- scheduled reviews or articles with future publish dates
- submissions intentionally parked in a non-urgent resolved state

### Done Recently

This section should show recently completed work for confidence and short-term traceability.

Examples:

- submissions in `qualified`, `won`, `rejected`, or `archived` updated within the last 7 days
- reviews or articles in `published` updated within the last 7 days

## Queue Actions

The queue should support only light actions in v1.

### Form Submissions

Allowed light actions:

- assign owner
- clear owner
- set `status`
- set `followUpState`
- set `followUpAt`
- open full record

### Reviews

Allowed light actions:

- assign owner
- clear owner
- move `workflowState` between `draft`, `in_review`, and `approved`
- open full record

### Articles

Allowed light actions:

- assign owner
- clear owner
- move `workflowState` between `draft`, `in_review`, and `approved`
- open full record

The queue should not directly publish, revert, delete, or deeply edit records.

## Admin Experience

The `Work Queue` screen should provide:

- urgency sections
- row badges for source type and status
- filters for assignee, source type, status, and `needs attention`
- a clear link into the underlying edit view
- inline light actions that do not require leaving the queue for basic triage

The screen should optimize for scanning and movement, not for document authoring.

## Architecture

Implementation should land in three layers.

### 1. Queue Domain Layer

Add one explicit queue service that:

- fetches eligible records from source collections
- applies capability-aware visibility
- maps records into the shared queue item model
- computes urgency sections and attention reasons
- exposes the allowed light actions per item

This is the core of the feature.

### 2. Admin View Layer

Add one top-level Payload admin view for `Work Queue` that consumes the queue service.

This view is responsible for:

- rendering sections
- rendering filters
- invoking light actions
- linking out to the source record

The admin view should remain thin. Business rules belong in the queue domain layer.

### 3. Source Collection Updates

Update the source collections only where the queue truly needs new data:

- `followUpState` and `followUpAt` on `form-submissions`
- `owner` on `reviews`
- `owner` on `articles`
- editorial workflow support for `approved`

No queue-specific duplicate persistence should be introduced.

## Testing

The most important coverage is behavioral, not cosmetic.

Tests should prove:

- admins see all eligible items
- non-admin users only see items for record types allowed by their capabilities
- `Needs attention` classification works for unassigned, stale, overdue, and ready-but-unpublished cases
- queue actions update the underlying records instead of shadow copies
- queue actions do not bypass collection access rules

This should be covered with focused integration tests plus any small unit-level tests needed for pure queue logic.

## Non-Goals

This phase does not include:

- page workflow in the queue
- admin homepage widgets
- queue analytics
- queue persistence
- manual escalation flags
- bulk actions across many records
- publish actions directly from the queue

## Success Criteria

This phase is successful when:

- operators have one clear place to see cross-collection work
- the queue reflects real urgency instead of generic lists
- light actions reduce collection-hopping for common triage work
- the queue honors the existing capability model
- the implementation adds one reusable operator surface without creating a second workflow system
