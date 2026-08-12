import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AwardsListBlockComponent } from '@/blocks/AwardsList/Component'
import { BentoGridBlockComponent } from '@/blocks/BentoGrid/Component'
import { ContentHighlightsBlockComponent } from '@/blocks/ContentHighlights/Component'
import { DownloadListBlockComponent } from '@/blocks/DownloadList/Component'
import { FeatureMatrixBlockComponent } from '@/blocks/FeatureMatrix/Component'
import { IconGridBlockComponent } from '@/blocks/IconGrid/Component'
import { MediaCarouselBlockComponent } from '@/blocks/MediaCarousel/Component'
import { NumberedStepsBlockComponent } from '@/blocks/NumberedSteps/Component'
import { ProfileCarouselBlockComponent } from '@/blocks/ProfileCarousel/Component'
import { ProgramGridBlockComponent } from '@/blocks/ProgramGrid/Component'
import { ProgramMatrixBlockComponent } from '@/blocks/ProgramMatrix/Component'
import { TeamShowcaseBlockComponent } from '@/blocks/TeamShowcase/Component'
import { TestimonialGridBlockComponent } from '@/blocks/TestimonialGrid/Component'

const media = {
  id: 1,
  alt: 'Campus',
  url: '/campus.jpg',
}

const expectPrimarySurface = (html: string) => {
  expect(html).toContain('data-card-background="primary"')
  expect(html).toContain('bg-primary text-primary-foreground')
}

const expectInheritedDefaultSurface = (html: string) => {
  expect(html).toContain('data-card-background="default"')
  expect(html).toContain('bg-transparent text-current')
  expect(html).not.toContain('bg-card text-card-foreground')
}

describe('semantic card surface rendering', () => {
  it('renders semantic surfaces in the always-card blocks', () => {
    const markups = [
      renderToStaticMarkup(
        <ProgramGridBlockComponent
          programs={[{ cardBackground: 'primary', title: 'MBBS' }]}
          title="Programmes"
        />,
      ),
      renderToStaticMarkup(
        <BentoGridBlockComponent
          items={[{ accentColor: 'primary', title: 'Clinical learning' }, { title: 'Research' }]}
          title="Highlights"
        />,
      ),
      renderToStaticMarkup(
        <FeatureMatrixBlockComponent
          features={[{ cardBackground: 'primary', image: media, title: 'Hospital training' }]}
          title="Features"
        />,
      ),
      renderToStaticMarkup(
        <ProfileCarouselBlockComponent
          profiles={[{ cardBackground: 'primary', image: media, name: 'Dr Example' }]}
          title="Faculty"
        />,
      ),
      renderToStaticMarkup(
        <TeamShowcaseBlockComponent
          members={[{ cardBackground: 'primary', image: media, name: 'Dr Example' }]}
          title="Faculty"
        />,
      ),
      renderToStaticMarkup(
        <MediaCarouselBlockComponent
          items={[{ cardBackground: 'primary', media, title: 'Campus life' }]}
          title="Gallery"
        />,
      ),
    ]

    for (const html of markups) expectPrimarySurface(html)
  })

  it('themes Icon Grid cards without turning minimal items into cards', () => {
    const card = renderToStaticMarkup(
      <IconGridBlockComponent
        items={[{ cardBackground: 'primary', icon: 'Hospital', title: 'Hospital training' }]}
        title="Why choose us"
        variant="card"
      />,
    )
    const minimal = renderToStaticMarkup(
      <IconGridBlockComponent
        items={[{ cardBackground: 'primary', icon: 'Hospital', title: 'Hospital training' }]}
        title="Why choose us"
        variant="minimal"
      />,
    )

    expectPrimarySurface(card)
    expect(minimal).not.toContain('data-card-background')
  })

  it('themes Content Highlights only in the numbered-card presentation', () => {
    const numbered = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        items={[{ cardBackground: 'primary', title: 'Apply' }]}
        layout="numberedSteps"
        title="Admissions"
      />,
    )
    const simple = renderToStaticMarkup(
      <ContentHighlightsBlockComponent
        items={[{ cardBackground: 'primary', title: 'Apply' }]}
        layout="simpleGrid"
        title="Admissions"
      />,
    )

    expectPrimarySurface(numbered)
    expect(simple).not.toContain('data-card-background')
  })

  it('themes testimonial and award card variants without changing their row variants', () => {
    const testimonialCard = renderToStaticMarkup(
      <TestimonialGridBlockComponent
        testimonials={[{ cardBackground: 'primary', name: 'Student', quote: 'Excellent' }]}
        variant="grid"
      />,
    )
    const testimonialList = renderToStaticMarkup(
      <TestimonialGridBlockComponent
        testimonials={[{ cardBackground: 'primary', name: 'Student', quote: 'Excellent' }]}
        variant="list"
      />,
    )
    const awardCard = renderToStaticMarkup(
      <AwardsListBlockComponent
        awards={[{ cardBackground: 'primary', title: 'Accredited' }]}
        variant="cards"
      />,
    )
    const awardRows = renderToStaticMarkup(
      <AwardsListBlockComponent
        awards={[{ cardBackground: 'primary', title: 'Accredited' }]}
        variant="rows"
      />,
    )

    expectPrimarySurface(testimonialCard)
    expectPrimarySurface(awardCard)
    expect(testimonialList).not.toContain('data-card-background')
    expect(awardRows).not.toContain('data-card-background')
  })

  it('themes download and numbered-step cards without changing list or connector layouts', () => {
    const downloadCards = renderToStaticMarkup(
      <DownloadListBlockComponent
        displayMode="cards"
        downloads={[
          {
            cardBackground: 'primary',
            externalUrl: 'https://example.com/form.pdf',
            title: 'Application Form',
          },
        ]}
      />,
    )
    const downloadList = renderToStaticMarkup(
      <DownloadListBlockComponent
        displayMode="list"
        downloads={[
          {
            cardBackground: 'primary',
            externalUrl: 'https://example.com/form.pdf',
            title: 'Application Form',
          },
        ]}
      />,
    )
    const cardSteps = renderToStaticMarkup(
      <NumberedStepsBlockComponent
        steps={[{ cardBackground: 'primary', title: 'Register' }, { title: 'Apply' }]}
        title="Admissions"
        variant="cards"
      />,
    )
    const verticalSteps = renderToStaticMarkup(
      <NumberedStepsBlockComponent
        steps={[{ cardBackground: 'primary', title: 'Register' }, { title: 'Apply' }]}
        title="Admissions"
        variant="vertical"
      />,
    )

    expectPrimarySurface(downloadCards)
    expectPrimarySurface(cardSteps)
    expect(downloadList).not.toContain('data-card-background')
    expect(verticalSteps).not.toContain('data-card-background')
  })

  it('inherits a primary section in server-rendered default cards', () => {
    const markups = [
      renderToStaticMarkup(
        <IconGridBlockComponent
          appearance={{ background: 'primary' }}
          items={[{ icon: 'Hospital', title: 'Hospital training' }]}
          title="Why choose us"
          variant="card"
        />,
      ),
      renderToStaticMarkup(
        <FeatureMatrixBlockComponent
          appearance={{ background: 'primary' }}
          features={[{ image: media, title: 'Hospital training' }]}
          title="Features"
        />,
      ),
      renderToStaticMarkup(
        <ProgramMatrixBlockComponent
          appearance={{ background: 'primary' }}
          items={[{ title: 'MBBS' }]}
          title="Programmes"
        />,
      ),
      renderToStaticMarkup(
        <TestimonialGridBlockComponent
          appearance={{ background: 'primary' }}
          testimonials={[{ name: 'Student', quote: 'Excellent' }]}
          variant="grid"
        />,
      ),
    ]

    for (const html of markups) {
      expectInheritedDefaultSurface(html)
      expect(html).toContain('border-current/15')
    }
  })

  it('inherits a primary section across client-rendered default cards', () => {
    const borderedMarkups = [
      renderToStaticMarkup(
        <DownloadListBlockComponent
          appearance={{ background: 'primary' }}
          displayMode="cards"
          downloads={[{ externalUrl: 'https://example.com/form.pdf', title: 'Application Form' }]}
        />,
      ),
      renderToStaticMarkup(
        <MediaCarouselBlockComponent
          appearance={{ background: 'primary' }}
          items={[{ media, title: 'Campus life' }]}
          title="Gallery"
        />,
      ),
      renderToStaticMarkup(
        <ProgramGridBlockComponent
          appearance={{ background: 'primary' }}
          programs={[{ title: 'MBBS' }]}
          title="Programmes"
        />,
      ),
    ]

    for (const html of borderedMarkups) {
      expectInheritedDefaultSurface(html)
      expect(html).toContain('border-current/15')
    }

    const borderlessProfile = renderToStaticMarkup(
      <ProfileCarouselBlockComponent
        appearance={{ background: 'primary' }}
        profiles={[{ image: media, name: 'Dr Example' }]}
        title="Faculty"
      />,
    )

    expectInheritedDefaultSurface(borderlessProfile)
    expect(borderlessProfile).not.toContain('border-current/15')
  })
})
