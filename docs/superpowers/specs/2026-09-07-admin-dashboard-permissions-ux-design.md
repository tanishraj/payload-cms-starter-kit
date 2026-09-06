# Admin Dashboard and Permission UX Design

## Status

Approved for implementation. Keep all changes uncommitted until the user explicitly requests a
commit.

## Objective

Make the Payload Admin easier to scan and operate without changing the two-role authorization model,
the 29-feature registry, stored user grants, or server-side access behavior.

The change has three parts:

1. replace Payload's default dashboard contents with the existing capability-aware dashboard so
   collection/global cards are not repeated;
2. make Site Manager feature assignment understandable at a glance and efficient to edit; and
3. move every block's optional Section Anchor ID into a consistent collapsed Advanced area while
   preserving its top-level stored path.

## Chosen Approach

### Dashboard view replacement

Register a custom `admin.components.views.dashboard.Component` and remove the current
`beforeDashboard` registration. Payload continues to own the Admin shell, navigation, header, and
authentication boundary; the custom view replaces only the dashboard body.

The dashboard receives the authenticated Payload instance and user from the view instead of
performing a second authentication request. Its queries continue to pass the user with
`overrideAccess: false` and are created only for granted features.

The dashboard will:

- keep Needs Attention, Content Overview, Quick Actions, Recently Edited, and Recent Submissions;
- include Reviews in Recently Edited when the Reviews feature is available;
- show `Count unavailable` when an authorized count fails instead of displaying a false zero;
- distinguish a genuinely zero-grant Site Manager from a manager whose only grants do not have a
  dashboard widget;
- provide a compact authorized-feature fallback for the latter case, linking to the granted Admin
  destinations;
- use semantic sections and headings; and
- allow the submissions table to scroll horizontally on narrow screens rather than clipping data.

### Site Manager feature assignment

Retain the existing native checkbox fields and exact `features.<key>` storage paths. Layer small
Payload UI fields around those checkboxes:

- a summary reports the number of direct grants selected and the supporting read-only destinations
  implied by those grants;
- global Select all and Clear all controls update all 29 native checkboxes;
- each Admin-sidebar group starts collapsed, includes its feature count in the label, reports the
  selected count when open, and provides Select group and Clear group controls; and
- concise guidance explains that dependency access is read-only, cannot expose the destination in
  navigation, and that saving changed grants signs the Site Manager out of active sessions.

Bulk controls are buttons, remain keyboard accessible, and use Payload theme variables. They do not
save automatically: the Admin still reviews the resulting form and uses Payload's Save action.

### Block anchor advanced configuration

Change the shared anchor field factory to return an unnamed, initially collapsed `Advanced`
collapsible containing the existing `anchorId` text field. Because the collapsible is unnamed,
Payload continues to store `anchorId` directly on each block. Validation, rendering, fragment URLs,
and existing documents remain unchanged.

## Alternatives Considered

### Native configuration only

Collapsing the permission groups and changing descriptions would be low risk, but it would not give
Admins selection counts, bulk controls, or an effective-access explanation.

### Full custom permission form or Admin shell

Replacing native fields or the complete Payload shell would allow total layout control, but would
duplicate Payload behavior, increase upgrade risk, and create a second authorization-editing path.
The selected approach customizes only the missing interactions while keeping Payload's form state,
validation, save behavior, and navigation.

## Accessibility and Responsive Behavior

- Dashboard regions use ordered headings and native links.
- Bulk controls use native buttons with explicit action labels and visible Payload focus states.
- Live permission summaries use polite status semantics without moving keyboard focus.
- Permission controls wrap instead of overflowing at narrow widths.
- The submissions table remains complete through horizontal page-local scrolling.
- Colors and borders use Payload semantic theme variables in light and dark modes.

## Security and Data Integrity

- No access helper, hook, role, feature key, dependency edge, or collection/global policy changes.
- Custom controls update only the existing native form fields.
- The server remains authoritative and continues to normalize all 29 feature values.
- Session invalidation and audit hooks remain unchanged.
- Dashboard Local API calls retain `overrideAccess: false` with the authenticated user.
- No data migration is required.

## Verification

- Assert the custom dashboard view replaces `beforeDashboard`.
- Cover zero-grant and non-widget-only Site Manager states.
- Cover truthful unavailable counts and Reviews in recent edits.
- Assert permission group collapse, counts, component registration, and unchanged field keys.
- Unit-test permission summary/dependency calculations and bulk form-state updates.
- Assert the shared block anchor remains top-level under an unnamed collapsed Advanced field.
- Regenerate the Payload import map and types.
- Run focused Admin, access, dashboard, and anchor tests, then lint/type/build checks proportional to
  the changed server/client boundaries.
