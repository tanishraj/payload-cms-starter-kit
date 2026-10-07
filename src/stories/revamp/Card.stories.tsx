import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/revamp/ui/card'

type StoryArgs = ComponentProps<typeof Card> & {
  heading: string
  description: string
  content: string
  footer: string
  showFooter: boolean
}
const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Official shadcn/ui Radix Luma Card, retrieved through pnpm dlx shadcn@latest add card as the authenticated Contact6 dependency (2026-10-07). Original size and CardHeader/Title/Description/Content/Footer composition. Sample content only; inherits the workshop Neutral light/dark tokens.',
      },
    },
  },
  args: {
    size: 'default',
    heading: 'Contact information',
    description: 'A Card dependency used by Contact6.',
    content: 'Compose the supported Card parts to keep content and actions readable.',
    footer: 'Example footer content',
    showFooter: true,
  },
  argTypes: {
    size: { name: 'Size', control: 'select', options: ['default', 'sm'] },
    heading: { name: 'Heading', control: 'text' },
    description: { name: 'Description', control: 'text' },
    content: { name: 'Content', control: 'text' },
    footer: { name: 'Footer', control: 'text' },
    showFooter: { name: 'Show footer', control: 'boolean' },
    children: { control: false },
    className: { control: false },
  },
  render: ({ heading, description, content, footer, showFooter, size }) => (
    <Card size={size} className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{heading}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
      {showFooter && <CardFooter>{footer}</CardFooter>}
    </Card>
  ),
} satisfies Meta<StoryArgs>
export default meta
type Story = StoryObj<StoryArgs>
export const Default: Story = {}
export const Small: Story = { args: { size: 'sm' } }
export const WithoutFooter: Story = { args: { showFooter: false } }
export const LongContent: Story = {
  args: {
    heading: 'Planning your first visit to the admissions and student support centre',
    content:
      'Bring any information that helps the team understand your enquiry. Longer content should wrap naturally inside the original Card composition without changing its supported shape.',
  },
}
