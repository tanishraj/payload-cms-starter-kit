import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { ClientForm } from './ClientForm'
import type { Form as FormDoc, FormBlock as FormBlockData } from '@/payload-types'
import type { SimpleFormField } from '@/lib/forms'

const getPublishedFormByID = cache(async (id: number): Promise<FormDoc | null> => {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'forms',
    where: {
      and: [
        {
          id: {
            equals: id,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  return result.docs[0] ?? null
})

const isPublishedFormDoc = (value: number | FormDoc | null | undefined): value is FormDoc => {
  return typeof value === 'object' && value !== null && value._status === 'published'
}

const toSimpleFields = (form: FormDoc): SimpleFormField[] => {
  return (form.fields ?? []).map((field) => ({
    label: field.label,
    name: field.name,
    options:
      field.options?.map((option) => ({
        label: option.label,
        value: option.value,
      })) ?? null,
    placeholder: field.placeholder ?? null,
    required: field.required ?? false,
    type: field.type,
  }))
}

export async function FormBlockComponent(props: FormBlockData) {
  const formRelation = props.form
  const form =
    isPublishedFormDoc(formRelation)
      ? formRelation
      : typeof formRelation === 'number'
        ? await getPublishedFormByID(formRelation)
        : null

  if (!form?.slug || !form.title || !form.fields?.length) {
    return null
  }

  return (
    <ClientForm
      fields={toSimpleFields(form)}
      slug={form.slug}
      submitButtonLabel={form.submitButtonLabel}
      successMessage={form.successMessage}
      title={form.title}
    />
  )
}
