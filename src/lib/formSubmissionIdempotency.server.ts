import { createHash } from 'node:crypto'
import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import type { Payload } from 'payload'

const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')

export function submissionIdentity(slug: string, key: unknown, values: unknown, revision: unknown) {
  if (
    typeof key !== 'string' ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(key)
  )
    return null
  const canonicalValues =
    values && typeof values === 'object' && !Array.isArray(values)
      ? Object.entries(values).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      : values
  return {
    submissionKeyHash: hash([slug, key.toLowerCase()]),
    submissionRequestHash: hash([revision ?? null, canonicalValues]),
  }
}

export async function findSubmissionReceipt(payload: Payload, keyHash: string) {
  const result = await payload.find({
    collection: 'form-submissions',
    trash: true,
    where: { submissionKeyHash: { equals: keyHash } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

/** Fail closed until the durable constraint is actually installed. Never create indexes in intake. */
export async function hasSubmissionKeyIndex(payload: Payload): Promise<boolean> {
  const model = (payload.db as MongooseAdapter).collections['form-submissions']
  const indexes = await model.collection.indexes()
  return indexes.some(
    (index) =>
      index.unique === true &&
      index.sparse === true &&
      !index.partialFilterExpression &&
      Object.keys(index.key).length === 1 &&
      index.key.submissionKeyHash === 1,
  )
}
