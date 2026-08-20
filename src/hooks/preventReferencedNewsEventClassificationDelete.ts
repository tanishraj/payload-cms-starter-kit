import { APIError, type CollectionBeforeDeleteHook } from 'payload'

import { findNewsEventClassificationReference } from '@/hooks/newsEventClassificationReferences'

export const preventReferencedNewsEventClassificationDelete: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  if (id == null) return

  const reference = await findNewsEventClassificationReference({
    classificationID: id,
    req,
  })

  if (reference) {
    throw new APIError('Archive this classification before removing its references.', 409)
  }
}
