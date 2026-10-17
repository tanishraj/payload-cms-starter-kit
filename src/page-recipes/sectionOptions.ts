import type { PageSectionOption } from '@/components/revamp/page-section-select'

/** Native Pages REST still owns authorization. Never infer availability from failed/partial reads. */
export function parseRecipeSectionOptions(value: unknown): PageSectionOption[] {
  if (!value || typeof value !== 'object') throw new Error('Invalid sections response.')
  const result = value as { docs?: unknown; hasNextPage?: unknown }
  if (!Array.isArray(result.docs) || result.hasNextPage !== false || result.docs.length > 50)
    throw new Error('Incomplete sections response.')
  const seen = new Set<string>()
  return result.docs.map((entry: unknown) => {
    if (!entry || typeof entry !== 'object') throw new Error('Invalid section.')
    const doc = entry as { id?: unknown; title?: unknown; slug?: unknown; parent?: unknown }
    if (
      typeof doc.id !== 'string' ||
      !doc.id ||
      seen.has(doc.id) ||
      typeof doc.title !== 'string' ||
      !doc.title.trim() ||
      doc.parent != null
    )
      throw new Error('Invalid section.')
    seen.add(doc.id)
    return {
      id: doc.id,
      label: `${doc.title}${typeof doc.slug === 'string' && doc.slug ? ` (/${doc.slug})` : ` (${doc.id})`}`,
    }
  })
}

export function recipeSectionsQuery() {
  return new URLSearchParams({
    depth: '0',
    draft: 'true',
    limit: '50',
    sort: 'title',
    'where[parent][exists]': 'false',
    'select[title]': 'true',
    'select[slug]': 'true',
    'select[parent]': 'true',
  }).toString()
}
