'use client'

import { DefaultEditView, useAuth, useDocumentDrawerContext, useDocumentInfo } from '@payloadcms/ui'
import type { DocumentViewClientProps } from 'payload'
import { useSearchParams } from 'next/navigation'

import { PageRecipeSetup } from '@/components/admin/PageRecipeSetup'

export function PageCreateView(props: DocumentViewClientProps) {
  const { drawerSlug } = useDocumentDrawerContext()
  const { id } = useDocumentInfo()
  const { user } = useAuth()
  const searchParams = useSearchParams()

  if (id || drawerSlug || searchParams.get('editor') === 'native')
    return <DefaultEditView {...props} />

  return <PageRecipeSetup sectionRequired={user?.role === 'siteManager'} />
}
