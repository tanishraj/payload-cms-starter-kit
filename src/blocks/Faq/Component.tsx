'use client'

import { Accordion as AccordionPrimitive } from 'radix-ui'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { ArrowRight, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import { buttonVariants } from '@/components/ui/button'
import { resolveCmsLink } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'
import type { Page } from '@/payload-types'

type RichTextValue = {
  root?: {
    children?: unknown[]
  } | null
} | null

type FaqItem = {
  answer?: RichTextValue
  question?: string | null
}

type FaqContact = {
  description?: string | null
  linkLabel?: string | null
  linkType?: 'page' | 'custom' | null
  openInNewTab?: boolean | null
  page?: Page | number | string | null
  title?: string | null
  url?: string | null
}

type FaqProfile = {
  image?: unknown
  name?: string | null
  title?: string | null
}

type FaqBlockLike = {
  appearance?: BlockAppearance | null
  defaultOpenFirst?: boolean | null
  description?: string | null
  heading: string
  items?: FaqItem[] | null
  sideColumn?: {
    contact?: FaqContact | null
    profile?: FaqProfile | null
  } | null
  sideColumnEnabled?: boolean | null
  size?: 'comfortable' | 'compact' | 'default' | null
}

const emptyRichText = {
  root: {
    type: 'root',
    children: [],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
} satisfies NonNullable<RichTextValue>

function FaqAccordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root className={cn('space-y-0', className)} {...props} />
}

function FaqAccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={className} {...props} />
}

function FaqAccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'group/accordion-trigger flex flex-1 items-start border-0 p-0 text-left transition-all outline-none disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          className="ml-auto h-5 w-5 shrink-0 text-muted-foreground group-data-[state=open]/accordion-trigger:hidden"
          aria-hidden="true"
        />
        <ChevronUpIcon
          className="ml-auto hidden h-5 w-5 shrink-0 text-muted-foreground group-data-[state=open]/accordion-trigger:inline"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function FaqAccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={className}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export function FaqBlockComponent({
  appearance,
  defaultOpenFirst = true,
  description,
  heading,
  items,
  sideColumn,
  sideColumnEnabled = true,
  size = 'default',
}: FaqBlockLike) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedSize = size ?? 'default'
  const validItems = (items ?? []).flatMap((item) => {
    const question = item?.question?.trim()

    if (!question) {
      return []
    }

    return [
      {
        answer: item.answer ?? emptyRichText,
        question,
      },
    ]
  })

  if (!validItems.length) {
    return null
  }

  const profile = sideColumn?.profile
  const contact = sideColumn?.contact
  const profileImage = getMediaImageProps({
    media: profile?.image as never,
    preset: 'generic',
    fallbackAlt: profile?.name?.trim() || heading,
  })
  const contactLink = resolveCmsLink(contact ?? {})

  const hasProfile = Boolean(profileImage || profile?.name?.trim() || profile?.title?.trim())
  const hasContact = Boolean(
    contact?.title?.trim() ||
    contact?.description?.trim() ||
    (contact?.linkLabel?.trim() && contactLink.href),
  )
  const hasSideColumn = sideColumnEnabled && (hasProfile || hasContact)

  return (
    <section
      className={cn('py-32', appearanceClasses.className)}
      data-faq-background={appearance?.background ?? 'none'}
      data-faq-has-side-column={hasSideColumn ? 'true' : 'false'}
      data-faq-size={resolvedSize}
    >
      <div className="container">
        <div
          className={cn(
            hasSideColumn
              ? 'grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12 xl:grid-cols-12 xl:gap-16'
              : 'w-full',
          )}
        >
          {hasSideColumn ? (
            <aside className="flex flex-col justify-between lg:col-span-2 xl:col-span-4">
              <div>
                {hasProfile ? (
                  <div className="mb-8 flex items-start gap-3 sm:gap-4 lg:mb-12">
                    {profileImage ? (
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[calc(var(--radius))] sm:h-16 sm:w-16">
                        {/* CMS media URLs are runtime-managed and may be absolute, so keep a direct img element. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={profileImage.alt}
                          className="h-full w-full object-cover"
                          src={profileImage.src}
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      {profile?.name?.trim() ? (
                        <h2 className="mb-1 text-lg leading-tight font-semibold text-foreground sm:text-xl">
                          {profile.name.trim()}
                        </h2>
                      ) : null}
                      {profile?.title?.trim() ? (
                        <p className="text-sm text-muted-foreground sm:text-base">
                          {profile.title.trim()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {hasContact ? (
                  <div className="space-y-4 lg:space-y-6">
                    {contact?.title?.trim() ? (
                      <h3 className="text-lg leading-tight font-semibold text-foreground sm:text-xl">
                        {contact.title.trim()}
                      </h3>
                    ) : null}
                    {contact?.description?.trim() ? (
                      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {contact.description.trim()}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {contact?.linkLabel?.trim() && contactLink.href ? (
                <div className="py-4">
                  <a
                    className={cn(
                      buttonVariants({ variant: 'link' }),
                      'group/button h-auto justify-start gap-2 px-0 py-0 text-left text-sm',
                    )}
                    data-faq-contact-cta="true"
                    href={contactLink.href}
                    rel={contactLink.openInNewTab ? 'noreferrer' : undefined}
                    target={contactLink.openInNewTab ? '_blank' : undefined}
                  >
                    <span>{contact.linkLabel.trim()}</span>
                    <span
                      aria-hidden="true"
                      className="relative inline-flex size-4 shrink-0 overflow-hidden"
                    >
                      <ArrowRight className="absolute left-0 top-0 size-4 rotate-[-35deg] transition-all duration-200 ease-out group-hover/button:translate-x-1 group-hover/button:opacity-0 group-hover/button:rotate-0" />
                      <ArrowRight className="absolute left-0 top-0 size-4 translate-x-[-70%] opacity-0 transition-all duration-200 ease-out group-hover/button:translate-x-0 group-hover/button:opacity-100" />
                    </span>
                  </a>
                </div>
              ) : null}
            </aside>
          ) : null}

          <div className={cn(hasSideColumn ? 'lg:col-span-3 xl:col-span-8' : 'w-full')}>
            <div
              className={cn('mb-8', hasSideColumn ? 'md:text-center lg:mb-16 lg:text-left' : '')}
            >
              <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
                {heading}
              </h2>
              {description?.trim() ? (
                <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-muted-foreground">
                  {description.trim()}
                </p>
              ) : null}
            </div>

            <FaqAccordion
              className="max-w-none"
              collapsible
              defaultValue={defaultOpenFirst ? 'item-0' : undefined}
              type="single"
            >
              {validItems.map((item, index) => (
                <FaqAccordionItem
                  className={cn(
                    'border-0',
                    index !== validItems.length - 1 && 'border-b border-border',
                  )}
                  key={`${item.question}-${index}`}
                  value={`item-${index}`}
                >
                  <FaqAccordionTrigger className="justify-between py-6 text-left text-lg font-semibold hover:no-underline sm:text-xl lg:text-xl">
                    <span className="pr-4">{item.question}</span>
                  </FaqAccordionTrigger>
                  <FaqAccordionContent className="pb-6 pr-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    <div className="prose max-w-none text-sm leading-relaxed [--tw-prose-body:var(--muted-foreground)] [--tw-prose-bold:var(--foreground)] [--tw-prose-bullets:var(--border)] [--tw-prose-counters:var(--muted-foreground)] [--tw-prose-headings:var(--foreground)] [--tw-prose-links:var(--foreground)] sm:text-base">
                      <RichText
                        className="[&>p]:m-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground"
                        data={item.answer}
                      />
                    </div>
                  </FaqAccordionContent>
                </FaqAccordionItem>
              ))}
            </FaqAccordion>
          </div>
        </div>
      </div>
    </section>
  )
}
