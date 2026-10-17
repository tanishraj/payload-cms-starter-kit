import { APIError, headersWithCors, parseParams, type Endpoint } from 'payload'
import { restorePageVersionAsDraft } from '@/lib/pageDraftRestoration'

/** Register before Payload's default endpoint, preserving the native URL/response. */
export const restorePageVersionEndpoint: Endpoint = {
  method: 'post',
  path: '/versions/:id',
  handler: async (req) => {
    if (!req.user) throw new APIError('Authentication is required.', 401)
    const id = req.routeParams?.id
    if (typeof id !== 'string' || !id) throw new APIError('A version ID is required.', 400)
    const { depth, populate } = parseParams(req.query)
    const result = await restorePageVersionAsDraft({ req, versionID: id, depth, populate })
    return Response.json(
      { ...result, message: 'Version restored as a draft. Review it, then publish when ready.' },
      {
        status: 200,
        headers: headersWithCors({ headers: new Headers(), req }),
      },
    )
  },
}
