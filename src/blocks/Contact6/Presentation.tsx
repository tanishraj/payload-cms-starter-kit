'use client'
import { Mail, MapPin, MessagesSquare, Phone } from 'lucide-react'
import { Contact6 } from '@/components/revamp/contact6'
import { regularBlockMobilePaddingClasses } from '@/blocks/shared/blockSpacing'
import { cn } from '@/lib/utils'
import type { GenericFormDefinition } from '@/lib/genericFormShared'
import { submitGenericForm } from '@/lib/submitGenericForm'
import type { Contact6Block } from '@/payload-types'

export type Contact6PresentationProps = Omit<Contact6Block, 'form' | 'blockType'> & {
  definition: GenericFormDefinition | null
  preview?: boolean
}
const icons = { email: Mail, chat: MessagesSquare, phone: Phone, location: MapPin }

/** Native CMS/transport adapter. The upstream presentation never fetches CMS data. */
export function Contact6BlockPresentation({
  definition,
  preview = false,
  size,
  contactInfo,
  officeHours,
  contactDetails,
  ...content
}: Contact6PresentationProps) {
  return (
    <Contact6
      {...content}
      preview={preview}
      className={cn('py-0', regularBlockMobilePaddingClasses[size ?? 'default'])}
      contactInfo={
        contactInfo?.map(({ icon, ...info }) => ({ ...info, icon: icons[icon] ?? Mail })) ?? []
      }
      officeHours={officeHours ?? []}
      contactDetails={contactDetails ?? []}
      form={
        definition
          ? {
              fields: definition.fields,
              revision: definition.revision,
              submitButtonLabel: definition.submitButtonLabel,
              protectRetries: true,
              disabled: preview,
              onSubmit: (values, revision, submissionKey) =>
                preview
                  ? Promise.resolve({
                      success: false,
                      message: 'Submissions are disabled in preview.',
                    })
                  : submitGenericForm(definition.slug, values, revision, submissionKey),
            }
          : null
      }
    />
  )
}
