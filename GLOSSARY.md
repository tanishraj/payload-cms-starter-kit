# Website builder

Canonical product language for planning in payload-cms-starter-kit. These definitions describe the intended domain; implementation status lives in the feature checklist.

## Language

**Admin**:
The role with full website and account authority, including assigning Site Managers and controlling shared resources.

**Site Manager**:
The role that creates, edits, saves, previews and publishes permitted content within assigned Page sections. Inbox access is a separate grant.
_Avoid_: editor or publisher as additional role types.

**Page**:
A website document whose content is composed from configured Blocks and references.

**Block**:
A supported typed content presentation placed in a Page; a Form block selects a reusable Form and owns its presentation.

**Page section**:
A permission scope rooted at a stable Page identity and covering its authorized descendants.
_Avoid_: section without qualification when discussing access.

**Layout section**:
A visual grouping in a page composition. It does not establish a permission scope.
_Avoid_: treating layout nesting as authorization.

**Section-owned resource**:
A Form or reusable content item owned within a Page section, manageable by authorized Site Managers.

**Admin-managed shared resource**:
A resource shared across Page sections whose original is controlled by Admins. Permission to use it does not imply permission to edit it.

**Form**:
A reusable definition of supported controls, custom labels/names, validation and submission behavior, selected by a presentation block.
_Avoid_: contact form when referring to all generic Forms.

**Published form revision**:
The published question definition against which a visitor’s answers are validated and interpreted. A changed definition requires explicit compatible-answer recovery; its exact identity contract remains to be specified.

**Submission**:
A captured set of answers to a Form, retaining the question meaning needed to read its history.

**Inbox access**:
Authority to inspect permitted Submissions, granted independently of placing a Form block on a Page. Export and attachment permissions remain separate policy questions.
