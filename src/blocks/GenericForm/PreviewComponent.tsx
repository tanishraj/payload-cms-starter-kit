import { projectGenericForm } from '@/lib/genericFormShared'
import type { GenericFormBlock } from '@/payload-types'
import { GenericFormBlockPresentation } from './Presentation'

export function GenericFormPreviewBlockComponent({ form, ...props }: GenericFormBlock) {
  return (
    <GenericFormBlockPresentation
      {...props}
      preview
      definition={projectGenericForm(typeof form === 'object' ? form : null, true)}
    />
  )
}
