export type FormSubmissionEventInput = {
  formId: number
  formSlug: string
  submissionId: number
  values: Record<string, boolean | string>
}

// Starter seam for project-specific lead routing or downstream automation.
export const emitFormSubmissionEvent = async (
  _input: FormSubmissionEventInput,
): Promise<void> => {
  return
}
