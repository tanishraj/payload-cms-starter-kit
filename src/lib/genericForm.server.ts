import 'server-only'
import config from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { CMS_CACHE_TAGS } from '@/hooks/revalidateCmsContent'
import { attachmentStorageAvailable } from '@/lib/formAttachmentStorage.server'
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
    const form = result.docs[0] ?? null
    if (form?.fields?.some((field) => field.type === 'file') && !attachmentStorageAvailable())
      return null
    return projectPublishedGenericForm(form)
  },
  ['published-generic-form-v2'],
  { tags: [CMS_CACHE_TAGS.globals], revalidate: false },
)
