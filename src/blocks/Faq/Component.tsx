'use client'

import { Accordion as AccordionPrimitive } from 'radix-ui'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import { ContentActions } from '@/components/ContentActions'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'

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
  actions?: CmsActionValue[] | null
  description?: string | null
  title?: string | null
}

type FaqProfile = {
  image?: unknown
  name?: string | null
  title?: string | null
}

type FaqBlockLike = {
  appearance?: BlockAppearance | null
  contentAlignment?: 'center' | 'left' | 'right' | null
  defaultOpenFirst?: boolean | null
  description?: string | null
  faqPlacement?: 'left' | 'right' | null
  heading: string
  headerActionMode?: 'button' | 'link' | null
  headerActions?: CmsActionValue[] | null
  items?: FaqItem[] | null
  layoutMode?: 'fiftyFifty' | 'fullWidth' | 'oneThird' | null
  sideActionMode?: 'button' | 'link' | null
  sideColumn?: {
    contact?: FaqContact | null
    profile?: FaqProfile | null
  } | null
  size?: 'comfortable' | 'compact' | 'default' | null
}

const contentAlignmentClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
} as const

const gridLayoutClasses = {
  fiftyFifty: 'lg:grid-cols-2 lg:gap-12 xl:gap-16',
  oneThird: 'lg:grid-cols-3 lg:gap-12 xl:gap-16',
} as const

const faqPlacementClasses = {
  left: 'lg:order-1',
  right: 'lg:order-2',
} as const

const sidePlacementClasses = {
  left: 'lg:order-2',
  right: 'lg:order-1',
} as const

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
  contentAlignment = 'left',
  defaultOpenFirst = true,
  description,
  faqPlacement = 'right',
  heading,
  headerActionMode = 'link',
  headerActions,
  items,
  layoutMode = 'fiftyFifty',
  sideActionMode = 'link',
  sideColumn,
  size = 'default',
}: FaqBlockLike) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedContentAlignment = contentAlignment ?? 'left'
  const resolvedFaqPlacement = faqPlacement ?? 'right'
  const configuredLayoutMode = layoutMode ?? 'fiftyFifty'
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
  const resolvedHeaderActions = resolveCmsActions(headerActions)
  const contactActions = resolveCmsActions(contact?.actions)

  const hasProfile = Boolean(profileImage || profile?.name?.trim() || profile?.title?.trim())
  const hasContact = Boolean(
    contact?.title?.trim() || contact?.description?.trim() || contactActions.length > 0,
  )
  const hasSideColumn = configuredLayoutMode !== 'fullWidth' && (hasProfile || hasContact)
  const resolvedSplitLayoutMode = configuredLayoutMode === 'oneThird' ? 'oneThird' : 'fiftyFifty'
  const resolvedLayoutMode = hasSideColumn ? configuredLayoutMode : 'fullWidth'

  const faqContent = (
    <div
      className={cn(
        'order-1',
        hasSideColumn ? faqPlacementClasses[resolvedFaqPlacement] : 'w-full',
        hasSideColumn && resolvedLayoutMode === 'oneThird' ? 'lg:col-span-2' : undefined,
      )}
      data-faq-main="true"
    >
      <div
        className={cn(
          'mb-8 flex flex-col gap-4 lg:mb-16',
          contentAlignmentClasses[resolvedContentAlignment],
        )}
      >
        <h2 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          {heading}
        </h2>
        {description?.trim() ? (
          <p className="text-balance text-base leading-7 text-muted-foreground">
            {description.trim()}
          </p>
        ) : null}
        <ContentActions
          actions={resolvedHeaderActions}
          alignment={resolvedContentAlignment}
          data-faq-header-actions="true"
          mode={headerActionMode ?? 'link'}
        />
      </div>

      <FaqAccordion
        className="max-w-none"
        collapsible
        defaultValue={defaultOpenFirst ? 'item-0' : undefined}
        type="single"
      >
        {validItems.map((item, index) => (
          <FaqAccordionItem
            className={cn('border-0', index !== validItems.length - 1 && 'border-b border-border')}
            key={`${item.question}-${index}`}
            value={`item-${index}`}
          >
            <FaqAccordionTrigger className="justify-between py-6 text-left text-base font-semibold hover:no-underline sm:text-lg lg:py-8 lg:text-xl">
              <span className="pr-4">{item.question}</span>
            </FaqAccordionTrigger>
            <FaqAccordionContent className="pb-6 pr-8 text-left text-sm leading-relaxed text-muted-foreground sm:text-base">
              <div className="prose max-w-none text-left text-sm leading-relaxed [--tw-prose-body:var(--muted-foreground)] [--tw-prose-bold:var(--foreground)] [--tw-prose-bullets:var(--border)] [--tw-prose-counters:var(--muted-foreground)] [--tw-prose-headings:var(--foreground)] [--tw-prose-links:var(--foreground)] sm:text-base">
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
  )

  const sideContent = hasSideColumn ? (
    <aside
      className={cn(
        'order-2',
        sidePlacementClasses[resolvedFaqPlacement],
        'flex flex-col justify-between text-left',
      )}
    >
      <div>
        {hasProfile ? (
          <div className="mb-8 flex items-start gap-3 sm:gap-4 lg:mb-12">
            {profileImage ? (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16">
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
                <p className="mb-1 text-sm font-semibold text-foreground sm:text-base">
                  {profile.name.trim()}
                </p>
              ) : null}
              {profile?.title?.trim() ? (
                <p className="text-sm text-muted-foreground sm:text-base">{profile.title.trim()}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {hasContact ? (
          <div className="space-y-4 lg:space-y-6">
            {contact?.title?.trim() ? (
              <p className="text-lg leading-tight font-semibold text-foreground sm:text-xl">
                {contact.title.trim()}
              </p>
            ) : null}
            {contact?.description?.trim() ? (
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {contact.description.trim()}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <ContentActions
        actions={contactActions}
        alignment="left"
        className="py-4"
        data-faq-contact-actions="true"
        mode={sideActionMode ?? 'link'}
      />
    </aside>
  ) : null

  return (
    <section
      className={cn(
        regularBlockMobilePaddingClasses[resolvedSize],
        'md:py-32',
        appearanceClasses.className,
      )}
      data-faq-background={appearance?.background ?? 'none'}
      data-faq-content-alignment={resolvedContentAlignment}
      data-faq-has-side-column={hasSideColumn ? 'true' : 'false'}
      data-faq-layout={resolvedLayoutMode}
      data-faq-placement={resolvedFaqPlacement}
      data-faq-side-column={hasSideColumn ? 'true' : 'false'}
      data-faq-size={resolvedSize}
    >
      <div className={regularBlockContainerClasses}>
        <div
          className={cn(
            'w-full',
            hasSideColumn
              ? cn('grid grid-cols-1 gap-8', gridLayoutClasses[resolvedSplitLayoutMode])
              : undefined,
          )}
        >
          {faqContent}
          {sideContent}
        </div>
      </div>
    </section>
  )
}
