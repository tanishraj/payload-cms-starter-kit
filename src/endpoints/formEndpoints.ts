import type { Endpoint, PayloadRequest } from 'payload'

/** One Payload REST owner per URL. Preserve original streams; never call req.json()
 * or addDataAndFileToRequest before the bounded handlers. Lazy imports keep the
 * collection configuration out of a config/handler import cycle.
 */
// createPayloadRequest uses Object.assign on the original Fetch Request.
// Payload's public type marks some Fetch properties optional for non-HTTP Local API requests.
const fetchRequest = (req: PayloadRequest): Request => req as unknown as Request

export const formEndpoints: Endpoint[] = [
  {
    path: '/:slug/submit',
    method: 'post',
    handler: async (req) => {
      const { POST } = await import('./forms/submit')
      const slug = typeof req.routeParams?.slug === 'string' ? req.routeParams.slug : ''
      return POST(fetchRequest(req), { params: Promise.resolve({ slug }) }, req.payload)
    },
  },
  {
    path: '/:slug/attachments',
    method: 'post',
    handler: async (req) => {
      const { POST } = await import('./forms/uploadAttachment')
      const slug = typeof req.routeParams?.slug === 'string' ? req.routeParams.slug : ''
      return POST(fetchRequest(req), { params: Promise.resolve({ slug }) }, req.payload)
    },
  },
]

export const formSubmissionEndpoints: Endpoint[] = [
  {
    path: '/:id/attachments/:token',
    method: 'get',
    handler: async (req) => {
      const { GET } = await import('./forms/downloadAttachment')
      const id = typeof req.routeParams?.id === 'string' ? req.routeParams.id : ''
      const token = typeof req.routeParams?.token === 'string' ? req.routeParams.token : ''
      return GET(fetchRequest(req), { params: Promise.resolve({ id, token }) }, req.payload)
    },
  },
]
