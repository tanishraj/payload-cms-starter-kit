export type FormSubmissionEventInput = {
  campaign?: string
  formId: number
  formSlug: string
  landingPage?: string
  owner?: number
  source?: string
  submissionId: number
  submissionIntent: 'general' | 'lead' | 'review'
  status: 'new' | 'in_review' | 'qualified' | 'won' | 'rejected' | 'archived'
  submitterEmail?: string
  submitterName?: string
  values: Record<string, boolean | string>
}

// Starter seam for project-specific lead routing or downstream automation.
export const emitFormSubmissionEvent = async (
  _input: FormSubmissionEventInput,
): Promise<void> => {
  return
}
