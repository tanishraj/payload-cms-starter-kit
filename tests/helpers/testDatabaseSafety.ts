const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])
const RESERVED_DATABASE_NAMES = new Set(['admin', 'local', 'config'])

function unsafeDatabaseError(rule: string): Error {
  return new Error(`Unsafe test database URI: ${rule}.`)
}

export function assertSafeTestDatabaseURI(uri: string): URL {
  let parsed: URL

  try {
    parsed = new URL(uri)
  } catch {
    throw unsafeDatabaseError('TEST_MONGODB_URI must be a valid URL')
  }

  if (parsed.protocol !== 'mongodb:') {
    throw unsafeDatabaseError('protocol must be mongodb')
  }

  const hostnames = parsed.hostname.split(',')
  if (hostnames.length === 0 || hostnames.some((hostname) => !LOOPBACK_HOSTNAMES.has(hostname))) {
    throw unsafeDatabaseError('every hostname must be loopback')
  }

  let databasePath: string
  try {
    databasePath = decodeURIComponent(parsed.pathname).replace(/^\//, '')
  } catch {
    throw unsafeDatabaseError('database name must use valid URL encoding')
  }

  const databaseSegments = databasePath.split('/')
  if (databaseSegments.length !== 1 || !databaseSegments[0]) {
    throw unsafeDatabaseError('exactly one non-empty database name is required')
  }

  const databaseName = databaseSegments[0]
  if (RESERVED_DATABASE_NAMES.has(databaseName)) {
    throw unsafeDatabaseError('reserved databases are forbidden')
  }

  if (!/_test$|-test$/.test(databaseName)) {
    throw unsafeDatabaseError('database name must end in _test or -test')
  }

  return parsed
}

export function getRequiredTestDatabaseURI(env: NodeJS.ProcessEnv = process.env): string {
  const uri = env.TEST_MONGODB_URI ?? ''
  assertSafeTestDatabaseURI(uri)
  return uri
}
