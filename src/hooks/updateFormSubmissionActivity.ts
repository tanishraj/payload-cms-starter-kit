import type { CollectionBeforeChangeHook } from 'payload'

type FormSubmissionActivityDoc = {
  id: number | string
  internalNotes?: string | null
  lastActionAt?: string | null
  owner?: number | string | { id?: number | string | null } | null
  status?: string | null
}

const normalizeOwnerID = (value: FormSubmissionActivityDoc['owner']): number | string | null => {
  const id = value && typeof value === 'object' ? value.id : value
  if (typeof id === 'string' && id.length > 0) return id
  if (typeof id === 'number' && Number.isFinite(id)) return id
  return null
}

const normalizeNotes = (value: string | null | undefined): string => {
  return typeof value === 'string' ? value.trim() : ''
}

export const updateFormSubmissionActivity: CollectionBeforeChangeHook<
  FormSubmissionActivityDoc
> = async ({ data, operation, originalDoc }) => {
  if (operation !== 'update' || !data) {
    return data
  }

  const nextStatus = data.status ?? originalDoc?.status ?? null
  const previousStatus = originalDoc?.status ?? null
  const nextOwnerID =
    data.owner === undefined ? normalizeOwnerID(originalDoc?.owner) : normalizeOwnerID(data.owner)
  const previousOwnerID = normalizeOwnerID(originalDoc?.owner)
  const nextNotes =
    data.internalNotes === undefined
      ? normalizeNotes(originalDoc?.internalNotes)
      : normalizeNotes(data.internalNotes)
  const previousNotes = normalizeNotes(originalDoc?.internalNotes)

  if (
    nextStatus !== previousStatus ||
    nextOwnerID !== previousOwnerID ||
    nextNotes !== previousNotes
  ) {
    data.lastActionAt = new Date().toISOString()
  }

  return data
}
