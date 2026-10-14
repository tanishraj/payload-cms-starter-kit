/** Browser-safe upload policy; byte/content checks and storage stay on the server. */
export const formFileTypeOptions = [
  { label: 'PDF', value: 'pdf', mime: 'application/pdf', extensions: ['pdf'] },
  {
    label: 'Word (.docx)',
    value: 'docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['docx'],
  },
  { label: 'PNG', value: 'png', mime: 'image/png', extensions: ['png'] },
  { label: 'JPEG', value: 'jpg', mime: 'image/jpeg', extensions: ['jpg', 'jpeg'] },
] as const
export type FormFileType = (typeof formFileTypeOptions)[number]['value']
export type FormFilePolicy = {
  allowedFileTypes?: FormFileType[] | null
  maxFileSizeMB?: number | null
  maxFiles?: number | null
}
export type UploadedFormFile = {
  token: string
  filename: string
  size: number
  fileType: FormFileType
}
export const FORM_FILE_MAX_BYTES = 3 * 1024 * 1024
export const FORM_FILE_MAX_COUNT = 5
export const FORM_ATTEMPT_MAX_FILES = 10
export const isUploadToken = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value)
export const getFormFilePolicy = (policy: FormFilePolicy) => ({
  allowedFileTypes:
    policy.allowedFileTypes == null ||
    (Array.isArray(policy.allowedFileTypes) && policy.allowedFileTypes.length === 0)
      ? (['pdf', 'docx', 'png', 'jpg'] as FormFileType[])
      : policy.allowedFileTypes,
  maxFileSizeMB: policy.maxFileSizeMB ?? 3,
  maxFiles: policy.maxFiles ?? 1,
})
export const validateFormFilePolicy = (policy: FormFilePolicy): boolean => {
  const value = getFormFilePolicy(policy)
  return (
    Array.isArray(value.allowedFileTypes) &&
    value.allowedFileTypes.length > 0 &&
    new Set(value.allowedFileTypes).size === value.allowedFileTypes.length &&
    value.allowedFileTypes.every((type) =>
      formFileTypeOptions.some((option) => option.value === type),
    ) &&
    Number.isInteger(value.maxFileSizeMB) &&
    value.maxFileSizeMB >= 1 &&
    value.maxFileSizeMB <= 3 &&
    Number.isInteger(value.maxFiles) &&
    value.maxFiles >= 1 &&
    value.maxFiles <= FORM_FILE_MAX_COUNT
  )
}
export const isCompatibleFormFile = (file: UploadedFormFile, policy: FormFilePolicy) => {
  const limits = getFormFilePolicy(policy)
  return (
    validateFormFilePolicy(policy) &&
    file.size > 0 &&
    file.size <= limits.maxFileSizeMB * 1024 * 1024 &&
    limits.allowedFileTypes.includes(file.fileType)
  )
}
export const getFormFileAccept = (policy: FormFilePolicy) => {
  const types = getFormFilePolicy(policy).allowedFileTypes
  return formFileTypeOptions
    .filter((option) => types.includes(option.value))
    .flatMap((option) => option.extensions.map((extension) => `.${extension}`))
    .join(',')
}
export const getFormFileHelp = (policy: FormFilePolicy) => {
  const limits = getFormFilePolicy(policy)
  const types = formFileTypeOptions
    .filter((option) => limits.allowedFileTypes.includes(option.value))
    .map((option) => option.label)
    .join(', ')
  return `${types}. Up to ${limits.maxFiles} file${limits.maxFiles === 1 ? '' : 's'}, ${limits.maxFileSizeMB} MB each. Files are private; send the form to attach them to your response.`
}
export const getClientFileError = (file: Pick<File, 'name' | 'size'>, policy: FormFilePolicy) => {
  const limits = getFormFilePolicy(policy)
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!file.name || file.name.length > 150 || /[\\/\u0000-\u001f\u007f]/.test(file.name))
    return 'Use a filename of up to 150 characters without path separators.'
  if (
    !formFileTypeOptions.some(
      (option) =>
        limits.allowedFileTypes.includes(option.value) &&
        (option.extensions as readonly string[]).includes(extension ?? ''),
    )
  )
    return 'This file type is not allowed. Choose one of the listed formats.'
  if (file.size < 1) return 'This file is empty. Choose a file with content.'
  if (file.size > limits.maxFileSizeMB * 1024 * 1024)
    return `This file exceeds ${limits.maxFileSizeMB} MB. Choose a smaller file.`
  return null
}
