import { getPublishedGenericForm } from '@/lib/genericForm.server'
import { Contact6BlockPresentation } from './Presentation'
import type { Contact6Block } from '@/payload-types'
export async function Contact6BlockComponent({ form, ...props }: Contact6Block) {
  const id = typeof form === 'object' && form ? form.id : form
  const definition = id ? await getPublishedGenericForm(String(id)) : null
  return <Contact6BlockPresentation key={definition?.slug} {...props} definition={definition} />
}
