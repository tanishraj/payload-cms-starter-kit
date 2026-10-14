import { describe, expect, it } from 'vitest'
import { recoverFormAnswers } from '@/lib/recoverFormAnswers'
import type { SimpleFormField } from '@/lib/forms'

describe('compatible form answer recovery', () => {
  const old: SimpleFormField[] = [
    { id: 'name', name: 'old_name', label: 'Name', type: 'text' },
    {
      id: 'choice',
      name: 'department',
      label: 'Department',
      type: 'select',
      options: [{ label: 'Library', value: 'library' }],
    },
    { id: 'note', name: 'notes', label: 'Notes', type: 'textarea' },
  ]
  it('preserves stable identity through rename, relabel, reorder and choice label changes', () => {
    const next: SimpleFormField[] = [
      { ...old[1], options: [{ label: 'New library label', value: 'library' }] },
      { ...old[0], name: 'new_name', label: 'Full name' },
    ]
    expect(
      recoverFormAnswers(old, next, { old_name: 'Alex', department: 'library', notes: 'Removed' }),
    ).toEqual({
      values: { new_name: 'Alex', department: 'library' },
      clearedLabels: ['Notes'],
    })
  })
  it('clears removed options and changed control types, without moving an answer by matching name', () => {
    const next: SimpleFormField[] = [
      { ...old[0], type: 'email' },
      { ...old[1], options: [{ label: 'Admissions', value: 'admissions' }] },
      { ...old[2], id: 'replacement' },
    ]
    const result = recoverFormAnswers(old, next, {
      old_name: 'Alex',
      department: 'library',
      notes: 'Private answer',
    })
    expect(result.values).toEqual({ old_name: '', department: '', notes: '' })
    expect(result.clearedLabels).toEqual(['Name', 'Department', 'Notes'])
  })
  it('fails closed for missing/duplicated field IDs and newly invalid values', () => {
    expect(
      recoverFormAnswers([{ ...old[0], id: null }], [old[0]], { old_name: 'Alex' }).values.old_name,
    ).toBe('')
    expect(
      recoverFormAnswers([old[0]], [old[0], { ...old[0], name: 'copy' }], { old_name: 'Alex' })
        .values,
    ).toEqual({ old_name: '', copy: '' })
    expect(
      recoverFormAnswers([old[0]], [old[0]], { old_name: 'x'.repeat(501) }).clearedLabels,
    ).toEqual(['Name'])
  })
  it('retains a false checkbox answer only while it remains valid under the new required rule', () => {
    const field: SimpleFormField = {
      id: 'permission',
      name: 'permission',
      label: 'Permission',
      type: 'checkbox',
    }
    expect(recoverFormAnswers([field], [field], { permission: false })).toEqual({
      values: { permission: false },
      clearedLabels: [],
    })
    expect(
      recoverFormAnswers([field], [{ ...field, required: true }], { permission: false }),
    ).toEqual({ values: { permission: false }, clearedLabels: ['Permission'] })
  })
})
