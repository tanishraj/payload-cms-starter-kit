'use client'

import { useConfig } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { formatAdminURL } from 'payload/shared'
import { type FormEvent, useEffect, useState } from 'react'
import {
  PageSectionSelect,
  type PageSectionSelectProps,
} from '@/components/revamp/page-section-select'
import { parseRecipeSectionOptions, recipeSectionsQuery } from '@/page-recipes/sectionOptions'

import { pageRecipeOptions, type PageRecipeID } from '@/page-recipes/pageRecipes'

import './PageRecipeSetup.scss'

type CreatePageResult = {
  editURL?: unknown
  message?: unknown
}

export function PageRecipeSetup({ sectionRequired = false }: { sectionRequired?: boolean }) {
  const { config } = useConfig()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [recipe, setRecipe] = useState<PageRecipeID>('blank')
  const [error, setError] = useState('')
  const [createdDraftURL, setCreatedDraftURL] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sections, setSections] = useState<Pick<PageSectionSelectProps, 'status' | 'options'>>({
    status: 'loading',
    options: [],
  })
  const [selectedSection, setSelectedSection] = useState('')
  const [sectionAttempt, setSectionAttempt] = useState(0)
  const parent = sections.options.some((option) => option.id === selectedSection)
    ? selectedSection
    : sections.options.length === 1
      ? sections.options[0].id
      : ''
  const sectionsUnavailable = sectionRequired && sections.status !== 'ready'
  const creationLocked = isSubmitting || Boolean(createdDraftURL)

  const endpointURL = formatAdminURL({
    apiRoute: config.routes.api,
    path: '/pages/create-from-recipe',
    relative: true,
    serverURL: config.serverURL,
  })
  const pagesURL = formatAdminURL({
    adminRoute: config.routes.admin,
    path: '/collections/pages',
    relative: true,
    serverURL: config.serverURL,
  })

  const sectionsURL =
    formatAdminURL({
      apiRoute: config.routes.api,
      path: '/pages',
      relative: true,
      serverURL: config.serverURL,
    }) +
    '?' +
    recipeSectionsQuery()
  const nativeEditorURL =
    formatAdminURL({
      adminRoute: config.routes.admin,
      path: '/collections/pages/create',
      relative: true,
      serverURL: config.serverURL,
    }) + '?editor=native'

  useEffect(() => {
    if (!sectionRequired) return
    const controller = new AbortController()
    const load = async () => {
      try {
        const response = await fetch(sectionsURL, {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        })
        // A native access denial is an unavailable assignment, not a successful empty query.
        if (response.status === 403) {
          if (!controller.signal.aborted) setSections({ status: 'empty', options: [] })
          return
        }
        if (!response.ok) throw new Error('Section lookup failed.')
        const options = parseRecipeSectionOptions(await response.json())
        if (!controller.signal.aborted)
          setSections({ status: options.length ? 'ready' : 'empty', options })
      } catch {
        if (!controller.signal.aborted) setSections({ status: 'error', options: [] })
      }
    }
    void load()
    return () => controller.abort()
  }, [sectionRequired, sectionsURL, sectionAttempt])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (creationLocked || sectionsUnavailable) return

    const normalizedTitle = title.trim()
    if (!normalizedTitle) {
      setError('Enter a Page title.')
      return
    }

    if (sectionRequired && !parent) {
      setError('Choose a website section.')
      return
    }
    setError('')
    setCreatedDraftURL('')
    setIsSubmitting(true)
    let nextEditURL = ''

    try {
      const response = await fetch(endpointURL, {
        body: JSON.stringify({
          recipe,
          title: normalizedTitle,
          ...(sectionRequired ? { parent } : {}),
        }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = (await response.json()) as CreatePageResult

      if (!response.ok || typeof result.editURL !== 'string') {
        setError(
          typeof result.message === 'string' ? result.message : 'Unable to create the Page draft.',
        )
        return
      }

      nextEditURL = result.editURL
      setCreatedDraftURL(nextEditURL)
      router.push(nextEditURL)
    } catch {
      setError(
        nextEditURL
          ? 'The draft was created, but the editor could not open automatically.'
          : 'Unable to create the Page draft.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-recipe-setup">
      <header>
        <h1>Create a Page</h1>
        <p className="page-recipe-setup__intro">
          Name the Page and choose a starting structure. You can use every Page block after the
          draft opens.
        </p>
      </header>

      <form className="page-recipe-setup__form" onSubmit={handleSubmit}>
        <div className="page-recipe-setup__field">
          <label className="page-recipe-setup__label" htmlFor="page-recipe-title">
            Page title
          </label>
          <input
            autoFocus
            className="page-recipe-setup__title-input"
            disabled={creationLocked}
            id="page-recipe-title"
            onChange={(event) => setTitle(event.target.value)}
            type="text"
            value={title}
          />
        </div>

        {sectionRequired ? (
          <PageSectionSelect
            {...sections}
            value={parent}
            invalid={error === 'Choose a website section.'}
            disabled={creationLocked}
            onChange={(value) => {
              setSelectedSection(value)
              setError('')
            }}
            onRetry={() => {
              setSections({ status: 'loading', options: [] })
              setSectionAttempt((value) => value + 1)
            }}
          />
        ) : null}

        <fieldset className="page-recipe-setup__field" disabled={creationLocked}>
          <legend>Choose a starting point</legend>
          <div className="page-recipe-setup__recipes">
            {pageRecipeOptions.map((option) => (
              <label className="page-recipe-setup__recipe" key={option.id}>
                <input
                  checked={recipe === option.id}
                  className="page-recipe-setup__radio"
                  name="page-recipe"
                  onChange={() => setRecipe(option.id)}
                  type="radio"
                  value={option.id}
                />
                <span className="page-recipe-setup__card">
                  <span className="page-recipe-setup__recipe-title">{option.label}</span>
                  <span className="page-recipe-setup__recipe-description">
                    {option.description}
                  </span>
                  {option.includedBlocks.length > 0 ? (
                    <span className="page-recipe-setup__recipe-blocks">
                      {option.includedBlocks.join(' → ')}
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <p aria-live="polite" className="page-recipe-setup__status" role="status">
          {error}
        </p>

        {createdDraftURL ? (
          <a className="page-recipe-setup__recovery" href={createdDraftURL}>
            Open the created draft
          </a>
        ) : null}

        <div className="page-recipe-setup__actions">
          <button
            className="page-recipe-setup__submit"
            disabled={creationLocked || sectionsUnavailable}
            type="submit"
          >
            {isSubmitting ? 'Creating draft…' : 'Create draft'}
          </button>
          <a
            aria-disabled={creationLocked}
            className="page-recipe-setup__cancel"
            href={creationLocked ? undefined : pagesURL}
          >
            Cancel
          </a>
        </div>
        <a aria-disabled={creationLocked} href={creationLocked ? undefined : nativeEditorURL}>
          Use the native Page editor
        </a>
      </form>
    </main>
  )
}
