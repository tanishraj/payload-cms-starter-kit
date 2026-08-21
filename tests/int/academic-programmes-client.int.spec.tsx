// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { AcademicProgrammesClient } from '@/blocks/AcademicProgrammes/AcademicProgrammesClient'

afterEach(() => {
  cleanup()
})

const programmes = [
  {
    ctaLabel: 'Explore programme',
    eyebrow: 'Undergraduate',
    id: 'mbbs',
    openInNewTab: false,
    title: 'MBBS',
  },
  {
    ctaLabel: 'Explore programme',
    eyebrow: 'undergraduate',
    id: 'bsc',
    openInNewTab: false,
    title: 'BSc Medical Sciences',
  },
  {
    ctaLabel: 'Explore programme',
    eyebrow: 'Postgraduate',
    id: 'md',
    openInNewTab: false,
    title: 'MD General Medicine',
  },
  {
    ctaLabel: 'Explore programme',
    id: 'fellowship',
    openInNewTab: false,
    title: 'Clinical Fellowship',
  },
]

describe('Academic Programmes client presentation', () => {
  it('deduplicates categories case-insensitively and filters programmes', () => {
    render(
      <AcademicProgrammesClient
        background="none"
        columns="3"
        contentAlignment="left"
        metadataPosition="flow"
        programmes={programmes}
        showFilter
        viewMode="grid"
      />,
    )

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'All',
      'Undergraduate',
      'Postgraduate',
    ])

    fireEvent.click(screen.getByRole('tab', { name: 'Postgraduate' }))

    expect(screen.getByRole('heading', { name: 'MD General Medicine' })).not.toBeNull()
    expect(screen.queryByRole('heading', { name: 'MBBS' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Clinical Fellowship' })).toBeNull()
  })

  it('omits a redundant filter when fewer than two categories exist', () => {
    render(
      <AcademicProgrammesClient
        background="none"
        columns="2"
        contentAlignment="center"
        metadataPosition="flow"
        programmes={[
          {
            ctaLabel: 'Explore programme',
            eyebrow: 'Undergraduate',
            id: 'mbbs',
            openInNewTab: false,
            title: 'MBBS',
          },
        ]}
        showFilter
        viewMode="grid"
      />,
    )

    expect(screen.queryByRole('tablist')).toBeNull()
    expect(screen.getByRole('heading', { name: 'MBBS' })).not.toBeNull()
  })

  it('supports keyboard navigation across filter tabs', () => {
    render(
      <AcademicProgrammesClient
        background="none"
        columns="3"
        contentAlignment="right"
        metadataPosition="flow"
        programmes={programmes}
        showFilter
        viewMode="grid"
      />,
    )

    const allTab = screen.getByRole('tab', { name: 'All' })
    allTab.focus()
    fireEvent.keyDown(allTab, { key: 'End' })

    expect(screen.getByRole('tab', { name: 'Postgraduate' })).toBe(document.activeElement)
    expect(screen.getByRole('heading', { name: 'MD General Medicine' })).not.toBeNull()
    expect(screen.queryByRole('heading', { name: 'MBBS' })).toBeNull()
  })

  it('omits a labelled metadata item when its value is empty', () => {
    const { container } = render(
      <AcademicProgrammesClient
        background="none"
        columns="2"
        contentAlignment="left"
        metadataPosition="bottom"
        programmes={[
          {
            ctaLabel: 'Explore programme',
            durationLabel: 'Programme duration',
            id: 'mbbs',
            intake: 'Subject to approval',
            intakeLabel: 'Availability',
            openInNewTab: false,
            title: 'MBBS',
          },
        ]}
        showFilter={false}
        viewMode="grid"
      />,
    )

    expect(screen.queryByText('Programme duration')).toBeNull()
    expect(screen.getByText('Availability')).not.toBeNull()
    expect(screen.getByText('Subject to approval')).not.toBeNull()
    expect(
      container.querySelector('[data-academic-programme-content="bottom-metadata"]'),
    ).not.toBeNull()
  })

  it('bottom-aligns an action when a programme has no metadata', () => {
    const { container } = render(
      <AcademicProgrammesClient
        background="none"
        columns="2"
        contentAlignment="left"
        metadataPosition="bottom"
        programmes={[
          {
            ctaLabel: 'Explore MBBS',
            href: '/programmes/mbbs',
            id: 'mbbs',
            openInNewTab: false,
            title: 'MBBS',
          },
        ]}
        showFilter={false}
        viewMode="grid"
      />,
    )

    expect(
      container.querySelector('[data-academic-programme-bottom-content="true"]'),
    ).not.toBeNull()
    expect(container.querySelector('[data-academic-programme-content="standard"]')).not.toBeNull()
    const action = container.querySelector('[data-academic-programme-action="ruled"]')
    expect(action?.classList.contains('border-t')).toBe(true)
    expect(action?.querySelector('span')?.className).toContain(
      'flex w-full items-center justify-between',
    )
    expect(screen.getByText('Explore MBBS')).not.toBeNull()
    expect(container.querySelector('dl')).toBeNull()
  })

  it('places an inline action after the title when bottom metadata has no description', () => {
    const { container } = render(
      <AcademicProgrammesClient
        background="none"
        columns="2"
        contentAlignment="left"
        metadataPosition="bottom"
        programmes={[
          {
            ctaLabel: 'Explore MBBS',
            duration: '3 years',
            href: '/programmes/mbbs',
            id: 'mbbs',
            openInNewTab: false,
            title: 'MBBS',
          },
        ]}
        showFilter={false}
        viewMode="grid"
      />,
    )

    const html = container.innerHTML
    const action = container.querySelector('[data-academic-programme-action="inline"]')
    expect(html.indexOf('MBBS')).toBeLessThan(html.indexOf('Explore MBBS'))
    expect(html.indexOf('Explore MBBS')).toBeLessThan(html.indexOf('Duration'))
    expect(action?.classList.contains('border-t')).toBe(false)
    expect(action?.querySelector('span')?.className).toContain('inline-flex items-center gap-2')
    expect(container.querySelectorAll('a')).toHaveLength(1)
  })
})
