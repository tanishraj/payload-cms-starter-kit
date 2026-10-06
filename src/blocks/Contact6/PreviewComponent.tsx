import { projectGenericForm } from '@/lib/genericFormShared'
import { Contact6BlockPresentation } from './Presentation'
import type { Contact6Block } from '@/payload-types'
export function Contact6PreviewBlockComponent({ form, ...props }: Contact6Block) {
  return (
    <Contact6BlockPresentation
      {...props}
      preview
      definition={projectGenericForm(typeof form === 'object' ? form : null, true)}
    />
  )
}
