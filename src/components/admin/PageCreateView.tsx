'use client'

import { DefaultEditView, useAuth, useDocumentDrawerContext, useDocumentInfo } from '@payloadcms/ui'
import type { DocumentViewClientProps } from 'payload'

import { PageRecipeSetup } from '@/components/admin/PageRecipeSetup'

export function PageCreateView(props: DocumentViewClientProps) {
  const { drawerSlug } = useDocumentDrawerContext()
  const { id } = useDocumentInfo()
  const { user } = useAuth()

  if (id || drawerSlug || user?.role === 'siteManager') return <DefaultEditView {...props} />

  return <PageRecipeSetup />
}
