import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { updateFormSubmissionActivity } from '@/hooks/updateFormSubmissionActivity'

const now = '2026-10-14T09:00:00.000Z'
const previousAction = '2026-10-13T09:00:00.000Z'
const first = '507f1f77bcf86cd799439011'
const second = '507f191e810c19729de860ea'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(now))
})
afterEach(() => vi.useRealTimers())

describe('submission owner activity', () => {
  it.each([
    ['assign string owner', null, first],
    ['reassign string owner', first, second],
    ['remove string owner', first, null],
    ['assign populated string owner', null, { id: first }],
    ['reassign populated string owner', { id: first }, { id: second }],
    ['remove populated string owner', { id: first }, null],
    ['retain numeric compatibility', 7, 9],
    ['remove numeric owner', { id: 7 }, null],
  ])('%s stamps activity without status or notes changing', async (_name, previous, owner) => {
    const result = await updateFormSubmissionActivity({
      operation: 'update',
      data: { owner },
      originalDoc: {
        id: 'submission',
        owner: previous,
        status: 'new',
        internalNotes: '',
        lastActionAt: previousAction,
      },
    } as never)
    expect(result).toEqual({ owner, lastActionAt: now })
  })

  it.each([
    ['same string owner', first, first],
    ['raw to populated string owner', first, { id: first }],
    ['populated to raw string owner', { id: first }, first],
    ['same populated owner', { id: first }, { id: first }],
    ['same numeric owner', 7, { id: 7 }],
    ['still unassigned', null, null],
    ['owner omitted', first, undefined],
  ])('%s does not create a false activity timestamp', async (_name, previous, owner) => {
    const data = owner === undefined ? {} : { owner }
    const result = await updateFormSubmissionActivity({
      operation: 'update',
      data,
      originalDoc: {
        id: 'submission',
        owner: previous,
        status: 'new',
        internalNotes: '',
        lastActionAt: previousAction,
      },
    } as never)
    expect(result).toEqual(data)
    expect(result).not.toHaveProperty('lastActionAt')
  })
})
