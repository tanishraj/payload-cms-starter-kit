export const editorialWorkflowStateOptions = [
  {
    label: 'Draft',
    value: 'draft',
  },
  {
    label: 'In Review',
    value: 'in_review',
  },
  {
    label: 'Scheduled',
    value: 'scheduled',
  },
  {
    label: 'Published',
    value: 'published',
  },
  {
    label: 'Reverted',
    value: 'reverted',
  },
] as const

export type EditorialWorkflowState =
  (typeof editorialWorkflowStateOptions)[number]['value']
