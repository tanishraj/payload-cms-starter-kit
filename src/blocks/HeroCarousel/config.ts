import type { ArrayField, Block, CheckboxField, Field, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import {
  createMediaOverlayCoverageField,
  createMediaOverlayDirectionField,
  createMediaOverlayStrengthField,
  createMediaOverlayToneField,
} from '@/blocks/shared/mediaOverlayFields'

const buttonsField = createContentActionsField({
  defaultMode: 'button',
  defaultVariant: 'secondary',
  label: 'Buttons',
  maxRows: 2,
  name: 'buttons',
})

const slideFields: Field[] = [
  {
    name: 'backgroundImage',
    label: 'Background Image',
    type: 'upload',
    relationTo: 'media',
    admin: {
      description: 'Full-bleed background image for this slide.',
    },
  },
  {
    name: 'backgroundVideoUrl',
    label: 'Background Video URL',
    type: 'text',
    admin: {
      description: 'Optional: direct video URL (.mp4). Overrides the image when set.',
      placeholder: 'https://example.com/video.mp4',
    },
  },
  {
    name: 'eyebrow',
    type: 'text',
    admin: { description: 'Small label above the title.' },
  },
  {
    name: 'title',
    type: 'text',
  },
  {
    name: 'description',
    type: 'textarea',
  },
  buttonsField,
]

export const HeroCarouselBlock: Block = {
  slug: 'heroCarousel',
  interfaceName: 'HeroCarouselBlock',
  admin: getBlockThumbnailAdmin('heroCarousel'),
  labels: {
    singular: 'Hero Carousel',
    plural: 'Hero Carousels',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'slides',
              label: 'Slides',
              type: 'array',
              minRows: 1,
              maxRows: 8,
              admin: {
                description: 'Add one slide for a static hero, or multiple for a carousel.',
                initCollapsed: true,
              },
              fields: slideFields,
            } satisfies ArrayField,
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            createMediaOverlayToneField({ required: false }),
            createMediaOverlayStrengthField(),
            createMediaOverlayDirectionField({ required: false }),
            createMediaOverlayCoverageField({ required: false }),
            {
              name: 'height',
              label: 'Height',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Immersive (full screen)', value: 'immersive' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'contentAlignment',
              label: 'Content Alignment',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
            } satisfies SelectField,
            {
              name: 'autoplay',
              label: 'Autoplay',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Automatically advance slides every 6 seconds.' },
            } satisfies CheckboxField,
            {
              name: 'showPauseControl',
              label: 'Show Pause / Play Control',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Shows a centered Pause / Play control on hover or focus and on touch devices. Pause freezes autoplay, background video, and slide navigation.',
              },
            } satisfies CheckboxField,
            {
              name: 'showArrows',
              label: 'Show Navigation Arrows',
              type: 'checkbox',
              defaultValue: true,
            } satisfies CheckboxField,
            {
              name: 'showDots',
              label: 'Show Dot Indicators',
              type: 'checkbox',
              defaultValue: true,
            } satisfies CheckboxField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
