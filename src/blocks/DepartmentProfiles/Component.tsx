import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
  type RegularBlockSize,
} from '@/blocks/shared/blockSpacing'
import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import {
  contentIntroClasses,
  contentSectionDescriptionClasses,
  contentSectionHeadingClasses,
} from '@/blocks/shared/contentStyles'
import type { ContentTabVariant } from '@/blocks/shared/contentTabRail'
import type {
  MediaOverlayCoverage,
  MediaOverlayDirection,
  MediaOverlayStrength,
  MediaOverlayTone,
} from '@/blocks/shared/mediaOverlayPresentation'
import {
  normalizeMediaOverlayCoverage,
  normalizeMediaOverlayDirection,
  normalizeMediaOverlayStrength,
  normalizeMediaOverlayTone,
} from '@/blocks/shared/mediaOverlayPresentation'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import { resolveCmsActions, type CmsActionValue } from '@/lib/cmsLinks'
import { getMediaImageProps } from '@/lib/media'
import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

import { DepartmentProfilesClient } from './DepartmentProfilesClient'
import type {
  DepartmentProfileImagePosition,
  DepartmentProfilesAlignment,
  DepartmentProfilesCardFrame,
  DepartmentProfilesCardLayout,
  DepartmentProfilesCardSize,
  DepartmentProfilesColumns,
  DepartmentProfilesPerLoad,
  ResolvedDepartmentProfile,
  ResolvedProfileDepartment,
} from './types'

type DepartmentValue = {
  id?: string | null
  name?: string | null
}

type DepartmentProfileValue = {
  departmentId?: string | null
  designation?: string | null
  id?: string | null
  image?: unknown
  imagePosition?: string | null
  name?: string | null
}

type DepartmentProfilesBlockLike = {
  accentTitle?: string | null
  actions?: CmsActionValue[] | null
  allTabLabel?: string | null
  appearance?: BlockAppearance | null
  cardLayout?: DepartmentProfilesCardLayout | null
  cardFrame?: DepartmentProfilesCardFrame | null
  cardSize?: DepartmentProfilesCardSize | null
  columns?: DepartmentProfilesColumns | null
  contentAlignment?: DepartmentProfilesAlignment | null
  departments?: DepartmentValue[] | null
  description?: string | null
  descriptionPosition?: 'side' | 'underTitle' | null
  eyebrow?: string | null
  footerActions?: CmsActionValue[] | null
  headerLayout?: 'split' | 'stacked' | null
  loadMoreLabel?: string | null
  mediumColumns?: DepartmentProfilesColumns | null
  noResultsMessage?: string | null
  overlayCoverage?: MediaOverlayCoverage | null
  overlayDirection?: MediaOverlayDirection | null
  overlayStyle?: MediaOverlayStrength | null
  profiles?: DepartmentProfileValue[] | null
  profilesPerLoad?: number | string | null
  searchPlaceholder?: string | null
  showDepartmentTabs?: boolean | null
  showSearch?: boolean | null
  sideContentAlignment?: 'bottom' | 'top' | null
  size?: RegularBlockSize | null
  smallColumns?: DepartmentProfilesColumns | null
  tabVariant?: ContentTabVariant | null
  themeMode?: MediaOverlayTone | null
  title?: string | null
}

const validAlignments = new Set<DepartmentProfilesAlignment>(['left', 'center', 'right'])
const validCardLayouts = new Set<DepartmentProfilesCardLayout>(['inline', 'overlay'])
const validCardFrames = new Set<DepartmentProfilesCardFrame>(['boxed', 'framed', 'open'])
const validCardSizes = new Set<DepartmentProfilesCardSize>(['lg', 'md', 'sm'])
const validLargeColumns = new Set<DepartmentProfilesColumns>(['2', '3', '4'])
const validMediumColumns = new Set<DepartmentProfilesColumns>(['3', '4', '5', '6'])
const validSmallColumns = new Set<DepartmentProfilesColumns>(['4', '5', '6', '7', '8'])
const validImagePositions = new Set<DepartmentProfileImagePosition>([
  'center',
  'top',
  'bottom',
  'left',
  'right',
])
const validProfilesPerLoad = new Set<DepartmentProfilesPerLoad>([12, 16, 20, 24])
const validSizes = new Set<RegularBlockSize>(['none', 'compact', 'default', 'comfortable'])
const validTabVariants = new Set<ContentTabVariant>(['contained', 'pill', 'underline'])

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'mx-auto items-center text-center',
  right: 'ml-auto items-end text-right',
} as const

const stackedAlignmentClasses = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
} as const

const sectionGapClasses = {
  none: 'gap-10',
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const satisfies Record<RegularBlockSize, string>

const normalizeDepartmentName = (value: string) => value.trim().toLocaleLowerCase()

export function DepartmentProfilesBlockComponent({
  accentTitle,
  actions,
  allTabLabel,
  appearance,
  cardFrame = 'boxed',
  cardLayout = 'overlay',
  cardSize = 'lg',
  columns = '4',
  contentAlignment = 'left',
  departments,
  description,
  descriptionPosition = 'side',
  eyebrow,
  footerActions,
  headerLayout = 'split',
  loadMoreLabel,
  mediumColumns = '6',
  noResultsMessage,
  overlayCoverage = 'full',
  overlayDirection = 'bottomToTop',
  overlayStyle = 'dark',
  profiles,
  profilesPerLoad = 20,
  searchPlaceholder,
  showDepartmentTabs = true,
  showSearch = true,
  sideContentAlignment = 'bottom',
  size = 'default',
  smallColumns = '8',
  tabVariant = 'pill',
  themeMode = 'dark',
  title,
}: DepartmentProfilesBlockLike) {
  const seenDepartmentNames = new Set<string>()
  const resolvedDepartments = (departments ?? []).flatMap(
    (department): ResolvedProfileDepartment[] => {
      const id = department.id?.trim()
      const name = department.name?.trim()
      if (!id || !name) return []

      const normalizedName = normalizeDepartmentName(name)
      if (seenDepartmentNames.has(normalizedName)) return []
      seenDepartmentNames.add(normalizedName)
      return [{ id, name }]
    },
  )
  const departmentById = new Map(
    resolvedDepartments.map((department) => [department.id, department] as const),
  )
  const resolvedProfiles = (profiles ?? []).flatMap(
    (profile, index): ResolvedDepartmentProfile[] => {
      const name = profile.name?.trim()
      const departmentId = profile.departmentId?.trim()
      const department = departmentId ? departmentById.get(departmentId) : undefined
      if (!name || !department) return []

      const image = getMediaImageProps({
        fallbackAlt: name,
        media: profile.image as Media | string | number | null | undefined,
        preset: 'generic',
      })
      const imagePosition = validImagePositions.has(
        profile.imagePosition as DepartmentProfileImagePosition,
      )
        ? (profile.imagePosition as DepartmentProfileImagePosition)
        : 'center'

      return [
        {
          departmentId: department.id,
          departmentName: department.name,
          designation: profile.designation?.trim() || undefined,
          id: profile.id ?? index,
          image: image ?? undefined,
          imagePosition,
          name,
        },
      ]
    },
  )
  if (!resolvedProfiles.length) return null

  const { background, className: appearanceClassName } = resolveBlockAppearanceClasses(appearance)
  const resolvedActions = resolveCmsActions(actions)
  const resolvedAccentTitle = accentTitle?.trim()
  const resolvedAlignment = validAlignments.has(contentAlignment ?? 'left')
    ? (contentAlignment ?? 'left')
    : 'left'
  const resolvedAllTabLabel = allTabLabel?.trim() || 'All'
  const resolvedCardLayout = validCardLayouts.has(cardLayout ?? 'overlay')
    ? (cardLayout ?? 'overlay')
    : 'overlay'
  const resolvedCardFrame = validCardFrames.has(cardFrame ?? 'boxed')
    ? (cardFrame ?? 'boxed')
    : 'boxed'
  const resolvedCardSize = validCardSizes.has(cardSize ?? 'lg') ? (cardSize ?? 'lg') : 'lg'
  const resolvedColumns =
    resolvedCardLayout === 'inline'
      ? validLargeColumns.has(columns ?? '4')
        ? (columns ?? '4')
        : '4'
      : resolvedCardSize === 'sm'
        ? validSmallColumns.has(smallColumns ?? '8')
          ? (smallColumns ?? '8')
          : '8'
        : resolvedCardSize === 'md'
          ? validMediumColumns.has(mediumColumns ?? '6')
            ? (mediumColumns ?? '6')
            : '6'
          : validLargeColumns.has(columns ?? '4')
            ? (columns ?? '4')
            : '4'
  const resolvedDescription = description?.trim()
  const resolvedDescriptionPosition = descriptionPosition === 'underTitle' ? 'underTitle' : 'side'
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedHeaderLayout = headerLayout === 'stacked' ? 'stacked' : 'split'
  const resolvedLoadMoreLabel = loadMoreLabel?.trim() || 'Load More'
  const resolvedNoResultsMessage = noResultsMessage?.trim() || 'No matching profiles found.'
  const resolvedOverlayDirection = normalizeMediaOverlayDirection(overlayDirection, 'bottomToTop')
  const resolvedOverlayCoverage = normalizeMediaOverlayCoverage(
    overlayCoverage,
    resolvedOverlayDirection,
  )
  const resolvedOverlayStyle = normalizeMediaOverlayStrength(overlayStyle, 'dark')
  const parsedProfilesPerLoad = Number(profilesPerLoad)
  const resolvedProfilesPerLoad = validProfilesPerLoad.has(
    parsedProfilesPerLoad as DepartmentProfilesPerLoad,
  )
    ? (parsedProfilesPerLoad as DepartmentProfilesPerLoad)
    : 20
  const resolvedSearchPlaceholder = searchPlaceholder?.trim() || 'Search profiles'
  const resolvedSideAlignment = sideContentAlignment === 'top' ? 'top' : 'bottom'
  const resolvedSize = validSizes.has(size ?? 'default') ? (size ?? 'default') : 'default'
  const resolvedTabVariant = validTabVariants.has(tabVariant ?? 'pill')
    ? (tabVariant ?? 'pill')
    : 'pill'
  const resolvedThemeMode = normalizeMediaOverlayTone(themeMode, 'dark')
  const resolvedTitle = title?.trim()
  const hasHeading = Boolean(resolvedTitle || resolvedAccentTitle)
  const hasHeader = Boolean(
    resolvedEyebrow || hasHeading || resolvedDescription || resolvedActions.length,
  )

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClassName)}
      data-department-profiles="true"
    >
      <div className={regularBlockContainerClasses}>
        <div className={cn('flex flex-col', hasHeader && sectionGapClasses[resolvedSize])}>
          {hasHeader ? (
            <header
              className={cn(
                'grid gap-6',
                resolvedHeaderLayout === 'split'
                  ? 'lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)] lg:items-end lg:gap-16'
                  : cn('w-full max-w-3xl', stackedAlignmentClasses[resolvedAlignment]),
              )}
              data-department-profiles-header={resolvedHeaderLayout}
            >
              <div className={cn(contentIntroClasses, alignmentClasses[resolvedAlignment])}>
                {resolvedEyebrow ? (
                  <SectionEyebrow surface={background}>{resolvedEyebrow}</SectionEyebrow>
                ) : null}
                {hasHeading ? (
                  <h2 className={contentSectionHeadingClasses}>
                    {resolvedTitle ? (
                      <span className="block font-[inherit]">{resolvedTitle}</span>
                    ) : null}
                    {resolvedAccentTitle ? (
                      <em className="block font-[inherit]">{resolvedAccentTitle}</em>
                    ) : null}
                  </h2>
                ) : null}
                {resolvedDescription &&
                (resolvedHeaderLayout === 'stacked' ||
                  resolvedDescriptionPosition === 'underTitle') ? (
                  <p className={contentSectionDescriptionClasses}>{resolvedDescription}</p>
                ) : null}
                {resolvedHeaderLayout === 'stacked' ? (
                  <ContentActions actions={resolvedActions} alignment={resolvedAlignment} />
                ) : null}
              </div>

              {resolvedHeaderLayout === 'split' &&
              ((resolvedDescriptionPosition === 'side' && resolvedDescription) ||
                resolvedActions.length) ? (
                <div
                  className={cn(
                    contentIntroClasses,
                    'max-w-xl',
                    resolvedDescriptionPosition === 'underTitle'
                      ? 'ml-auto w-full items-end text-right'
                      : alignmentClasses[resolvedAlignment],
                    resolvedSideAlignment === 'top' ? 'lg:self-start' : 'lg:self-end lg:pb-1',
                  )}
                >
                  {resolvedDescriptionPosition === 'side' && resolvedDescription ? (
                    <p className={contentSectionDescriptionClasses}>{resolvedDescription}</p>
                  ) : null}
                  <ContentActions
                    actions={resolvedActions}
                    alignment={
                      resolvedDescriptionPosition === 'underTitle' ? 'right' : resolvedAlignment
                    }
                  />
                </div>
              ) : null}
            </header>
          ) : null}

          <DepartmentProfilesClient
            allTabLabel={resolvedAllTabLabel}
            background={background}
            cardFrame={resolvedCardFrame}
            cardLayout={resolvedCardLayout}
            cardSize={resolvedCardSize}
            columns={resolvedColumns}
            departments={resolvedDepartments}
            hasSectionHeading={hasHeading}
            loadMoreLabel={resolvedLoadMoreLabel}
            noResultsMessage={resolvedNoResultsMessage}
            overlayCoverage={resolvedOverlayCoverage}
            overlayDirection={resolvedOverlayDirection}
            overlayStyle={resolvedOverlayStyle}
            profiles={resolvedProfiles}
            profilesPerLoad={resolvedProfilesPerLoad}
            searchPlaceholder={resolvedSearchPlaceholder}
            showDepartmentTabs={showDepartmentTabs !== false}
            showSearch={showSearch !== false}
            tabVariant={resolvedTabVariant}
            themeMode={resolvedThemeMode}
          />
        </div>

        <div data-department-profiles-footer-actions="true">
          <BlockFooterActions actions={footerActions} alignment="center" />
        </div>
      </div>
    </section>
  )
}
