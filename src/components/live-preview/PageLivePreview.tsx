'use client'

import { ClientForm } from '@/blocks/Form/ClientForm'
import { Hero36 } from '@/components/hero36'
import { resolveCmsLink } from '@/lib/cmsLinks'
import type { SimpleFormField } from '@/lib/forms'
import { getMediaImageProps, isMediaDoc } from '@/lib/media'
import type { Form, FormBlock, Hero36Block, Page } from '@/payload-types'
import { RefreshRouteOnSave, useLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const toSimpleFields = (form: Form): SimpleFormField[] => {
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

const isPublishedFormDoc = (value: FormBlock['form']): value is Form => {
  return typeof value === 'object' && value !== null && value._status === 'published'
}

function PreviewHero36Block(props: Hero36Block) {
  const cards = props.cards.map((card) => {
    const image =
      card.visualType === 'image' && isMediaDoc(card.image)
        ? getMediaImageProps({
            media: card.image,
            preset: 'hero',
          })
        : undefined
    const { href, openInNewTab } = resolveCmsLink(card)

    return {
      title: card.title,
      description: card.description,
      href,
      openInNewTab,
      icon: card.visualType === 'icon' ? card.icon ?? undefined : undefined,
      image,
    }
  })

  return (
    <Hero36
      badge={props.badge?.text ? { text: props.badge.text } : undefined}
      heading={props.heading}
      description={props.description ?? undefined}
      cards={cards}
    />
  )
}

function PreviewFormBlock(props: FormBlock) {
  if (!isPublishedFormDoc(props.form)) {
    return null
  }

  if (!props.form.slug || !props.form.title || !props.form.fields?.length) {
    return null
  }

  return (
    <ClientForm
      fields={toSimpleFields(props.form)}
      slug={props.form.slug}
      submitButtonLabel={props.form.submitButtonLabel}
      successMessage={props.form.successMessage}
      title={props.form.title}
    />
  )
}

function PreviewPageContent({ page }: { page: Page }) {
  if (!page.layout?.length) {
    return null
  }

  return (
    <>
      {page.layout.map((block, index) => {
        switch (block.blockType) {
          case 'hero36':
            return <PreviewHero36Block key={block.id ?? `${block.blockType}-${index}`} {...block} />
          case 'form':
            return <PreviewFormBlock key={block.id ?? `${block.blockType}-${index}`} {...block} />
          default:
            return null
        }
      })}
    </>
  )
}

type Props = {
  initialData: Page
}

export function PageLivePreview({ initialData }: Props) {
  const router = useRouter()
  const { data } = useLivePreview<Page>({
    depth: 2,
    initialData,
    serverURL,
  })

  return (
    <>
      <RefreshRouteOnSave
        depth={2}
        refresh={() => router.refresh()}
        serverURL={serverURL}
      />
      <PreviewPageContent page={data} />
    </>
  )
}
