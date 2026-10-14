import 'server-only'
import config from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { CMS_CACHE_TAGS } from '@/hooks/revalidateCmsContent'
import { projectPublishedGenericForm } from '@/lib/genericFormRevision.server'

export const getPublishedGenericForm = unstable_cache(
  async (id: string) => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'forms',
      depth: 0,
      draft: false,
      overrideAccess: false,
      limit: 1,
      pagination: false,
      where: {
        and: [
          { id: { equals: id } },
          { _status: { equals: 'published' } },
          { submissionIntent: { in: ['general', 'lead'] } },
        ],
      },
      select: {
        slug: true,
        title: true,
        fields: true,
        submitButtonLabel: true,
        submissionIntent: true,
        _status: true,
      },
    })
    return projectPublishedGenericForm(result.docs[0] ?? null)
  },
  ['published-generic-form-v2'],
  { tags: [CMS_CACHE_TAGS.globals], revalidate: false },
)
