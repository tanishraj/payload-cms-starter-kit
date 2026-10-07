'use client'

/** Source: @shadcnblocks/contact6, authenticated CLI retrieval 2026-10-07.
 * Keeps the upstream introduction, contact cards, message card and two-column information footer.
 * Adaptations: editable content, shared schema-driven form engine, persistent confirmation,
 * accessible headings, safe links and wrapping. No fixed questions or CMS fetching here.
 */
import type { LucideIcon } from 'lucide-react'
import { GenericForm, type GenericFormProps } from './generic-form'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { FieldDescription, FieldError } from './ui/field'
import { Separator } from './ui/separator'
import { cn } from '@/lib/utils'
import { isContact6Href } from '@/lib/contact6Shared'

export type Contact6ContactInfo = {
  icon: LucideIcon
  title: string
  description?: string | null
  value: string
  href?: string | null
}
export type Contact6Detail = { label: string; value: string }
export type Contact6Props = {
  heading?: string | null
  description?: string | null
  formTitle?: string | null
  formDescription?: string | null
  contactInfo?: Contact6ContactInfo[]
  officeHoursTitle?: string | null
  officeHours?: Contact6Detail[]
  contactDetailsTitle?: string | null
  contactDetails?: Contact6Detail[]
  form: GenericFormProps | null
  preview?: boolean
  className?: string
}

export function Contact6({
  heading = 'Contact Us',
  description,
  formTitle = 'Send us a message',
  formDescription,
  contactInfo = [],
  officeHoursTitle = 'Office Hours',
  officeHours = [],
  contactDetailsTitle = 'Contact Information',
  contactDetails = [],
  form,
  preview = false,
  className,
}: Contact6Props) {
  return (
    <section
      className={cn('bg-background py-24 text-foreground', className)}
      data-contact6-preview={preview || undefined}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          {(heading || description) && (
            <div className="mb-16 text-center">
              {heading && (
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  {heading}
                </h2>
              )}
              {description && (
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          <div className={cn('grid gap-12', contactInfo.length > 0 && 'lg:grid-cols-2')}>
            {contactInfo.length > 0 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  {contactInfo.map(({ icon: Icon, ...info }, index) => (
                    <Card key={index} className="border-0 bg-muted shadow-none">
                      <CardContent>
                        <div className="flex items-start gap-4">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Icon className="size-6" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <h3 className="font-semibold">{info.title}</h3>
                            </div>
                            {info.description && (
                              <p className="mb-2 text-sm text-muted-foreground">
                                {info.description}
                              </p>
                            )}
                            {info.href && isContact6Href(info.href) ? (
                              <a
                                href={info.href}
                                className="wrap-anywhere text-sm font-medium transition-colors hover:underline"
                              >
                                {info.value}
                              </a>
                            ) : (
                              <span className="wrap-anywhere text-sm font-medium">
                                {info.value}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            <Card className="min-w-0 border-0 shadow-none">
              {(formTitle || formDescription) && (
                <CardHeader>
                  {formTitle && (
                    <CardTitle>
                      <h3>{formTitle}</h3>
                    </CardTitle>
                  )}
                  {formDescription && (
                    <p className="text-sm text-muted-foreground">{formDescription}</p>
                  )}
                </CardHeader>
              )}
              <CardContent>
                {preview && (
                  <FieldDescription className="mb-4">
                    Preview only — submissions are disabled. Publish the Form and Page to accept
                    responses.
                  </FieldDescription>
                )}
                {form ? (
                  <GenericForm
                    {...form}
                    heading=""
                    formLabel={formTitle || 'Enquiry form'}
                    description={undefined}
                    layout="contact6"
                    disabled={preview || form.disabled}
                  />
                ) : (
                  <FieldError>
                    This form is unavailable. Please try another way to contact us.
                  </FieldError>
                )}
              </CardContent>
            </Card>
          </div>
          {(officeHours.length > 0 || contactDetails.length > 0) && (
            <div className="mt-12">
              <Separator className="mb-8" />
              <Card className="border-0 bg-muted shadow-none">
                <CardContent className="p-6">
                  <div className="grid gap-8 md:grid-cols-2">
                    <Contact6Details title={officeHoursTitle} rows={officeHours} />
                    <Contact6Details title={contactDetailsTitle} rows={contactDetails} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Contact6Details({ title, rows }: { title?: string | null; rows: Contact6Detail[] }) {
  if (!rows.length) return null
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <dl className="flex flex-col gap-2 text-sm text-muted-foreground">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between gap-4">
            <dt className="max-w-[45%] shrink-0 wrap-anywhere">{row.label}</dt>
            <dd className="min-w-0 flex-1 wrap-anywhere text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
