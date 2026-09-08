import type { SectionContentAlignment } from './sectionFields'

export const preferCanonicalActions = <T>(canonical?: T[] | null, legacy?: T[] | null): T[] =>
  (canonical?.length ? canonical : legacy) ?? []

export const resolveSectionAlignment = (
  canonical: SectionContentAlignment | null | undefined,
  legacy: SectionContentAlignment | null | undefined,
  fallback: SectionContentAlignment,
): SectionContentAlignment => canonical ?? legacy ?? fallback
