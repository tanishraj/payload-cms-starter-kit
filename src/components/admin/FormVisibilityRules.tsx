'use client'

import { useField, useFormFields } from '@payloadcms/ui'
import type { UIFieldClientProps } from 'payload'
import { useMemo } from 'react'

import type { FormConditionOperator, FormVisibilityCondition } from '@/lib/formConditions'

type AdminValue = { value?: unknown }
type AdminFields = Record<string, AdminValue>

const getQuestions = (fields: AdminFields) => {
  const rows = new Map<string, Partial<Record<'id' | 'name' | 'label' | 'type', unknown>>>()
  for (const [path, item] of Object.entries(fields)) {
    const match = path.match(/^(fields\.\d+(?:\.questions\.\d+)?)\.(id|name|label|type)$/)
    if (match) rows.set(match[1], { ...rows.get(match[1]), [match[2]]: item.value })
  }
  return [...rows.entries()].flatMap(([path, question]) => {
    if (
      typeof question.id !== 'string' ||
      typeof question.name !== 'string' ||
      typeof question.label !== 'string' ||
      typeof question.type !== 'string'
    )
      return []
    return [{ id: question.id, label: question.label, name: question.name, path, type: question.type }]
  })
}

const questionOrder = (path: string): [number, number] => {
  const match = path.match(/^fields\.(\d+)(?:\.questions\.(\d+))?$/)
  return match ? [Number(match[1]), match[2] == null ? -1 : Number(match[2])] : [Infinity, Infinity]
}

const operators: { label: string; value: FormConditionOperator }[] = [
  { label: 'has an answer', value: 'answered' },
  { label: 'has no answer', value: 'unanswered' },
  { label: 'equals', value: 'equals' },
  { label: 'does not equal', value: 'notEquals' },
]

export function FormVisibilityRules({ path, readOnly }: UIFieldClientProps) {
  const { value, setValue } = useField<unknown>({ path })
  const formFields = useFormFields(([fields]) => fields as AdminFields)
  const currentPath = path.replace(/\.visibilityConditions$/, '')
  const [currentTopLevelOrder, currentNestedOrder] = questionOrder(currentPath)
  const candidates = useMemo(
    () => getQuestions(formFields).filter((question) => {
      const order = questionOrder(question.path)
      return order[0] < currentTopLevelOrder || (order[0] === currentTopLevelOrder && order[1] < currentNestedOrder)
    }),
    [currentTopLevelOrder, currentNestedOrder, formFields],
  )
  const rules = Array.isArray(value)
    ? (value.filter((rule): rule is FormVisibilityCondition => Boolean(rule && typeof rule === 'object')) as FormVisibilityCondition[])
    : []

  const update = (index: number, patch: Partial<FormVisibilityCondition>) => {
    setValue(rules.map((rule, ruleIndex) => (ruleIndex === index ? { ...rule, ...patch } : rule)))
  }

  return (
    <fieldset className="field-type" disabled={readOnly}>
      <legend className="field-label">Show this question when…</legend>
      <p className="field-description">
        Add one or more rules. Every rule must match. Rules can use earlier questions only, so visitors see each question in a predictable order.
      </p>
      {rules.map((rule, index) => {
        const source = candidates.find((question) => question.id === rule.fieldID)
        const optionPrefix = source ? `${source.path}.options.` : ''
        const optionValues = source
          ? Object.entries(formFields)
              .filter(([key]) => key.startsWith(optionPrefix) && key.endsWith('.value'))
              .map(([, item]) => item.value)
              .filter((item): item is string => typeof item === 'string')
          : []
        const booleanSource = source && ['checkbox', 'switch'].includes(source.type)
        const choicesSource = source && ['select', 'radio', 'checkboxGroup', 'multiSelect'].includes(source.type)
        const availableOperators = source?.type === 'file'
          ? operators.filter((operator) => operator.value === 'answered' || operator.value === 'unanswered')
          : operators
        return (
          <div key={`${rule.fieldID}-${index}`} className="form-visibility-rules__row">
            <label>
              <span>Question</span>
              <select value={rule.fieldID} onChange={(event) => update(index, { fieldID: event.target.value, operator: 'answered', value: undefined })}>
                {candidates.map((question) => <option key={question.id} value={question.id}>{question.label} ({question.type})</option>)}
              </select>
            </label>
            <label>
              <span>Answer</span>
              <select value={rule.operator} onChange={(event) => update(index, { operator: event.target.value as FormConditionOperator, value: undefined })}>
                {availableOperators.map((operator) => <option key={operator.value} value={operator.value}>{operator.label}</option>)}
              </select>
            </label>
            {(rule.operator === 'equals' || rule.operator === 'notEquals') && (
              <label>
                <span>Value</span>
                {booleanSource ? (
                  <select value={rule.value ?? ''} onChange={(event) => update(index, { value: event.target.value })}>
                    <option value="">Choose…</option><option value="true">Yes</option><option value="false">No</option>
                  </select>
                ) : choicesSource ? (
                  <select value={rule.value ?? ''} onChange={(event) => update(index, { value: event.target.value })}>
                    <option value="">Choose…</option>{optionValues.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : (
                  <input value={rule.value ?? ''} maxLength={500} onChange={(event) => update(index, { value: event.target.value })} />
                )}
              </label>
            )}
            <button type="button" onClick={() => setValue(rules.filter((_, ruleIndex) => ruleIndex !== index))}>Remove rule</button>
          </div>
        )
      })}
      {candidates.length > 0 ? (
        <button type="button" onClick={() => setValue([...rules, { fieldID: candidates[0].id, operator: 'answered' }])}>Add condition</button>
      ) : (
        <p className="field-description">Add an earlier question first to make this question conditional.</p>
      )}
    </fieldset>
  )
}
