const fallbackApplicationOrigin = 'http://localhost:3000'

const loopbackHostnames = new Set(['127.0.0.1', '[::1]', 'localhost'])

export const parseApplicationOrigin = (
  configuredOrigin: string | undefined,
  isProduction: boolean,
): string => {
  const rawOrigin = configuredOrigin?.trim() || fallbackApplicationOrigin
  let url: URL

  try {
    url = new URL(rawOrigin)
  } catch {
    throw new Error('Invalid NEXT_PUBLIC_SERVER_URL. Use an absolute HTTPS origin.')
  }

  if (url.username || url.password) {
    throw new Error('Invalid NEXT_PUBLIC_SERVER_URL. Credentials are not allowed.')
  }

  if (isProduction && url.protocol !== 'https:') {
    throw new Error('Invalid production NEXT_PUBLIC_SERVER_URL. Use an HTTPS origin.')
  }

  const isDevelopmentLoopbackHTTP =
    !isProduction && url.protocol === 'http:' && loopbackHostnames.has(url.hostname)

  if (url.protocol !== 'https:' && !isDevelopmentLoopbackHTTP) {
    throw new Error(
      'Invalid NEXT_PUBLIC_SERVER_URL. Use HTTPS, or loopback HTTP outside production.',
    )
  }

  return url.origin
}
