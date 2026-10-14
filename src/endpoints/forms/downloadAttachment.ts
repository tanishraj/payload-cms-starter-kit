import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { hasFeature } from '@/access/featureAccess'
import { createHash } from 'node:crypto'
import { findSubmissionReceipt } from '@/lib/formSubmissionIdempotency.server'
import { isUploadToken } from '@/lib/formAttachments'
import { getFormAttachmentStorage } from '@/lib/formAttachmentStorage.server'

const denied = () =>
  Response.json(
    { message: 'Attachment unavailable.' },
    { status: 404, headers: { 'Cache-Control': 'no-store' } },
  )
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; token: string }> },
  suppliedPayload?: Payload,
) {
  const { id, token } = await context.params
  if (!isUploadToken(token) || !/^[a-f0-9]{24}$/.test(id)) return denied()
  const payload = suppliedPayload ?? (await getPayload({ config: configPromise }))
  const { user } = await payload.auth({ headers: request.headers })
  // Dependency/placement access is explicitly insufficient for private submissions.
  if (!hasFeature(user, 'formSubmissions')) return denied()
  try {
    const submission = await payload.findByID({
      collection: 'form-submissions',
      id,
      user,
      overrideAccess: false,
      depth: 0,
    })
    const file = submission.attachments?.find((file) => file.token === token)
    if (!file) return denied()
    const doc = (
      await payload.find({
        collection: 'form-attachments',
        where: { token: { equals: token } },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]
    if (!doc || doc.state !== 'attached') return denied()
    const receipt = await findSubmissionReceipt(payload, doc.submissionKeyHash)
    if (receipt?.id !== submission.id) return denied()
    const bytes = await getFormAttachmentStorage().get(token)
    if (
      bytes.length !== doc.size ||
      createHash('sha256').update(bytes).digest('hex') !== doc.sha256
    )
      return denied()
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="download.${file.fileType}"; filename*=UTF-8''${encodeURIComponent(file.filename).replaceAll("'", '%27')}`,
        'Content-Length': String(bytes.length),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
      },
    })
  } catch {
    return denied()
  }
}
