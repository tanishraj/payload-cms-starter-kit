import { Download, FileText } from 'lucide-react'

import { BlockFooterActions } from '@/blocks/shared/BlockFooterActions'
import { resolveBlockAppearanceClasses } from '@/blocks/shared/blockAppearance'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'
import {
  contentIntroClasses,
  contentSectionDescriptionClasses,
  contentSectionHeadingClasses,
} from '@/blocks/shared/contentStyles'
import { ContentActions } from '@/components/ContentActions'
import { SectionEyebrow } from '@/components/SectionEyebrow'
import { Button, buttonVariants } from '@/components/ui/button'
import { resolveCmsActions, type CmsActionVariant } from '@/lib/cmsLinks'
import { getMediaAbsoluteUrl } from '@/lib/media'
import { cn } from '@/lib/utils'

import { FeeStructureClient } from './FeeStructureClient'
import { normalizeFeeCategories } from './normalizeFeeStructure'
import type { FeeStructureBlockLike, FeeStructureDownloadButtonVariant } from './types'

const downloadButtonVariants = new Set<CmsActionVariant>([
  'default',
  'primary',
  'secondary',
  'outline',
  'white',
  'whiteOutline',
])

const resolveDownloadButtonVariant = (
  value?: FeeStructureDownloadButtonVariant | null,
): FeeStructureDownloadButtonVariant =>
  downloadButtonVariants.has(value as CmsActionVariant)
    ? (value as FeeStructureDownloadButtonVariant)
    : 'outline'

export function FeeStructureBlockComponent({
  academicSession,
  accentTitle,
  actions,
  appearance,
  contentAlignment = 'left',
  description,
  downloadActionMode = 'button',
  downloadAppearance,
  downloadButtonVariant = 'outline',
  downloadLabel = 'Download Fee Structure',
  eyebrow,
  feeCategories,
  feeDocument,
  footerActions,
  programmeName,
  size = 'default',
  tabStyle = 'underline',
  tabWidth = 'content',
  title,
}: FeeStructureBlockLike) {
  const resolvedProgramme = programmeName?.trim()
  const resolvedSession = academicSession?.trim()
  const categories = normalizeFeeCategories(feeCategories)

  if (!resolvedProgramme || !resolvedSession || categories.length === 0) return null

  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const alignment = contentAlignment === 'center' ? 'center' : 'left'
  const resolvedSize =
    size === 'none' || size === 'compact' || size === 'comfortable' ? size : 'default'
  const resolvedActions = resolveCmsActions(actions)
  const resolvedEyebrow = eyebrow?.trim()
  const resolvedTitle = title?.trim()
  const resolvedAccentTitle = accentTitle?.trim()
  const resolvedDescription = description?.trim()
  const fileURL = getMediaAbsoluteUrl(feeDocument)
  const fileLabel = downloadLabel?.trim() || 'Download Fee Structure'
  const resolvedDownloadMode = downloadActionMode === 'link' ? 'link' : 'button'
  const resolvedDownloadVariant = resolveDownloadButtonVariant(downloadButtonVariant)
  const downloadAppearanceClasses = resolveBlockAppearanceClasses(downloadAppearance)
  const downloadSurface =
    downloadAppearanceClasses.background === 'none'
      ? appearanceClasses.surface
      : downloadAppearanceClasses.surface
  const hasHeader = Boolean(
    resolvedEyebrow || resolvedTitle || resolvedDescription || resolvedActions.length,
  )

  return (
    <section
      className={cn(regularBlockMobilePaddingClasses[resolvedSize], appearanceClasses.className)}
      data-content-alignment={alignment}
      data-fee-structure="true"
    >
      <div className={cn(regularBlockContainerClasses, 'flex flex-col gap-8 md:gap-10')}>
        {hasHeader ? (
          <div
            className={cn(
              contentIntroClasses,
              alignment === 'center' ? 'mx-auto items-center text-center' : 'items-start text-left',
            )}
            data-content-alignment={alignment}
          >
            {resolvedEyebrow ? (
              <SectionEyebrow surface={appearanceClasses.background}>
                {resolvedEyebrow}
              </SectionEyebrow>
            ) : null}
            {resolvedTitle ? (
              <h2 className={contentSectionHeadingClasses}>
                {resolvedAccentTitle ? (
                  <>
                    <span className="block">{resolvedTitle}</span>
                    <em className="block">{resolvedAccentTitle}</em>
                  </>
                ) : (
                  resolvedTitle
                )}
              </h2>
            ) : null}
            {resolvedDescription ? (
              <p className={contentSectionDescriptionClasses}>{resolvedDescription}</p>
            ) : null}
            <ContentActions actions={resolvedActions} alignment={alignment} />
          </div>
        ) : null}

        <dl
          className={cn(
            'flex w-full max-w-3xl flex-wrap gap-x-8 gap-y-3 border-y border-current/15 py-4',
            alignment === 'center' ? 'mx-auto justify-center text-center' : 'self-start',
          )}
          data-fee-context="true"
        >
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-current/60">
              Programme
            </dt>
            <dd className="mt-1 font-semibold">{resolvedProgramme}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-current/60">
              Academic Session
            </dt>
            <dd className="mt-1 font-semibold tabular-nums">{resolvedSession}</dd>
          </div>
        </dl>

        <FeeStructureClient
          categories={categories}
          sectionBackground={appearanceClasses.background}
          tabStyle={tabStyle}
          tabWidth={tabWidth}
        />

        {fileURL ? (
          <div
            className={cn(
              'flex flex-col gap-4 rounded-[var(--radius)] border border-current/15 p-5 sm:flex-row sm:items-center sm:justify-between',
              downloadAppearanceClasses.className,
            )}
            data-fee-document="true"
            data-fee-download-background={downloadAppearanceClasses.background}
          >
            <div className="flex items-center gap-3">
              <FileText aria-hidden="true" className="size-5" />
              <p className="font-semibold">Official fee structure</p>
            </div>
            {resolvedDownloadMode === 'link' ? (
              <a
                className={cn(
                  buttonVariants({ variant: 'link' }),
                  'group/button h-auto gap-2 px-0 py-0 text-sm font-semibold text-current no-underline hover:text-current/80 hover:no-underline',
                )}
                data-fee-download-mode="link"
                download
                href={fileURL}
              >
                <span className="underline decoration-current decoration-2 underline-offset-4">
                  {fileLabel}
                </span>
                <Download aria-hidden="true" data-icon="inline-end" />
              </a>
            ) : (
              <Button
                asChild
                className={cn(
                  downloadSurface === 'brand' &&
                    resolvedDownloadVariant === 'outline' &&
                    'border-current/70 text-current hover:border-current hover:bg-current/10',
                )}
                variant={resolvedDownloadVariant}
              >
                <a data-fee-download-mode="button" download href={fileURL}>
                  <Download aria-hidden="true" data-icon="inline-start" />
                  {fileLabel}
                </a>
              </Button>
            )}
          </div>
        ) : null}

        <BlockFooterActions actions={footerActions} alignment={alignment} className="mt-0" />
      </div>
    </section>
  )
}
