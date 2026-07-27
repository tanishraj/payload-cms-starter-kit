import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const projectRoot = process.cwd()
const entryPath = path.join(projectRoot, 'src/components/live-preview/PageLivePreview.tsx')
const extensions = ['', '.ts', '.tsx', '.js', '.jsx'] as const

const resolveLocalImport = (fromPath: string, specifier: string): string | null => {
  const unresolved = specifier.startsWith('@/')
    ? path.join(projectRoot, 'src', specifier.slice(2))
    : specifier.startsWith('.')
      ? path.resolve(path.dirname(fromPath), specifier)
      : null

  if (!unresolved) {
    return null
  }

  for (const extension of extensions) {
    const candidate = `${unresolved}${extension}`

    if (existsSync(candidate)) {
      return candidate
    }

    const indexCandidate = path.join(unresolved, `index${extension}`)

    if (existsSync(indexCandidate)) {
      return indexCandidate
    }
  }

  return null
}

const hasRuntimeBinding = (declaration: ts.ImportDeclaration): boolean => {
  const clause = declaration.importClause

  if (!clause) {
    return true
  }

  if (clause.isTypeOnly) {
    return false
  }

  if (clause.name || !clause.namedBindings) {
    return true
  }

  if (ts.isNamespaceImport(clause.namedBindings)) {
    return true
  }

  return clause.namedBindings.elements.some((element) => !element.isTypeOnly)
}

const collectReachableRuntimeModules = (entry: string): Set<string> => {
  const visited = new Set<string>()
  const pending = [entry]

  while (pending.length) {
    const current = pending.pop()

    if (!current || visited.has(current)) {
      continue
    }

    visited.add(current)
    const sourceText = readFileSync(current, 'utf8')
    const sourceFile = ts.createSourceFile(
      current,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      current.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    )

    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement) || !hasRuntimeBinding(statement)) {
        continue
      }

      if (!ts.isStringLiteral(statement.moduleSpecifier)) {
        continue
      }

      const resolved = resolveLocalImport(current, statement.moduleSpecifier.text)

      if (resolved && !visited.has(resolved)) {
        pending.push(resolved)
      }
    }
  }

  return new Set(
    [...visited].map((filePath) => path.relative(projectRoot, filePath).split(path.sep).join('/')),
  )
}

describe('live-preview client import boundary', () => {
  it('uses the client-safe renderer', () => {
    const source = readFileSync(entryPath, 'utf8')

    expect(source).toContain("from '@/blocks/renderLivePreviewPageBlocks'")
    expect(source).not.toContain("from '@/blocks/renderPageBlocks'")
  })

  it('cannot reach Payload-backed review or news modules', () => {
    const reachablePaths = collectReachableRuntimeModules(entryPath)

    for (const serverPath of [
      'src/payload.config.ts',
      'src/lib/reviewFeed.ts',
      'src/lib/reviewRatingSummary.ts',
      'src/blocks/ReviewFeed/Component.tsx',
      'src/blocks/RatingSpotlight/Component.tsx',
      'src/lib/newsEvents.ts',
      'src/blocks/NewsEventsHighlights/Component.tsx',
      'src/lib/siteOffices.ts',
      'src/lib/eventGallery.ts',
    ]) {
      expect(reachablePaths.has(serverPath), `${serverPath} entered the client graph`).toBe(false)
    }
  })
})
