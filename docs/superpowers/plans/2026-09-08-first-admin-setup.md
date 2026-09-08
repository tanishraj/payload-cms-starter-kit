# First administrator setup

Approved design: first-account setup explains that the account will be the administrator and hides role and feature choices. Existing admins retain role selection for later accounts. Server-side first-account role assignment and bootstrap access restrictions remain authoritative.

Implementation:
- Add a conditional UI notice and restrict role field visibility to authenticated admins in Users.ts. Keep the existing feature visibility condition.
- Verify anonymous setup, Admin, and Site Manager visibility and that a submitted Site Manager role cannot override first-account Admin assignment.
- Generate types and the Admin import map, refresh project context, and run focused tests and TypeScript.
