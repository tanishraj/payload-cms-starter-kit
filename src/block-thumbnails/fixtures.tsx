import type { ReactNode } from 'react'

import { AnnouncementBlockComponent } from '@/blocks/Announcement/Component'
import { ContentHighlightsBlockComponent } from '@/blocks/ContentHighlights/Component'
import { FeatureMatrixBlockComponent } from '@/blocks/FeatureMatrix/Component'
import { Footer56BlockComponent } from '@/blocks/Footer56/Component'
import { GalleryShowcaseBlockComponent } from '@/blocks/GalleryShowcase/Component'
import { Cta39BlockComponent } from '@/blocks/Cta39/Component'
import { HeaderNavbar12BlockComponent } from '@/blocks/HeaderNavbar12/Component'
import { HeroBannerBlockComponent } from '@/blocks/HeroBanner/Component'
import { ImageMosaicBlockComponent } from '@/blocks/ImageMosaic/Component'
import { NewsEventsHighlightsBlockPresentation } from '@/blocks/NewsEventsHighlights/Presentation'
import { ProfileCarouselBlockComponent } from '@/blocks/ProfileCarousel/Component'
import { QaAccordionBlockComponent } from '@/blocks/QaAccordion/Component'
import { RatingSpotlightBlockComponent } from '@/blocks/RatingSpotlight/Component'
import { ReviewSubmissionBlockComponent } from '@/blocks/ReviewSubmission/Component'
import { Contact33BlockComponent } from '@/blocks/Contact33/Component'
import { FeatureSpotlightBlockComponent } from '@/blocks/FeatureSpotlight/Component'
import { StatsStripBlockComponent } from '@/blocks/StatsStrip/Component'
import { TeamShowcase } from '@/components/team-showcase'
import { ReviewFeed } from '@/components/review-feed'
import { Services21BlockComponent } from '@/blocks/Services21/Component'
import { System404BlockComponent } from '@/blocks/System404/Component'
import { SystemComingSoonBlockComponent } from '@/blocks/SystemComingSoon/Component'
import { SystemMaintenanceBlockComponent } from '@/blocks/SystemMaintenance/Component'
import { Contact24 } from '@/components/contact24'
import { EventGallery } from '@/components/event-gallery'
import type { SiteOfficeLocation } from '@/lib/siteOfficesShared'
import type { Form } from '@/payload-types'

import type { BlockThumbnailSlug } from './definitions'

export const blockThumbnailAssetPaths = [
  '/block-thumbnail-assets/editorial-landscape.svg',
  '/block-thumbnail-assets/collaboration.svg',
  '/block-thumbnail-assets/portrait.svg',
  '/block-thumbnail-assets/brand-mark.svg',
  '/block-thumbnail-assets/office-map.svg',
] as const

const [editorialLandscape, collaboration, portrait, brandMark, officeMap] =
  blockThumbnailAssetPaths

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

const contactFormFixture: Pick<
  Form,
  'fields' | 'slug' | 'submitButtonLabel' | 'successMessage' | 'title'
> = {
  fields: [
    {
      label: 'Name',
      name: 'name',
      placeholder: 'Your name',
      required: true,
      type: 'text',
    },
    {
      label: 'Email',
      name: 'email',
      placeholder: 'you@example.com',
      required: true,
      type: 'email',
    },
    {
      label: 'Subject',
      name: 'subject',
      options: [
        { label: 'Programs', value: 'programs' },
        { label: 'Admissions', value: 'admissions' },
        { label: 'Partnerships', value: 'partnerships' },
      ],
      required: false,
      type: 'select',
    },
    {
      label: 'Message',
      name: 'message',
      placeholder: 'How can we help?',
      required: true,
      type: 'textarea',
    },
  ],
  slug: 'thumbnail-contact-form',
  submitButtonLabel: 'Send message',
  successMessage: 'Thanks. Our team will be in touch.',
  title: 'Contact form',
}

const contact24OfficeFixtures: SiteOfficeLocation[] = [
  {
    id: 'new-york',
    region: 'North America',
    city: 'New York',
    address: '350 Fifth Avenue, New York, NY 10118',
    phone: '+1 (212) 555-0123',
    phoneHref: 'tel:+12125550123',
    email: 'nyc@northstar.example',
    mapEmbedUrl: officeMap,
    mapUrl: 'https://maps.google.com/?q=New+York',
    mapTitle: 'Interactive map for the New York office',
    showAddressDetails: true,
  },
  {
    id: 'dubai',
    region: 'Middle East',
    city: 'Dubai',
    address: 'DIFC, Gate Building, Level 13, Dubai, UAE',
    phone: '+971 4 555 0123',
    phoneHref: 'tel:+97145550123',
    email: 'dubai@northstar.example',
    mapEmbedUrl: officeMap,
    mapUrl: 'https://maps.google.com/?q=Dubai',
    mapTitle: 'Interactive map for the Dubai office',
    showAddressDetails: true,
  },
]

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
  contentHighlights: (
    <ContentHighlightsBlockComponent
      actionMode="link"
      actions={[
        {
          label: 'Explore student life',
          linkType: 'custom',
          url: '/student-life',
        },
      ]}
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      description="Resources, communities, and opportunities designed to support every part of the student experience."
      eyebrow="Life here"
      items={[
        {
          description: 'On-campus and supported off-campus options for every stage.',
          linkType: 'custom',
          title: 'Housing',
          url: '/student-life/housing',
        },
        {
          description: 'Dedicated people and resources for physical and mental wellbeing.',
          linkType: 'none',
          title: 'Wellness',
        },
        {
          description: 'Student-led groups spanning academic, creative, and community interests.',
          linkType: 'none',
          title: 'Organizations',
        },
        {
          description: 'Recreation, team activities, and modern fitness facilities.',
          linkType: 'none',
          title: 'Athletics',
        },
        {
          description: 'Volunteer programs connect learning with meaningful community work.',
          linkType: 'none',
          title: 'Service',
        },
        {
          description: 'A welcoming community shaped by many backgrounds and perspectives.',
          linkType: 'none',
          title: 'Diversity',
        },
      ]}
      layout="highlightsGrid"
      size="compact"
      title="What students say matters"
      />
  ),
  cta39: (
    <Cta39BlockComponent
      actionMode="button"
      actions={[
        {
          label: 'Get started',
          linkType: 'custom',
          url: '/get-started',
          variant: 'default',
        },
        {
          label: 'Talk to our team',
          linkType: 'custom',
          url: '/contact',
          variant: 'outline',
        },
      ]}
      appearance={{ background: 'none', border: 'topAndBottom' }}
      description="Learn quickly, build confidently, and deliver with quality using a modern production workflow."
      size="compact"
      title="Turn goals into action with focused execution."
    />
  ),
  newsEventsHighlights: (
    <NewsEventsHighlightsBlockPresentation
      actionMode="link"
      actions={[{ label: 'View all stories', linkType: 'custom', url: '/news-events' }]}
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      description="Discover the latest stories, milestones, and opportunities from across our community."
      eyebrow="Latest"
      items={[
        {
          category: { id: 'category-1', slug: 'research', title: 'Research' },
          contentType: 'news',
          dateISO: '2026-07-18T00:00:00.000Z',
          dateLabel: 'Jul 18, 2026',
          excerpt: 'A new center brings collaborative research and practical learning together.',
          href: '/news-events/research-center',
          id: 'news-1',
          image: { alt: 'Campus landscape', position: 'center', src: editorialLandscape },
          isPastEvent: false,
          slug: 'research-center',
          title: 'New research center opens this summer',
        },
        {
          category: { id: 'category-2', slug: 'campus', title: 'Campus' },
          contentType: 'event',
          dateISO: '2026-08-12T00:00:00.000Z',
          dateLabel: 'Aug 12, 2026',
          excerpt: 'Meet faculty, explore learning spaces, and discover the programs on offer.',
          href: '/news-events/open-day',
          id: 'event-1',
          image: { alt: 'Community gathering', position: 'center', src: collaboration },
          isPastEvent: false,
          slug: 'open-day',
          title: 'Community open day returns in August',
        },
        {
          category: { id: 'category-3', slug: 'people', title: 'People' },
          contentType: 'news',
          dateISO: '2026-07-10T00:00:00.000Z',
          dateLabel: 'Jul 10, 2026',
          excerpt: 'Student-led projects are creating meaningful connections across the region.',
          href: '/news-events/community-impact',
          id: 'news-2',
          image: { alt: 'Student portrait', position: 'top', src: portrait },
          isPastEvent: false,
          slug: 'community-impact',
          title: 'Student initiatives make a community impact',
        },
      ]}
      size="compact"
      title="News & Events"
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
  eventGallery: (
    <EventGallery
      albums={[
        {
          cover: {
            alt: 'Community gathering',
            height: 900,
            id: 'event-cover-1',
            src: collaboration,
            width: 1600,
          },
          createdAt: '2026-07-25T00:00:00.000Z',
          description: 'A day of workshops, performances, and shared experiences.',
          eventDate: '2026-07-25T00:00:00.000Z',
          id: 'event-album-1',
          imageCount: 3,
          images: [
            {
              alt: 'Community gathering',
              height: 900,
              id: 'event-cover-1',
              src: collaboration,
              width: 1600,
            },
            {
              alt: 'Learning environment',
              height: 900,
              id: 'event-image-2',
              src: editorialLandscape,
              width: 1600,
            },
            {
              alt: 'Community portrait',
              height: 900,
              id: 'event-image-3',
              src: portrait,
              width: 1600,
            },
          ],
          title: 'Community Day',
        },
        {
          cover: {
            alt: 'Editorial landscape',
            height: 900,
            id: 'event-cover-2',
            src: editorialLandscape,
            width: 1600,
          },
          createdAt: '2026-06-21T00:00:00.000Z',
          eventDate: '2026-06-21T00:00:00.000Z',
          id: 'event-album-2',
          imageCount: 2,
          images: [
            {
              alt: 'Editorial landscape',
              height: 900,
              id: 'event-cover-2',
              src: editorialLandscape,
              width: 1600,
            },
            {
              alt: 'Community gathering',
              height: 900,
              id: 'event-image-4',
              src: collaboration,
              width: 1600,
            },
          ],
          title: 'Yoga Day',
        },
      ]}
      alignment="left"
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      description="Browse recent celebrations, programs, and community events."
      eyebrow="Moments"
      size="compact"
      title="Event gallery"
    />
  ),
  imageMosaic: (
    <ImageMosaicBlockComponent
      actionMode="link"
      actions={[
        {
          label: 'Explore all spaces',
          linkType: 'custom',
          url: '/spaces',
        },
      ]}
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      contentAlignment="center"
      description="Explore the spaces, people, and moments that shape our community."
      eyebrow="Inside our community"
      items={[
        {
          action: [
            {
              label: 'Explore',
              linkType: 'custom',
              mode: 'link',
              url: '/spaces',
              variant: 'default',
            },
          ],
          image: { alt: 'Learning environment', id: 1, url: editorialLandscape },
          title: 'Learning spaces',
        },
        {
          action: [
            {
              label: 'Discover',
              linkType: 'custom',
              mode: 'button',
              url: '/community',
              variant: 'outline',
            },
          ],
          image: { alt: 'Collaborative environment', id: 2, url: collaboration },
          imagePosition: 'top',
          title: 'Collaboration',
        },
        {
          image: { alt: 'Community portrait', id: 3, url: portrait },
          imagePosition: 'center',
          title: 'Our community',
        },
        {
          action: [
            {
              label: 'Take a look',
              linkType: 'custom',
              mode: 'link',
              url: '/campus',
              variant: 'default',
            },
          ],
          image: { alt: 'Campus landscape', id: 4, url: editorialLandscape },
          imagePosition: 'right',
          title: 'Campus life',
        },
        {
          action: [
            {
              label: 'Learn more',
              linkType: 'custom',
              mode: 'link',
              url: '/experience',
              variant: 'default',
            },
          ],
          image: { alt: 'Shared learning moment', id: 5, url: collaboration },
          imagePosition: 'bottom',
          title: 'Shared experiences',
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
  contact33: (
    <Contact33BlockComponent
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      description="Tell us what you need and our team will help you find the right next step."
      eyebrow="Contact"
      form={contactFormFixture}
      image={{ alt: 'Modern learning environment', url: editorialLandscape }}
      imageAlt="A welcoming modern learning environment"
      imagePosition="right"
      size="compact"
      title="Start a conversation."
    />
  ),
  contact24: (
    <Contact24
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      description="Regional teams provide local support wherever your work takes you."
      eyebrow="Global presence"
      offices={contact24OfficeFixtures}
      size="compact"
      title="Our offices"
    />
  ),
  reviewFeed: (
    <ReviewFeed
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      description="Published experiences shared by students, families, alumni, and visitors."
      emptyStateMessage="No published reviews yet."
      eyebrow="Community voices"
      initialPage={{
        docs: [
          {
            authorName: 'Alex M.',
            content: 'The support was thoughtful, clear, and genuinely welcoming throughout.',
            date: 'Jul 18, 2026',
            id: 'review-feed-1',
            rating: 5,
            title: 'Outstanding support',
            verified: true,
          },
          {
            authorName: 'Jordan K.',
            content: 'Every step felt organized, and the team always made time for questions.',
            date: 'Jul 15, 2026',
            id: 'review-feed-2',
            rating: 5,
            title: 'A welcoming experience',
            verified: true,
          },
          {
            authorName: 'Priya S.',
            content: 'A positive experience with helpful people and excellent communication.',
            date: 'Jul 10, 2026',
            id: 'review-feed-3',
            rating: 4,
            title: 'Helpful and responsive',
            verified: false,
          },
        ],
        hasNextPage: true,
        page: 1,
        totalPages: 2,
      }}
      loadMoreLabel="Load More Reviews"
      pageSize={3}
      size="compact"
      summary={{ average: 4.7, count: 124, counts: [2, 3, 8, 19, 92] }}
      title="What our community is saying"
      />
  ),
  services21: (
    <Services21BlockComponent
      actions={[
        {
          label: 'View all services',
          linkType: 'custom',
          openInNewTab: false,
          url: '#',
          variant: 'default',
        },
      ]}
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      description="Service-first design support for products, teams, and platforms from discovery to launch."
      eyebrow="Capabilities"
      services={[
        {
          description: 'From initial planning to execution, we shape products around user needs.',
          image: {
            alt: 'Design workshop',
            url: editorialLandscape,
            width: 1200,
            height: 800,
          },
          code: '{01}',
          title: 'Discovery',
        },
        {
          description: 'Refine goals, priorities, and architecture before any implementation begins.',
          image: { alt: 'Roadmap planning', url: collaboration, width: 1200, height: 800 },
          code: '{02}',
          title: 'Strategy',
        },
        {
          description: 'Create polished visuals and interactions with clear execution standards.',
          image: { alt: 'UI implementation', url: portrait, width: 1200, height: 800 },
          code: '{03}',
          title: 'Design & UX',
        },
      ]}
      title="Services built to move ideas into impact"
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
  teamShowcase: (
    <TeamShowcase
      appearance={{ background: 'muted', border: 'topAndBottom' }}
      contentAlignment="left"
      description="Our team combines practical experience, community focus, and active mentorship."
      heading="Meet the team"
      members={[
        {
          description:
            'Leads program design, curriculum planning, and student-facing support.',
          image: editorialLandscape,
          name: 'Jordan Lee',
          role: 'Academic Director',
        },
        {
          description:
            'Builds partnerships, coordinates initiatives, and keeps teams aligned.',
          image: collaboration,
          name: 'Sam Rivera',
          role: 'Community Lead',
        },
        {
          description: 'Supports operations, accessibility, and day-to-day learning experiences.',
          image: portrait,
          name: 'Avery Chen',
          role: 'Student Success Lead',
        },
      ]}
      size="compact"
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
