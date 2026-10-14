/** Calendar dates and minute-precision local times. No Date/UTC conversion. */
export type FormTemporalType = 'date' | 'time'
export type FormTemporalConstraints = {
  minDate?: string | null
  maxDate?: string | null
  minTime?: string | null
  maxTime?: string | null
}

export const isValidFormDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  if (year < 1 || month < 1 || month > 12 || day < 1) return false
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
}

export const isValidFormTime = (value: string): boolean => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)

export const getFormTemporalBounds = (type: FormTemporalType, config: FormTemporalConstraints) => ({
  minimum: (type === 'date' ? config.minDate : config.minTime) || undefined,
  maximum: (type === 'date' ? config.maxDate : config.maxTime) || undefined,
})

export const validateFormTemporalConstraints = (
  type: FormTemporalType,
  config: FormTemporalConstraints,
): boolean => {
  const rawBounds =
    type === 'date' ? [config.minDate, config.maxDate] : [config.minTime, config.maxTime]
  const { minimum, maximum } = getFormTemporalBounds(type, config)
  const valid = type === 'date' ? isValidFormDate : isValidFormTime
  if (
    !rawBounds.every(
      (value) => value == null || value === '' || (typeof value === 'string' && valid(value)),
    )
  )
    return false
  return (
    (!minimum || (typeof minimum === 'string' && valid(minimum))) &&
    (!maximum || (typeof maximum === 'string' && valid(maximum))) &&
    (!minimum || !maximum || minimum <= maximum)
  )
}

export const getFormTemporalError = (
  value: string,
  type: FormTemporalType,
  config: FormTemporalConstraints,
  label: string,
): string | undefined => {
  const valid = type === 'date' ? isValidFormDate : isValidFormTime
  if (!valid(value))
    return type === 'date'
      ? `${label} must be a valid calendar date in YYYY-MM-DD format (year 0001–9999).`
      : `${label} must be a local time in HH:mm format (00:00–23:59).`
  const { minimum, maximum } = getFormTemporalBounds(type, config)
  if (minimum && value < minimum) return `${label} must be ${minimum} or later.`
  if (maximum && value > maximum) return `${label} must be ${maximum} or earlier.`
}
