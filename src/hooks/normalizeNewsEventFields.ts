import type { CollectionBeforeChangeHook } from 'payload'

export const normalizeNewsEventFields: CollectionBeforeChangeHook = async ({ data }) => {
  if (!data || data.contentType !== 'news') {
    return data
  }

  data.eventStart = null
  data.eventEnd = null
  data.eventLocation = null
  data.eventRegistrationAction = []

  return data
}
