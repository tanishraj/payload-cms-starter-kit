'use client'

import Image from 'next/image'
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
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import { ContentActions } from '@/components/ContentActions'
import { compactRichTextClasses } from '@/components/rich-text/richTextStyles'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'

type RichTextData = React.ComponentProps<typeof RichText>['data']

type RichTextValue = {
  root?: {
    children?: unknown[]
  } | null
} | null

type QaAccordionItemValue = {
  answer?: RichTextValue
  question?: string | null
}

type QaAccordionContact = {
  actions?: CmsActionValue[] | null
  description?: string | null
  title?: string | null
}

type QaAccordionProfile = {
  image?: unknown
  name?: string | null
  title?: string | null
}

type QaAccordionBlockLike = {
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  appearance?: BlockAppearance | null
  contentAlignment?: 'center' | 'left' | 'right' | null
  defaultOpenFirst?: boolean | null
  description?: string | null
  footerActions?: CmsActionValue[] | null
  accordionPlacement?: 'left' | 'right' | null
  title?: string | null
  items?: QaAccordionItemValue[] | null
  layoutMode?: 'fiftyFifty' | 'fullWidth' | 'oneThird' | null
  sideColumn?: {
    contact?: QaAccordionContact | null
    profile?: QaAccordionProfile | null
  } | null
  size?: 'none' | 'comfortable' | 'compact' | 'default' | null
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

const accordionPlacementClasses = {
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
} satisfies RichTextData

function QaAccordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root className={cn('space-y-0', className)} {...props} />
}

function QaAccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={className} {...props} />
}

function QaAccordionTrigger({
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
          className="ml-auto h-5 w-5 shrink-0 text-current/70 group-data-[state=open]/accordion-trigger:hidden"
          aria-hidden="true"
        />
        <ChevronUpIcon
          className="ml-auto hidden h-5 w-5 shrink-0 text-current/70 group-data-[state=open]/accordion-trigger:inline"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function QaAccordionContent({
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

export function QaAccordionBlockComponent({
  accentTitle,
  actions,
  appearance,
  contentAlignment = 'center',
  defaultOpenFirst = true,
  description,
  footerActions,
  accordionPlacement = 'right',
  title,
  items,
  layoutMode = 'fiftyFifty',
  sideColumn,
  size = 'default',
}: QaAccordionBlockLike) {
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedContentAlignment = contentAlignment ?? 'left'
  const resolvedAccordionPlacement = accordionPlacement ?? 'right'
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

  const resolvedAccentTitle = accentTitle?.trim() || undefined
  const profile = sideColumn?.profile
  const contact = sideColumn?.contact
  const profileImage = getMediaImageProps({
    media: profile?.image as never,
    preset: 'generic',
    fallbackAlt: profile?.name?.trim() || title,
  })
  const resolvedHeaderActions = resolveCmsActions(actions)
  const contactActions = resolveCmsActions(contact?.actions)

  const resolvedLayoutMode =
    configuredLayoutMode === 'fullWidth' || configuredLayoutMode === 'oneThird'
      ? configuredLayoutMode
      : 'fiftyFifty'
  const resolvedSplitLayoutMode = resolvedLayoutMode === 'oneThird' ? 'oneThird' : 'fiftyFifty'
  const isSplitLayout = resolvedLayoutMode !== 'fullWidth'
  const hasProfile =
    isSplitLayout && Boolean(profileImage || profile?.name?.trim() || profile?.title?.trim())
  const hasContact =
    isSplitLayout &&
    Boolean(contact?.title?.trim() || contact?.description?.trim() || contactActions.length > 0)
  const hasSideColumn = hasProfile || hasContact

  const supportingContent = hasSideColumn ? (
    <aside
      className="flex flex-1 flex-col justify-between text-left"
      data-qa-accordion-side-column="true"
    >
      <div>
        {hasProfile ? (
          <div className="mb-8 flex items-start gap-3 sm:gap-4 lg:mb-12">
            {profileImage ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16">
                <Image
                  fill
                  alt={profileImage.alt}
                  className="object-cover"
                  src={profileImage.src}
                  sizes="64px"
                />
              </div>
            ) : null}
            <div className="min-w-0">
              {profile?.name?.trim() ? (
                <p className="mb-1 text-sm font-semibold text-current sm:text-base">
                  {profile.name.trim()}
                </p>
              ) : null}
              {profile?.title?.trim() ? (
                <p className="text-sm text-current/70 sm:text-base">{profile.title.trim()}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {hasContact ? (
          <div className="space-y-4 lg:space-y-6">
            {contact?.title?.trim() ? (
              <p className="text-lg leading-tight font-semibold text-current sm:text-xl">
                {contact.title.trim()}
              </p>
            ) : null}
            {contact?.description?.trim() ? (
              <p className="text-sm leading-relaxed text-current/70 sm:text-base">
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
        data-qa-accordion-contact-actions="true"
      />
    </aside>
  ) : null

  const sectionContent = (
    <div
      className={cn(
        'flex h-full flex-col order-1',
        isSplitLayout ? sidePlacementClasses[resolvedAccordionPlacement] : 'w-full',
      )}
      data-qa-accordion-section-content="true"
    >
      <div
        className={cn(
          'flex flex-col gap-4',
          !isSplitLayout ? 'mb-8 lg:mb-16' : undefined,
          isSplitLayout && hasSideColumn ? 'mb-8 lg:mb-12' : undefined,
          contentAlignmentClasses[resolvedContentAlignment],
        )}
      >
        <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
          {resolvedAccentTitle ? (
            <>
              <span className="block font-[inherit]">{title}</span>
              <em className="block font-[inherit]">{resolvedAccentTitle}</em>
            </>
          ) : (
            title
          )}
        </h2>
        {description?.trim() ? (
          <p className="text-balance text-base leading-7 text-current/70">{description.trim()}</p>
        ) : null}
        <ContentActions
          actions={resolvedHeaderActions}
          alignment={resolvedContentAlignment}
          data-qa-accordion-header-actions="true"
        />
      </div>

      {supportingContent}
    </div>
  )

  const accordionContent = (
    <div
      className={cn(
        'order-2',
        isSplitLayout ? accordionPlacementClasses[resolvedAccordionPlacement] : 'w-full',
        isSplitLayout && resolvedLayoutMode === 'oneThird' ? 'lg:col-span-2' : undefined,
      )}
      data-qa-accordion-main="true"
    >
      <QaAccordion
        className="max-w-none"
        collapsible
        defaultValue={defaultOpenFirst ? 'item-0' : undefined}
        type="single"
      >
        {validItems.map((item, index) => (
          <QaAccordionItem
            className={cn(
              'border-0',
              index !== validItems.length - 1 && 'border-b border-current/15',
            )}
            key={`${item.question}-${index}`}
            value={`item-${index}`}
          >
            <QaAccordionTrigger className="justify-between py-6 text-left text-base font-semibold hover:no-underline sm:text-lg lg:py-8 lg:text-xl">
              <span className="pr-4">{item.question}</span>
            </QaAccordionTrigger>
            <QaAccordionContent className="pb-6 pr-8 text-left text-sm leading-relaxed text-current/70 sm:text-base">
              <div className={cn(compactRichTextClasses, 'text-left')}>
                <RichText data={item.answer as RichTextData} />
              </div>
            </QaAccordionContent>
          </QaAccordionItem>
        ))}
      </QaAccordion>
    </div>
  )

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClasses.className)}
      data-qa-accordion-background={appearance?.background ?? 'none'}
      data-qa-accordion-content-alignment={resolvedContentAlignment}
      data-qa-accordion-has-side-column={hasSideColumn ? 'true' : 'false'}
      data-qa-accordion-layout={resolvedLayoutMode}
      data-qa-accordion-placement={resolvedAccordionPlacement}
      data-qa-accordion-side-column={hasSideColumn ? 'true' : 'false'}
      data-qa-accordion-size={resolvedSize}
    >
      <div className={regularBlockContainerClasses}>
        <div className="w-full">
          {isSplitLayout ? (
            <div
              className={cn(
                'grid grid-cols-1 gap-8',
                gridLayoutClasses[resolvedSplitLayoutMode],
              )}
            >
              {sectionContent}
              {accordionContent}
            </div>
          ) : (
            <>
              {sectionContent}
              {accordionContent}
            </>
          )}
        </div>
        <BlockFooterActions actions={footerActions} />
      </div>
    </section>
  )
}
