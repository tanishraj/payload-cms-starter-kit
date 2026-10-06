import { getPublishedGenericForm } from '@/lib/genericForm.server'
import { GenericFormBlockPresentation } from './Presentation'
import type { GenericFormBlock } from '@/payload-types'

export async function GenericFormBlockComponent({ form, ...props }: GenericFormBlock) {
  const id = typeof form === 'object' && form ? form.id : form
  const definition = id ? await getPublishedGenericForm(String(id)) : null
  return <GenericFormBlockPresentation {...props} definition={definition} />
}
