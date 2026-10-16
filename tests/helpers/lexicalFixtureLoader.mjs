// Test-only adaptation of Payload's CLI resolver: payloadcms/payload#18398 (MIT).
// Lexical 0.50's Node wrappers use top-level dynamic imports that can deadlock.
// Select the identical static build; preserve all other package conditions.
let environmentCondition

export function initialize(condition) {
  environmentCondition = condition
}

export function resolve(specifier, context, nextResolve) {
  if (
    (specifier === 'lexical' ||
      specifier.startsWith('lexical/') ||
      specifier.startsWith('@lexical/')) &&
    !context.conditions.includes('development') &&
    !context.conditions.includes('production')
  ) {
    return nextResolve(specifier, {
      ...context,
      conditions: [...context.conditions, environmentCondition],
    })
  }
  return nextResolve(specifier, context)
}
