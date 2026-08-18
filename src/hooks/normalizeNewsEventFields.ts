import type { CollectionBeforeChangeHook } from 'payload'

import { isEventClassification } from '@/lib/newsEventClassifications'

export const normalizeNewsEventFields: CollectionBeforeChangeHook = async ({ data }) => {
  if (!data || isEventClassification(data.contentType)) {
    return data
  }

  data.eventStart = null
  data.eventEnd = null
  data.eventLocation = null
  data.eventRegistrationAction = []

  return data
}
