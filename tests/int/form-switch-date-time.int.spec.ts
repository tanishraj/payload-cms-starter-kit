import { describe, expect, it } from 'vitest'
import {
  isValidFormDate,
  isValidFormTime,
  validateFormTemporalConstraints,
} from '@/lib/formTemporal'
import {
  getFormFieldConfiguration,
  getFormInitialAnswers,
  getSubmissionContactMetadata,
  validateFormFieldDefinitions,
  validateFormFieldDefinitionsForIntent,
  validateFormSubmission,
  type SimpleFormField,
} from '@/lib/forms'
import { buildFormSubmissionSnapshot } from '@/lib/formSubmissionSnapshot'
import { recoverFormAnswers } from '@/lib/recoverFormAnswers'

const date: SimpleFormField = { id: 'date', name: 'email', label: 'Visit date', type: 'date' }
const time: SimpleFormField = { id: 'time', name: 'phone', label: 'Visit time', type: 'time' }
const toggle: SimpleFormField = {
  id: 'switch',
  name: 'reminder',
  label: 'Reminder',
  type: 'switch',
}
const validate = (field: SimpleFormField, value: unknown) =>
  validateFormSubmission({ fields: [field], values: { [field.name]: value } })

describe('timezone-free Date and Time controls', () => {
  it.each(['0001-01-01', '1900-02-28', '2000-02-29', '2024-02-29', '2026-12-31', '9999-12-31'])(
    'accepts real calendar day %s',
    (value) => expect(isValidFormDate(value)).toBe(true),
  )
  it.each([
    '0000-01-01',
    '10000-01-01',
    '1900-02-29',
    '2100-02-29',
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-00-01',
    '2026-01-00',
    '2026-1-01',
    '01/01/2026',
    '2026-01-01T00:00:00Z',
    '2026-01-01Z',
  ])('rejects invalid/ambiguous date %s', (value) => expect(isValidFormDate(value)).toBe(false))
  it.each(['00:00', '09:05', '12:00', '23:59'])('accepts minute local time %s', (value) =>
    expect(isValidFormTime(value)).toBe(true),
  )
  it.each([
    '24:00',
    '12:60',
    '9:05',
    '09:5',
    '09:05:00',
    '09:05Z',
    '9:05 AM',
    '12:00+04:00',
    ' 12:00 ',
  ])('rejects invalid/ambiguous time %s', (value) => expect(isValidFormTime(value)).toBe(false))
  it('enforces inclusive ranges without dates, instants or overnight coercion', () => {
    const boundedDate = { ...date, minDate: '2026-10-20', maxDate: '2026-10-31' }
    expect(validate(boundedDate, '2026-10-20').errors).toEqual({})
    expect(validate(boundedDate, '2026-10-31').errors).toEqual({})
    expect(validate(boundedDate, '2026-10-19').errors.email).toContain('or later')
    expect(validate(boundedDate, '2026-11-01').errors.email).toContain('or earlier')
    const boundedTime = { ...time, minTime: '09:00', maxTime: '17:00' }
    expect(validate(boundedTime, '09:00').errors).toEqual({})
    expect(validate(boundedTime, '17:00').errors).toEqual({})
    expect(validate(boundedTime, '08:59').errors.phone).toContain('or later')
    expect(validate(boundedTime, '17:01').errors.phone).toContain('or earlier')
    expect(validateFormTemporalConstraints('time', { minTime: '22:00', maxTime: '02:00' })).toBe(
      false,
    )
  })
  it.each([null, true, 2, {}, []])('rejects non-string temporal answer %j', (value) => {
    expect(validate(date, value).errors.email).toContain('text')
    expect(validate(time, value).errors.phone).toContain('text')
  })
  it('allows blank optional answers but never supplies an omitted initial answer', () => {
    expect(validate(date, '').errors).toEqual({})
    expect(validate(time, '').errors).toEqual({})
    expect(
      validateFormSubmission({
        fields: [{ ...date, required: true, defaultValue: '2026-10-22' }],
        values: {},
      }).errors.email,
    ).toContain('required')
    expect(validate(time, ' 09:00 ').normalizedData.phone).toBe('09:00')
    expect(validateFormFieldDefinitions([{ ...date, defaultValue: '2026-02-30' }])).toContain(
      'Initial answer',
    )
    expect(
      validateFormFieldDefinitions([{ ...time, minTime: '09:00', defaultValue: '08:00' }]),
    ).toContain('Initial answer')
  })
  it.each([
    { minDate: '2026-02-30' },
    { maxDate: '0000-01-01' },
    { minDate: '2026-11-01', maxDate: '2026-10-01' },
    { minDate: ' 2026-10-01' },
    { minDate: 0 },
    { maxDate: false },
  ])('rejects malformed date bounds %j', (config) =>
    expect(validateFormFieldDefinitions([{ ...date, ...config }])).toContain('Date limits'),
  )
  it.each([
    { minTime: '24:00' },
    { maxTime: '09:00:00' },
    { minTime: '22:00', maxTime: '02:00' },
    { minTime: 0 },
    { maxTime: false },
  ])('rejects malformed time bounds %j', (config) =>
    expect(validateFormFieldDefinitions([{ ...time, ...config }])).toContain('Time limits'),
  )
  it('retains inactive settings without including them in the current revision', () => {
    expect(
      getFormFieldConfiguration({
        ...date,
        minDate: '2026-10-01',
        maxTime: '17:00',
        defaultChecked: true,
      }),
    ).toEqual({ minDate: '2026-10-01' })
    expect(getFormFieldConfiguration({ ...time, minDate: '2026-10-01', maxTime: '17:00' })).toEqual(
      { maxTime: '17:00' },
    )
    expect(
      getFormFieldConfiguration({
        ...toggle,
        defaultValue: 'old text',
        minDate: '2026-10-01',
        defaultChecked: true,
      }),
    ).toEqual({ defaultChecked: true })
    expect(validateFormFieldDefinitions([{ ...date, minDate: '', maxDate: '' }])).toBe(true)
  })
})

describe('Switch boolean contract', () => {
  it.each([true, false])('keeps explicit boolean %j', (value) =>
    expect(validate(toggle, value)).toEqual({ errors: {}, normalizedData: { reminder: value } }),
  )
  it.each(['true', 'false', 'on', 'off', '', 1, 0, null, {}, []])('rejects coercion %j', (value) =>
    expect(validate(toggle, value).errors.reminder).toContain('true or false'),
  )
  it('requires explicit on-state and disallows required preselection', () => {
    expect(validate({ ...toggle, required: true }, false).errors.reminder).toContain('turned on')
    expect(validate({ ...toggle, required: true }, true).errors).toEqual({})
    expect(
      validateFormFieldDefinitions([{ ...toggle, required: true, defaultChecked: true }]),
    ).toContain('start off')
    expect(validateFormFieldDefinitions([{ ...toggle, defaultChecked: 'on' }])).toContain(
      'true or false',
    )
    expect(
      getFormInitialAnswers([
        { ...toggle, defaultChecked: true },
        { ...date, defaultValue: '2026-10-22' },
      ]),
    ).toEqual({ reminder: true, email: '2026-10-22' })
    expect(
      validateFormSubmission({ fields: [{ ...toggle, defaultChecked: true }], values: {} })
        .normalizedData.reminder,
    ).toBe(false)
  })
})

describe('temporal history, recovery and compatibility', () => {
  it('captures original day/time/boolean meaning and active rules without timezone conversion', () => {
    const form = {
      id: 'f',
      slug: 'visits',
      title: 'Visits',
      fields: [{ ...date, minDate: '2026-10-20' }, time, toggle],
    }
    const snapshot = buildFormSubmissionSnapshot(form, {
      email: '2026-10-22',
      phone: '10:30',
      reminder: true,
    })
    expect(snapshot.answers.map((answer) => [answer.displayValue, answer.value])).toEqual([
      ['2026-10-22', { raw: '2026-10-22' }],
      ['10:30', { raw: '10:30' }],
      ['Yes', { raw: true }],
    ])
    expect(snapshot.formSnapshot.fields[0]).toMatchObject({ minDate: '2026-10-20' })
    expect(
      buildFormSubmissionSnapshot(
        { ...form, fields: [{ ...date, minDate: '2026-10-23' }, time, toggle] },
        {},
      ).formRevision,
    ).not.toBe(snapshot.formRevision)
    expect(
      getSubmissionContactMetadata({ email: '2026-10-22', phone: '10:30' }, [date, time]),
    ).toEqual({ email: undefined, name: undefined, phone: undefined })
  })
  it('preserves renamed valid answers but clears incompatible bounds/type and newly-required off-state without refilling defaults', () => {
    const next = [
      { ...date, name: 'day', minDate: '2026-10-20' },
      { ...time, minTime: '11:00', defaultValue: '12:00' },
      { ...toggle, required: true, defaultChecked: false },
    ]
    expect(
      recoverFormAnswers([date, time, toggle], next, {
        email: '2026-10-22',
        phone: '10:30',
        reminder: false,
      }),
    ).toEqual({
      values: { day: '2026-10-22', phone: '', reminder: false },
      clearedLabels: ['Visit time', 'Reminder'],
      partiallyClearedLabels: [],
    })
    expect(
      recoverFormAnswers([toggle], [{ ...toggle, type: 'checkbox' }], { reminder: true }).values
        .reminder,
    ).toBe(false)
    expect(
      recoverFormAnswers([date], [{ ...date, type: 'time', defaultValue: '12:00' }], {
        email: '2026-10-22',
      }).values.email,
    ).toBe('')
  })
  it.each([date, time, toggle])('rejects $type on fixed Review forms', (field) =>
    expect(
      validateFormFieldDefinitionsForIntent({ fields: [field], submissionIntent: 'review' }),
    ).toContain('General/Lead'),
  )
})

it('reports invalid temporal configuration as an answer error instead of accepting it', () => {
  expect(validate({ ...date, minDate: '2026-02-30' }, '2026-10-22').errors.email).toContain(
    'limits are invalid',
  )
})
