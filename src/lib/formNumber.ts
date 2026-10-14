export type FormNumberConstraints = {
  minValue?: number | null
  maxValue?: number | null
  step?: number | null
}

type Decimal = { units: bigint; scale: number }

// Answers use decimal notation; scientific notation is only needed to represent
// finite JavaScript configuration values. Bounds are applied without rounding answers.
const decimal = (value: string, allowExponent = false): Decimal | null => {
  const match = /^([+-]?)(?:(\d+)(?:\.(\d+))?|\.(\d+))(?:[eE]([+-]?\d{1,3}))?$/.exec(value)
  if (!match || (!allowExponent && match[5])) return null
  const fraction = match[3] ?? match[4] ?? ''
  let scale = fraction.length - Number(match[5] ?? 0)
  let units = BigInt((match[2] ?? '0') + fraction) * (match[1] === '-' ? -1n : 1n)
  if (scale < 0) {
    units *= 10n ** BigInt(-scale)
    scale = 0
  }
  return { units, scale }
}
const atScale = (value: Decimal, scale: number) => value.units * 10n ** BigInt(scale - value.scale)
const compare = (left: Decimal, right: Decimal) => {
  const scale = Math.max(left.scale, right.scale)
  const difference = atScale(left, scale) - atScale(right, scale)
  return difference < 0n ? -1 : difference > 0n ? 1 : 0
}
const rule = (value: number) => decimal(String(value), true)!
const usableRule = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  (!Number.isInteger(value) || Number.isSafeInteger(value))

export const validateFormNumberConstraints = ({
  minValue,
  maxValue,
  step,
}: FormNumberConstraints): boolean => {
  if ([minValue, maxValue, step].some((value) => value != null && !usableRule(value))) return false
  if (step != null && step <= 0) return false
  return minValue == null || maxValue == null || compare(rule(minValue), rule(maxValue)) <= 0
}

export const getFormNumberError = (
  value: string,
  constraints: FormNumberConstraints,
  label: string,
): string | undefined => {
  const answer = decimal(value)
  if (!answer) return `${label} must be a number, such as 2 or 1.5.`
  if (!validateFormNumberConstraints(constraints))
    return `${label} is unavailable. Please contact us another way.`
  const { minValue, maxValue, step } = constraints
  if (minValue != null && compare(answer, rule(minValue)) < 0)
    return `${label} must be at least ${minValue}.`
  if (maxValue != null && compare(answer, rule(maxValue)) > 0)
    return `${label} must be ${maxValue} or less.`
  if (step != null) {
    const base = rule(minValue ?? 0)
    const increment = rule(step)
    const scale = Math.max(answer.scale, base.scale, increment.scale)
    if ((atScale(answer, scale) - atScale(base, scale)) % atScale(increment, scale) !== 0n)
      return `${label} must use increments of ${step} starting from ${minValue ?? 0}.`
  }
  return undefined
}
