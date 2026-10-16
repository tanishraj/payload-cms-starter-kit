'use client'

import { toast, useAuth, useConfig, useListQuery } from '@payloadcms/ui'
import { useState } from 'react'
import { hasFeature } from '@/access/featureAccess'
import { FormExportAction } from '@/components/revamp/form-export-action'

/** Native list extension only. Payload continues to own filtering/search/table state. */
export function FormSubmissionExport() {
  const { user } = useAuth()
  const { config } = useConfig()
  const { query, data } = useListQuery()
  const [pending, setPending] = useState(false)
  if (!hasFeature(user, 'formSubmissions')) return null

  async function download() {
    if (pending) return
    setPending(true)
    try {
      const params = new URLSearchParams()
      if (query.where) params.set('filter', JSON.stringify(query.where))
      if (query.search) params.set('search', query.search)
      const response = await fetch(`${config.routes.api}/form-submissions/export?${params}`, {
        credentials: 'same-origin',
        cache: 'no-store',
      })
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(
          typeof result.message === 'string'
            ? result.message
            : 'Export could not be completed. Try again.',
        )
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'form-answers.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 30_000)
      const count = response.headers.get('X-Submission-Count') ?? '0'
      toast.success(
        `Exported ${count} ${count === '1' ? 'submission' : 'submissions'}. Each answer has its own row.`,
      )
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : 'Export could not be completed. Try again.',
      )
    } finally {
      setPending(false)
    }
  }
  return (
    <FormExportAction
      pending={pending}
      disabled={!data?.totalDocs || query.trash === true}
      onExport={download}
      className="btn btn--style-secondary btn--size-small btn--no-margin btn--withoutPopup"
    />
  )
}
