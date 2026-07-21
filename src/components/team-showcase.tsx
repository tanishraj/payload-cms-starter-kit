'use client'

import { motion } from 'framer-motion'
import React, { memo, useState, type ReactNode } from 'react'

import {
  resolveBlockAppearanceClasses,
  type BlockAppearance,
} from '@/blocks/shared/blockAppearance'
import { cn } from '@/lib/utils'
import {
  regularBlockContainerClasses,
  regularBlockMobilePaddingClasses,
} from '@/blocks/shared/blockSpacing'

type TeamShowcaseAlignment = 'left' | 'center' | 'right'
type TeamShowcaseSize = 'compact' | 'default' | 'comfortable'

interface TeamShowcaseMember {
  image: string
  name: string
  role: string
  description: string
}

interface TeamShowcaseMemberCardProps {
  member: TeamShowcaseMember
  highlighted?: boolean
}

const TeamShowcaseMemberCard = memo(
  ({ member, highlighted = false }: TeamShowcaseMemberCardProps) => {
    return (
      <div
        className={cn('flex flex-col gap-4 px-2 md:px-5 md:pt-8', highlighted && 'md:py-0 md:pb-4')}
      >
        <div
          className={cn(
            'flex flex-col gap-2 pt-4 md:flex-row md:items-center',
            !highlighted && 'border-b pb-4 md:border-b-2',
          )}
        >
          <img
            src={member.image}
            alt={`${member.name} Profile Picture`}
            className="size-full rounded border object-cover md:size-12"
          />

          <div className="flex flex-col gap-1 tracking-tight">
            <p className="line-clamp-1">{member.name}</p>
            <p className="line-clamp-1 text-sm text-muted-foreground">{member.role}</p>
          </div>
        </div>
        {highlighted && (
          <>
            <span className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500" />
            <p className="line-clamp-2 text-xs">{member.description}</p>
          </>
        )}
      </div>
    )
  },
)
TeamShowcaseMemberCard.displayName = 'TeamShowcaseMemberCard'

interface TeamShowcaseProps {
  appearance?: BlockAppearance | null
  className?: string
  contentAlignment?: TeamShowcaseAlignment
  actions?: ReactNode
  description?: string
  heading?: string
  members?: TeamShowcaseMember[]
  showHeaderDivider?: boolean
  size?: TeamShowcaseSize
}

const contentAlignmentClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const

const sectionGapClasses = {
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const

const sectionGapWithoutDividerClasses = {
  compact: 'gap-8',
  default: 'gap-10',
  comfortable: 'gap-12',
} as const

const TeamShowcase = ({
  appearance,
  className,
  actions,
  contentAlignment = 'left',
  showHeaderDivider = true,
  description,
  heading,
  members = [],
  size = 'default',
}: TeamShowcaseProps) => {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null)
  const appearanceClasses = resolveBlockAppearanceClasses(appearance)
  const resolvedAlignment = contentAlignment ?? 'left'
  const resolvedSize = size ?? 'default'
  const resolvedDescription = description?.trim()

  if (!members.length) {
    return null
  }

  return (
    <section
      className={cn(
        regularBlockMobilePaddingClasses[resolvedSize],
        appearanceClasses.className,
        className,
      )}
    >
      <div className={cn(regularBlockContainerClasses, contentAlignmentClasses[resolvedAlignment])}>
        <div
          className={cn(
            'flex flex-col',
            showHeaderDivider
              ? sectionGapClasses[resolvedSize]
              : sectionGapWithoutDividerClasses[resolvedSize],
          )}
        >
          <div
            className={cn('flex flex-col gap-4', showHeaderDivider ? 'border-b-2 pb-6' : 'pb-3')}
          >
            {heading?.trim() ? (
              <h2 className="text-3xl font-semibold tracking-tight text-balance text-current sm:text-4xl">
                {heading.trim()}
              </h2>
            ) : null}
            {resolvedDescription ? (
              <p className="text-base leading-7 text-balance text-current/70">
                {resolvedDescription}
              </p>
            ) : null}
            {actions}
          </div>
          <ul
            onMouseLeave={() => setHoveredMember(null)}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {members.map((member, index) => {
              return (
                <li
                  key={`team-showcase-member-${index}`}
                  onMouseEnter={() => setHoveredMember(index)}
                  className="relative"
                >
                  <TeamShowcaseMemberCard member={member} />

                  {hoveredMember === index && (
                    <motion.div
                      layoutId="team-showcase-member-card"
                      transition={{
                        layout: {
                          duration: 0.2,
                          type: 'spring',
                          bounce: 0.1,
                        },
                      }}
                      className="pointer-events-none absolute inset-0 z-10 hidden h-max rounded-2xl bg-background shadow-lg md:block dark:border"
                    >
                      <TeamShowcaseMemberCard member={member} highlighted />
                    </motion.div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

export { TeamShowcase }
export type { TeamShowcaseAlignment, TeamShowcaseSize, TeamShowcaseMember }
