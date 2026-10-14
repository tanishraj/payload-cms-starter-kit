import type { CollectionAfterDeleteHook } from 'payload'
/** Only permanent deletion invokes afterDelete. Trashed submissions retain files.
 * Queue external storage deletion; cleanup checks for the missing receipt again. */
export const releaseFormAttachments: CollectionAfterDeleteHook = async ({ doc, req }) => {
  for (const file of doc.attachments ?? []) {
    try {
      await req.payload.update({
        collection: 'form-attachments',
        where: { token: { equals: file.token } },
        data: { expiresAt: new Date().toISOString() },
        overrideAccess: true,
        req,
      })
    } catch (error) {
      req.payload.logger.error({
        err: error,
        msg: 'Unable to schedule deleted submission attachment cleanup.',
      })
    }
  }
}
