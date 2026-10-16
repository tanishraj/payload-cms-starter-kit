/** Browser-safe scope metadata and relationship normalization; grants are enforced in sectionAccess. */
export const scopedSourceFeatures = [
  'pages',
  'forms',
  'reusableSections',
  'formSubmissions',
] as const

export const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string' && value.length) return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (value && typeof value === 'object' && 'id' in value) return relationshipID(value.id)
  return null
}
export const normalizeSectionRoots = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.map(relationshipID).filter((id): id is string => id !== null))].sort()
    : []
