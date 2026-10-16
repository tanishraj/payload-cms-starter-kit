// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { initialize, resolve } from '../helpers/lexicalFixtureLoader.mjs'

describe('standalone fixture Lexical resolution', () => {
  it.each(['lexical', 'lexical/Lexical', '@lexical/selection', '@lexical/react/LexicalComposer'])(
    'selects the static development export for %s without dropping React or import conditions',
    (specifier) => {
      initialize('development')
      const context = {
        conditions: ['node', 'import', 'react-server'],
        parentURL: 'file:///fixture.mjs',
      }
      const result = { url: 'file:///resolved.mjs' }
      const nextResolve = vi.fn().mockReturnValue(result)
      expect(resolve(specifier, context, nextResolve)).toBe(result)
      expect(nextResolve).toHaveBeenCalledWith(specifier, {
        ...context,
        conditions: [...context.conditions, 'development'],
      })
      expect(context.conditions).toEqual(['node', 'import', 'react-server'])
    },
  )
  it('selects the production build in a production fixture process', () => {
    initialize('production')
    const nextResolve = vi.fn()
    resolve('lexical', { conditions: ['node', 'import'] }, nextResolve)
    expect(nextResolve).toHaveBeenCalledWith('lexical', {
      conditions: ['node', 'import', 'production'],
    })
  })
  it.each(['development', 'production'])('preserves an explicit %s condition', (condition) => {
    initialize('development')
    const context = { conditions: ['node', condition] }
    const nextResolve = vi.fn()
    resolve('lexical', context, nextResolve)
    expect(nextResolve).toHaveBeenCalledWith('lexical', context)
  })
  it.each(['payload', '@payloadcms/richtext-lexical', 'react', 'node:crypto', 'lexical-unrelated'])(
    'leaves %s resolution unchanged',
    (specifier) => {
      initialize('development')
      const context = { conditions: ['node', 'import', 'react-server'] }
      const nextResolve = vi.fn()
      resolve(specifier, context, nextResolve)
      expect(nextResolve).toHaveBeenCalledWith(specifier, context)
    },
  )
})
