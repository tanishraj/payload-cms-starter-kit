'use client'

/** Source: authenticated @shadcnblocks/field-field-advanced-4,
 * @shadcnblocks/form-form-multi-field-6 and @shadcnblocks/field-field-advanced-5.
 * Preserve FieldSet/Legend/Description/Group and FieldSeparator compositions.
 * Adaptations: typed display entries and caller-supplied question controls.
 */
import { cn } from '@/lib/utils'
import { Fragment, type ReactNode, useId } from 'react'
import { FieldDescription, FieldGroup, FieldLegend, FieldSeparator, FieldSet } from './ui/field'
import type { FormLayoutEntry } from '@/lib/formLayout'

export function FormLayout({
  entries,
  names,
  children,
  headingLevel = 3,
  twoColumns = false,
  compact = false,
}: {
  twoColumns?: boolean
  compact?: boolean
  headingLevel?: 3 | 4
  entries?: FormLayoutEntry[]
  names: string[]
  children: ReactNode[]
}) {
  const prefix = useId()
  if (!entries) return children
  const fullWidth = twoColumns && '@lg/form:col-span-2'
  const Heading = headingLevel === 3 ? 'h3' : 'h4'
  const questions = new Map(names.map((name, i) => [name, children[i]]))
  return entries.map((entry, i) => {
    const id = `${prefix}-${i}`
    switch (entry.kind) {
      case 'question':
        return <Fragment key={id}>{questions.get(entry.name)}</Fragment>
      case 'heading':
        return (
          <Heading key={id} className={cn('text-base font-medium wrap-anywhere', fullWidth)}>
            {entry.text}
          </Heading>
        )
      case 'description':
        return (
          <FieldDescription key={id} className={cn('whitespace-pre-line wrap-anywhere', fullWidth)}>
            {entry.text}
          </FieldDescription>
        )
      case 'separator':
        return <FieldSeparator key={id} className={cn(fullWidth)} />
      case 'group':
        return (
          <FieldSet
            className={cn('min-w-0', fullWidth, compact && 'gap-3')}
            key={id}
            aria-describedby={entry.description ? `${id}-description` : undefined}
          >
            <FieldLegend className="wrap-anywhere">{entry.label}</FieldLegend>
            {entry.description && (
              <FieldDescription
                id={`${id}-description`}
                className="whitespace-pre-line wrap-anywhere"
              >
                {entry.description}
              </FieldDescription>
            )}
            <FieldGroup
              className={cn(twoColumns && 'grid gap-4 @lg/form:grid-cols-2', compact && 'gap-3')}
            >
              {entry.questions.map((name) => (
                <Fragment key={name}>{questions.get(name)}</Fragment>
              ))}
            </FieldGroup>
          </FieldSet>
        )
    }
  })
}
