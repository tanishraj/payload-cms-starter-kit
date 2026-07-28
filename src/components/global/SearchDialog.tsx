'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import type { SearchResponse, SearchResultItem } from '@/app/api/search/route'

const DEBOUNCE_MS = 220
const MIN_QUERY = 2

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

type Status = 'idle' | 'loading' | 'done' | 'error'

const typeAccent: Record<string, string> = {
  page: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  article: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'news-event': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS)

  const openDialog = useCallback(() => {
    setOpen(true)
    setQuery('')
    setResults([])
    setStatus('idle')
    setActiveIndex(-1)
  }, [])

  const closeDialog = useCallback(() => {
    setOpen(false)
  }, [])

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) closeDialog()
        else openDialog()
      }
      if (e.key === 'Escape' && open) closeDialog()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, openDialog, closeDialog])

  // Custom event so the header button can trigger the dialog
  useEffect(() => {
    const handler = () => openDialog()
    window.addEventListener('open-search-dialog', handler)
    return () => window.removeEventListener('open-search-dialog', handler)
  }, [openDialog])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Fetch results when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY) {
      setResults([])
      setStatus('idle')
      setActiveIndex(-1)
      return
    }
    let cancelled = false
    setStatus('loading')
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json() as Promise<SearchResponse>)
      .then((data) => {
        if (!cancelled) {
          setResults(data.results)
          setStatus('done')
          setActiveIndex(-1)
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  // Keyboard navigation within results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      const item = results[activeIndex]
      if (item) {
        closeDialog()
        window.location.href = item.href
      }
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!open) return null

  return (
    /* backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site search"
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDialog()
      }}
    >
      {/* scrim */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* panel */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        {/* Search input row */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <svg
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-autocomplete="list"
            aria-controls="search-dialog-results"
            aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, articles, news…"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {/* Esc hint */}
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground sm:block">
            Esc
          </kbd>
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close search"
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Results */}
        <div
          aria-live="polite"
          aria-atomic="false"
          className="max-h-[60vh] overflow-y-auto"
        >
          {query.length >= MIN_QUERY && status === 'loading' ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Searching…</p>
          ) : status === 'error' ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Search unavailable. Please try again.
            </p>
          ) : status === 'done' && results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results for <strong>&ldquo;{query}&rdquo;</strong>
            </p>
          ) : results.length > 0 ? (
            <ul
              ref={listRef}
              id="search-dialog-results"
              role="listbox"
              aria-label="Search results"
              className="py-2"
            >
              {results.map((item, i) => (
                <li
                  key={item.id}
                  id={`search-result-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                >
                  <Link
                    href={item.href}
                    onClick={closeDialog}
                    className={`flex items-start gap-3 px-4 py-2.5 transition ${
                      i === activeIndex ? 'bg-muted' : 'hover:bg-muted'
                    }`}
                  >
                    <span
                      className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold ${
                        typeAccent[item.type] ?? 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      {item.excerpt ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {item.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            /* idle: show keyboard hint */
            <div className="flex items-center justify-between px-4 py-4 text-xs text-muted-foreground">
              <span>Type to search the site</span>
              <span className="hidden sm:block">
                <kbd className="rounded border border-border px-1.5 py-0.5">↑↓</kbd> navigate&nbsp;&nbsp;
                <kbd className="rounded border border-border px-1.5 py-0.5">↵</kbd> open
              </span>
            </div>
          )}
        </div>

        {/* Footer: link to full search page */}
        {results.length > 0 && (
          <div className="border-t border-border px-4 py-2.5">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={closeDialog}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              View all results for &ldquo;{query}&rdquo; →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
