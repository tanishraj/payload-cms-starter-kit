import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NewsEventsContentBlockComponent } from '@/blocks/NewsEventsContent/Component'
import type { PublicNewsEventDetail } from '@/lib/newsEventsShared'

const entry: PublicNewsEventDetail = {
  id: 'storybook-news',
  slug: 'community-learning',
  title: 'A new chapter in community learning',
  behavior: 'story',
  contentType: 'news',
  classification: {
    id: 'storybook-news',
    slug: 'news',
    title: 'News',
    behavior: 'story',
    calendarColor: 'blue',
    active: true,
    badgeLabel: 'News',
    legacyValue: 'news',
  },
  dateISO: '2026-10-06T08:00:00Z',
  dateLabel: '6 October 2026',
  excerpt: 'Students and faculty share their ideas in a day of practical learning.',
  href: '/news-events/community-learning',
  isPastEvent: false,
  image: {
    src: '/block-thumbnail-assets/collaboration.svg',
    alt: 'Community learning illustration',
    position: 'center',
    width: 1200,
    height: 800,
  },
  body: {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'This sample article demonstrates the existing News & Events detail template using local content.',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
  categories: [{ id: 'learning', slug: 'learning', title: 'Learning' }],
  tags: [],
  updatedAt: '2026-10-06T08:00:00Z',
}
const meta = {
  title: 'Blocks/News & Events Content',
  component: NewsEventsContentBlockComponent,
  tags: ['autodocs'],
  parameters: {
    blockSlug: 'newsEventsContent',
    websiteBlock: true,
    docs: {
      description: {
        component:
          'Existing production component: src/blocks/NewsEventsContent/Component.tsx. This dynamic block belongs to the News & Events Detail Template, not the page picker. Its article is supplied by the current entry in production; Storybook uses synthetic local content and no CMS connection.',
      },
    },
  },
  args: {
    blockType: 'newsEventsContent',
    entry,
    authorLabel: 'Editorial team',
    showShareActions: true,
    appearance: { background: 'none', border: 'none' },
    size: 'default',
    sidebarCardBackground: 'muted',
    featuredImageRatio: 'wide',
    themeMode: 'auto',
    overlayStyle: 'dark',
    overlayDirection: 'vertical',
    overlayCoverage: 'full',
  },
  argTypes: {
    entry: { name: 'Sample article', control: 'object' },
    authorLabel: { name: 'Author label', control: 'text' },
    showShareActions: { name: 'Share actions', control: 'boolean' },
    blockType: { control: false },
  },
} satisfies Meta<typeof NewsEventsContentBlockComponent>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const WithoutShareActions: Story = { args: { showShareActions: false } }
