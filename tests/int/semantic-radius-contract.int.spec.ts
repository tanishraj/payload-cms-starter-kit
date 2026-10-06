import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import ts from 'typescript'

const publicRoots = ['src/app/(frontend)', 'src/blocks', 'src/components', 'src/styles'] as const

const sourceExtensions = new Set(['.css', '.ts', '.tsx'])

const walk = (root: string): string[] => {
  if (!fs.existsSync(root)) return []

  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(root, entry.name)
    const relativePath = path.relative(process.cwd(), absolutePath)

    // The isolated Neutral workshop has its own upstream radius contract.
    if (relativePath.startsWith('src/components/admin/')) return []
    if (relativePath.startsWith('src/components/revamp/')) return []
    if (entry.isDirectory()) return walk(absolutePath)

    return sourceExtensions.has(path.extname(entry.name)) ? [absolutePath] : []
  })
}

const bannedPatterns = [
  /\brounded(?:-[trblse]{1,2})?-(?:xs|sm|md|lg|xl|2xl|3xl|4xl)\b/g,
  /\brounded(?:-[trblse]{1,2})?-(?:\[(?:calc\()?var\(--radius\)[^\]]*\]|\(--radius\))/g,
  /(?<![-\w])rounded(?=[\s"'`])/g,
] as const

describe('semantic radius contract', () => {
  it('allows only the reviewed scoped Generic Form adapter to import the revamp presentation', () => {
    const imports: string[] = []
    for (const root of publicRoots) {
      for (const file of walk(path.resolve(process.cwd(), root))) {
        if (!['.ts', '.tsx'].includes(path.extname(file))) continue
        const parsed = ts.createSourceFile(
          file,
          fs.readFileSync(file, 'utf8'),
          ts.ScriptTarget.Latest,
          true,
        )
        const inspect = (node: ts.Node) => {
          let specifier: ts.Node | undefined
          if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
            specifier = node.moduleSpecifier
          } else if (
            ts.isCallExpression(node) &&
            (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
              (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
          ) {
            specifier = node.arguments[0]
          }
          if (
            specifier &&
            ts.isStringLiteral(specifier) &&
            /(^|\/)revamp(\/|$)/.test(specifier.text)
          ) {
            imports.push(`${path.relative(process.cwd(), file)}: ${specifier.text}`)
          }
          ts.forEachChild(node, inspect)
        }
        inspect(parsed)
      }
    }
    expect(imports.sort()).toEqual([
      'src/blocks/GenericForm/Presentation.tsx: @/components/revamp/generic-form',
      'src/blocks/GenericForm/Presentation.tsx: @/components/revamp/ui/field',
    ])
  })

  it('uses semantic radius roles throughout the public frontend', () => {
    const violations = publicRoots.flatMap((root) =>
      walk(path.resolve(process.cwd(), root)).flatMap((absolutePath) => {
        const source = fs.readFileSync(absolutePath, 'utf8')
        const relativePath = path.relative(process.cwd(), absolutePath)

        return bannedPatterns.flatMap((pattern) => {
          pattern.lastIndex = 0

          return [...source.matchAll(pattern)].map((match) => `${relativePath}: ${match[0]}`)
        })
      }),
    )

    expect(violations).toEqual([])
  })
})
