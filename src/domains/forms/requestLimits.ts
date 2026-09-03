export const PUBLIC_JSON_BODY_MAX_BYTES = 262_144

export type RequestBodyErrorCode = 'unsupported_media_type' | 'body_too_large' | 'invalid_json'

const errorMessages: Record<RequestBodyErrorCode, string> = {
  body_too_large: 'The request body is too large.',
  invalid_json: 'The request body is not valid JSON.',
  unsupported_media_type: 'The request Content-Type must be application/json.',
}

export class RequestBodyError extends Error {
  readonly code: RequestBodyErrorCode

  constructor(code: RequestBodyErrorCode) {
    super(errorMessages[code])
    this.name = 'RequestBodyError'
    this.code = code
  }
}

const getNormalizedMediaType = (request: Request): string => {
  return request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() ?? ''
}

export const readBoundedJSON = async <T>(
  request: Request,
  { maxBytes }: { maxBytes: number },
): Promise<T> => {
  if (getNormalizedMediaType(request) !== 'application/json') {
    throw new RequestBodyError('unsupported_media_type')
  }

  let body: ArrayBuffer

  try {
    body = await request.arrayBuffer()
  } catch {
    throw new RequestBodyError('invalid_json')
  }

  if (body.byteLength > maxBytes) {
    throw new RequestBodyError('body_too_large')
  }

  try {
    const decodedBody = new TextDecoder('utf-8', { fatal: true }).decode(body)

    return JSON.parse(decodedBody) as T
  } catch {
    throw new RequestBodyError('invalid_json')
  }
}
