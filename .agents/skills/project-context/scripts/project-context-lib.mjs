import { createHash } from 'node:crypto'
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

const getPropertyName = (node) => {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text
  }

  return undefined
}

const getStringValue = (node) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text
  }

  return undefined
}

const unwrapExpression = (node) => {
  let current = node

  while (
    ts.isAsExpression(current) ||
    ts.isParenthesizedExpression(current) ||
    ts.isSatisfiesExpression(current)
  ) {
    current = current.expression
  }

  return current
}

const objectStringProperties = (object) =>
  Object.fromEntries(
    object.properties
      .filter(ts.isPropertyAssignment)
      .map((property) => [getPropertyName(property.name), getStringValue(property.initializer)])
      .filter(([name, value]) => Boolean(name && value)),
  )

export function parseSource(source, filePath) {
  const scriptKind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS

  return ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, scriptKind)
}

export function extractImports(source, filePath) {
  const imports = {}
  const ast = parseSource(source, filePath)

  for (const statement of ast.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue
    }

    const bindings = statement.importClause?.namedBindings

    if (!bindings || !ts.isNamedImports(bindings)) {
      continue
    }

    for (const element of bindings.elements) {
      imports[element.name.text] = statement.moduleSpecifier.text
    }
  }

  return Object.fromEntries(Object.entries(imports).sort(([left], [right]) => left.localeCompare(right)))
}

export function extractArrayPropertyIdentifiers(source, filePath, targetProperty) {
  const identifiers = []
  const ast = parseSource(source, filePath)

  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      getPropertyName(node.name) === targetProperty &&
      ts.isArrayLiteralExpression(unwrapExpression(node.initializer))
    ) {
      const array = unwrapExpression(node.initializer)

      for (const element of array.elements) {
        if (ts.isIdentifier(element)) {
          identifiers.push(element.text)
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(ast)
  return identifiers
}

export function extractBlockDefinition(source, filePath) {
  const ast = parseSource(source, filePath)

  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue
    }

    const isExported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    )

    if (!isExported) {
      continue
    }

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) {
        continue
      }

      const initializer = unwrapExpression(declaration.initializer)
      let object
      let deriveFactoryInterface = false

      if (ts.isObjectLiteralExpression(initializer)) {
        object = initializer
      } else if (
        ts.isCallExpression(initializer) &&
        ts.isIdentifier(initializer.expression) &&
        initializer.expression.text === 'createSystemPageBlock' &&
        initializer.arguments[0]
      ) {
        const argument = unwrapExpression(initializer.arguments[0])

        if (ts.isObjectLiteralExpression(argument)) {
          object = argument
          deriveFactoryInterface = true
        }
      }

      if (!object) {
        continue
      }

      const values = objectStringProperties(object)

      if (!values.slug) {
        continue
      }

      const derivedInterface = `${values.slug.charAt(0).toUpperCase()}${values.slug.slice(1)}Block`

      return {
        configPath: filePath,
        interfaceName: values.interfaceName ?? (deriveFactoryInterface ? derivedInterface : null),
        slug: values.slug,
        symbol: declaration.name.text,
      }
    }
  }

  throw new Error(`No exported block definition found in ${filePath}`)
}

export function extractSwitchCases(source) {
  return [...source.matchAll(/case\s+['"]([^'"]+)['"]\s*:/g)].map((match) => match[1])
}

export function extractThumbnailDefinitions(source, filePath) {
  const ast = parseSource(source, filePath)
  const definitions = []

  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'defineThumbnail' &&
      node.arguments[0]
    ) {
      const argument = unwrapExpression(node.arguments[0])

      if (!ts.isObjectLiteralExpression(argument)) {
        throw new Error(`Invalid thumbnail definition in ${filePath}`)
      }

      const values = objectStringProperties(argument)

      if (!values.slug || !values.filename) {
        throw new Error(`Thumbnail definition is missing slug or filename in ${filePath}`)
      }

      definitions.push({ filename: values.filename, slug: values.slug })
    }

    ts.forEachChild(node, visit)
  }

  visit(ast)
  return definitions
}

export function extractExportedObjectKeys(source, filePath, exportName) {
  const ast = parseSource(source, filePath)

  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue
    }

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== exportName) {
        continue
      }

      if (!declaration.initializer) {
        throw new Error(`${exportName} has no initializer in ${filePath}`)
      }

      const initializer = unwrapExpression(declaration.initializer)

      if (!ts.isObjectLiteralExpression(initializer)) {
        throw new Error(`${exportName} is not an object literal in ${filePath}`)
      }

      return initializer.properties.map((property) => getPropertyName(property.name)).filter(Boolean)
    }
  }

  throw new Error(`Missing ${exportName} in ${filePath}`)
}

export function extractExportNames(source, filePath) {
  const ast = parseSource(source, filePath)
  const names = []

  for (const statement of ast.statements) {
    const isExported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    )

    if (!isExported) {
      continue
    }

    if (ts.isFunctionDeclaration(statement) && statement.name) {
      names.push(statement.name.text)
    }

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          names.push(declaration.name.text)
        }
      }
    }
  }

  return names.sort()
}

const sortObjectKeys = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys)
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, sortObjectKeys(nested)]),
  )
}

export const stableStringify = (value) => `${JSON.stringify(sortObjectKeys(value), null, 2)}\n`

export const sha256 = (value) => createHash('sha256').update(value).digest('hex')

