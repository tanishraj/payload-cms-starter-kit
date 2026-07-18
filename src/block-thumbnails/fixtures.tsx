import type { ReactNode } from 'react'

import { AnnouncementBlockComponent } from '@/blocks/Announcement/Component'
import { FeatureMatrixBlockComponent } from '@/blocks/FeatureMatrix/Component'
import { Footer56BlockComponent } from '@/blocks/Footer56/Component'
import { GalleryShowcaseBlockComponent } from '@/blocks/GalleryShowcase/Component'
import { HeaderNavbar12BlockComponent } from '@/blocks/HeaderNavbar12/Component'
import { HeroBannerBlockComponent } from '@/blocks/HeroBanner/Component'
import { ProfileCarouselBlockComponent } from '@/blocks/ProfileCarousel/Component'
import { QaAccordionBlockComponent } from '@/blocks/QaAccordion/Component'
import { RatingSpotlightBlockComponent } from '@/blocks/RatingSpotlight/Component'
import { ReviewSubmissionBlockComponent } from '@/blocks/ReviewSubmission/Component'
import { FeatureSpotlightBlockComponent } from '@/blocks/FeatureSpotlight/Component'
import { StatsStripBlockComponent } from '@/blocks/StatsStrip/Component'
import { System404BlockComponent } from '@/blocks/System404/Component'
import { SystemComingSoonBlockComponent } from '@/blocks/SystemComingSoon/Component'
import { SystemMaintenanceBlockComponent } from '@/blocks/SystemMaintenance/Component'
import type { Form } from '@/payload-types'

import type { BlockThumbnailSlug } from './definitions'

export const blockThumbnailAssetPaths = [
  '/block-thumbnail-assets/editorial-landscape.svg',
  '/block-thumbnail-assets/collaboration.svg',
  '/block-thumbnail-assets/portrait.svg',
  '/block-thumbnail-assets/brand-mark.svg',
] as const

const [editorialLandscape, collaboration, portrait, brandMark] = blockThumbnailAssetPaths

const richTextParagraph = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

const qaAccordionFixtureItems = [
  {
    question: 'How do I choose the right program?',
    answer: richTextParagraph(
      'Start with your goals, preferred learning style, and the kind of support you value most.',
    ),
  },
  {
    question: 'Can I visit before I apply?',
    answer: richTextParagraph(
      'Yes. Guided visits and open events are available throughout the year.',
    ),
  },
  {
    question: 'What support is available?',
    answer: richTextParagraph(
      'Advising, learning resources, and community support are available from your first day.',
    ),
  },
]

const reviewFormFixture: Pick<
  Form,
  'fields' | 'slug' | 'submitButtonLabel' | 'successMessage' | 'title'
> = {
  fields: [
    {
      label: 'Rating',
      name: 'rating',
      options: [
        { label: 'Poor', value: '1' },
        { label: 'Fair', value: '2' },
        { label: 'Good', value: '3' },
        { label: 'Very Good', value: '4' },
        { label: 'Excellent', value: '5' },
      ],
      required: true,
      type: 'select',
    },
    {
      label: 'What is it about?',
      name: 'subjectLabel',
      options: [
        { label: 'Programs', value: 'programs' },
        { label: 'Campus', value: 'campus' },
        { label: 'Support', value: 'support' },
      ],
      required: false,
      type: 'select',
    },
    {
      label: 'Your name',
      name: 'reviewerName',
      placeholder: 'Your name',
      required: true,
      type: 'text',
    },
    {
      label: 'Email',
      name: 'reviewerEmail',
      placeholder: 'you@example.com',
      required: false,
      type: 'email',
    },
    {
      label: 'Your review',
      name: 'reviewBody',
      placeholder: 'Tell us what stood out.',
      required: true,
      type: 'textarea',
    },
  ],
  slug: 'thumbnail-review-form',
  submitButtonLabel: 'Submit review',
  successMessage: 'Thank you for sharing your experience.',
  title: 'Review form',
}

const headerMenuFixture = [
  {
    label: 'Programs',
    linkType: 'custom' as const,
    url: '/programs',
    children: [
      { label: 'Overview', linkType: 'custom' as const, url: '/programs' },
      { label: 'Learning paths', linkType: 'custom' as const, url: '/programs/paths' },
    ],
  },
  { label: 'Experience', linkType: 'custom' as const, url: '/experience' },
  { label: 'Community', linkType: 'custom' as const, url: '/community' },
]

const footerGroupsFixture = [
  {
    title: 'Explore',
    links: [
      { label: 'Programs', linkType: 'custom' as const, url: '/programs' },
      { label: 'Experience', linkType: 'custom' as const, url: '/experience' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Visit', linkType: 'custom' as const, url: '/visit' },
      { label: 'Contact', linkType: 'custom' as const, url: '/contact' },
    ],
  },
]

export const blockThumbnailFixtures = {
  announcement: (
    <AnnouncementBlockComponent
      appearance={{ background: 'accent', border: 'bottom' }}
      displayMode="vertical"
      items={[
        {
          description: 'Explore the latest programs and resources.',
          title: 'New',
        },
      ]}
      label="Latest"
    />
  ),
  qaAccordion: (
    <QaAccordionBlockComponent
      defaultOpenFirst
      description="Clear answers to common questions about programs, visits, and support."
      heading="Frequently asked questions"
      items={qaAccordionFixtureItems}
      layoutMode="fiftyFifty"
      sideActionMode="link"
      sideColumn={{
        contact: {
          actions: [
            {
              label: 'Contact our team',
              linkType: 'custom',
              url: '/contact',
            },
          ],
          description: 'Our team can help you find the right next step.',
          title: 'Still have questions?',
        },
        profile: {
          image: { alt: 'Program advisor', url: portrait },
          name: 'Alex Morgan',
          title: 'Program advisor',
        },
      }}
      size="compact"
    />
  ),
  featureMatrix: (
    <FeatureMatrixBlockComponent
      actionMode="link"
      actions={[
        {
          label: 'Explore our facilities',
          linkType: 'custom',
          url: '/facilities',
        },
      ]}
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      contentAlignment="center"
      description="Four connected environments support focused study, practical work, collaboration, and community."
      eyebrow="Facilities"
      features={[
        {
          description: 'Flexible spaces for independent and collaborative learning.',
          image: { alt: 'Modern learning environment', url: editorialLandscape },
          title: 'Learning spaces',
        },
        {
          description: 'Hands-on settings designed for practical exploration.',
          image: { alt: 'Collaborative practical environment', url: collaboration },
          title: 'Practical labs',
        },
        {
          description: 'Helpful people and resources at every stage.',
          image: { alt: 'Student support advisor', url: portrait },
          title: 'Student support',
        },
        {
          description: 'Shared programs that connect ideas with the wider community.',
          image: { alt: 'Community learning environment', url: editorialLandscape },
          title: 'Community programs',
        },
      ]}
      size="compact"
      title="Designed around the way you learn"
    />
  ),
  profileCarousel: (
    <ProfileCarouselBlockComponent
      actionMode="link"
      actions={[
        {
          label: 'Meet the full team',
          linkType: 'custom',
          url: '/team',
        },
      ]}
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      cardVariant="overlay"
      contentAlignment="left"
      description="A multidisciplinary team brings practical experience, thoughtful guidance, and shared purpose to every program."
      eyebrow="Our people"
      overlayAlignment="left"
      profiles={[
        {
          image: { alt: 'Program director', url: portrait },
          name: 'Alex Morgan',
          role: 'Program Director',
        },
        {
          image: { alt: 'Student experience lead', url: collaboration },
          name: 'Jordan Lee',
          role: 'Student Experience Lead',
        },
        {
          image: { alt: 'Faculty advisor', url: editorialLandscape },
          name: 'Sam Rivera',
          role: 'Faculty Advisor',
        },
        {
          image: { alt: 'Research coordinator', url: portrait },
          imagePosition: 'top',
          name: 'Taylor Chen',
          role: 'Research Coordinator',
        },
        {
          image: { alt: 'Community partner', url: collaboration },
          imagePosition: 'right',
          name: 'Jamie Patel',
          role: 'Community Partner',
        },
      ]}
      size="compact"
      title="The people behind our work"
    />
  ),
  galleryShowcase: (
    <GalleryShowcaseBlockComponent
      actionMode="link"
      actions={[
        {
          label: 'Explore the gallery',
          linkType: 'custom',
          url: '/gallery',
        },
      ]}
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      contentAlignment="center"
      description="Five perspectives capture the spaces, people, and shared moments that shape the experience."
      eyebrow="Inside our community"
      images={[
        {
          image: { alt: 'Editorial landscape', id: 1, url: editorialLandscape },
        },
        {
          image: { alt: 'Collaborative environment', id: 2, url: collaboration },
          imagePosition: 'top',
        },
        {
          image: { alt: 'Community portrait', id: 3, url: portrait },
          imagePosition: 'center',
        },
        {
          image: { alt: 'Learning environment', id: 4, url: editorialLandscape },
          imagePosition: 'right',
        },
        {
          image: { alt: 'Shared campus moment', id: 5, url: collaboration },
          imagePosition: 'bottom',
        },
      ]}
      size="compact"
      title="A closer look at life here"
    />
  ),
  footer56: (
    <Footer56BlockComponent
      appearance={{ background: 'muted', border: 'top' }}
      blockType="footer56"
      copyrightText="© 2026 Northstar"
      description="Thoughtful programs, practical resources, and a community built around progress."
      linkGroups={footerGroupsFixture}
      logoMode="siteDefault"
      siteAddress="100 Market Street"
      siteEmail="hello@example.com"
      siteLogo={{ alt: 'Northstar', url: brandMark }}
      siteName="Northstar"
      sitePhone="+1 555 0100"
    />
  ),
  headerNavbar12: (
    <HeaderNavbar12BlockComponent
      appearance={{ background: 'none', border: 'bottom', textColor: 'auto' }}
      blockType="headerNavbar12"
      ctaButtons={[
        {
          label: 'Get started',
          linkType: 'custom',
          url: '/start',
          variant: 'default',
        },
      ]}
      logoMode="siteDefault"
      menuItems={headerMenuFixture}
      siteLogo={{ alt: 'Northstar', url: brandMark }}
      siteName="Northstar"
      size="compact"
    />
  ),
  heroBanner: (
    <HeroBannerBlockComponent
      backgroundImage={{ alt: 'Abstract architectural landscape', url: editorialLandscape }}
      buttons={[
        {
          label: 'Explore programs',
          linkType: 'custom',
          url: '/programs',
          variant: 'default',
        },
        {
          label: 'Plan a visit',
          linkType: 'custom',
          url: '/visit',
          variant: 'outline',
        },
      ]}
      description="Practical learning, thoughtful teaching, and spaces designed for discovery."
      eyebrow="Learning without limits"
      height="compact"
      horizontalAlignment="left"
      overlayStyle="light"
      themeMode="auto"
      title="A place to learn, connect, and grow."
    />
  ),
  reviewSubmission: (
    <ReviewSubmissionBlockComponent
      description="Share what stood out and help others understand the experience."
      eyebrow="Your perspective matters"
      form={reviewFormFixture}
      size="compact"
      title="Tell us about your experience."
    />
  ),
  ratingSpotlight: (
    <RatingSpotlightBlockComponent
      actionMode="button"
      actions={[
        {
          label: 'Leave a review',
          linkType: 'custom',
          url: '/reviews/new',
          variant: 'default',
        },
      ]}
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      description="Students, alumni, parents, and campus visitors — your rating and review help us keep sharpening what works."
      eyebrow="Feedback"
      ratingData={{ dataMode: 'manual', manualRating: 4.8, manualReviewCount: 1240 }}
      size="compact"
      title="Tell us how we're doing."
    />
  ),
  featureSpotlight: (
    <FeatureSpotlightBlockComponent
      actionMode="link"
      actions={[
        {
          label: 'Explore the experience',
          linkType: 'custom',
          url: '/experience',
        },
      ]}
      description="Flexible spaces and collaborative programs help ideas move from discussion to practice."
      eyebrow="Built for collaboration"
      image={{ alt: 'Abstract collaboration scene', url: collaboration }}
      layoutMode="split"
      mediaFillMode="containedFill"
      mediaPosition="left"
      size="compact"
      title="Designed around the way people learn."
    />
  ),
  statsStrip: (
    <StatsStripBlockComponent
      animationEnabled={false}
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      items={[
        { label: 'Programs', suffix: '+', value: 48 },
        { label: 'Positive outcomes', suffix: '%', value: 92 },
        { label: 'Digital access', suffix: '/7', value: 24 },
        { label: 'Community partners', value: 18 },
      ]}
    />
  ),
  system404: (
    <System404BlockComponent
      appearance={{ background: 'muted', border: 'none' }}
      badge="404"
      blockType="system404"
      description="The page may have moved or the address may be incorrect."
      heading="We couldn't find that page"
    />
  ),
  systemComingSoon: (
    <SystemComingSoonBlockComponent
      appearance={{ background: 'accent', border: 'none' }}
      badge="Coming soon"
      blockType="systemComingSoon"
      description="We are preparing a new experience."
      heading="Something thoughtful is taking shape"
    />
  ),
  systemMaintenance: (
    <SystemMaintenanceBlockComponent
      appearance={{ background: 'secondary', border: 'none' }}
      badge="Maintenance"
      blockType="systemMaintenance"
      description="Scheduled improvements are underway."
      heading="We'll be back shortly"
    />
  ),
} satisfies Record<BlockThumbnailSlug, ReactNode>

export function getBlockThumbnailFixture(slug: BlockThumbnailSlug): ReactNode {
  const fixture = blockThumbnailFixtures[slug]

  if (!fixture) {
    throw new Error(`Unknown block thumbnail fixture: ${slug}`)
  }

  return fixture
}
