import { describe, expect, it } from 'vitest'

import { System404Block } from '@/blocks/System404/config'
import { SystemComingSoonBlock } from '@/blocks/SystemComingSoon/config'
import { SystemMaintenanceBlock } from '@/blocks/SystemMaintenance/config'
import { createBaseSystemPageFields } from '@/blocks/systemPageFields'

type NamedField = {
  defaultValue?: unknown
  fields?: unknown[]
  name: string
  type?: string
}

const flattenNamedFields = (fields: unknown[]): NamedField[] => {
  return fields.flatMap((field) => {
    if (typeof field !== 'object' || field === null) {
      return []
    }

    const nestedFields = 'fields' in field && Array.isArray(field.fields) ? flattenNamedFields(field.fields) : []
    const currentField =
      'name' in field && typeof field.name === 'string'
        ? [
            {
              name: field.name,
              type: 'type' in field && typeof field.type === 'string' ? field.type : undefined,
              defaultValue: 'defaultValue' in field ? field.defaultValue : undefined,
            },
          ]
        : []

    return [...currentField, ...nestedFields]
  })
}

const getNamedField = (fields: unknown[], fieldName: string): NamedField => {
  const field = flattenNamedFields(fields).find((candidate) => candidate.name === fieldName)

  if (!field) {
    throw new Error(`Expected to find "${fieldName}".`)
  }

  return field
}

describe('system page block schemas', () => {
  it('keeps the block assembly thin and the field factory reusable', () => {
    expect(typeof createBaseSystemPageFields).toBe('function')
  })

  it('keeps the shared core fields across all system page blocks', () => {
    for (const block of [System404Block, SystemMaintenanceBlock, SystemComingSoonBlock]) {
      const fieldNames = flattenNamedFields(block.fields).map((field) => field.name)

      expect(fieldNames).toEqual(
        expect.arrayContaining([
          'badge',
          'heading',
          'description',
          'supportingNote',
          'primaryAction',
          'secondaryAction',
        ]),
      )
    }
  })

  it('keeps the minimal shared schema and removes rich-layout fields', () => {
    const removedFields = ['helpLinks', 'serviceMessage', 'expectedBackAt', 'eyebrow', 'signupNote', 'image']

    for (const block of [System404Block, SystemMaintenanceBlock, SystemComingSoonBlock]) {
      const fieldNames = flattenNamedFields(block.fields).map((field) => field.name)

      for (const fieldName of removedFields) {
        expect(fieldNames).not.toContain(fieldName)
      }
    }
  })

  it('prefills simple user-friendly default copy for each system page type', () => {
    expect(getNamedField(System404Block.fields, 'badge').defaultValue).toBe('404')
    expect(getNamedField(System404Block.fields, 'heading').defaultValue).toBe(
      "We couldn't find that page",
    )
    expect(getNamedField(System404Block.fields, 'description').defaultValue).toBe(
      'It may have been moved, deleted, or the web address might be incorrect.',
    )

    expect(getNamedField(SystemMaintenanceBlock.fields, 'badge').defaultValue).toBe('Maintenance')
    expect(getNamedField(SystemMaintenanceBlock.fields, 'heading').defaultValue).toBe(
      'This website is temporarily unavailable',
    )
    expect(getNamedField(SystemMaintenanceBlock.fields, 'description').defaultValue).toBe(
      'We are carrying out scheduled updates to improve the website. Please check back shortly.',
    )

    expect(getNamedField(SystemComingSoonBlock.fields, 'badge').defaultValue).toBe('Coming Soon')
    expect(getNamedField(SystemComingSoonBlock.fields, 'heading').defaultValue).toBe('This website is being prepared')
    expect(getNamedField(SystemComingSoonBlock.fields, 'description').defaultValue).toBe(
      'We are finalizing the website and its information. Please check back again soon.',
    )
  })
})
