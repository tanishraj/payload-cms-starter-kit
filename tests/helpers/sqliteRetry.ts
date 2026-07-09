const SQLITE_BUSY_MESSAGE = 'database is locked'
const SQLITE_RETRY_DELAYS_MS = [100, 200, 400, 800, 1200]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isSQLiteBusyError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false
  }

  if (error.message.includes(SQLITE_BUSY_MESSAGE)) {
    return true
  }

  if (error.cause instanceof Error) {
    return error.cause.message.includes(SQLITE_BUSY_MESSAGE)
  }

  return false
}

// Payload e2e seeds share one SQLite file, so transient write locks should retry briefly.
export async function runWithSQLiteBusyRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt <= SQLITE_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      if (!isSQLiteBusyError(error) || attempt === SQLITE_RETRY_DELAYS_MS.length) {
        throw error
      }

      await sleep(SQLITE_RETRY_DELAYS_MS[attempt]!)
    }
  }

  throw new Error('SQLite retry loop exited unexpectedly.')
}
