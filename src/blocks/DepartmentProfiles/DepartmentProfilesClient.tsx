'use client'

import { Search } from 'lucide-react'
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'

import { resolveBlockSurface, type BlockBackground } from '@/blocks/shared/blockAppearance'
import {
  getContentTabClasses,
  getContentTabRailClasses,
  type ContentTabVariant,
} from '@/blocks/shared/contentTabRail'
import type {
  MediaOverlayCoverage,
  MediaOverlayDirection,
  MediaOverlayStrength,
  MediaOverlayTone,
} from '@/blocks/shared/mediaOverlayPresentation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { DepartmentProfileCard } from './DepartmentProfileCard'
import type {
  DepartmentProfilesCardFrame,
  DepartmentProfilesCardLayout,
  DepartmentProfilesCardSize,
  DepartmentProfilesColumns,
  DepartmentProfilesPerLoad,
  DepartmentProfilesTabWidth,
  ResolvedDepartmentProfile,
  ResolvedProfileDepartment,
} from './types'

type DepartmentProfilesClientProps = {
  allTabLabel: string
  background: BlockBackground
  cardFrame: DepartmentProfilesCardFrame
  cardLayout: DepartmentProfilesCardLayout
  cardSize: DepartmentProfilesCardSize
  columns: DepartmentProfilesColumns
  departments: ResolvedProfileDepartment[]
  hasSectionHeading: boolean
  loadMoreLabel: string
  noResultsMessage: string
  overlayCoverage: MediaOverlayCoverage
  overlayDirection: MediaOverlayDirection
  overlayStyle: MediaOverlayStrength
  profiles: ResolvedDepartmentProfile[]
  profilesPerLoad: DepartmentProfilesPerLoad
  searchPlaceholder: string
  showDepartmentTabs: boolean
  showSearch: boolean
  tabVariant: ContentTabVariant
  tabWidth: DepartmentProfilesTabWidth
  themeMode: MediaOverlayTone
}

const gridClasses = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  '5': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5',
  '6': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6',
  '7': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7',
  '8': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8',
} as const

const imageSizes = {
  '2': '(min-width: 640px) 50vw, 100vw',
  '3': '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  '4': '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
  '5': '(min-width: 1536px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
  '6': '(min-width: 1536px) 16.67vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
  '7': '(min-width: 1536px) 14.29vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
  '8': '(min-width: 1536px) 12.5vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
} as const

const overlayMobileWidthClasses = {
  lg: 'mx-auto w-full max-w-80 sm:max-w-none',
  md: 'mx-auto w-full max-w-72 sm:max-w-none',
  sm: 'mx-auto w-full max-w-64 sm:max-w-none',
} as const

const tabRailWidthClasses = {
  centered: 'mx-auto w-max',
  content: 'w-max min-w-full',
  equal: 'w-full min-w-0',
} as const satisfies Record<DepartmentProfilesTabWidth, string>

const normalizeSearchValue = (value: string) => value.trim().toLocaleLowerCase()

type DepartmentProfilesGridProps = Pick<
  DepartmentProfilesClientProps,
  | 'background'
  | 'cardFrame'
  | 'cardLayout'
  | 'cardSize'
  | 'columns'
  | 'hasSectionHeading'
  | 'overlayCoverage'
  | 'overlayDirection'
  | 'overlayStyle'
  | 'themeMode'
> & {
  profiles: ResolvedDepartmentProfile[]
}

function DepartmentProfilesGrid({
  background,
  cardFrame,
  cardLayout,
  cardSize,
  columns,
  hasSectionHeading,
  overlayCoverage,
  overlayDirection,
  overlayStyle,
  profiles,
  themeMode,
}: DepartmentProfilesGridProps) {
  const mobileWidthClass =
    cardLayout === 'overlay' ? overlayMobileWidthClasses[cardSize] : undefined

  if (cardFrame === 'boxed') {
    return (
      <div
        className={cn('grid gap-5 sm:gap-6', mobileWidthClass, gridClasses[columns])}
        data-department-profiles-frame="boxed"
        data-department-profiles-grid="true"
      >
        {profiles.map((profile) => (
          <DepartmentProfileCard
            background={background}
            frame={cardFrame}
            hasSectionHeading={hasSectionHeading}
            imageSizes={imageSizes[columns]}
            key={profile.id}
            layout={cardLayout}
            overlayCoverage={overlayCoverage}
            overlayDirection={overlayDirection}
            overlayStyle={overlayStyle}
            profile={profile}
            size={cardSize}
            themeMode={themeMode}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'overflow-hidden border-current/15',
        mobileWidthClass,
        cardFrame === 'framed' ? 'border' : 'border-y',
      )}
      data-department-profiles-frame={cardFrame}
    >
      <div
        className={cn('-mb-px -mr-px grid', gridClasses[columns])}
        data-department-profiles-grid="true"
      >
        {profiles.map((profile) => (
          <div className="min-w-0 border-r border-b border-current/15" key={profile.id}>
            <DepartmentProfileCard
              background={background}
              frame={cardFrame}
              hasSectionHeading={hasSectionHeading}
              imageSizes={imageSizes[columns]}
              layout={cardLayout}
              overlayCoverage={overlayCoverage}
              overlayDirection={overlayDirection}
              overlayStyle={overlayStyle}
              profile={profile}
              size={cardSize}
              themeMode={themeMode}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DepartmentProfilesClient({
  allTabLabel,
  background,
  cardFrame,
  cardLayout,
  cardSize,
  columns,
  departments,
  hasSectionHeading,
  loadMoreLabel,
  noResultsMessage,
  overlayCoverage,
  overlayDirection,
  overlayStyle,
  profiles,
  profilesPerLoad,
  searchPlaceholder,
  showDepartmentTabs,
  showSearch,
  tabVariant,
  tabWidth,
  themeMode,
}: DepartmentProfilesClientProps) {
  const componentID = useId().replaceAll(':', '')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [activeDepartmentId, setActiveDepartmentId] = useState('all')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState<number>(profilesPerLoad)
  const populatedDepartments = useMemo(
    () => departments.filter(({ id }) => profiles.some((profile) => profile.departmentId === id)),
    [departments, profiles],
  )
  const tabs = useMemo(
    () => [{ id: 'all', name: allTabLabel }, ...populatedDepartments],
    [allTabLabel, populatedDepartments],
  )
  const tabsVisible = showDepartmentTabs && populatedDepartments.length > 0
  const activeId =
    tabsVisible && tabs.some(({ id }) => id === activeDepartmentId) ? activeDepartmentId : 'all'
  const normalizedQuery = normalizeSearchValue(query)
  const filteredProfiles = useMemo(
    () =>
      profiles.filter((profile) => {
        if (activeId !== 'all' && profile.departmentId !== activeId) return false
        if (!normalizedQuery) return true

        return [profile.name, profile.designation, profile.departmentName].some((value) =>
          value?.toLocaleLowerCase().includes(normalizedQuery),
        )
      }),
    [activeId, normalizedQuery, profiles],
  )
  const visibleProfiles = filteredProfiles.slice(0, visibleCount)
  const panelID = `${componentID}-panel`
  const tabSurface = resolveBlockSurface(background)
  const selectDepartment = (id: string) => {
    setActiveDepartmentId(id)
    setVisibleCount(profilesPerLoad)
  }

  const activateTab = (index: number) => {
    const nextTab = tabs[index]
    if (!nextTab) return
    selectDepartment(nextTab.id)
    tabRefs.current[index]?.focus()
    tabRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    if (nextIndex === undefined) return

    event.preventDefault()
    activateTab(nextIndex)
  }

  return (
    <div
      className="flex min-w-0 flex-col gap-8 md:gap-10"
      data-department-profiles-card-frame={cardFrame}
      data-department-profiles-card-layout={cardLayout}
      data-department-profiles-card-size={cardSize}
      data-department-profiles-columns={columns}
      data-department-profiles-directory="true"
    >
      {showSearch || tabsVisible ? (
        <div
          className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center"
          data-department-profiles-toolbar="true"
        >
          {showSearch ? (
            <label className="relative block w-full shrink-0 lg:w-64">
              <span className="sr-only">Search profiles</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="h-11 border-border bg-background pr-4 pl-10 text-foreground shadow-none"
                onChange={(event) => {
                  setQuery(event.currentTarget.value)
                  setVisibleCount(profilesPerLoad)
                }}
                placeholder={searchPlaceholder}
                type="search"
                value={query}
              />
            </label>
          ) : null}

          {tabsVisible ? (
            <div className="min-w-0 flex-1 overflow-x-auto pb-1">
              <div
                aria-label="Profile departments"
                className={cn(
                  'flex flex-nowrap',
                  tabRailWidthClasses[tabWidth],
                  getContentTabRailClasses(tabVariant, tabSurface),
                )}
                data-department-profiles-tab-width={tabWidth}
                role="tablist"
              >
                {tabs.map((tab, index) => {
                  const active = tab.id === activeId
                  const tabID = `${componentID}-tab-${index}`

                  return (
                    <button
                      aria-controls={panelID}
                      aria-selected={active}
                      className={cn(
                        getContentTabClasses(tabVariant, active, tabSurface),
                        tabWidth === 'equal' &&
                          'w-0 min-w-0 flex-1 shrink overflow-hidden px-2 text-ellipsis',
                      )}
                      id={tabID}
                      key={tab.id}
                      onClick={() => selectDepartment(tab.id)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                      ref={(node) => {
                        tabRefs.current[index] = node
                      }}
                      role="tab"
                      tabIndex={active ? 0 : -1}
                      type="button"
                    >
                      {tab.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only" role="status">
        {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'} found
      </p>

      <div
        aria-labelledby={
          tabsVisible
            ? `${componentID}-tab-${tabs.findIndex(({ id }) => id === activeId)}`
            : undefined
        }
        id={tabsVisible ? panelID : undefined}
        role={tabsVisible ? 'tabpanel' : undefined}
        tabIndex={tabsVisible ? 0 : undefined}
      >
        {visibleProfiles.length ? (
          <DepartmentProfilesGrid
            background={background}
            cardFrame={cardFrame}
            cardLayout={cardLayout}
            cardSize={cardSize}
            columns={columns}
            hasSectionHeading={hasSectionHeading}
            overlayCoverage={overlayCoverage}
            overlayDirection={overlayDirection}
            overlayStyle={overlayStyle}
            profiles={visibleProfiles}
            themeMode={themeMode}
          />
        ) : (
          <p className="border border-border bg-background px-5 py-10 text-center text-sm text-current/70">
            {noResultsMessage}
          </p>
        )}
      </div>

      {visibleCount < filteredProfiles.length ? (
        <div className="flex justify-center">
          <Button
            onClick={() => setVisibleCount((current) => current + profilesPerLoad)}
            type="button"
            variant="outline"
          >
            {loadMoreLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
